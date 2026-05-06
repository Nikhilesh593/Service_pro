import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Check, X } from 'lucide-react';

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const res = await api.get('/admin/pending-users');
      setPendingUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/approve/${id}`);
      fetchPendingUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/admin/reject/${id}`);
      fetchPendingUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Admin Dashboard</h2>
      
      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Pending Approvals</h3>
        
        {pendingUsers.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No pending users.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map(user => (
                  <tr key={user._id}>
                    <td><strong>{user.name}</strong></td>
                    <td style={{ color: 'var(--text-muted)' }}>{user.email}</td>
                    <td><span className="badge badge-pending">{user.role}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn-primary" 
                          style={{ background: 'var(--success)', padding: '6px 12px', width: 'auto' }}
                          onClick={() => handleApprove(user._id)}
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          className="btn-primary" 
                          style={{ background: 'var(--danger)', padding: '6px 12px', width: 'auto' }}
                          onClick={() => handleReject(user._id)}
                          title="Reject"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
