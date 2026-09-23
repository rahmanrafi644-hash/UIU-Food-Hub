import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Send, Store, User, Sparkles, MessageCircle, Clock } from 'lucide-react';

interface ChatDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetOutletId: string;
  orderId?: string;
}

export const ChatDrawerModal: React.FC<ChatDrawerModalProps> = ({
  isOpen,
  onClose,
  targetOutletId,
  orderId,
}) => {
  const { user, outlets, messages, sendChatMessage, markMessagesAsRead } = useApp();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const outlet = outlets.find((o) => o.id === targetOutletId) || outlets[0];
  const isVendor = user?.role === 'vendor';

  // Filter messages for this outlet
  const chatHistory = messages.filter((m) => m.outletId === outlet.id);

  useEffect(() => {
    if (isOpen) {
      markMessagesAsRead(outlet.id);
    }
  }, [isOpen, outlet.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    sendChatMessage({
      outletId: outlet.id,
      message: text.trim(),
      senderRole: isVendor ? 'vendor' : 'student',
      orderId,
    });

    setInputText('');
  };

  const studentQuickPrompts = [
    'Is my order ready for pickup?',
    'Please pack extra chili sauce',
    'Are there free tables available right now?',
    'Is Chicken Fry fresh out of the fryer?',
  ];

  const vendorQuickPrompts = [
    'Preparing your order right now!',
    'Hot & fresh, ready in 3 minutes!',
    'Extra sauce noted and added 👍',
    'Ready at the pickup counter!',
  ];

  const quickPrompts = isVendor ? vendorQuickPrompts : studentQuickPrompts;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '80vh',
          maxHeight: 650,
          padding: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-app)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F68920 0%, #D86B07 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Store size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {outlet.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }}></span>
                <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>Direct Campus Line</span>
                {orderId && (
                  <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 700 }}>
                    • Ref: #{orderId}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button onClick={onClose} className="btn-icon-circle" style={{ width: 32, height: 32 }}>
            <X size={16} />
          </button>
        </div>

        {/* Chat Messages Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            background: '#FAF8F5',
          }}
        >
          {chatHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
              <MessageCircle size={32} color="var(--text-light)" style={{ margin: '0 auto 8px auto' }} />
              <p style={{ fontSize: 13, fontWeight: 700 }}>Start a conversation with {outlet.name}</p>
              <p style={{ fontSize: 11, marginTop: 2 }}>
                Ask about food prep, special requests, or cafeteria crowd levels.
              </p>
            </div>
          ) : (
            chatHistory.map((msg) => {
              const isMe = (isVendor && msg.senderRole === 'vendor') || (!isVendor && msg.senderRole === 'student');

              return (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '82%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                  }}
                >
                  <span style={{ fontSize: 10, color: 'var(--text-light)', marginBottom: 2, padding: '0 4px' }}>
                    {msg.senderRole === 'vendor' ? `${outlet.name} Staff` : msg.studentName}
                  </span>

                  <div
                    style={{
                      background: isMe
                        ? 'linear-gradient(135deg, #F68920 0%, #E07510 100%)'
                        : '#FFFFFF',
                      color: isMe ? '#FFFFFF' : 'var(--text-main)',
                      padding: '10px 14px',
                      borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      border: isMe ? 'none' : '1px solid var(--border-subtle)',
                      fontSize: 13,
                      lineHeight: 1.4,
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.message}
                  </div>

                  <span style={{ fontSize: 9, color: 'var(--text-light)', marginTop: 2, padding: '0 4px' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div
          style={{
            padding: '6px 12px',
            background: 'var(--bg-app)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              style={{
                flexShrink: 0,
                background: 'white',
                border: '1px solid var(--border-subtle)',
                borderRadius: 9999,
                padding: '4px 10px',
                fontSize: 11,
                color: 'var(--text-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div
          style={{
            padding: '10px 14px',
            background: 'white',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <input
            type="text"
            placeholder={isVendor ? 'Reply to student...' : `Message ${outlet.name}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 9999,
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-app)',
              fontSize: 13,
              outline: 'none',
            }}
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: inputText.trim() ? 'var(--primary)' : '#E5E7EB',
              color: 'white',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputText.trim() ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
