import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { FoodItem } from '../../types';
import { FoodCard } from '../../components/student/FoodCard';
import { FoodDetailModal } from '../../components/student/FoodDetailModal';
import { ArrowLeft, MapPin, Clock, Star, Search, Calendar, MessageSquare, Activity } from 'lucide-react';
import { TableBookingModal } from '../../components/student/TableBookingModal';
import { ChatDrawerModal } from '../../components/chat/ChatDrawerModal';

export const OutletDetailPage: React.FC = () => {
  const { outletId } = useParams<{ outletId: string }>();
  const navigate = useNavigate();
  const { outlets, inventory } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const outlet = outlets.find((o) => o.id === outletId) || outlets[0];
  const outletItems = inventory.filter((i) => i.outletId === outlet.id);

  const categories = ['All', ...Array.from(new Set(outletItems.map((i) => i.category)))];

  const filteredItems = outletItems.filter((i) => {
    const matchesCat = selectedCategory === 'All' || i.category === selectedCategory;
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const operationalStatus = outlet.operationalStatus || 'Open';

  return (
    <div className="app-main" style={{ padding: 0 }}>
      {/* Outlet Banner Header */}
      <div style={{ position: 'relative', width: '100%', height: 210 }}>
        <img
          src={outlet.image}
          alt={outlet.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)',
          }}
        />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="btn-icon-circle"
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            border: 'none',
          }}
        >
          <ArrowLeft size={18} />
        </button>

        {/* Direct Chat Button on Banner */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="btn-icon-circle"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(8px)',
            border: 'none',
            color: 'var(--primary)',
          }}
          title="Direct Message to Kitchen"
        >
          <MessageSquare size={18} />
        </button>

        {/* Title & Info Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            left: 18,
            right: 18,
            color: 'white',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span
              style={{
                background:
                  operationalStatus === 'Open'
                    ? '#059669'
                    : operationalStatus === 'Busy'
                    ? '#D97706'
                    : '#DC2626',
                color: 'white',
                fontSize: 10,
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 9999,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Activity size={11} />
              {operationalStatus === 'Open'
                ? 'OPEN FOR ORDERS'
                : operationalStatus === 'Busy'
                ? 'KITCHEN BUSY (+15m)'
                : 'ORDERS PAUSED'}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700 }}>
              <Star size={12} fill="#FBBF24" color="#FBBF24" />
              {outlet.rating}
            </div>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>{outlet.name}</h1>

          <div style={{ display: 'flex', gap: 12, fontSize: 11, opacity: 0.9, marginTop: 4 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={12} /> {outlet.location}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} /> {outlet.openingHours}
            </span>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Table Booking & Direct Message Action Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            className="btn-secondary"
            onClick={() => setIsChatOpen(true)}
            style={{ padding: '10px 12px', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <MessageSquare size={15} color="var(--primary)" /> Message Outlet
          </button>

          <button
            className="btn-primary"
            onClick={() => setIsBookingOpen(true)}
            style={{ padding: '10px 12px', fontSize: 12 }}
          >
            <Calendar size={14} /> Book Table
          </button>
        </div>

        {/* Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--bg-card)',
            padding: '8px 14px',
            borderRadius: 9999,
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Search size={16} color="var(--text-light)" />
          <input
            type="text"
            placeholder={`Search ${outlet.name} menu...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: 13,
              width: '100%',
            }}
          />
        </div>

        {/* Category Filter */}
        <div className="category-row">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Items Grid */}
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

      {/* Modals */}
      <FoodDetailModal
        item={selectedFoodItem}
        onClose={() => setSelectedFoodItem(null)}
      />

      <TableBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        preselectedOutletId={outlet.id}
      />

      <ChatDrawerModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        targetOutletId={outlet.id}
      />
    </div>
  );
};
