import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2, Zap, Clock, Building2, Wrench, X } from 'lucide-react';
import api from '../utils/api';

// ─── Fastlane Service Catalogue ─────────────────────────────────────────────
export const FASTLANE_SERVICES = [
  { id: 1,  name: 'Instant Visit',                price: '₹250 + S.C',  time: '2–4 hrs',   icon: '⚡', tag: 'FAST'    },
  { id: 2,  name: 'General Visit',                price: '₹200 + S.C',  time: '24 hrs',    icon: '🏠', tag: 'POPULAR' },
  { id: 3,  name: 'A.C Jet Machine Service',      price: '₹1,099',       time: 'Scheduled', icon: '❄️',  tag: 'MACHINE' },
  { id: 4,  name: 'Water Tank Cleaning',          price: '₹1,599',       time: 'Scheduled', icon: '💧', tag: 'MACHINE' },
  { id: 5,  name: 'Air Cooler Service',           price: '₹349',         time: 'Scheduled', icon: '🌬️', tag: ''        },
  { id: 6,  name: 'Washing Machine Service',      price: '₹899',         time: 'Scheduled', icon: '🫧', tag: ''        },
  { id: 7,  name: 'Generator/Inverter Rental',    price: '₹699',         time: 'Scheduled', icon: '🔋', tag: 'RENTAL'  },
  { id: 8,  name: 'Chimney Services',             price: '₹1,099',       time: 'Scheduled', icon: '🏭', tag: ''        },
  { id: 9,  name: 'Aquaguard Service',            price: '₹399',         time: 'Scheduled', icon: '🚰', tag: ''        },
  { id: 10, name: 'Janitorial Services',          price: '₹449',         time: 'Scheduled', icon: '🧹', tag: ''        },
  { id: 11, name: '2-Wheeler Service @ Doorstep', price: '₹499',         time: 'Scheduled', icon: '🏍️', tag: ''        },
  { id: 12, name: 'Others (Please Specify)',       price: 'As per scope', time: 'Flexible',  icon: '📋', tag: 'CUSTOM'  },
];

const STEPS = ['Service', 'Provider', 'Details', 'Contact'];

const initials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

/**
 * BookingWizard
 * Props:
 *   isOpen        {bool}   – whether to show the modal
 *   onClose       {fn}     – called when wizard closes (cancel or success)
 *   onSuccess     {fn}     – called after successful submission
 *   user          {obj}    – logged-in user (name, address, phone, …)
 *   initialService{obj}    – optional pre-selected service object
 */
export default function BookingWizard({ isOpen, onClose, onSuccess, user, initialService = null }) {
  const [step, setStep]                   = useState(0);
  const [providers, setProviders]         = useState([]);
  const [loadingProviders, setLoading]    = useState(false);
  const [submitting, setSubmitting]       = useState(false);

  const [selectedService,  setSelectedService]  = useState(initialService);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [description,      setDescription]      = useState('');
  const [photo,            setPhoto]            = useState(null);
  const [address,          setAddress]          = useState(user?.address || '');
  const [phone,            setPhone]            = useState(user?.phone   || '');

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setStep(initialService ? 1 : 0);
      setSelectedService(initialService);
      setSelectedProvider(null);
      setDescription('');
      setPhoto(null);
      setAddress(user?.address || '');
      setPhone(user?.phone   || '');
      loadProviders();
    }
  }, [isOpen]);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/providers');
      setProviders(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const canNext = () => {
    if (step === 0) return !!selectedService;
    if (step === 1) return !!selectedProvider;
    if (step === 2) return description.trim().length > 0;
    return address.trim() && phone.trim();
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!canNext()) return;
    setSubmitting(true);
    try {
      await api.post('/request', {
        serviceType:  selectedService.name,
        description,
        location:     address,
        urgency:      selectedService.id === 1 ? 'high' : 'medium',
        providerId:   selectedProvider._id,
        servicePrice: selectedService.price,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cd-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cd-modal">
        {/* Close */}
        <button className="cd-modal-close" onClick={onClose}><X size={20} /></button>

        {/* Welcome Banner */}
        <div className="cd-welcome-banner">
          <Zap size={20} color="#fff" />
          <span>Welcome to <strong>Fastlane</strong> — Proceed with a single tap</span>
          <span className="cd-welcome-note">Extra charges apply beyond 5 km radius</span>
        </div>

        {/* Step Indicator */}
        <div className="cd-steps">
          {STEPS.map((label, idx) => (
            <div key={label} className={`cd-step ${idx < step ? 'done' : ''} ${idx === step ? 'active' : ''}`}>
              <div className="cd-step-circle">
                {idx < step ? <CheckCircle2 size={16} /> : <span>{idx + 1}</span>}
              </div>
              <span className="cd-step-label">{label}</span>
              {idx < 3 && <div className={`cd-step-line ${idx < step ? 'done' : ''}`} />}
            </div>
          ))}
        </div>

        {/* ── Step 0: Select Service ── */}
        {step === 0 && (
          <div className="cd-step-body">
            <h3 className="cd-step-heading">Select a Service</h3>
            <div className="cd-service-grid">
              {FASTLANE_SERVICES.map(svc => (
                <div
                  key={svc.id}
                  className={`cd-service-card ${selectedService?.id === svc.id ? 'selected' : ''}`}
                  onClick={() => setSelectedService(svc)}
                >
                  <div className="cd-svc-top">
                    <span className="cd-svc-num">{svc.id}</span>
                    {svc.tag && <span className={`cd-svc-tag cd-tag-${svc.tag}`}>{svc.tag}</span>}
                  </div>
                  <div className="cd-svc-icon">{svc.icon}</div>
                  <div className="cd-svc-name">{svc.name}</div>
                  <div className="cd-svc-price">{svc.price}</div>
                  <div className="cd-svc-time"><Clock size={11} /> {svc.time}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 1: Select Provider ── */}
        {step === 1 && (
          <div className="cd-step-body">
            <h3 className="cd-step-heading">Select a Provider</h3>
            {loadingProviders ? (
              <div className="cd-loading">Loading providers...</div>
            ) : providers.length === 0 ? (
              <div className="cd-empty-providers">
                <span>😕</span>
                <p>No approved providers available yet.</p>
              </div>
            ) : (
              <div className="cd-provider-list">
                {providers.map(prov => (
                  <div
                    key={prov._id}
                    className={`cd-provider-card ${selectedProvider?._id === prov._id ? 'selected' : ''}`}
                    onClick={() => setSelectedProvider(prov)}
                  >
                    <div className="cd-prov-avatar">{initials(prov.name)}</div>
                    <div className="cd-prov-info">
                      <span className="cd-prov-name">{prov.name}</span>
                      <span className={`cd-prov-role cd-role-${prov.role}`}>
                        {prov.role === 'organization' ? <Building2 size={11} /> : <Wrench size={11} />}
                        {prov.role.toUpperCase()}
                      </span>
                      {prov.address && <span className="cd-prov-addr">📍 {prov.address}</span>}
                    </div>
                    {selectedProvider?._id === prov._id && (
                      <CheckCircle2 size={20} className="cd-prov-check" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Request Details ── */}
        {step === 2 && (
          <div className="cd-step-body">
            <h3 className="cd-step-heading">Request Details</h3>
            <div className="cd-selected-summary">
              <span>{selectedService?.icon} {selectedService?.name}</span>
              <span className="cd-selected-price">{selectedService?.price}</span>
            </div>
            <div className="cd-form-group">
              <label>Describe the Problem <span className="req">*</span></label>
              <textarea
                rows={4}
                placeholder="e.g. My AC is not cooling properly, making noise..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <div className="cd-form-group">
              <label>Upload Photo <span className="opt">(Optional)</span></label>
              <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} />
              {photo && <span className="cd-photo-name">📎 {photo.name}</span>}
            </div>
          </div>
        )}

        {/* ── Step 3: Contact Info ── */}
        {step === 3 && (
          <div className="cd-step-body">
            <h3 className="cd-step-heading">Contact Information</h3>
            <div className="cd-order-summary">
              <div className="cd-order-row"><span>Service</span><strong>{selectedService?.name}</strong></div>
              <div className="cd-order-row"><span>Price</span><strong>{selectedService?.price}</strong></div>
              <div className="cd-order-row"><span>Provider</span><strong>{selectedProvider?.name}</strong></div>
              <div className="cd-order-note">⚠️ Extra charges apply beyond 5 km radius</div>
            </div>
            <div className="cd-form-group">
              <label>Address <span className="req">*</span></label>
              <input type="text" placeholder="Your full address" value={address} onChange={e => setAddress(e.target.value)} />
            </div>
            <div className="cd-form-group">
              <label>Phone Number <span className="req">*</span></label>
              <input type="tel" placeholder="10-digit mobile number" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="cd-modal-footer">
          {step > 0 ? (
            <button className="cd-btn-back" onClick={prevStep}>
              <ChevronLeft size={16} /> Back
            </button>
          ) : <div />}

          {step < 3 ? (
            <button className="cd-btn-next" onClick={nextStep} disabled={!canNext()}>
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button className="cd-btn-submit" onClick={handleSubmit} disabled={submitting || !canNext()}>
              {submitting ? 'Submitting...' : '✅ Submit Request'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
