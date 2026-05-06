const ServiceRequest = require('../models/ServiceRequest');
const { generateServiceReport } = require('../utils/pdfGenerator');

exports.createRequest = async (req, res) => {
  try {
    const { serviceType, description, location, urgency } = req.body;
    const request = await ServiceRequest.create({
      userId: req.user._id,
      serviceType, description, location, urgency
    });
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    let requests;
    if (req.user.role === 'customer') {
      requests = await ServiceRequest.find({ userId: req.user._id }).populate('assignedTo', 'name email role');
    } else {
      requests = await ServiceRequest.find({ assignedTo: req.user._id }).populate('userId', 'name location');
    }
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    // Technicians/Organizations see pending requests
    const requests = await ServiceRequest.find({ status: 'pending' }).populate('userId', 'name location');
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
    res.json(request);
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
    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.downloadPdf = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id).populate('userId', 'name email').populate('assignedTo', 'name role email');
    if (!request) return res.status(404).json({ message: 'Request not found' });

    generateServiceReport(request, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
