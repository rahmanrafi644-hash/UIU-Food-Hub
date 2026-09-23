import React, { useState } from 'react';
import { Smartphone, Monitor, Wifi, Battery, Signal } from 'lucide-react';

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const [viewMode, setViewMode] = useState<'mobile' | 'full'>('mobile');

  return (
    <div className="app-viewport-wrapper">
      {/* Presentation Bar (for desktop preview toggling) */}
      <div className={`presentation-bar mode-${viewMode}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }}></span>
          <span style={{ fontWeight: 700, letterSpacing: 0.2 }}>UIU Food HUB Prototype</span>
          <span style={{ opacity: 0.6 }}>• React + Gemini AI + Vercel</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => setViewMode('mobile')}
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              background: viewMode === 'mobile' ? '#1E1E24' : 'transparent',
              color: viewMode === 'mobile' ? 'white' : '#64748B',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <Smartphone size={13} /> Mobile Frame
          </button>

          <button
            onClick={() => setViewMode('full')}
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              background: viewMode === 'full' ? '#1E1E24' : 'transparent',
              color: viewMode === 'full' ? 'white' : '#64748B',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <Monitor size={13} /> Full Screen
          </button>
        </div>
      </div>

      {/* Main Shell */}
      <div className={`device-shell mode-${viewMode}`}>
        {/* Dynamic Island / Mobile Notch on Desktop Frame */}
        {viewMode === 'mobile' && (
          <div className="device-speaker-notch">
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
                fontSize: 11,
                fontWeight: 700,
                color: '#1E1E24',
              }}
            >
              <span>9:41</span>
              <div className="notch-pill">
                <div className="camera-dot"></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#1E1E24' }}>
                <Signal size={12} />
                <Wifi size={12} />
                <Battery size={13} />
              </div>
            </div>
          </div>
        )}

        {children}
      </div>
    </div>
  );
};
