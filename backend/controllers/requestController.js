const ServiceRequest = require('../models/ServiceRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { generateServiceReport } = require('../utils/pdfGenerator');

// Helper: notify all approved technicians/orgs of a new request
const notifyTechnicians = async (request) => {
  try {
    const technicians = await User.find({
      role: { $in: ['technician', 'organization'] },
      status: 'approved'
    }).select('_id');

    const notifications = technicians.map(tech => ({
      userId: tech._id,
      title: 'New Service Request',
      message: `New ${request.serviceType} request in ${request.location}. Issue: ${request.description.substring(0, 60)}${request.description.length > 60 ? '...' : ''}`,
      type: 'new_request',
      relatedRequest: request._id
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
    const { serviceType, description, location, urgency } = req.body;

    // If multer processed a file, build a public URL path
    const faultPhoto = req.file
      ? `/uploads/faults/${req.file.filename}`
      : '';

    const request = await ServiceRequest.create({
      userId: req.user._id,
      serviceType, description, location, urgency, faultPhoto
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
      requests = await ServiceRequest.find({ userId: req.user._id }).populate('assignedTo', 'name email role phone');
    } else {
      requests = await ServiceRequest.find({ assignedTo: req.user._id }).populate('userId', 'name email phone location');
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
      rejectedBy: { $ne: req.user._id }
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
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already accepted' });

    request.status = 'accepted';
    request.assignedTo = req.user._id;
    await request.save();

    // Notify the customer
    await Notification.create({
      userId: request.userId,
      title: 'Request Accepted',
      message: `Your ${request.serviceType} request has been accepted by a technician.`,
      type: 'request_accepted',
      relatedRequest: request._id
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
    if (request.status !== 'pending') return res.status(400).json({ message: 'Can only reject pending requests' });

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
    if (request.assignedTo.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = 'completed';
    request.completedAt = new Date();
    await request.save();

    // Notify the customer
    await Notification.create({
      userId: request.userId,
      title: 'Request Completed',
      message: `Your ${request.serviceType} request has been marked as completed.`,
      type: 'request_completed',
      relatedRequest: request._id
    });

    res.json(request);
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

exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Jobs assigned to this technician
    const totalAssigned = await ServiceRequest.countDocuments({ assignedTo: userId });
    const completed = await ServiceRequest.countDocuments({ assignedTo: userId, status: 'completed' });
    const activeJobs = await ServiceRequest.countDocuments({ assignedTo: userId, status: 'accepted' });

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
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      totalAssigned,
      completed,
      activeJobs,
      rejected,
      unfulfilled,
      monthlyData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
