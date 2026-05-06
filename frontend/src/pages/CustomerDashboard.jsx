import { useState, useEffect } from 'react';
import api from '../utils/api';
import { PlusCircle, Download, Sparkles } from 'lucide-react';

export default function CustomerDashboard({ user }) {
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ problemText: '', location: '', urgency: 'medium' });
  const [aiCategory, setAiCategory] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSuggestService = async () => {
    if (!formData.problemText) return;
    setLoadingAi(true);
    try {
      const res = await api.post('/ai/suggest-service', { problemText: formData.problemText });
      setAiCategory(res.data.category);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!aiCategory) return alert('Please get AI suggestion first');
    setSubmitting(true);
    try {
      await api.post('/request', {
        serviceType: aiCategory,
        description: formData.problemText,
        location: formData.location,
        urgency: formData.urgency
      });
      setShowForm(false);
      setFormData({ problemText: '', location: '', urgency: 'medium' });
      setAiCategory('');
      fetchRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
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
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2>My Service Requests</h2>
        <button className="btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowForm(!showForm)}>
          <PlusCircle size={18} /> New Request
        </button>
      </div>

      {showForm && (
        <div className="glass-card" style={{ marginBottom: '32px' }}>
          <h3>Create Service Request (AI Assisted)</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label>Describe your problem</label>
              <textarea 
                className="input-field" 
                rows="3" 
                required
                value={formData.problemText}
                onChange={(e) => setFormData({...formData, problemText: e.target.value})}
                placeholder="e.g. My ceiling fan is making a weird noise and stopped working"
              ></textarea>
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', padding: '8px 16px' }}
                onClick={handleSuggestService}
                disabled={loadingAi}
              >
                <Sparkles size={16} color="var(--primary)" /> {loadingAi ? 'Analyzing...' : 'Suggest Category'}
              </button>
            </div>
            
            {aiCategory && (
              <div style={{ padding: '12px', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--primary)' }}>
                <span style={{ color: 'var(--text-muted)' }}>AI Suggested Category: </span>
                <strong style={{ color: 'var(--primary)' }}>{aiCategory}</strong>
              </div>
            )}

            <div className="form-group">
              <label>Location</label>
              <input type="text" className="input-field" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
            </div>

            <div className="form-group">
              <label>Urgency</label>
              <select className="input-field" value={formData.urgency} onChange={(e) => setFormData({...formData, urgency: e.target.value})}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <button type="submit" className="btn-primary" disabled={submitting || !aiCategory}>Submit Request</button>
          </form>
        </div>
      )}

      <div className="grid-cards">
        {requests.map(req => (
          <div key={req._id} className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ color: 'var(--primary)' }}>{req.serviceType}</h3>
              <span className={`badge badge-${req.status}`}>{req.status}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>{req.description}</p>
            <div style={{ fontSize: '0.875rem', marginBottom: '16px' }}>
              <p>📍 {req.location}</p>
              <p>⏳ Urgency: {req.urgency}</p>
              {req.assignedTo && <p>👷 Provider: {req.assignedTo.name}</p>}
            </div>
            {req.status === 'completed' && (
              <button className="btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }} onClick={() => downloadPdf(req._id)}>
                <Download size={16} /> Download PDF
              </button>
            )}
          </div>
        ))}
        {requests.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No service requests found.</p>}
      </div>
    </div>
  );
}
