import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './VerifyJob.css';

export default function VerifyJob() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
	const [message, setMessage] = useState('');

	useEffect(() => {
		const verifyToken = async () => {
			try {
				const token = searchParams.get('token');
				const requestId = searchParams.get('requestId');

				if (!token) {
					setStatus('error');
					setMessage('Verification token not found in URL');
					return;
				}

				// Call the backend to verify using the token
				const response = await api.post('/request/verify-token', {
					token,
				});

				if (response.data.success) {
					setStatus('success');
					setMessage(response.data.message || 'Job verified successfully!');

					// Redirect to dashboard after 3 seconds
					setTimeout(() => {
						navigate('/dashboard');
					}, 3000);
				}
			} catch (error) {
				setStatus('error');
				setMessage(
					error.response?.data?.message ||
						'Failed to verify job. The link may have expired or been used already.'
				);
			}
		};

		verifyToken();
	}, [searchParams, navigate]);

	return (
		<div className="verify-page">
			<div className="verify-container">
				{status === 'loading' && (
					<div className="verify-loading">
						<div className="spinner"></div>
						<h2>Verifying your job completion...</h2>
						<p>Please wait while we verify the service.</p>
					</div>
				)}

				{status === 'success' && (
					<div className="verify-success">
						<div className="success-icon">✅</div>
						<h2>Verification Successful!</h2>
						<p>{message}</p>
						<p className="redirect-text">
							Redirecting to your dashboard in 3 seconds...
						</p>
						<button onClick={() => navigate('/dashboard')} className="btn-dashboard">
							Go to Dashboard Now
						</button>
					</div>
				)}

				{status === 'error' && (
					<div className="verify-error">
						<div className="error-icon">❌</div>
						<h2>Verification Failed</h2>
						<p>{message}</p>
						<div className="error-actions">
							<button
								onClick={() => navigate('/dashboard')}
								className="btn-dashboard"
							>
								← Back to Dashboard
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
