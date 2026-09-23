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

const AppLayout: React.FC = () => {
  const { user } = useApp();
  const location = useLocation();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const isAuthPage = location.pathname === '/login';

  return (
    <DeviceFrame>
      {!isAuthPage && user && <Header />}

      <Routes>
        {/* Auth */}
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to={user.role === 'vendor' ? '/vendor' : '/'} replace />}
        />

        {/* Student Routes */}
        <Route
          path="/"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : user.role === 'vendor' ? (
              <Navigate to="/vendor" replace />
            ) : (
              <StudentHomePage />
            )
          }
        />
        <Route
          path="/explore"
          element={!user ? <Navigate to="/login" replace /> : <StudentExplorePage />}
        />
        <Route
          path="/outlet/:outletId"
          element={!user ? <Navigate to="/login" replace /> : <OutletDetailPage />}
        />
        <Route
          path="/orders"
          element={!user ? <Navigate to="/login" replace /> : <StudentOrdersPage />}
        />
        <Route
          path="/tables"
          element={!user ? <Navigate to="/login" replace /> : <StudentTablesPage />}
        />
        <Route
          path="/profile"
          element={!user ? <Navigate to="/login" replace /> : <StudentProfilePage />}
        />

        {/* Vendor Routes */}
        <Route
          path="/vendor"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : user.role === 'student' ? (
              <Navigate to="/" replace />
            ) : (
              <VendorDashboardPage />
            )
          }
        />
        <Route
          path="/vendor/orders"
          element={!user ? <Navigate to="/login" replace /> : <VendorOrdersPage />}
        />
        <Route
          path="/vendor/inventory"
          element={!user ? <Navigate to="/login" replace /> : <VendorInventoryPage />}
        />
        <Route
          path="/vendor/ai"
          element={!user ? <Navigate to="/login" replace /> : <VendorAiAssistantPage />}
        />
        <Route
          path="/vendor/tables"
          element={!user ? <Navigate to="/login" replace /> : <VendorTablesPage />}
        />
        <Route
          path="/vendor/reports"
          element={!user ? <Navigate to="/login" replace /> : <VendorReportsPage />}
        />
        <Route
          path="/vendor/messages"
          element={!user ? <Navigate to="/login" replace /> : <VendorMessagesPage />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
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

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
