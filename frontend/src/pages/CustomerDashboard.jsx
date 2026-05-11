import { useState, useEffect } from 'react';
import api from '../utils/api';
import {
	LogOut,
	CalendarCheck,
	User as UserIcon,
	MapPin,
	Calendar,
	PlusCircle,
} from 'lucide-react';
import BookingWizard from '../components/BookingWizard';
import PaymentModal from '../components/PaymentModal';
import QRVerificationModal from '../components/QRVerificationModal';
import '../components/BookingWizard.css';
import './CustomerDashboard.css';

export default function CustomerDashboard({ user, onLogout }) {
	const [requests, setRequests] = useState([]);
	const [showWizard, setShowWizard] = useState(false);
	const [activeTab, setActiveTab] = useState('upcoming');

	// Payment modal states
	const [showPaymentModal, setShowPaymentModal] = useState(false);
	const [selectedRequestForPayment, setSelectedRequestForPayment] = useState(null);

	// QR verification modal states
	const [showQRModal, setShowQRModal] = useState(false);
	const [selectedRequestForQR, setSelectedRequestForQR] = useState(null);

	useEffect(() => {
		fetchRequests();
	}, []);

	const fetchRequests = async () => {
		try {
			const res = await api.get('/request/my');
			setRequests(res.data);
		} catch (err) {
			console.error(err);
		}
	};

	const upcomingStatuses = ['pending', 'accepted', 'payment_pending', 'payment_completed'];
	const historyStatuses = ['completed', 'verified', 'rejected', 'cancelled'];

	const upcomingRequests = requests.filter((req) => upcomingStatuses.includes(req.status));
	const historyRequests = requests.filter((req) => historyStatuses.includes(req.status));

	const displayedRequests = activeTab === 'upcoming' ? upcomingRequests : historyRequests;

	const getInitials = (name) => {
		if (!name) return 'U';
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.substring(0, 2)
			.toUpperCase();
	};

	const formatDate = (dateString) => {
		if (!dateString) return 'Date not available';
		const d = new Date(dateString);
		const datePart = d.toISOString().split('T')[0];
		const timePart = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
		return `${datePart} at ${timePart}`;
	};

	const getStatusBadgeText = (status) => {
		const statusMap = {
			pending: 'PENDING',
			accepted: 'ASSIGNED',
			payment_pending: 'PAYMENT PENDING',
			payment_completed: 'PAID',
			completed: 'COMPLETED',
			verified: 'VERIFIED',
			rejected: 'REJECTED',
			cancelled: 'CANCELLED',
		};
		return statusMap[status] || status.toUpperCase();
	};

	const openPaymentModal = (req) => {
		console.log('💳 Opening payment modal for request:', {
			id: req._id,
			estimatedPrice: req.estimatedPrice,
			paymentStatus: req.paymentStatus,
			status: req.status,
			serviceType: req.serviceType,
		});
		setSelectedRequestForPayment(req);
		setShowPaymentModal(true);
	};

	const openQRModal = (req) => {
		setSelectedRequestForQR(req);
		setShowQRModal(true);
	};

	const handlePaymentSuccess = (updatedRequest) => {
		// Update the request in the list
		setRequests(requests.map((r) => (r._id === updatedRequest._id ? updatedRequest : r)));
		setShowPaymentModal(false);
	};

	const handleQRVerificationSuccess = (updatedRequest) => {
		// Update the request in the list
		setRequests(requests.map((r) => (r._id === updatedRequest._id ? updatedRequest : r)));
		setShowQRModal(false);
	};

	return (
		<div className="cd-layout">
			{/* Sidebar */}
			<aside className="cd-sidebar">
				<div className="cd-sidebar-profile">
					<div className="cd-avatar">{getInitials(user?.name)}</div>
					<h3 className="cd-user-name">{user?.name || 'User'}</h3>
					<p className="cd-user-email">{user?.email || 'user@example.com'}</p>
				</div>

				<div className="cd-sidebar-nav">
					<button className="cd-nav-item active">
						<CalendarCheck size={18} /> My Bookings
					</button>
					<button className="cd-nav-item">
						<UserIcon size={18} /> Profile Details
					</button>
					<button className="cd-nav-item">
						<MapPin size={18} /> Manage Addresses
					</button>
				</div>

				<div className="cd-sidebar-footer">
					<button className="cd-nav-item cd-logout-btn" onClick={onLogout}>
						<LogOut size={18} /> Logout
					</button>
				</div>
			</aside>

			{/* Main Content */}
			<main className="cd-main-content">
				<div className="cd-main-header">
					<h2 className="cd-main-title">My Bookings</h2>
					{/* A small button to keep the booking functionality accessible */}
					<button className="cd-btn-new-small" onClick={() => setShowWizard(true)}>
						<PlusCircle size={16} /> New Booking
					</button>
				</div>

				<div className="cd-tabs">
					<button
						className={`cd-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
						onClick={() => setActiveTab('upcoming')}
					>
						Upcoming
					</button>
					<button
						className={`cd-tab ${activeTab === 'history' ? 'active' : ''}`}
						onClick={() => setActiveTab('history')}
					>
						History
					</button>
				</div>

				<div className="cd-booking-list">
					{displayedRequests.length === 0 ? (
						<div className="cd-empty-state">No {activeTab} bookings found.</div>
					) : (
						displayedRequests.map((req) => (
							<div key={req._id} className="cd-booking-card">
								<div className="cd-booking-header">
									<h4 className="cd-booking-service">{req.serviceType}</h4>
									<span className={`cd-booking-status status-${req.status}`}>
										{getStatusBadgeText(req.status)}
									</span>
								</div>

								<div className="cd-booking-provider">
									Provider: {req.assignedTo?.name || 'Pending assignment'}
								</div>

								<div className="cd-booking-details">
									<span className="cd-booking-date">
										<Calendar size={16} /> {formatDate(req.createdAt)}
									</span>
									<span className="cd-booking-price">
										₹ {req.estimatedPrice || 'TBD'}
									</span>
								</div>

								{/* Payment Status Display */}
								{req.status === 'accepted' && (
									<div className="cd-payment-status">
										<span className="payment-badge">💳 Payment Required</span>
									</div>
								)}
								{req.paymentStatus === 'COMPLETED' && (
									<div className="cd-payment-status">
										<span className="payment-badge payment-completed">
											✅ Payment Completed
										</span>
									</div>
								)}
								{req.status === 'completed' && !req.verificationQR?.isVerified && (
									<div className="cd-verification-status">
										<span className="verification-badge">
											🔍 Pending Verification
										</span>
									</div>
								)}
								{req.verificationQR?.isVerified && (
									<div className="cd-verification-status">
										<span className="verification-badge verified">
											✓ Verified
										</span>
									</div>
								)}

								<div className="cd-booking-actions">
									{/* Payment button - show for accepted status or payment pending */}
									{(req.status === 'accepted' ||
										req.status === 'payment_pending') &&
										req.paymentStatus !== 'COMPLETED' && (
											<button
												className="cd-btn-action payment"
												onClick={() => openPaymentModal(req)}
											>
												💳 Pay Now
											</button>
										)}

									{/* QR verification button - show for completed status */}
									{req.status === 'completed' && (
										<button
											className="cd-btn-action qr"
											onClick={() => openQRModal(req)}
										>
											📱 QR Verification
										</button>
									)}

									{/* Default action */}
									{req.status !== 'completed' &&
										req.paymentStatus !== 'COMPLETED' &&
										req.status !== 'accepted' && (
											<button className="cd-btn-action">
												{activeTab === 'upcoming'
													? 'Cancel Booking'
													: 'View Details'}
											</button>
										)}
								</div>
							</div>
						))
					)}
				</div>
			</main>

			{/* Payment Modal */}
			<PaymentModal
				isOpen={showPaymentModal}
				onClose={() => setShowPaymentModal(false)}
				requestId={selectedRequestForPayment?._id}
				amount={selectedRequestForPayment?.estimatedPrice || 0}
				onPaymentSuccess={handlePaymentSuccess}
			/>

			{/* QR Verification Modal */}
			<QRVerificationModal
				isOpen={showQRModal}
				onClose={() => setShowQRModal(false)}
				requestId={selectedRequestForQR?._id}
				qrCode={selectedRequestForQR?.verificationQR?.qrCode}
				verificationToken={selectedRequestForQR?.verificationQR?.verificationToken}
				onVerificationSuccess={handleQRVerificationSuccess}
			/>

			{/* Booking Wizard */}
			<BookingWizard
				isOpen={showWizard}
				onClose={() => setShowWizard(false)}
				onSuccess={fetchRequests}
				user={user}
			/>
		</div>
	);
}
