import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';
import Navbar from './components/Navbar';

function AppContent() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isLandingPage = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isDashboard = location.pathname.includes('-dashboard');

  return (
    <div className="app-container">
      {user && isDashboard && <Navbar user={user} onLogout={handleLogout} />}
      <main style={
        isAuthPage
          ? { flex: 1, width: '100%', padding: 0, maxWidth: 'none', margin: 0 }
          : isLandingPage
            ? { flex: 1, width: '100%' }
            : { padding: '32px', flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%' }
      }>
        <Routes>
          <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to={`/${user.role}-dashboard`} />} />
          <Route path="/register" element={!user ? <Register setUser={setUser} /> : <Navigate to={`/${user.role}-dashboard`} />} />

          <Route path="/customer-dashboard" element={user?.role === 'customer' ? <CustomerDashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/technician-dashboard" element={user?.role === 'technician' || user?.role === 'organization' ? <TechnicianDashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/organization-dashboard" element={user?.role === 'organization' || user?.role === 'technician' ? <TechnicianDashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/admin-dashboard" element={user?.role === 'admin' ? <AdminDashboard user={user} /> : <Navigate to="/login" />} />

          <Route path="/" element={<LandingPage user={user} onLogout={handleLogout} />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
