const express = require('express');
const User = require('../models/User');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// GET /api/providers — returns all approved technicians & organizations
router.get('/', protect, async (req, res) => {
  try {
    const providers = await User.find({
      role: { $in: ['technician', 'organization'] },
      status: 'approved'
    }).select('name role phone address services');

    res.json(providers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
