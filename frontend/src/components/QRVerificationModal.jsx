import { useState, useRef, useEffect } from 'react';
import api from '../utils/api';
import './QRVerificationModal.css';

// QRScanner component using html5-qrcode
function QRScanner({ onScan, onClose }) {
	const scannerRef = useRef(null);
	const [scanning, setScanning] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		if (!scanning) return;

		const startScanning = async () => {
			try {
				const Html5QrcodeScanner = window.Html5QrcodeScanner;

				if (!Html5QrcodeScanner) {
					setError('QR Scanner library not loaded. Please refresh the page.');
					return;
				}

				const scanner = new Html5QrcodeScanner(
					'qr-reader',
					{
						fps: 10,
						qrbox: { width: 250, height: 250 },
						aspectRatio: 1,
					},
					false
				);

				scanner.render(
					(result) => {
						console.log('QR Scanned:', result);
						onScan(result);
						scanner.clear();
					},
					(error) => {
						if (error && error.includes('NotFoundException')) {
							// Keep scanning silently for "no QR code found" errors
							return;
						}
						console.warn(error);
					}
				);

				setScanning(true);
			} catch (err) {
				setError('Failed to start QR scanner: ' + err.message);
				console.error(err);
			}
		};

		startScanning();

		return () => {
			if (scannerRef.current) {
				try {
					const Html5QrcodeScanner = window.Html5QrcodeScanner;
					if (Html5QrcodeScanner?.clear) {
						Html5QrcodeScanner.clear();
					}
				} catch (err) {
					console.error('Error clearing scanner:', err);
				}
			}
		};
	}, [scanning, onScan]);

	if (!scanning) {
		return (
			<div className="scanner-placeholder">
				<button className="btn-start-scan" onClick={() => setScanning(true)}>
					📷 Start Camera Scanner
				</button>
				<p className="scanner-hint">Click to start scanning the QR code with your camera</p>
			</div>
		);
	}

	return (
		<div className="qr-scanner-container">
			{error && (
				<div className="scanner-error">
					<span>⚠️</span> {error}
				</div>
			)}
			<div id="qr-reader" style={{ width: '100%' }}></div>
			<button className="btn-stop-scan" onClick={() => setScanning(false)}>
				✕ Stop Scanner
			</button>
		</div>
	);
}

export default function QRVerificationModal({
	isOpen,
	onClose,
	requestId,
	qrCode,
	verificationToken,
	onVerificationSuccess,
	userType = 'customer', // 'customer' or 'technician'
}) {
	const [mode, setMode] = useState('display'); // 'display' or 'scan'
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);

	if (!isOpen) return null;

	// For customers to verify with token (mobile-friendly)
	const handleVerifyWithToken = async () => {
		if (!verificationToken) {
			setError('Verification token not found');
			return;
		}

		try {
			setLoading(true);
			setError('');

			const response = await api.post('/request/verify-token', {
				token: verificationToken,
			});

			if (response.data.success) {
				setSuccess(true);
				onVerificationSuccess(response.data.request);
				setTimeout(() => {
					onClose();
				}, 2000);
			}
		} catch (err) {
			setError(err.response?.data?.message || 'Verification failed');
		} finally {
			setLoading(false);
		}
	};

	const handleQRScan = async (qrData) => {
		try {
			setLoading(true);
			setError('');

			// Send scanned QR data to backend for verification
			const response = await api.post(`/request/${requestId}/verify-qr`, {
				qrData,
			});

			if (response.data.success) {
				setSuccess(true);
				onVerificationSuccess(response.data.request);
				setTimeout(() => {
					onClose();
				}, 2000);
			}
		} catch (err) {
			setError(err.response?.data?.message || 'QR verification failed');
		} finally {
			setLoading(false);
		}
	};

	const handleDownloadQR = () => {
		if (!qrCode) return;

		const link = document.createElement('a');
		link.href = qrCode;
		link.download = `qr-verification-${requestId}.png`;
		link.click();
	};

	return (
		<div className="qr-modal-overlay" onClick={onClose}>
			<div className="qr-modal" onClick={(e) => e.stopPropagation()}>
				<div className="qr-modal-header">
					<h2>Verification QR Code</h2>
					<button className="qr-modal-close" onClick={onClose}>
						✕
					</button>
				</div>

				<div className="qr-modal-body">
					{success ? (
						<div className="verification-success">
							<div className="success-icon">✅</div>
							<h3>Verification Successful!</h3>
							<p>The service has been verified. Thank you!</p>
						</div>
					) : (
						<>
							<div className="qr-mode-tabs">
								<button
									className={`mode-tab ${mode === 'display' ? 'active' : ''}`}
									onClick={() => setMode('display')}
								>
									📄 Display QR
								</button>
								<button
									className={`mode-tab ${mode === 'scan' ? 'active' : ''}`}
									onClick={() => setMode('scan')}
								>
									📷 Scan QR
								</button>
							</div>

							{error && (
								<div className="qr-error">
									<span className="error-icon">⚠️</span>
									{error}
								</div>
							)}

							{mode === 'display' ? (
								<div className="qr-display-section">
									<div className="qr-info">
										{userType === 'technician' ? (
											<>
												<p>
													<strong>
														📱 Ask the customer to scan this QR code
													</strong>
												</p>
												<p>
													The customer can use their phone camera or
													Google Lens to scan this code and verify that
													you completed the service.
												</p>
											</>
										) : (
											<>
												<p>
													This QR code proves that the technician visited
													your location and completed the service.
												</p>
												<p>
													<strong>How to use:</strong> Show this QR code
													to the technician for verification, or scan the
													technician's QR code using the "Scan QR" tab.
												</p>
											</>
										)}
									</div>

									{qrCode ? (
										<div className="qr-code-container">
											<img
												src={qrCode}
												alt="Verification QR Code"
												className="qr-code-image"
											/>
											<div className="qr-code-info">
												<p className="qr-code-id">
													Request ID: {requestId}
												</p>
												<p className="qr-code-timestamp">
													Generated: {new Date().toLocaleString()}
												</p>
											</div>
										</div>
									) : (
										<div className="qr-placeholder">
											<p>QR Code not available</p>
										</div>
									)}

									{userType === 'customer' && verificationToken && (
										<div
											className="verification-token-section"
											style={{
												marginTop: '20px',
												padding: '15px',
												background: 'rgba(79, 70, 229, 0.1)',
												borderRadius: '8px',
												border: '1px solid rgba(79, 70, 229, 0.3)',
											}}
										>
											<p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
												<strong>
													📱 Or verify instantly (works on mobile):
												</strong>
											</p>
											<button
												className="btn-verify-now"
												onClick={handleVerifyWithToken}
												disabled={loading}
												style={{
													width: '100%',
													padding: '10px',
													background: '#10b981',
													color: 'white',
													border: 'none',
													borderRadius: '6px',
													cursor: loading ? 'not-allowed' : 'pointer',
													fontWeight: '600',
													fontSize: '1rem',
												}}
											>
												{loading ? '⏳ Verifying...' : '✅ Verify Now'}
											</button>
										</div>
									)}

									<button
										className="btn-download-qr"
										onClick={handleDownloadQR}
										disabled={!qrCode}
									>
										💾 Download QR Code
									</button>
								</div>
							) : (
								<div className="qr-scan-section">
									<div className="qr-info">
										<p>
											Scan the QR code provided by the technician to verify
											the service completion.
										</p>
									</div>
									<QRScanner onScan={handleQRScan} onClose={onClose} />
								</div>
							)}
						</>
					)}
				</div>

				<div className="qr-modal-footer">
					{!success && (
						<button className="btn-close" onClick={onClose} disabled={loading}>
							Close
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
