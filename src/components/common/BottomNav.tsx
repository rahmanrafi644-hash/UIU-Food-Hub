import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Home,
  Compass,
  ShoppingBag,
  Clock,
  CalendarDays,
  User,
  LayoutDashboard,
  Boxes,
  Sparkles,
  ClipboardList,
  AlertCircle,
} from 'lucide-react';

interface BottomNavProps {
  onOpenCart?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenCart }) => {
  const { user, cart, reports } = useApp();
  const location = useLocation();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const openReportsCount = reports.filter((r) => r.status === 'Open').length;

  if (user?.role === 'vendor') {
    const vendorLinks = [
      { to: '/vendor', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/vendor/orders', label: 'Orders', icon: Clock },
      { to: '/vendor/inventory', label: 'Stock', icon: Boxes },
      { to: '/vendor/ai', label: 'AI Demand', icon: Sparkles, highlight: true },
      { to: '/vendor/tables', label: 'Tables', icon: CalendarDays },
      { to: '/vendor/reports', label: 'Issues', icon: AlertCircle, badge: openReportsCount },
    ];

    return (
      <div className="bottom-nav-container">
        <nav className="floating-bottom-nav" style={{ padding: '6px 8px' }}>
          {vendorLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-item-btn ${isActive ? 'active' : ''}`}
                style={{
                  position: 'relative',
                  padding: '6px 8px',
                  color: item.highlight && !isActive ? '#D97706' : undefined,
                }}
              >
                <Icon size={18} />
                <span style={{ fontSize: 10 }}>{item.label}</span>
                {item.badge && item.badge > 0 ? (
                  <span
                    style={{
                      position: 'absolute',
                      top: 2,
                      right: 4,
                      background: '#EF4444',
                      color: 'white',
                      fontSize: 9,
                      fontWeight: 800,
                      borderRadius: 9999,
                      padding: '1px 4px',
                    }}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>
    );
  }

  // Student Navigation
  const studentLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/explore', label: 'Explore', icon: Compass },
    { to: '/orders', label: 'Orders', icon: Clock },
    { to: '/tables', label: 'Tables', icon: CalendarDays },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="bottom-nav-container">
      <nav className="floating-bottom-nav">
        {/* Home & Explore */}
        {studentLinks.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-item-btn ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Center Floating Cart Button */}
        <button
          className="nav-item-cart-circle"
          onClick={onOpenCart}
          title="Open Cart"
        >
          <ShoppingBag size={22} />
          {totalCartCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                background: '#1E1E24',
                color: 'white',
                fontSize: 10,
                fontWeight: 800,
                borderRadius: 9999,
                padding: '2px 6px',
                border: '2px solid white',
              }}
            >
              {totalCartCount}
            </span>
          )}
        </button>

        {/* Orders, Tables, Profile */}
        {studentLinks.slice(2).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-item-btn ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
