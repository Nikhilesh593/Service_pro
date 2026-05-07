const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['new_request', 'request_accepted', 'request_completed', 'request_rejected', 'general'],
    default: 'general'
  },
  relatedRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest' },
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
