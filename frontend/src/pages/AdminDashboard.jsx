import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Check, X, FileText, ExternalLink } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
                  <th>Email / Phone</th>
                  <th>Role</th>
                  <th>Address</th>
                  <th>Services</th>
                  <th>Document</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map(user => (
                  <tr key={user._id}>
                    {/* Name */}
                    <td><strong>{user.name}</strong></td>

                    {/* Email + Phone */}
                    <td style={{ color: 'var(--text-muted)' }}>
                      <div>{user.email}</div>
                      {user.phone && <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>📞 {user.phone}</div>}
                    </td>

                    {/* Role badge */}
                    <td><span className="badge badge-pending">{user.role}</span></td>

                    {/* Address */}
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '150px' }}>
                      {user.address || <span style={{ opacity: 0.4 }}>—</span>}
                    </td>

                    {/* Services */}
                    <td style={{ maxWidth: '180px' }}>
                      {user.services && user.services.length > 0 ? (
                        <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {user.services.map((s, i) => (
                            <li key={i}>{s.name}{s.details ? ` — ${s.details}` : ''}</li>
                          ))}
                        </ul>
                      ) : (
                        <span style={{ opacity: 0.4, fontSize: '0.85rem' }}>—</span>
                      )}
                    </td>

                    {/* Document */}
                    <td>
                      {user.documents && user.documents.length > 0 ? (
                        <a
                          href={`${API_BASE}${user.documents[0]}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: 'var(--accent)',
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                          }}
                          title="View uploaded document"
                        >
                          <FileText size={14} />
                          View Doc
                          <ExternalLink size={11} />
                        </a>
                      ) : (
                        <span style={{ opacity: 0.4, fontSize: '0.85rem' }}>No file</span>
                      )}
                    </td>

                    {/* Date */}
                    <td style={{ color: 'var(--text-muted)' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
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
