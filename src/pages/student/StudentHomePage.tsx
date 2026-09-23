import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FoodItem, CampusOutlet } from '../../types';
import { FoodCard } from '../../components/student/FoodCard';
import { FoodDetailModal } from '../../components/student/FoodDetailModal';
import {
  Search,
  Sparkles,
  ChevronRight,
  Flame,
  Coffee,
  CupSoda,
  Utensils,
  Clock,
  ArrowRight,
  Store,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const StudentHomePage: React.FC = () => {
  const { user, inventory, outlets, orders } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null);

  // Active student order banner
  const activeOrder = orders.find(
    (o) => o.status === 'Placed' || o.status === 'Preparing' || o.status === 'Ready'
  );

  const categories = [
    { label: 'All', icon: Utensils },
    { label: 'Rice', icon: Utensils },
    { label: 'Chicken', icon: Flame },
    { label: 'Snacks', icon: Sparkles },
    { label: 'Coffee', icon: Coffee },
    { label: 'Juice', icon: CupSoda },
  ];

  // Filter items
  const filteredItems = inventory.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.outletName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="app-main">
      {/* Top Greeting & Location */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
            UIU Campus, Madani Avenue
          </span>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)', letterSpacing: -0.4 }}>
            Hungry, {user?.name?.split(' ')[0] || 'Student'}? 🍔
          </h2>
        </div>
      </div>

      {/* Active Order Banner (If an order is live) */}
      {activeOrder && (
        <div
          onClick={() => navigate('/orders')}
          style={{
            background:
              activeOrder.status === 'Ready'
                ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                : 'linear-gradient(135deg, #1E1E24 0%, #2D3142 100%)',
            color: 'white',
            borderRadius: 20,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', opacity: 0.85 }}>
                  Active Order #{activeOrder.id}
                </span>
                <span
                  style={{
                    background: activeOrder.status === 'Ready' ? '#10B981' : '#F68920',
                    color: 'white',
                    fontSize: 9,
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: 9999,
                  }}
                >
                  {activeOrder.status}
                </span>
              </div>
              <p style={{ fontSize: 13, fontWeight: 700 }}>
                {activeOrder.items.map((i) => `${i.quantity}x ${i.item.name}`).join(', ')}
              </p>
            </div>
          </div>
          <ChevronRight size={18} />
        </div>
      )}

      {/* Search Input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--bg-card)',
          padding: '10px 16px',
          borderRadius: 9999,
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <Search size={18} color="var(--text-light)" />
        <input
          type="text"
          placeholder="Search Chicken Fry, Khichuri, Coffee..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontSize: 13,
            width: '100%',
            color: 'var(--text-main)',
          }}
        />
      </div>

      {/* Hero Food Banner */}
      <div className="hero-banner">
        <div className="hero-banner-content">
          <span className="hero-badge">UIU CAMPUS EXCLUSIVE</span>
          <h3 className="hero-title">Freshly Prepared on Campus.</h3>
          <p className="hero-desc">Pre-order ahead from Khan&apos;s Kitchen, Olympia & Brew. Skip the long rush lines.</p>
          <button
            className="btn-secondary"
            onClick={() => navigate('/explore')}
            style={{
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 700,
              background: 'white',
              color: '#C25700',
              border: 'none',
            }}
          >
            Explore Outlets <ArrowRight size={14} />
          </button>
        </div>
        <img
          src="https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&q=80"
          alt="Chicken Fry Banner"
          className="hero-bg-img"
        />
      </div>

      {/* Food Categories */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800 }}>Categories</h3>
        </div>
        <div className="category-row">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className={`category-pill ${isSelected ? 'active' : ''}`}
              >
                <Icon size={15} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Campus Food Outlets Carousel */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800 }}>Campus Food Outlets</h3>
          <Link
            to="/explore"
            style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}
          >
            View All ({outlets.length})
          </Link>
        </div>

        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}>
          {outlets.map((outlet: CampusOutlet) => (
            <Link
              key={outlet.id}
              to={`/outlet/${outlet.id}`}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                flexShrink: 0,
                width: 170,
              }}
            >
              <div
                className="card-base card-hover"
                style={{
                  padding: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <img
                  src={outlet.image}
                  alt={outlet.name}
                  style={{ width: '100%', height: 95, borderRadius: 14, objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                    {outlet.name}
                  </h4>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{outlet.totalItems} items</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Food Items Grid (Popular Picks) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800 }}>Popular Campus Picks</h3>
          <span style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 600 }}>
            {filteredItems.length} available
          </span>
        </div>

        <div className="grid-2col">
          {filteredItems.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              onSelect={(food) => setSelectedFoodItem(food)}
            />
          ))}
        </div>
      </div>

      {/* Demo Disclaimer */}
      <p style={{ fontSize: 11, color: 'var(--text-light)', textAlign: 'center', marginTop: 10 }}>
        Prototype demo data — not official UIU operational data.
      </p>

      {/* Food Detail Modal */}
      <FoodDetailModal
        item={selectedFoodItem}
        onClose={() => setSelectedFoodItem(null)}
      />
    </div>
  );
};
