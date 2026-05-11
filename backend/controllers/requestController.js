const ServiceRequest = require('../models/ServiceRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { generateServiceReport } = require('../utils/pdfGenerator');
const { generateVerificationQR } = require('../utils/qrGenerator');
const { getPriceForService } = require('../utils/priceConfig');

// Helper: notify all approved technicians/orgs of a new request
const notifyTechnicians = async (request) => {
	try {
		const technicians = await User.find({
			role: { $in: ['technician', 'organization'] },
			status: 'approved',
		}).select('_id');

		const notifications = technicians.map((tech) => ({
			userId: tech._id,
			title: 'New Service Request',
			message: `New ${request.serviceType} request in ${request.location}. Issue: ${request.description.substring(0, 60)}${request.description.length > 60 ? '...' : ''}`,
			type: 'new_request',
			relatedRequest: request._id,
		}));

		if (notifications.length > 0) {
			await Notification.insertMany(notifications);
		}
	} catch (err) {
		console.error('Error creating notifications:', err);
	}
};

exports.createRequest = async (req, res) => {
	try {
		const { serviceType, description, location, urgency, estimatedPrice } = req.body;

		// If multer processed a file, build a public URL path
		const faultPhoto = req.file ? `/uploads/faults/${req.file.filename}` : '';

		// Get price: use provided price or fetch from config
		let price = estimatedPrice ? parseInt(estimatedPrice) : getPriceForService(serviceType);

		// Ensure price is a valid number
		if (!price || isNaN(price) || price < 0) {
			price = getPriceForService(serviceType);
		}

		const request = await ServiceRequest.create({
			userId: req.user._id,
			serviceType,
			description,
			location,
			urgency,
			faultPhoto,
			estimatedPrice: price,
		});

		// Notify all technicians/orgs
		await notifyTechnicians(request);

		res.status(201).json(request);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

exports.getMyRequests = async (req, res) => {
	try {
		let requests;
		if (req.user.role === 'customer') {
			requests = await ServiceRequest.find({ userId: req.user._id }).populate(
				'assignedTo',
				'name email role phone'
			);
		} else {
			requests = await ServiceRequest.find({ assignedTo: req.user._id }).populate(
				'userId',
				'name email phone location'
			);
		}
		res.json(requests);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

exports.getAllRequests = async (req, res) => {
	try {
		// Technicians see pending requests they haven't rejected
		const requests = await ServiceRequest.find({
			status: 'pending',
			rejectedBy: { $ne: req.user._id },
		}).populate('userId', 'name email location phone');
		res.json(requests);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

exports.acceptRequest = async (req, res) => {
	try {
		const request = await ServiceRequest.findById(req.params.id);
		if (!request) return res.status(404).json({ message: 'Request not found' });
		if (request.status !== 'pending')
			return res.status(400).json({ message: 'Request already accepted' });

		request.status = 'accepted';
		request.assignedTo = req.user._id;
		await request.save();

		// Notify the customer
		await Notification.create({
			userId: request.userId,
			title: 'Request Accepted',
			message: `Your ${request.serviceType} request has been accepted by a technician. Please proceed with payment.`,
			type: 'request_accepted',
			relatedRequest: request._id,
		});

		res.json(request);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

exports.rejectRequest = async (req, res) => {
	try {
		const request = await ServiceRequest.findById(req.params.id);
		if (!request) return res.status(404).json({ message: 'Request not found' });
		if (request.status !== 'pending')
			return res.status(400).json({ message: 'Can only reject pending requests' });

		// Add this technician to rejectedBy so it won't show up for them again
		if (!request.rejectedBy.includes(req.user._id)) {
			request.rejectedBy.push(req.user._id);
		}
		await request.save();

		res.json({ message: 'Request rejected', request });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

exports.completeRequest = async (req, res) => {
	try {
		const request = await ServiceRequest.findById(req.params.id);
		if (!request) return res.status(404).json({ message: 'Request not found' });
		if (
			request.assignedTo.toString() !== req.user._id.toString() &&
			req.user.role !== 'admin'
		) {
			return res.status(403).json({ message: 'Not authorized' });
		}

		// Check if payment is completed
		if (request.paymentStatus !== 'COMPLETED') {
			return res.status(400).json({
				message: 'Payment must be completed before marking job as complete',
				paymentStatus: request.paymentStatus,
			});
		}

		// Generate verification QR code with single-use token
		const qrResult = await generateVerificationQR(
			request._id.toString(),
			req.user._id.toString(),
			request.location
		);

		request.status = 'completed';
		request.completedAt = new Date();
		request.verificationQR = {
			qrCode: qrResult.qrCode,
			qrData: qrResult.qrData,
			generatedAt: new Date(),
			isVerified: false,
			verificationToken: qrResult.verificationToken,
			verificationLink: qrResult.verificationLink,
			tokenExpiry: qrResult.tokenExpiry,
			tokenUsed: false,
		};
		await request.save();

		// Notify the customer
		await Notification.create({
			userId: request.userId,
			title: 'Job Completed - Verification Required',
			message: `Your ${request.serviceType} request has been completed. Please scan the QR code to verify.`,
			type: 'request_completed',
			relatedRequest: request._id,
		});

		res.json({
			message: 'Request marked as complete',
			request,
			qrCode: qrResult.qrCode,
			verificationLink: qrResult.verificationLink,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

exports.downloadPdf = async (req, res) => {
	try {
		const request = await ServiceRequest.findById(req.params.id)
			.populate('userId', 'name email phone')
			.populate('assignedTo', 'name role email phone specialization');
		if (!request) return res.status(404).json({ message: 'Request not found' });

		generateServiceReport(request, res);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * Verify QR Code after scanning
 * POST /api/request/:id/verify-qr
 */
exports.verifyQRCode = async (req, res) => {
	try {
		const { qrData } = req.body;
		const { id: requestId } = req.params;

		const request = await ServiceRequest.findById(requestId);
		if (!request) return res.status(404).json({ message: 'Request not found' });

		if (!request.verificationQR || !request.verificationQR.qrData) {
			return res.status(400).json({ message: 'No QR code found for this request' });
		}

		// Verify QR data matches
		let scannedData;
		try {
			scannedData = JSON.parse(qrData);
		} catch (e) {
			return res.status(400).json({ message: 'Invalid QR code format' });
		}

		let storedData;
		try {
			storedData = JSON.parse(request.verificationQR.qrData);
		} catch (e) {
			return res.status(500).json({ message: 'Invalid stored QR data' });
		}

		// Verify key fields match
		if (
			scannedData.requestId !== storedData.requestId ||
			scannedData.verificationId !== storedData.verificationId
		) {
			return res.status(400).json({ message: 'QR code does not match this request' });
		}

		// Mark as verified
		request.verificationQR.isVerified = true;
		request.verificationQR.scannedAt = new Date();
		request.verificationQR.scannedBy = req.user._id;
		request.status = 'verified';
		await request.save();

		// Notify technician
		await Notification.create({
			userId: request.assignedTo,
			title: 'Job Verified',
			message: `Your ${request.serviceType} job has been verified by the customer.`,
			type: 'job_verified',
			relatedRequest: request._id,
		});

		res.json({
			success: true,
			message: 'Request verified successfully',
			request,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * Verify job via single-use token (works on mobile/localhost too)
 * POST /api/request/verify-token
 * Body: { token: "verification-token" }
 */
exports.verifyJobByToken = async (req, res) => {
	try {
		const { token } = req.body;

		if (!token) {
			return res.status(400).json({
				success: false,
				message: 'Verification token required',
			});
		}

		// Find the request with this token and not expired/used
		const request = await ServiceRequest.findOne({
			'verificationQR.verificationToken': token,
			'verificationQR.tokenUsed': false,
			'verificationQR.tokenExpiry': { $gt: new Date() },
		});

		if (!request) {
			return res.status(400).json({
				success: false,
				message: 'Invalid, expired, or already used verification token',
			});
		}

		// Mark as verified and expire the token
		request.verificationQR.isVerified = true;
		request.verificationQR.tokenUsed = true;
		request.verificationQR.scannedAt = new Date();
		request.status = 'verified';
		await request.save();

		// Notify technician
		await Notification.create({
			userId: request.assignedTo,
			title: 'Job Verified ✓',
			message: `Your ${request.serviceType} job has been verified by the customer!`,
			type: 'job_verified',
			relatedRequest: request._id,
		});

		res.json({
			success: true,
			message: '✅ Job verified successfully! Thank you.',
			request,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

/**
 * Verify job via single-use link
 * GET /api/request/verify-link/:token
 */
exports.verifyJobByLink = async (req, res) => {
	try {
		const { token } = req.params;
		// Find the request with this token and not expired/used
		const request = await ServiceRequest.findOne({
			'verificationQR.verificationToken': token,
			'verificationQR.tokenUsed': false,
			'verificationQR.tokenExpiry': { $gt: new Date() },
		});
		if (!request) {
			return res
				.status(400)
				.json({ success: false, message: 'Invalid or expired verification link.' });
		}
		// Mark as verified and expire the token
		request.verificationQR.isVerified = true;
		request.verificationQR.tokenUsed = true;
		request.verificationQR.scannedAt = new Date();
		request.status = 'verified';
		await request.save();
		// Notify technician
		await Notification.create({
			userId: request.assignedTo,
			title: 'Job Verified',
			message: `Your ${request.serviceType} job has been verified by the customer (via link).`,
			type: 'job_verified',
			relatedRequest: request._id,
		});
		// Optionally, redirect to a success page or show a message
		res.json({ success: true, message: 'Job verified successfully!', request });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

exports.getAnalytics = async (req, res) => {
	try {
		const userId = req.user._id;

		// Jobs assigned to this technician
		const totalAssigned = await ServiceRequest.countDocuments({ assignedTo: userId });
		const completed = await ServiceRequest.countDocuments({
			assignedTo: userId,
			status: 'completed',
		});
		const activeJobs = await ServiceRequest.countDocuments({
			assignedTo: userId,
			status: 'accepted',
		});

		// Requests this technician rejected (skipped)
		const rejected = await ServiceRequest.countDocuments({ rejectedBy: userId });

		// Unfulfilled: still pending (no one accepted yet)
		const unfulfilled = await ServiceRequest.countDocuments({ status: 'pending' });

		// Monthly breakdown (last 6 months)
		const sixMonthsAgo = new Date();
		sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

		const monthlyData = await ServiceRequest.aggregate([
			{
				$match: {
					assignedTo: userId,
					createdAt: { $gte: sixMonthsAgo },
				},
			},
			{
				$group: {
					_id: {
						year: { $year: '$createdAt' },
						month: { $month: '$createdAt' },
					},
					total: { $sum: 1 },
					completed: {
						$sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
					},
				},
			},
			{ $sort: { '_id.year': 1, '_id.month': 1 } },
		]);

		res.json({
			totalAssigned,
			completed,
			activeJobs,
			rejected,
			unfulfilled,
			monthlyData,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
