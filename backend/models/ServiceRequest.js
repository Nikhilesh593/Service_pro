const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		serviceType: { type: String, required: true },
		description: { type: String, required: true },
		location: { type: String, required: true },
		urgency: { type: String, enum: ['low', 'medium', 'high'], required: true },
		status: {
			type: String,
			enum: [
				'pending',
				'accepted',
				'payment_pending',
				'payment_completed',
				'completed',
				'verified',
				'cancelled',
			],
			default: 'pending',
		},
		assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		rejectedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
		completedAt: { type: Date },
		notes: { type: String },
		faultPhoto: { type: String, default: '' },

		// Payment fields
		estimatedPrice: { type: Number, default: 0 },
		paymentStatus: {
			type: String,
			enum: ['PENDING', 'COMPLETED', 'FAILED'],
			default: 'PENDING',
		},
		paymentDetails: {
			razorpayOrderId: String,
			razorpayPaymentId: String,
			razorpaySignature: String,
			amount: Number,
			currency: { type: String, default: 'INR' },
			paidAt: Date,
			paymentMethod: String, // upi, card, wallet, etc.
		},

		// QR Verification fields
		verificationQR: {
			qrCode: String, // base64 encoded image or text
			qrData: String, // JSON: {requestId, timestamp, technician, location}
			generatedAt: Date,
			scannedAt: Date,
			scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
			isVerified: { type: Boolean, default: false },
			// Single-use verification link
			verificationToken: String, // Unique token for one-time verification
			verificationLink: String, // Full verification URL
			tokenExpiry: Date, // Token expiration time
			tokenUsed: { type: Boolean, default: false }, // Track if token was already used
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
