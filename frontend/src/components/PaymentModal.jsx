import { useState } from 'react';
import api from '../utils/api';
import './PaymentModal.css';

export default function PaymentModal({ isOpen, onClose, requestId, amount, onPaymentSuccess }) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	if (!isOpen) return null;

	// Log what we received as props
	console.log('🟦 PaymentModal mounted with props:', { requestId, amount, isOpen });

	if (!requestId) {
		console.error('❌ ERROR: requestId is missing!', { requestId });
		return (
			<div className="payment-modal-overlay" onClick={onClose}>
				<div className="payment-modal" onClick={(e) => e.stopPropagation()}>
					<div className="payment-modal-header">
						<h2>Error</h2>
						<button className="payment-modal-close" onClick={onClose}>
							✕
						</button>
					</div>
					<div className="payment-modal-body">
						<div className="payment-error">
							<span className="error-icon">⚠️</span>
							Request ID is missing. Cannot process payment.
						</div>
					</div>
					<div className="payment-modal-footer">
						<button className="btn-cancel" onClick={onClose}>
							Close
						</button>
					</div>
				</div>
			</div>
		);
	}

	const handlePayment = async () => {
		try {
			setLoading(true);
			setError('');

			// Validate amount
			if (!amount || amount <= 0) {
				setError('Invalid amount. Please check the service price.');
				setLoading(false);
				return;
			}

			// Get user ID from localStorage with safety checks
			const userJson = localStorage.getItem('user');
			if (!userJson) {
				setError('User not logged in. Please login again.');
				setLoading(false);
				return;
			}

			let user;
			try {
				user = JSON.parse(userJson);
			} catch (e) {
				setError('Invalid user data in local storage.');
				setLoading(false);
				return;
			}

			if (!user || !user._id) {
				console.error('❌ User object invalid:', user);
				setError('User ID not found. Please login again.');
				setLoading(false);
				return;
			}

			// Step 1: Create order on backend
			const paymentData = {
				requestId,
				amount: parseFloat(amount),
				userId: user._id,
			};

			console.log('📌 Creating payment order:', paymentData);

			const orderRes = await api.post('/payment/create-order', paymentData);

			console.log('✅ Order created:', orderRes.data);
			const { order } = orderRes.data;

			// Step 2: Initialize Razorpay checkout
			const options = {
				key: order.keyId,
				amount: order.amount, // in paise
				currency: order.currency,
				name: 'ServicePro',
				description: order.description,
				order_id: order.id,
				handler: async (response) => {
					try {
						// Step 3: Verify payment on backend
						const verifyRes = await api.post('/payment/verify', {
							razorpayOrderId: response.razorpay_order_id,
							razorpayPaymentId: response.razorpay_payment_id,
							razorpaySignature: response.razorpay_signature,
							requestId,
						});

						if (verifyRes.data.success) {
							onPaymentSuccess(verifyRes.data.request);
							onClose();
						}
					} catch (err) {
						console.error(
							'❌ Payment verification error:',
							err.response?.data || err.message
						);
						setError(err.response?.data?.message || 'Payment verification failed');
					}
				},
				prefill: {
					email: order.userEmail,
					contact: '9999999999',
				},
				theme: {
					color: '#4F46E5',
				},
				modal: {
					ondismiss: () => {
						setError('Payment cancelled');
					},
				},
			};

			// Open Razorpay checkout
			const razorpay = new window.Razorpay(options);
			razorpay.open();
			setLoading(false);
		} catch (err) {
			console.error('❌ Payment creation error:', {
				message: err.message,
				response: err.response?.data,
				status: err.response?.status,
				fullError: err,
			});

			// Extract the best error message
			let errorMessage = 'Failed to create payment order';
			if (err.response?.data?.message) {
				errorMessage = err.response.data.message;
			} else if (err.response?.data?.error) {
				errorMessage = err.response.data.error;
			} else if (err.message) {
				errorMessage = err.message;
			}

			setError(errorMessage);
			setLoading(false);
		}
	};

	return (
		<div className="payment-modal-overlay" onClick={onClose}>
			<div className="payment-modal" onClick={(e) => e.stopPropagation()}>
				<div className="payment-modal-header">
					<h2>Payment Required</h2>
					<button className="payment-modal-close" onClick={onClose}>
						✕
					</button>
				</div>

				<div className="payment-modal-body">
					<div className="payment-details">
						<div className="detail-row">
							<span className="detail-label">Service Amount:</span>
							<span className="detail-value">₹ {amount}</span>
						</div>
						<div className="detail-row total">
							<span className="detail-label">Total Amount:</span>
							<span className="detail-value">₹ {amount}</span>
						</div>
					</div>

					<div className="payment-info">
						<div className="info-icon">ℹ️</div>
						<p>
							Complete the payment to proceed with the service. After payment, the
							technician can mark the job as complete.
						</p>
					</div>

					{error && (
						<div className="payment-error">
							<span className="error-icon">⚠️</span>
							{error}
						</div>
					)}

					<div className="payment-methods">
						<h3>Payment Methods Available:</h3>
						<div className="methods-list">
							<div className="method">
								<span className="method-icon">📱</span>
								<span className="method-name">UPI</span>
							</div>
							<div className="method">
								<span className="method-icon">💳</span>
								<span className="method-name">Debit/Credit Card</span>
							</div>
							<div className="method">
								<span className="method-icon">💰</span>
								<span className="method-name">Mobile Wallet</span>
							</div>
							<div className="method">
								<span className="method-icon">🏦</span>
								<span className="method-name">Net Banking</span>
							</div>
						</div>
						<p className="methods-hint">
							You'll choose your preferred payment method after clicking "Pay Now"
						</p>
					</div>
				</div>

				<div className="payment-modal-footer">
					<button className="btn-cancel" onClick={onClose} disabled={loading}>
						Cancel
					</button>
					<button className="btn-pay" onClick={handlePayment} disabled={loading}>
						{loading ? 'Processing...' : '💳 Pay Now'}
					</button>
				</div>
			</div>
		</div>
	);
}
