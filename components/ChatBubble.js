// components/ChatBubble.js
// User and AI chat message bubbles

function formatMarkdown(text) {
  if (!text) return '';

  // 1. Escape HTML for security
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // 2. Bold: **text** -> <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // 3. Italics: *text* -> <em>text</em>
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // 4. Split by paragraph breaks (\n\n)
  const paragraphs = html.split(/\n\n+/);

  const rendered = paragraphs.map((p) => {
    const lines = p.split('\n');

    // Check for headers (e.g. #, ##, ###)
    if (lines.length === 1) {
      const trimmed = p.trim();
      if (trimmed.startsWith('### ')) {
        return `<h4 style="margin: 10px 0 4px 0; font-weight: 700; font-size: 0.875rem;">${trimmed.substring(4)}</h4>`;
      }
      if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
        const headingText = trimmed.startsWith('## ') ? trimmed.substring(3) : trimmed.substring(2);
        return `<h3 style="margin: 12px 0 6px 0; font-weight: 700; font-size: 0.95rem;">${headingText}</h3>`;
      }
    }

    // Check if this paragraph is a list
    const isList = lines.every((line) => {
      const trimmed = line.trim();
      return trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed === '';
    });

    if (isList) {
      const listItems = lines
        .map((line) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
            return `• ${trimmed.substring(2)}<br />`;
          }
          return '';
        })
        .filter(Boolean)
        .join('');
      return `<div style="margin: 0 0 10px 0; line-height: 1.5;">${listItems}</div>`;
    } else {
      // Standard paragraph
      return `<p style="margin: 0 0 10px 0; line-height: 1.5;">${p.replace(/\n/g, '<br />')}</p>`;
    }
  });

  return rendered.join('');
}

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

      {isUser ? (
        <div className="bubble-user">
          {content}
        </div>
      ) : (
        <div
          className="bubble-ai"
          dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }}
        />
      )}

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
