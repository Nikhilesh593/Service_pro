import { useState, useEffect } from 'react';
import api from '../utils/api';
import { CheckCircle, Clock } from 'lucide-react';

export default function TechnicianDashboard({ user }) {
  const [availableRequests, setAvailableRequests] = useState([]);
  const [myJobs, setMyJobs] = useState([]);

  useEffect(() => {
    if (user.status === 'approved') {
      fetchAvailableRequests();
      fetchMyJobs();
    }
  }, [user.status]);

  const fetchAvailableRequests = async () => {
    try {
      const res = await api.get('/request/all');
      setAvailableRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyJobs = async () => {
    try {
      const res = await api.get('/request/my');
      setMyJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const acceptJob = async (id) => {
    try {
      await api.put(`/request/accept/${id}`);
      fetchAvailableRequests();
      fetchMyJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const completeJob = async (id) => {
    try {
      await api.put(`/request/complete/${id}`);
      fetchMyJobs();
    } catch (err) {
      console.error(err);
    }
  };

  if (user.status !== 'approved') {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '48px', maxWidth: '600px', margin: '40px auto' }}>
        <Clock size={48} color="var(--warning)" style={{ marginBottom: '16px' }} />
        <h2 style={{ color: 'var(--warning)', marginBottom: '8px' }}>Account Pending Approval</h2>
        <p style={{ color: 'var(--text-muted)' }}>Your account is currently under review by the admin. You will be able to access the dashboard once approved.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>My Assigned Jobs</h2>
      <div className="grid-cards" style={{ marginBottom: '48px' }}>
        {myJobs.map(job => (
          <div key={job._id} className="glass-card" style={{ borderLeft: `4px solid ${job.status === 'completed' ? 'var(--success)' : 'var(--primary)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ color: 'var(--primary)' }}>{job.serviceType}</h3>
              <span className={`badge badge-${job.status}`}>{job.status}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>{job.description}</p>
            <div style={{ fontSize: '0.875rem', marginBottom: '16px' }}>
              <p>📍 {job.location}</p>
              <p>👤 Customer: {job.userId?.name}</p>
              <p>⏳ Urgency: {job.urgency}</p>
            </div>
            {job.status === 'accepted' && (
              <button className="btn-primary" style={{ background: 'var(--success)', width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }} onClick={() => completeJob(job._id)}>
                <CheckCircle size={16} /> Mark as Completed
              </button>
            )}
          </div>
        ))}
        {myJobs.length === 0 && <p style={{ color: 'var(--text-muted)' }}>You haven't accepted any jobs yet.</p>}
      </div>

      <h2 style={{ marginBottom: '24px' }}>Available Requests</h2>
      <div className="grid-cards">
        {availableRequests.map(req => (
          <div key={req._id} className="glass-card">
            <h3 style={{ color: 'var(--primary)', marginBottom: '8px' }}>{req.serviceType}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>{req.description}</p>
            <div style={{ fontSize: '0.875rem', marginBottom: '16px' }}>
              <p>📍 {req.location}</p>
              <p>⏳ Urgency: {req.urgency}</p>
            </div>
            <button className="btn-secondary" style={{ width: '100%', color: 'var(--primary)', borderColor: 'var(--primary)' }} onClick={() => acceptJob(req._id)}>
              Accept Job
            </button>
          </div>
        ))}
        {availableRequests.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No available requests at the moment.</p>}
      </div>
    </div>
  );
}
