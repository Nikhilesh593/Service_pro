const Razorpay = require('razorpay');
const crypto = require('crypto');
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');

// Initialize Razorpay
console.log('🔑 Razorpay Initialization:', {
	hasKeyId: !!process.env.RAZORPAY_KEY_ID,
	hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
	keyId: process.env.RAZORPAY_KEY_ID?.substring(0, 10) + '...',
});

const razorpay = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create Payment Order
 * POST /api/payment/create-order
 */
exports.createPaymentOrder = async (req, res) => {
	try {
		const { requestId, amount, userId } = req.body;

		console.log('🟡 CREATE ORDER - Received request:', { requestId, amount, userId });

		// Validate request
		if (!requestId || !amount || !userId) {
			console.log('❌ Missing required fields:', {
				requestId: !!requestId,
				amount: !!amount,
				userId: !!userId,
			});
			return res.status(400).json({
				success: false,
				message: 'Missing required fields: requestId, amount, userId',
			});
		}

		// Check if service request exists
		const serviceRequest = await ServiceRequest.findById(requestId);
		if (!serviceRequest) {
			console.log('❌ Service request not found:', requestId);
			return res.status(404).json({
				success: false,
				message: 'Service request not found',
			});
		}
		console.log('✅ Service request found');

		// Check payment not already done
		if (serviceRequest.paymentStatus === 'COMPLETED') {
			console.log('⚠️ Payment already completed');
			return res.status(400).json({
				success: false,
				message: 'Payment already completed for this request',
			});
		}

		// Get user details
		const user = await User.findById(userId);
		if (!user) {
			console.log('❌ User not found:', userId);
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}
		console.log('✅ User found:', user.email);

		// Create Razorpay order
		const options = {
			amount: Math.round(amount * 100), // Razorpay expects amount in paise
			currency: 'INR',
			receipt: `rcpt_${requestId.slice(-12)}_${Date.now().toString().slice(-6)}`, // Max 40 chars
			description: `Service Request #${requestId} - ${serviceRequest.serviceType}`,
			notes: {
				requestId: requestId.toString(),
				userId: userId.toString(),
				serviceType: serviceRequest.serviceType,
			},
		};

		console.log('🟡 Creating Razorpay order with options:', {
			amount: options.amount,
			currency: options.currency,
		});

		try {
			const order = await razorpay.orders.create(options);
			console.log('✅ Razorpay order created:', order.id);

			// Save order ID to database
			// Ensure paymentDetails is a proper object
			if (!serviceRequest.paymentDetails) {
				serviceRequest.paymentDetails = {};
			}

			serviceRequest.paymentDetails.razorpayOrderId = order.id;
			serviceRequest.paymentDetails.amount = amount;
			serviceRequest.paymentDetails.currency = 'INR';
			serviceRequest.paymentStatus = 'PENDING';
			await serviceRequest.save();
			console.log('✅ Service request updated with payment details');

			res.status(200).json({
				success: true,
				order: {
					id: order.id,
					amount: order.amount,
					currency: order.currency,
					keyId: process.env.RAZORPAY_KEY_ID,
					userEmail: user.email,
					userName: user.name,
					description: options.description,
				},
			});
		} catch (razorpayError) {
			console.error('❌ Razorpay API Error Details:');
			console.error('Full error object:', JSON.stringify(razorpayError, null, 2));
			console.error('Error message:', razorpayError.message);
			console.error('Error response:', razorpayError.response?.data);
			console.error('Error statusCode:', razorpayError.statusCode);
			console.error('Error toString():', razorpayError.toString());

			throw razorpayError;
		}
	} catch (error) {
		console.error('❌ Payment Order Creation Error:', error.message);
		res.status(500).json({
			success: false,
			message: 'Failed to create payment order',
			error: error.message,
			details: error.description || 'Please check backend logs',
		});
	}
};

/**
 * Verify Payment
 * POST /api/payment/verify
 */
exports.verifyPayment = async (req, res) => {
	try {
		const { razorpayOrderId, razorpayPaymentId, razorpaySignature, requestId } = req.body;

		if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
			return res.status(400).json({
				success: false,
				message: 'Missing payment details',
			});
		}

		// Verify signature
		const data = `${razorpayOrderId}|${razorpayPaymentId}`;
		const expectedSignature = crypto
			.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
			.update(data)
			.digest('hex');

		if (expectedSignature !== razorpaySignature) {
			return res.status(400).json({
				success: false,
				message: 'Invalid payment signature',
			});
		}

		// Get payment details from Razorpay
		const payment = await razorpay.payments.fetch(razorpayPaymentId);

		// Update service request with payment details
		const serviceRequest = await ServiceRequest.findByIdAndUpdate(
			requestId,
			{
				paymentStatus: 'COMPLETED',
				status: 'payment_completed',
				'paymentDetails.razorpayPaymentId': razorpayPaymentId,
				'paymentDetails.razorpaySignature': razorpaySignature,
				'paymentDetails.paidAt': new Date(),
				'paymentDetails.paymentMethod': payment.method || 'unknown',
			},
			{ new: true }
		);

		res.status(200).json({
			success: true,
			message: 'Payment verified successfully',
			request: serviceRequest,
		});
	} catch (error) {
		console.error('Payment Verification Error:', error);
		res.status(500).json({
			success: false,
			message: 'Payment verification failed',
			error: error.message,
		});
	}
};

/**
 * Get Payment Status
 * GET /api/payment/status/:requestId
 */
exports.getPaymentStatus = async (req, res) => {
	try {
		const { requestId } = req.params;

		const serviceRequest = await ServiceRequest.findById(requestId);
		if (!serviceRequest) {
			return res.status(404).json({
				success: false,
				message: 'Service request not found',
			});
		}

		res.status(200).json({
			success: true,
			paymentStatus: serviceRequest.paymentStatus,
			amount: serviceRequest.paymentDetails?.amount,
			paidAt: serviceRequest.paymentDetails?.paidAt,
			jobStatus: serviceRequest.status,
		});
	} catch (error) {
		console.error('Get Payment Status Error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to get payment status',
			error: error.message,
		});
	}
};

/**
 * Webhook: Handle Razorpay payment events
 * POST /api/payment/webhook
 */
exports.paymentWebhook = async (req, res) => {
	try {
		const { event, payload } = req.body;

		// Verify webhook signature
		const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '');
		shasum.update(JSON.stringify(req.body));
		const digest = shasum.digest('hex');

		if (digest !== req.headers['x-razorpay-signature']) {
			return res.status(403).json({
				success: false,
				message: 'Invalid webhook signature',
			});
		}

		// Handle different events
		if (event === 'payment.authorized' || event === 'payment.captured') {
			const payment = payload.payment.entity;
			const requestId = payment.notes.requestId;

			await ServiceRequest.findByIdAndUpdate(requestId, {
				paymentStatus: 'COMPLETED',
				status: 'payment_completed',
				'paymentDetails.razorpayPaymentId': payment.id,
				'paymentDetails.paidAt': new Date(),
			});
		}

		if (event === 'payment.failed') {
			const payment = payload.payment.entity;
			const requestId = payment.notes.requestId;

			await ServiceRequest.findByIdAndUpdate(requestId, {
				paymentStatus: 'FAILED',
				'paymentDetails.razorpayPaymentId': payment.id,
			});
		}

		res.status(200).json({ success: true });
	} catch (error) {
		console.error('Webhook Error:', error);
		res.status(500).json({
			success: false,
			message: 'Webhook processing failed',
			error: error.message,
		});
	}
};
