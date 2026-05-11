import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomerChatbot from './components/CustomerChatbot';

const TECH_ROUTES = [ '/technician-dashboard', '/organization-dashboard' ];

function AppContent() {
  const [ user, setUser ] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isLandingPage = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isTechPage = TECH_ROUTES.includes(location.pathname);
  const isCustomerPage = location.pathname === '/customer-dashboard';

  // Dashboards with their own sidebar skip global Navbar
  const showNavbar = user && !isAuthPage && !isTechPage && !isCustomerPage && !isLandingPage;

  return (
    <div className="app-container">
      {showNavbar && <Navbar user={user} onLogout={handleLogout} />}
      <main style={
        isAuthPage
          ? { flex: 1, width: '100%', padding: 0, maxWidth: 'none', margin: 0 }
          : isLandingPage
            ? { flex: 1, width: '100%' }
            : isTechPage || isCustomerPage
              ? { flex: 1, width: '100%', padding: 0, maxWidth: 'none', margin: 0 }
              : { padding: '32px', flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%' }
      }>
        <Routes>
          <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register setUser={setUser} /> : <Navigate to="/" />} />

          <Route path="/customer-dashboard" element={user?.role === 'customer' ? <CustomerDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/technician-dashboard" element={user?.role === 'technician' || user?.role === 'organization' ? <TechnicianDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/organization-dashboard" element={user?.role === 'organization' || user?.role === 'technician' ? <TechnicianDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/admin-dashboard" element={user?.role === 'admin' ? <AdminDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />

          <Route path="/" element={<LandingPage user={user} onLogout={handleLogout} />} />
        </Routes>
      </main>

      {/* Show Footer on Landing Page */}
      {isLandingPage && <Footer />}

      {/* Global AI Chatbot for Customers */}
      {user?.role === 'customer' && <CustomerChatbot />}
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
