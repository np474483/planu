// components/ChatBubble.js
// User and AI chat message bubbles

/**
 * ChatBubble
 * Props:
 *   role    ('user' | 'ai')
 *   content (string)
 *   time    (string) — optional timestamp
 */
export default function ChatBubble({ role, content, time }) {
  const isUser = role === 'user';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        gap: 4,
        animationDelay: '0.05s',
      }}
      className="animate-fade-in"
    >
      {!isUser && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          {/* AI avatar */}
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'var(--grad-button)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              flexShrink: 0,
            }}
          >
            🤖
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>AI Tutor</span>
        </div>
      )}

      <div className={isUser ? 'bubble-user' : 'bubble-ai'}>
        {content}
      </div>

      {time && (
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', padding: '0 4px' }}>
          {time}
        </span>
      )}
    </div>
  );
}

// ─── Typing Indicator ────────────────────────────────────────────

export function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <div
        style={{
          width: 24, height: 24, borderRadius: '50%',
          background: 'var(--grad-button)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.7rem', flexShrink: 0,
        }}
      >
        🤖
      </div>
      <div className="bubble-ai" style={{ padding: '8px 14px' }}>
        <div className="typing-dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}
