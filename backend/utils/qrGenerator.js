const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

/**
 * Generate QR code for job verification
 * QR contains: Single-use verification link
 * Customer clicks link to verify job completion
 */
const generateVerificationQR = async (requestId, technicianId, location) => {
	try {
		const timestamp = new Date().toISOString();
		const verificationId = uuidv4();
		const verificationToken = crypto.randomBytes(32).toString('hex');
		const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

		// Create verification link (will be opened by customer to verify)
		const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5175';
		const verificationLink = `${FRONTEND_URL}/verify-job?token=${verificationToken}&requestId=${requestId}`;

		// QR data structure - contains the verification link
		const qrData = {
			requestId,
			technicianId,
			location,
			timestamp,
			verificationId,
			verificationLink, // Direct link to verify
			platform: 'ServicePro',
		};

		// Convert to JSON string for QR encoding
		const qrString = JSON.stringify(qrData);

		// Generate QR code as data URL (base64)
		const qrCodeDataURL = await QRCode.toDataURL(verificationLink, {
			errorCorrectionLevel: 'H',
			type: 'image/png',
			width: 300,
			margin: 2,
			color: {
				dark: '#000000',
				light: '#FFFFFF',
			},
		});

		return {
			qrCode: qrCodeDataURL, // base64 image
			qrData: qrString, // JSON string with link
			generatedAt: timestamp,
			verificationId,
			verificationToken, // Store token to validate later
			tokenExpiry, // Token expiration
			verificationLink, // The actual link to click
		};
	} catch (error) {
		console.error('QR Generation Error:', error);
		throw new Error('Failed to generate QR code');
	}
};

/**
 * Verify QR data validity
 */
const verifyQRData = (qrData) => {
	try {
		const data = JSON.parse(qrData);

		// Check if all required fields exist
		const required = ['requestId', 'technicianId', 'timestamp', 'verificationId'];
		for (let field of required) {
			if (!data[field]) return false;
		}

		return data;
	} catch (error) {
		return false;
	}
};

module.exports = {
	generateVerificationQR,
	verifyQRData,
};
