import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StockIntakeModal } from '../../components/vendor/StockIntakeModal';
import { PlusCircle, Search, Sparkles, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const VendorInventoryPage: React.FC = () => {
  const { inventory, outlets } = useApp();
  const navigate = useNavigate();

  const [selectedOutlet, setSelectedOutlet] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedItemIdForRestock, setSelectedItemIdForRestock] = useState<string | undefined>(undefined);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  const filteredItems = inventory.filter((item) => {
    const matchesOutlet = selectedOutlet === 'all' || item.outletId === selectedOutlet;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesOutlet && matchesSearch;
  });

  const handleOpenRestock = (itemId?: string) => {
    setSelectedItemIdForRestock(itemId);
    setIsStockModalOpen(true);
  };

  return (
    <div className="app-main">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Live Inventory</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Shared real-time stock across student and vendor apps
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => handleOpenRestock()}
          style={{ padding: '8px 14px', fontSize: 12 }}
        >
          <PlusCircle size={15} /> Add Stock
        </button>
      </div>

      {/* Stock Threshold Legend */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 6,
          background: 'var(--bg-card)',
          padding: '10px 12px',
          borderRadius: 14,
          border: '1px solid var(--border-subtle)',
          fontSize: 11,
          textAlign: 'center',
        }}
      >
        <div>
          <span style={{ color: '#059669', fontWeight: 800 }}>9+ units</span>
          <span style={{ display: 'block', color: 'var(--text-light)', fontSize: 10 }}>Available</span>
        </div>
        <div>
          <span style={{ color: '#D97706', fontWeight: 800 }}>1–8 units</span>
          <span style={{ display: 'block', color: 'var(--text-light)', fontSize: 10 }}>Low Stock</span>
        </div>
        <div>
          <span style={{ color: '#DC2626', fontWeight: 800 }}>0 units</span>
          <span style={{ display: 'block', color: 'var(--text-light)', fontSize: 10 }}>Sold Out</span>
        </div>
      </div>

      {/* Outlet Filter Pills */}
      <div className="category-row">
        <button
          onClick={() => setSelectedOutlet('all')}
          className={`category-pill ${selectedOutlet === 'all' ? 'active' : ''}`}
        >
          All Outlets
        </button>
        {outlets.map((o) => (
          <button
            key={o.id}
            onClick={() => setSelectedOutlet(o.id)}
            className={`category-pill ${selectedOutlet === o.id ? 'active' : ''}`}
          >
            {o.name}
          </button>
        ))}
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
          placeholder="Filter food items..."
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

      {/* Items Table / Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredItems.map((item) => {
          const isLowStock = item.stock <= 8;

          return (
            <div
              key={item.id}
              className="card-base"
              style={{
                padding: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: isLowStock ? '1px solid #FED7AA' : '1px solid var(--border-subtle)',
                background: isLowStock ? '#FFFDF9' : 'var(--bg-card)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)' }}>
                    {item.name}
                  </h4>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {item.outletName} • ৳{item.price}
                  </span>
                  <div style={{ marginTop: 2 }}>
                    <StatusBadge status={item.status} stock={item.stock} />
                  </div>
                </div>
              </div>

              {/* Stock and Quick Restock Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-light)', display: 'block' }}>Stock</span>
                  <strong
                    style={{
                      fontSize: 18,
                      color: item.stock <= 0 ? '#DC2626' : item.stock <= 8 ? '#D97706' : '#1E1E24',
                    }}
                  >
                    {item.stock}
                  </strong>
                </div>

                <button
                  className="btn-secondary"
                  onClick={() => handleOpenRestock(item.id)}
                  style={{ padding: '8px 12px', fontSize: 12 }}
                  title="Add prepared stock"
                >
                  + Add Stock
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <StockIntakeModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        preselectedItemId={selectedItemIdForRestock}
      />
    </div>
  );
};
