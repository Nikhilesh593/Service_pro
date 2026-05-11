const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
	createPaymentOrder,
	verifyPayment,
	getPaymentStatus,
	paymentWebhook,
} = require('../controllers/paymentController');

const router = express.Router();

// Create payment order - Protected (customer)
router.post('/create-order', protect, createPaymentOrder);

// Verify payment - Protected (customer)
router.post('/verify', protect, verifyPayment);

// Get payment status - Protected
router.get('/status/:requestId', protect, getPaymentStatus);

// Webhook - No auth needed (Razorpay calls this)
router.post('/webhook', paymentWebhook);

module.exports = router;
