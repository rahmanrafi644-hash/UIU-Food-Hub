import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { DeviceFrame } from './components/common/DeviceFrame';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { CartDrawer } from './components/student/CartDrawer';
import { CheckoutModal } from './components/student/CheckoutModal';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { StudentHomePage } from './pages/student/StudentHomePage';
import { StudentExplorePage } from './pages/student/StudentExplorePage';
import { OutletDetailPage } from './pages/student/OutletDetailPage';
import { StudentOrdersPage } from './pages/student/StudentOrdersPage';
import { StudentTablesPage } from './pages/student/StudentTablesPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';

import { VendorDashboardPage } from './pages/vendor/VendorDashboardPage';
import { VendorOrdersPage } from './pages/vendor/VendorOrdersPage';
import { VendorInventoryPage } from './pages/vendor/VendorInventoryPage';
import { VendorAiAssistantPage } from './pages/vendor/VendorAiAssistantPage';
import { VendorTablesPage } from './pages/vendor/VendorTablesPage';
import { VendorReportsPage } from './pages/vendor/VendorReportsPage';
import { VendorMessagesPage } from './pages/vendor/VendorMessagesPage';

// Strict Role Guard for Students
const RequireStudent: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'student') return <Navigate to="/vendor" replace />;
  return children;
};

// Open & Free Access for Vendors (so faculty can directly inspect any vendor outlet without registration)
const RequireVendor: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loginAsVendorFree } = useApp();

  React.useEffect(() => {
    if (!user || user.role !== 'vendor') {
      loginAsVendorFree('khans-kitchen');
    }
  }, [user, loginAsVendorFree]);

  if (!user || user.role !== 'vendor') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
        <div className="spinner" />
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
          Opening Vendor Operations (Free Faculty Access)...
        </span>
      </div>
    );
  }

  return children;
};

const AppLayout: React.FC = () => {
  const { user } = useApp();
  const location = useLocation();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/reset-password';

  return (
    <DeviceFrame>
      {!isAuthPage && user && <Header />}

      <Routes>
        {/* Auth Routes */}
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to={user.role === 'vendor' ? '/vendor' : '/'} replace />}
        />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Student Routes (Protected - Student Only) */}
        <Route
          path="/"
          element={
            <RequireStudent>
              <StudentHomePage />
            </RequireStudent>
          }
        />
        <Route
          path="/explore"
          element={
            <RequireStudent>
              <StudentExplorePage />
            </RequireStudent>
          }
        />
        <Route
          path="/outlet/:outletId"
          element={
            <RequireStudent>
              <OutletDetailPage />
            </RequireStudent>
          }
        />
        <Route
          path="/orders"
          element={
            <RequireStudent>
              <StudentOrdersPage />
            </RequireStudent>
          }
        />
        <Route
          path="/tables"
          element={
            <RequireStudent>
              <StudentTablesPage />
            </RequireStudent>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireStudent>
              <StudentProfilePage />
            </RequireStudent>
          }
        />

        {/* Vendor Routes (Protected - Vendor Only) */}
        <Route
          path="/vendor"
          element={
            <RequireVendor>
              <VendorDashboardPage />
            </RequireVendor>
          }
        />
        <Route
          path="/vendor/orders"
          element={
            <RequireVendor>
              <VendorOrdersPage />
            </RequireVendor>
          }
        />
        <Route
          path="/vendor/inventory"
          element={
            <RequireVendor>
              <VendorInventoryPage />
            </RequireVendor>
          }
        />
        <Route
          path="/vendor/ai"
          element={
            <RequireVendor>
              <VendorAiAssistantPage />
            </RequireVendor>
          }
        />
        <Route
          path="/vendor/tables"
          element={
            <RequireVendor>
              <VendorTablesPage />
            </RequireVendor>
          }
        />
        <Route
          path="/vendor/reports"
          element={
            <RequireVendor>
              <VendorReportsPage />
            </RequireVendor>
          }
        />
        <Route
          path="/vendor/messages"
          element={
            <RequireVendor>
              <VendorMessagesPage />
            </RequireVendor>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={user?.role === 'vendor' ? '/vendor' : '/'} replace />} />
      </Routes>

      {/* Floating Bottom Nav */}
      {!isAuthPage && user && <BottomNav onOpenCart={() => setIsCartOpen(true)} />}

      {/* Cart & Checkout Modals for Student */}
      {user?.role === 'student' && (
        <>
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            onProceedCheckout={() => setIsCheckoutOpen(true)}
          />
          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
          />
        </>
      )}
    </DeviceFrame>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
