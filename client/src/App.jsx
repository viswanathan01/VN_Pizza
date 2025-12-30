import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import { injectTokenGetter } from './api/axios';

// Pages
import Home from './pages/Home';
import Menu from './pages/Menu';
import Builder from './pages/Builder';
import Orders from './pages/Orders';
import Cart from './pages/Cart';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminInventory from './pages/AdminInventory';
import AdminUsers from './pages/AdminUsers';
import ChefDashboard from './pages/ChefDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';

// Component to bridge Clerk Auth with our Axios instance
const AuthInitializer = ({ children }) => {
  const { getToken, isLoaded } = useAuth();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      injectTokenGetter(getToken);
      setInitialized(true);
    }
  }, [isLoaded, getToken]);

  if (!isLoaded || !initialized) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return children;
};

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin" />
      <p className="text-luxury-gold text-xs font-black uppercase tracking-widest animate-pulse">Authenticating...</p>
    </div>
  );

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  const role = user.publicMetadata?.role?.toUpperCase() || 'USER';

  if (adminOnly && role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthInitializer>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1F2937',
            color: '#fff',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)'
          },
        }}
      />
      <Routes>
        {/* Auth */}
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />

        {/* Customer App (Wrapped in Layout) */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/builder" element={<ProtectedRoute><Builder /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        </Route>

        {/* Special Role Dashboards */}
        <Route path="/chef" element={<ProtectedRoute><ChefDashboard /></ProtectedRoute>} />
        <Route path="/delivery" element={<ProtectedRoute><DeliveryDashboard /></ProtectedRoute>} />

        {/* Admin Routes (Protected) */}
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthInitializer>
  );
}

export default App;
