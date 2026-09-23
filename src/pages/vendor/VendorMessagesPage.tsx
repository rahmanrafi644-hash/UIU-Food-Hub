import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChatDrawerModal } from '../../components/chat/ChatDrawerModal';
import { MessageSquare, User, Clock, ArrowRight, CheckCircle2, Store } from 'lucide-react';

export const VendorMessagesPage: React.FC = () => {
  const { messages, user, activeVendorOutlet, outlets } = useApp();
  const [selectedChatOutletId, setSelectedChatOutletId] = useState<string | null>(null);

  const currentOutlet = activeVendorOutlet || outlets[0];

  // Group messages for current outlet
  const outletMessages = messages.filter((m) => m.outletId === currentOutlet.id);

  // Group by student
  const studentThreads = Array.from(new Set(outletMessages.map((m) => m.studentName))).map((studentName) => {
    const threadMsgs = outletMessages.filter((m) => m.studentName === studentName);
    const lastMsg = threadMsgs[threadMsgs.length - 1];
    const unreadCount = threadMsgs.filter((m) => !m.isRead && m.senderRole === 'student').length;
    return {
      studentName,
      lastMsg,
      total: threadMsgs.length,
      unreadCount,
    };
  });

  return (
    <div className="app-main">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', marginBottom: 2 }}>
          <Store size={15} />
          <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>
            {currentOutlet.name}
          </span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Student Inquiries</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Direct communication with students dining at {currentOutlet.name}
        </p>
      </div>

      {studentThreads.length === 0 ? (
        <div
          className="card-base"
          style={{
            padding: 36,
            textAlign: 'center',
            color: 'var(--text-muted)',
            background: 'var(--bg-app)',
            border: '1px dashed var(--border-subtle)',
          }}
        >
          <MessageSquare size={36} color="var(--text-light)" style={{ margin: '0 auto 10px auto' }} />
          <h4 style={{ fontSize: 16, fontWeight: 800 }}>No Messages Yet</h4>
          <p style={{ fontSize: 12, marginTop: 4 }}>
            When students message {currentOutlet.name} regarding menu items or active orders, they will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {studentThreads.map((thread) => (
            <div
              key={thread.studentName}
              onClick={() => setSelectedChatOutletId(currentOutlet.id)}
              className="card-base card-hover"
              style={{
                padding: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                border: thread.unreadCount > 0 ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                background: thread.unreadCount > 0 ? '#FFFBF5' : 'white',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 16,
                  }}
                >
                  {thread.studentName.charAt(0)}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)' }}>
                      {thread.studentName}
                    </h4>
                    {thread.unreadCount > 0 && (
                      <span
                        style={{
                          background: '#EF4444',
                          color: 'white',
                          fontSize: 9,
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: 9999,
                        }}
                      >
                        NEW
                      </span>
                    )}
                  </div>

                  <p
                    style={{
                      fontSize: 12,
                      color: thread.unreadCount > 0 ? 'var(--text-main)' : 'var(--text-muted)',
                      fontWeight: thread.unreadCount > 0 ? 700 : 400,
                      marginTop: 2,
                      maxWidth: 210,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {thread.lastMsg?.message}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)' }}>
                <span style={{ fontSize: 11, fontWeight: 700 }}>Reply</span>
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reusable Chat Drawer */}
      {selectedChatOutletId && (
        <ChatDrawerModal
          isOpen={true}
          onClose={() => setSelectedChatOutletId(null)}
          targetOutletId={selectedChatOutletId}
        />
      )}
    </div>
  );
};
