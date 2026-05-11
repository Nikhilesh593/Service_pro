import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import QRVerificationModal from '../components/QRVerificationModal';
import './TechnicianDashboard.css';

const BACKEND = 'http://localhost:5000';

// ── helpers ──────────────────────────────────────────────
const initials = (name = '') =>
	name
		.split(' ')
		.map((w) => w[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);

const avatarColor = (name = '') => {
	const colors = [
		'linear-gradient(135deg,#4F46E5,#7C3AED)',
		'linear-gradient(135deg,#0ea5e9,#6366f1)',
		'linear-gradient(135deg,#10b981,#059669)',
		'linear-gradient(135deg,#f59e0b,#ef4444)',
		'linear-gradient(135deg,#ec4899,#8b5cf6)',
	];
	return colors[name.charCodeAt(0) % colors.length];
};

const timeAgo = (date) => {
	const diff = Math.floor((Date.now() - new Date(date)) / 1000);
	if (diff < 60) return 'just now';
	if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
	return `${Math.floor(diff / 86400)}d ago`;
};

const URGENCY_CLASS = { high: 'urgency-high', medium: 'urgency-medium', low: 'urgency-low' };

// ── Donut Chart ───────────────────────────────────────────
function DonutChart({ completed, active, rejected, pending }) {
	const total = completed + active + rejected + pending || 1;
	const segments = [
		{ value: completed, color: '#10b981', label: 'Completed' },
		{ value: active, color: '#818cf8', label: 'Active' },
		{ value: rejected, color: '#ef4444', label: 'Skipped by Me' },
		{ value: pending, color: '#f59e0b', label: 'Unfulfilled' },
	];
	const r = 60,
		cx = 80,
		cy = 80,
		circ = 2 * Math.PI * r;
	let offset = 0;
	return (
		<div className="donut-wrapper">
			<div className="donut-chart">
				<svg viewBox="0 0 160 160">
					{segments.map((seg, i) => {
						const dash = (seg.value / total) * circ;
						const gap = circ - dash;
						const el = (
							<circle
								key={i}
								cx={cx}
								cy={cy}
								r={r}
								fill="none"
								stroke={seg.color}
								strokeWidth="22"
								strokeDasharray={`${dash} ${gap}`}
								strokeDashoffset={-offset}
								strokeLinecap="butt"
							/>
						);
						offset += dash;
						return el;
					})}
					<circle cx={cx} cy={cy} r={49} fill="#1a2332" />
				</svg>
				<div className="donut-center">
					<div className="donut-center-value">{total}</div>
					<div className="donut-center-label">Total</div>
				</div>
			</div>
			<div className="donut-legend">
				{segments.map((seg, i) => (
					<div className="legend-item" key={i}>
						<div className="legend-dot" style={{ background: seg.color }} />
						<div className="legend-info">
							<span className="legend-name">{seg.label}</span>
							<span className="legend-val">{seg.value}</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

// ── Main Component ────────────────────────────────────────
export default function TechnicianDashboard({ user: propUser, onLogout }) {
	const [activeTab, setActiveTab] = useState('incoming');
	const [user, setUser] = useState(propUser);
	const [incomingRequests, setIncomingRequests] = useState([]);
	const [activeJobs, setActiveJobs] = useState([]);
	const [analytics, setAnalytics] = useState(null);
	const [notifications, setNotifications] = useState([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [showNotifDrawer, setShowNotifDrawer] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editForm, setEditForm] = useState({ name: '', phone: '', bio: '', specialization: '' });
	const [loading, setLoading] = useState(false);
	const [toast, setToast] = useState(null);

	// QR Verification states
	const [showQRModal, setShowQRModal] = useState(false);
	const [selectedJobForQR, setSelectedJobForQR] = useState(null);

	const showToast = (msg, type = 'success') => {
		setToast({ msg, type });
		setTimeout(() => setToast(null), 3000);
	};

	// ── Data fetching ──────────────────────────────────────
	const fetchIncoming = useCallback(async () => {
		try {
			const r = await api.get('/request/all');
			setIncomingRequests(r.data);
		} catch {}
	}, []);

	const fetchMyJobs = useCallback(async () => {
		try {
			const r = await api.get('/request/my');
			setActiveJobs(r.data);
		} catch {}
	}, []);

	const fetchAnalytics = useCallback(async () => {
		try {
			const r = await api.get('/request/analytics');
			setAnalytics(r.data);
		} catch {}
	}, []);

	const fetchNotifications = useCallback(async () => {
		try {
			const r = await api.get('/notifications');
			setNotifications(r.data.notifications);
			setUnreadCount(r.data.unreadCount);
		} catch {}
	}, []);

	useEffect(() => {
		if (user?.status !== 'approved') return;
		fetchIncoming();
		fetchMyJobs();
		fetchAnalytics();
		fetchNotifications();
		// Refresh jobs and notifications every 30 seconds to detect payment completions
		const interval = setInterval(() => {
			fetchMyJobs();
			fetchNotifications();
		}, 30000);
		return () => clearInterval(interval);
	}, [user?.status, fetchIncoming, fetchMyJobs, fetchAnalytics, fetchNotifications]);

	// ── Actions ────────────────────────────────────────────
	const handleAccept = async (id) => {
		try {
			await api.put(`/request/accept/${id}`);
			showToast('Request accepted!');
			fetchIncoming();
			fetchMyJobs();
			fetchAnalytics();
		} catch (e) {
			showToast(e.response?.data?.message || 'Error', 'error');
		}
	};

	const handleReject = async (id) => {
		try {
			await api.put(`/request/reject/${id}`);
			showToast('Request skipped');
			fetchIncoming();
		} catch (e) {
			showToast(e.response?.data?.message || 'Error', 'error');
		}
	};

	const handleComplete = async (id) => {
		try {
			const response = await api.put(`/request/complete/${id}`);
			showToast('Job marked complete! 🎉');

			// Show QR modal with the generated QR code
			const updatedJob = response.data.request;
			setSelectedJobForQR(updatedJob);
			setShowQRModal(true);

			fetchMyJobs();
			fetchAnalytics();
		} catch (e) {
			showToast(e.response?.data?.message || 'Error', 'error');
		}
	};

	const handleDownloadPdf = async (id) => {
		try {
			const response = await api.get(`/request/${id}/pdf`, { responseType: 'blob' });
			const url = window.URL.createObjectURL(
				new Blob([response.data], { type: 'application/pdf' })
			);
			const a = document.createElement('a');
			a.href = url;
			a.download = `service-request-${id}.pdf`;
			a.click();
			window.URL.revokeObjectURL(url);
			showToast('PDF downloaded!');
		} catch {
			showToast('PDF download failed', 'error');
		}
	};

	const handleMarkAllRead = async () => {
		try {
			await api.patch('/notifications/read', { all: true });
			fetchNotifications();
		} catch {}
	};

	const handleMarkOneRead = async (notifId) => {
		try {
			await api.patch('/notifications/read', { id: notifId });
			fetchNotifications();
		} catch {}
	};

	const handleSaveProfile = async () => {
		setLoading(true);
		try {
			const r = await api.patch('/auth/profile', editForm);
			const updated = { ...user, ...r.data };
			setUser(updated);
			localStorage.setItem('user', JSON.stringify(updated));
			setIsEditing(false);
			showToast('Profile updated!');
		} catch (e) {
			showToast(e.response?.data?.message || 'Error', 'error');
		} finally {
			setLoading(false);
		}
	};

	const startEdit = () => {
		setEditForm({
			name: user.name || '',
			phone: user.phone || '',
			bio: user.bio || '',
			specialization: user.specialization || '',
		});
		setIsEditing(true);
	};

	// ── Pending approval ───────────────────────────────────
	if (user?.status !== 'approved') {
		return (
			<div
				className="tech-dashboard"
				style={{ justifyContent: 'center', alignItems: 'center' }}
			>
				<div className="pending-card glass-card">
					<div className="pending-icon">⏳</div>
					<h2>Account Pending Approval</h2>
					<p>
						Your account is under review by the admin. You'll gain full access once
						approved.
					</p>
				</div>
			</div>
		);
	}

	// ── Tabs ───────────────────────────────────────────────
	const tabs = [
		{ id: 'profile', icon: '👤', label: 'Profile' },
		{ id: 'incoming', icon: '📋', label: 'Incoming Requests' },
		{ id: 'active', icon: '🔧', label: 'Active Jobs' },
		{ id: 'analytics', icon: '📊', label: 'Analytics' },
	];

	const jobs = activeJobs.filter(
		(j) => j.status === 'accepted' || j.status === 'payment_completed'
	);
	const completedJobs = activeJobs.filter(
		(j) => j.status === 'completed' || j.status === 'verified'
	);

	return (
		<div className="tech-dashboard">
			{/* ── SIDEBAR ── */}
			<aside className="tech-sidebar">
				<div className="sidebar-header">
					<span className="sidebar-brand">⚡ ServicePro</span>
					<button
						className="notif-btn"
						onClick={() => setShowNotifDrawer(true)}
						id="notif-bell-btn"
					>
						🔔
						{unreadCount > 0 && (
							<span className="notif-badge">
								{unreadCount > 99 ? '99+' : unreadCount}
							</span>
						)}
					</button>
				</div>

				<div className="sidebar-profile">
					<div className="avatar-circle" style={{ background: avatarColor(user.name) }}>
						{initials(user.name)}
					</div>
					<div className="profile-name">{user.name}</div>
					<div className="profile-email">{user.email}</div>
					{user.specialization && (
						<div className="profile-badge">{user.specialization}</div>
					)}
					{user.rating > 0 && (
						<div className="profile-rating">⭐ {user.rating.toFixed(1)}</div>
					)}
				</div>

				<nav className="sidebar-nav">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							id={`tab-${tab.id}`}
							className={`nav-item${activeTab === tab.id ? ' active' : ''}`}
							onClick={() => setActiveTab(tab.id)}
						>
							<span className="nav-item-icon">{tab.icon}</span>
							{tab.label}
						</button>
					))}
				</nav>

				<div className="sidebar-logout">
					<button className="logout-btn" id="logout-btn" onClick={onLogout}>
						🚪 Logout
					</button>
				</div>
			</aside>

			{/* ── MAIN CONTENT ── */}
			<main className="tech-content">
				{/* Toast */}
				{toast && (
					<div
						style={{
							position: 'fixed',
							top: 20,
							right: 20,
							zIndex: 999,
							background:
								toast.type === 'error'
									? 'rgba(239,68,68,0.9)'
									: 'rgba(16,185,129,0.9)',
							color: '#fff',
							padding: '12px 20px',
							borderRadius: 10,
							fontWeight: 600,
							fontSize: '0.875rem',
							boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
							animation: 'fadeIn 0.3s',
						}}
					>
						{toast.msg}
					</div>
				)}

				{/* ── PROFILE TAB ── */}
				{activeTab === 'profile' && (
					<div>
						<div className="content-header">
							<h1 className="content-title">My Profile</h1>
							<p className="content-sub">Manage your professional information</p>
						</div>
						<div className="profile-view-card">
							{!isEditing ? (
								<>
									<div className="profile-fields">
										{[
											{ label: 'Full Name', value: user.name },
											{ label: 'Email', value: user.email },
											{ label: 'Phone', value: user.phone || 'Not set' },
											{
												label: 'Specialization',
												value: user.specialization || 'Not set',
											},
											{ label: 'Bio', value: user.bio || 'Not set' },
											{
												label: 'Role',
												value:
													user.role?.charAt(0).toUpperCase() +
													user.role?.slice(1),
											},
											{
												label: 'Account Status',
												value:
													user.status?.charAt(0).toUpperCase() +
													user.status?.slice(1),
											},
										].map((f) => (
											<div className="profile-field" key={f.label}>
												<label>{f.label}</label>
												<p>{f.value}</p>
											</div>
										))}
									</div>
									<div style={{ marginTop: 24 }}>
										<button
											className="btn-edit"
											id="edit-profile-btn"
											onClick={startEdit}
										>
											✏️ Edit Profile
										</button>
									</div>
								</>
							) : (
								<div className="edit-form">
									<h3 style={{ marginBottom: 8 }}>Edit Profile</h3>
									<div className="form-row">
										<div>
											<label>Full Name</label>
											<input
												id="edit-name"
												value={editForm.name}
												onChange={(e) =>
													setEditForm((f) => ({
														...f,
														name: e.target.value,
													}))
												}
												placeholder="Your name"
											/>
										</div>
										<div>
											<label>Phone</label>
											<input
												id="edit-phone"
												value={editForm.phone}
												onChange={(e) =>
													setEditForm((f) => ({
														...f,
														phone: e.target.value,
													}))
												}
												placeholder="+91 XXXXX XXXXX"
											/>
										</div>
									</div>
									<div>
										<label>Specialization</label>
										<input
											id="edit-specialization"
											value={editForm.specialization}
											onChange={(e) =>
												setEditForm((f) => ({
													...f,
													specialization: e.target.value,
												}))
											}
											placeholder="e.g. Plumbing, Electrical, AC Repair..."
										/>
									</div>
									<div>
										<label>Bio</label>
										<textarea
											id="edit-bio"
											rows={3}
											value={editForm.bio}
											onChange={(e) =>
												setEditForm((f) => ({ ...f, bio: e.target.value }))
											}
											placeholder="Tell customers about yourself..."
										/>
									</div>
									<div style={{ display: 'flex', gap: 12 }}>
										<button
											className="btn-edit"
											id="save-profile-btn"
											onClick={handleSaveProfile}
											disabled={loading}
										>
											{loading ? 'Saving...' : '💾 Save Changes'}
										</button>
										<button
											className="btn-cancel"
											onClick={() => setIsEditing(false)}
										>
											Cancel
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				{/* ── INCOMING REQUESTS TAB ── */}
				{activeTab === 'incoming' && (
					<div>
						<div className="content-header">
							<h1 className="content-title">Incoming Requests</h1>
							<p className="content-sub">
								{incomingRequests.length} request
								{incomingRequests.length !== 1 ? 's' : ''} available
							</p>
						</div>
						<div className="requests-grid">
							{incomingRequests.length === 0 ? (
								<div className="empty-state">
									<div className="empty-state-icon">📭</div>
									<h3>No incoming requests</h3>
									<p>
										New service requests from customers will appear here. Check
										back soon!
									</p>
								</div>
							) : (
								incomingRequests.map((req) => (
									<div
										className="request-card"
										key={req._id}
										id={`request-${req._id}`}
									>
										<div
											className="req-avatar"
											style={{
												background: avatarColor(req.userId?.name || 'U'),
											}}
										>
											{initials(req.userId?.name || 'UN')}
										</div>
										<div className="req-info">
											<div className="req-name">
												{req.userId?.name || 'Customer'}
											</div>
											<div className="req-location">📍 {req.location}</div>
											<div className="req-service-badge">
												{req.serviceType}
											</div>
											<div
												className={`req-urgency ${URGENCY_CLASS[req.urgency]}`}
												style={{ marginTop: 6 }}
											>
												🔥{' '}
												{req.urgency?.charAt(0).toUpperCase() +
													req.urgency?.slice(1)}{' '}
												urgency
											</div>
										</div>
										<div className="req-issue">
											<div className="req-issue-label">Issue:</div>
											<div className="req-issue-text">{req.description}</div>
										</div>
										<div className="req-actions">
											<button
												className="btn-reject"
												id={`reject-${req._id}`}
												onClick={() => handleReject(req._id)}
											>
												Reject
											</button>
											<button
												className="btn-accept"
												id={`accept-${req._id}`}
												onClick={() => handleAccept(req._id)}
											>
												Accept
											</button>
											<button
												className="btn-pdf"
												id={`pdf-incoming-${req._id}`}
												onClick={() => handleDownloadPdf(req._id)}
											>
												📄 Export PDF
											</button>
										</div>
										{/* Full-width photo row — only rendered when photo exists */}
										{req.faultPhoto && (
											<div className="req-photo-row">
												<div className="req-photo-label">
													📸 Fault Photo uploaded by customer
												</div>
												<img
													className="req-photo-img"
													src={`${BACKEND}${req.faultPhoto}`}
													alt="Fault"
													onClick={() =>
														window.open(
															`${BACKEND}${req.faultPhoto}`,
															'_blank'
														)
													}
												/>
												<div className="req-photo-hint">
													Click to view full size
												</div>
											</div>
										)}
									</div>
								))
							)}
						</div>
					</div>
				)}

				{/* ── ACTIVE JOBS TAB ── */}
				{activeTab === 'active' && (
					<div>
						<div className="content-header">
							<h1 className="content-title">Active Jobs</h1>
							<p className="content-sub">
								{jobs.length} job{jobs.length !== 1 ? 's' : ''} in progress ·{' '}
								{completedJobs.length} completed
							</p>
						</div>

						{jobs.length > 0 && (
							<>
								<h3
									style={{
										color: '#818cf8',
										marginBottom: 14,
										fontSize: '0.9rem',
										textTransform: 'uppercase',
										letterSpacing: '0.08em',
									}}
								>
									🔧 In Progress
								</h3>
								<div className="requests-grid" style={{ marginBottom: 32 }}>
									{jobs.map((job) => (
										<div
											className="request-card"
											key={job._id}
											id={`job-${job._id}`}
										>
											<div
												className="req-avatar"
												style={{
													background: avatarColor(
														job.userId?.name || 'U'
													),
												}}
											>
												{initials(job.userId?.name || 'UN')}
											</div>
											<div className="req-info">
												<div className="req-name">
													{job.userId?.name || 'Customer'}
												</div>
												<div className="req-location">
													📍 {job.location}
												</div>
												<div className="req-service-badge">
													{job.serviceType}
												</div>
												<div
													className={`req-urgency ${URGENCY_CLASS[job.urgency]}`}
													style={{ marginTop: 6 }}
												>
													🔥{' '}
													{job.urgency?.charAt(0).toUpperCase() +
														job.urgency?.slice(1)}{' '}
													urgency
												</div>
											</div>
											<div className="req-issue">
												<div className="req-issue-label">Issue:</div>
												<div className="req-issue-text">
													{job.description}
												</div>
												<div
													className="status-pill status-accepted"
													style={{ marginTop: 8 }}
												>
													● Accepted
												</div>
												{job.paymentStatus === 'COMPLETED' && (
													<div
														className="status-pill status-payment"
														style={{ marginTop: 6 }}
													>
														💳 Payment Received
													</div>
												)}
												{job.paymentStatus !== 'COMPLETED' && (
													<div
														className="status-pill status-payment-pending"
														style={{ marginTop: 6 }}
													>
														⏳ Awaiting Payment
													</div>
												)}
											</div>
											<div className="req-actions">
												{job.paymentStatus === 'COMPLETED' ? (
													<button
														className="btn-complete"
														id={`complete-${job._id}`}
														onClick={() => handleComplete(job._id)}
													>
														✅ Mark Complete
													</button>
												) : (
													<button
														className="btn-complete"
														id={`complete-${job._id}`}
														onClick={() => handleComplete(job._id)}
														disabled
														style={{
															opacity: 0.5,
															cursor: 'not-allowed',
														}}
													>
														⏳ Waiting for Payment
													</button>
												)}
												<button
													className="btn-pdf"
													id={`pdf-job-${job._id}`}
													onClick={() => handleDownloadPdf(job._id)}
												>
													📄 Export PDF
												</button>
											</div>
											{/* Full-width photo row */}
											{job.faultPhoto && (
												<div className="req-photo-row">
													<div className="req-photo-label">
														📸 Fault Photo uploaded by customer
													</div>
													<img
														className="req-photo-img"
														src={`${BACKEND}${job.faultPhoto}`}
														alt="Fault"
														onClick={() =>
															window.open(
																`${BACKEND}${job.faultPhoto}`,
																'_blank'
															)
														}
													/>
													<div className="req-photo-hint">
														Click to view full size
													</div>
												</div>
											)}
										</div>
									))}
								</div>
							</>
						)}

						{completedJobs.length > 0 && (
							<>
								<h3
									style={{
										color: '#10b981',
										marginBottom: 14,
										fontSize: '0.9rem',
										textTransform: 'uppercase',
										letterSpacing: '0.08em',
									}}
								>
									✅ Completed
								</h3>
								<div className="requests-grid">
									{completedJobs.map((job) => (
										<div
											className="request-card"
											key={job._id}
											style={{ opacity: 0.8 }}
										>
											<div
												className="req-avatar"
												style={{ background: '#374151' }}
											>
												{initials(job.userId?.name || 'UN')}
											</div>
											<div className="req-info">
												<div className="req-name">
													{job.userId?.name || 'Customer'}
												</div>
												<div className="req-location">
													📍 {job.location}
												</div>
												<div className="req-service-badge">
													{job.serviceType}
												</div>
											</div>
											<div className="req-issue">
												<div className="req-issue-label">Issue:</div>
												<div className="req-issue-text">
													{job.description}
												</div>
												<div
													className="status-pill status-completed"
													style={{ marginTop: 8 }}
												>
													✓ Completed
												</div>
											</div>
											<div className="req-actions">
												<button
													className="btn-pdf"
													id={`pdf-done-${job._id}`}
													onClick={() => handleDownloadPdf(job._id)}
												>
													📄 Export PDF
												</button>
											</div>
										</div>
									))}
								</div>
							</>
						)}

						{jobs.length === 0 && completedJobs.length === 0 && (
							<div className="empty-state">
								<div className="empty-state-icon">🔧</div>
								<h3>No active jobs</h3>
								<p>
									Accept incoming requests to see them appear here as active jobs.
								</p>
							</div>
						)}
					</div>
				)}

				{/* ── ANALYTICS TAB ── */}
				{activeTab === 'analytics' && (
					<div>
						<div className="content-header">
							<h1 className="content-title">Analytics</h1>
							<p className="content-sub">Your performance overview</p>
						</div>

						{!analytics ? (
							<div className="empty-state">
								<div className="empty-state-icon">📊</div>
								<h3>Loading analytics...</h3>
							</div>
						) : (
							<>
								<div className="analytics-grid">
									{[
										{
											label: 'Total Assigned',
											value: analytics.totalAssigned,
											icon: '📦',
											cls: 'indigo',
										},
										{
											label: 'Completed',
											value: analytics.completed,
											icon: '✅',
											cls: 'green',
										},
										{
											label: 'Active Jobs',
											value: analytics.activeJobs,
											icon: '🔧',
											cls: 'blue',
										},
										{
											label: 'Skipped by Me',
											value: analytics.rejected,
											icon: '↩️',
											cls: 'red',
										},
										{
											label: 'Unfulfilled (All)',
											value: analytics.unfulfilled,
											icon: '⏳',
											cls: 'amber',
										},
									].map((s) => (
										<div className={`stat-card ${s.cls}`} key={s.label}>
											<div className="stat-icon">{s.icon}</div>
											<div className="stat-value">{s.value}</div>
											<div className="stat-label">{s.label}</div>
										</div>
									))}
								</div>

								<div className="donut-section">
									<div className="donut-title">📈 Job Distribution</div>
									<DonutChart
										completed={analytics.completed}
										active={analytics.activeJobs}
										rejected={analytics.rejected}
										pending={analytics.unfulfilled}
									/>
								</div>

								{analytics.monthlyData?.length > 0 && (
									<div className="donut-section" style={{ marginTop: 20 }}>
										<div className="donut-title">
											📅 Monthly Performance (Last 6 Months)
										</div>
										<div
											style={{
												display: 'flex',
												gap: 12,
												alignItems: 'flex-end',
												paddingTop: 16,
												flexWrap: 'wrap',
											}}
										>
											{analytics.monthlyData.map((m) => {
												const month = new Date(
													m._id.year,
													m._id.month - 1
												).toLocaleString('default', { month: 'short' });
												const maxH = 100;
												const pct = analytics.totalAssigned
													? (m.completed / (m.total || 1)) * maxH
													: 0;
												return (
													<div
														key={`${m._id.year}-${m._id.month}`}
														style={{
															display: 'flex',
															flexDirection: 'column',
															alignItems: 'center',
															gap: 6,
															minWidth: 50,
														}}
													>
														<div
															style={{
																fontSize: '0.75rem',
																color: '#10b981',
																fontWeight: 600,
															}}
														>
															{m.completed}/{m.total}
														</div>
														<div
															style={{
																width: 36,
																height: maxH,
																background: 'rgba(30,41,59,0.8)',
																borderRadius: 6,
																display: 'flex',
																flexDirection: 'column',
																justifyContent: 'flex-end',
																overflow: 'hidden',
																border: '1px solid var(--border)',
															}}
														>
															<div
																style={{
																	width: '100%',
																	height: `${(m.total / (analytics.totalAssigned || 1)) * maxH}px`,
																	background:
																		'rgba(79,70,229,0.4)',
																	transition: 'height 0.5s',
																}}
															/>
														</div>
														<div
															style={{
																fontSize: '0.7rem',
																color: 'var(--text-muted)',
															}}
														>
															{month}
														</div>
													</div>
												);
											})}
										</div>
									</div>
								)}
							</>
						)}
					</div>
				)}
			</main>

			{/* ── NOTIFICATION DRAWER ── */}
			{showNotifDrawer && (
				<>
					<div className="notif-overlay" onClick={() => setShowNotifDrawer(false)} />
					<div className="notif-drawer">
						<div className="notif-drawer-header">
							<span className="notif-drawer-title">
								🔔 Notifications {unreadCount > 0 && `(${unreadCount})`}
							</span>
							<div className="notif-drawer-actions">
								{unreadCount > 0 && (
									<button className="btn-mark-all" onClick={handleMarkAllRead}>
										Mark all read
									</button>
								)}
								<button
									className="btn-close-drawer"
									onClick={() => setShowNotifDrawer(false)}
								>
									✕
								</button>
							</div>
						</div>
						<div className="notif-list">
							{notifications.length === 0 ? (
								<div className="notif-empty">
									<div className="notif-empty-icon">🔕</div>
									<p>No notifications yet</p>
								</div>
							) : (
								notifications.map((n) => (
									<div
										key={n._id}
										className={`notif-item${!n.read ? ' unread' : ''}`}
										onClick={() => !n.read && handleMarkOneRead(n._id)}
									>
										<div className={`notif-dot${n.read ? ' read' : ''}`} />
										<div className="notif-body">
											<div className="notif-title-text">{n.title}</div>
											<div className="notif-message">{n.message}</div>
											<div className="notif-time">{timeAgo(n.createdAt)}</div>
										</div>
									</div>
								))
							)}
						</div>
					</div>
				</>
			)}

			{/* ── QR VERIFICATION MODAL (Technician) ── */}
			<QRVerificationModal
				isOpen={showQRModal}
				onClose={() => setShowQRModal(false)}
				requestId={selectedJobForQR?._id}
				qrCode={selectedJobForQR?.verificationQR?.qrCode}
				userType="technician"
				onVerificationSuccess={(updatedJob) => {
					setActiveJobs(
						activeJobs.map((j) => (j._id === updatedJob._id ? updatedJob : j))
					);
					setShowQRModal(false);
				}}
			/>
		</div>
	);
}
