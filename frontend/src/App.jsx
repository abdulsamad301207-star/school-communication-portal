import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HelpProvider } from './context/HelpContext';

// Set base URL for API
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Admin Pages
import LandingPage from './pages/admin/LandingPage';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import Compose from './pages/admin/Compose';
import Templates from './pages/admin/Templates';
import Recipients from './pages/admin/Recipients';
import History from './pages/admin/History';
import Attendance from './pages/admin/Attendance';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import HelpRequests from './pages/admin/HelpRequests';
// Portal Pages
import PortalLogin from './pages/portal/PortalLogin';
import Inbox from './pages/portal/Inbox';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) {
    // Redirect to the correct login page based on the route's target audience
    const isPortalRoute = allowedRoles && (allowedRoles.includes('parent') || allowedRoles.includes('student'));
    return <Navigate to={isPortalRoute ? '/login' : '/admin-login'} replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

// Auto-redirect from login pages when already authenticated
const AdminLoginRoute = () => {
  const { user } = useAuth();
  if (user && (user.role === 'super_admin' || user.role === 'staff')) return <Navigate to="/dashboard" replace />;
  if (user && (user.role === 'parent' || user.role === 'student')) return <Navigate to="/portal/inbox" replace />;
  return <AdminLogin />;
};

const PortalLoginRoute = () => {
  const { user } = useAuth();
  if (user && (user.role === 'parent' || user.role === 'student')) return <Navigate to="/portal/inbox" replace />;
  if (user && (user.role === 'super_admin' || user.role === 'staff')) return <Navigate to="/dashboard" replace />;
  return <PortalLogin />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin-login" element={<AdminLoginRoute />} />
      <Route path="/login" element={<PortalLoginRoute />} />

      {/* Admin Protected */}
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['super_admin', 'staff']}><Dashboard /></ProtectedRoute>} />
      <Route path="/compose" element={<ProtectedRoute allowedRoles={['super_admin', 'staff']}><Compose /></ProtectedRoute>} />
      <Route path="/templates" element={<ProtectedRoute allowedRoles={['super_admin', 'staff']}><Templates /></ProtectedRoute>} />
      <Route path="/recipients" element={<ProtectedRoute allowedRoles={['super_admin', 'staff']}><Recipients /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute allowedRoles={['super_admin', 'staff']}><History /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute allowedRoles={['super_admin', 'staff']}><Attendance /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute allowedRoles={['super_admin', 'staff']}><Reports /></ProtectedRoute>} />
      <Route path="/help-requests" element={<ProtectedRoute allowedRoles={['super_admin', 'staff']}><HelpRequests /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute allowedRoles={['super_admin', 'staff']}><Settings /></ProtectedRoute>} />


      {/* Portal Protected */}
      <Route path="/portal/inbox" element={<ProtectedRoute allowedRoles={['parent', 'student']}><Inbox /></ProtectedRoute>} />
      
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <HelpProvider>
          <AppRoutes />
        </HelpProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
