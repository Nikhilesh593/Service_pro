const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('relatedRequest', 'serviceType location status');
    
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const { id, all } = req.body;

    if (all) {
      await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
      return res.json({ message: 'All notifications marked as read' });
    }

    if (id) {
      await Notification.findOneAndUpdate(
        { _id: id, userId: req.user._id },
        { read: true }
      );
      return res.json({ message: 'Notification marked as read' });
    }

    res.status(400).json({ message: 'Provide id or all:true' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
