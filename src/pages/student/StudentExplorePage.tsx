import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CampusOutlet } from '../../types';
import { Link } from 'react-router-dom';
import { Star, Clock, MapPin, ChevronRight, Search, Sparkles } from 'lucide-react';

export const StudentExplorePage: React.FC = () => {
  const { outlets } = useApp();
  const [search, setSearch] = useState('');

  const filteredOutlets = outlets.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.description.toLowerCase().includes(search.toLowerCase()) ||
      o.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-main">
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Explore Campus Outlets</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          5 verified food & beverage outlets across UIU campus
        </p>
      </div>

      {/* Search */}
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
          placeholder="Search outlets (Khan's, Olympia, Brew...)"
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

      {/* Outlets List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filteredOutlets.map((outlet: CampusOutlet) => (
          <Link
            key={outlet.id}
            to={`/outlet/${outlet.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="card-base card-hover" style={{ padding: 14 }}>
              <div style={{ position: 'relative', width: '100%', height: 140, borderRadius: 16, overflow: 'hidden' }}>
                <img
                  src={outlet.image}
                  alt={outlet.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: 'rgba(0,0,0,0.65)',
                    backdropFilter: 'blur(4px)',
                    color: 'white',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Star size={12} fill="#FBBF24" color="#FBBF24" />
                  {outlet.rating}
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-main)' }}>{outlet.name}</h3>
                  <ChevronRight size={18} color="var(--primary)" />
                </div>

                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 8px 0', lineHeight: 1.4 }}>
                  {outlet.description}
                </p>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 12,
                    fontSize: 11,
                    color: 'var(--text-muted)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={13} color="var(--primary)" /> {outlet.location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={13} /> {outlet.openingHours}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
