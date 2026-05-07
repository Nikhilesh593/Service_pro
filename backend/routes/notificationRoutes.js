const express = require('express');
const { getNotifications, markRead } = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.patch('/read', markRead);

module.exports = router;
