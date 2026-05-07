import { useState, useEffect } from 'react';
import api from '../utils/api';
import { PlusCircle, Download } from 'lucide-react';
import BookingWizard from '../components/BookingWizard';
import '../components/BookingWizard.css';
import './CustomerDashboard.css';

export default function CustomerDashboard({ user }) {
  const [requests, setRequests]     = useState([]);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/request/my');
      setRequests(res.data);
    } catch (err) { console.error(err); }
  };

  const downloadPdf = async (id) => {
    try {
      const res = await api.get(`/request/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ServiceReport-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="cd-root">
      {/* Header */}
      <div className="cd-header">
        <div>
          <h2 className="cd-title">My Service Requests</h2>
          <p className="cd-subtitle">Track and manage all your service bookings</p>
        </div>
        <button className="cd-btn-new" onClick={() => setShowWizard(true)}>
          <PlusCircle size={18} /> New Request
        </button>
      </div>

      {/* Request Cards */}
      <div className="cd-cards-grid">
        {requests.map(req => (
          <div key={req._id} className="cd-req-card">
            <div className="cd-req-card-top">
              <div>
                <span className="cd-service-name">{req.serviceType}</span>
                {req.servicePrice && <span className="cd-service-price">{req.servicePrice}</span>}
              </div>
              <span className={`cd-badge cd-badge-${req.status}`}>{req.status}</span>
            </div>
            <p className="cd-req-desc">{req.description}</p>
            <div className="cd-req-meta">
              <span>📍 {req.location}</span>
              {req.assignedTo && <span>👷 {req.assignedTo.name}</span>}
            </div>
            {req.status === 'completed' && (
              <button className="cd-btn-pdf" onClick={() => downloadPdf(req._id)}>
                <Download size={14} /> Download PDF
              </button>
            )}
          </div>
        ))}
        {requests.length === 0 && (
          <div className="cd-empty">
            <span style={{ fontSize: '3rem' }}>🛠️</span>
            <p>No service requests yet. Click <strong>New Request</strong> to get started.</p>
          </div>
        )}
      </div>

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
