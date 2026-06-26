'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, ChevronDown, BookOpen } from 'lucide-react';
import TopHeader from '@/components/TopHeader';
import ChatBubble, { TypingIndicator } from '@/components/ChatBubble';
import { mockSubjects } from '@/lib/mock/subjects';

const INITIAL_MESSAGES = [
  {
    id: 'm0',
    role: 'ai',
    content: "Hi! I'm your AI Tutor 🤖 Ask me anything about your topics and I'll explain it at your level. Select a subject above to get started!",
    time: 'Now',
  },
];

const MOCK_REPLIES = [
  "Great question! Let me break this down for you. This concept is foundational to understanding the subject as a whole. Think of it like building blocks — once you understand the fundamentals, everything else falls into place naturally.",
  "That's a key topic! Here's the core idea: the underlying principle here involves understanding how components interact with each other. At your level, the most important thing to grasp is the 'why' behind the pattern, not just the 'how'.",
  "Excellent! This is one of the most commonly misunderstood topics. Let me explain it step by step with a simple analogy that should make it click immediately.",
  "I love that question! This connects to several other topics you're studying. Essentially, the concept works by establishing a relationship between inputs and expected outputs — much like a recipe that guarantees a specific dish.",
];

let replyIndex = 0;

export default function ChatPage() {
  const searchParams = useSearchParams();
  const subjectId = searchParams.get('subject');
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [activeSubjectId, setActiveSubjectId] = useState(subjectId || '');
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const messagesEndRef = useRef(null);

  const activeSubject = mockSubjects.find((s) => s.id === activeSubjectId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async () => {
    if (!input.trim() || typing) return;
    const userMsg = {
      id: `m_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
    const reply = MOCK_REPLIES[replyIndex % MOCK_REPLIES.length];
    replyIndex++;
    setMessages((prev) => [
      ...prev,
      {
        id: `m_${Date.now() + 1}`,
        role: 'ai',
        content: reply,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setTyping(false);
  };

  return (
    <>
      <TopHeader
        title="AI Tutor"
        rightSlot={
          <button
            onClick={() => setShowSubjectPicker((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-full)', padding: '4px 10px',
              cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
              color: 'var(--text-secondary)', maxWidth: 100,
              overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
            }}
          >
            <BookOpen size={12} />
            {activeSubject ? activeSubject.name.split(' ')[0] : 'Subject'}
            <ChevronDown size={12} />
          </button>
        }
      />

      {/* Subject picker dropdown */}
      {showSubjectPicker && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 80 }}
            onClick={() => setShowSubjectPicker(false)}
          />
          <div
            className="card animate-scale-in"
            style={{
              position: 'fixed', top: 64, right: 16, zIndex: 90,
              minWidth: 200, padding: 8,
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            }}
          >
            <button
              onClick={() => { setActiveSubjectId(''); setShowSubjectPicker(false); }}
              style={{
                display: 'block', width: '100%', padding: '8px 10px',
                background: !activeSubjectId ? 'var(--accent-light)' : 'none',
                border: 'none', borderRadius: 6, cursor: 'pointer',
                color: !activeSubjectId ? 'var(--accent)' : 'var(--text-secondary)',
                textAlign: 'left', fontSize: '0.8125rem', fontWeight: 500,
              }}
            >
              No subject (general)
            </button>
            {mockSubjects.map((s) => (
              <button
                key={s.id}
                onClick={() => { setActiveSubjectId(s.id); setShowSubjectPicker(false); }}
                style={{
                  display: 'block', width: '100%', padding: '8px 10px',
                  background: activeSubjectId === s.id ? 'var(--accent-light)' : 'none',
                  border: 'none', borderRadius: 6, cursor: 'pointer',
                  color: activeSubjectId === s.id ? 'var(--accent)' : 'var(--text-primary)',
                  textAlign: 'left', fontSize: '0.8125rem', fontWeight: 500,
                }}
              >
                {s.name}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Context chip */}
      {activeSubject && (
        <div style={{ padding: '8px 16px 0', position: 'fixed', top: 'var(--header-h)', left: 0, right: 0, zIndex: 70, background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
          <span className="badge badge-accent" style={{ fontSize: '0.72rem' }}>
            📚 Context: {activeSubject.name}
          </span>
        </div>
      )}

      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          paddingTop: activeSubject ? 40 : 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          minHeight: 0,
        }}
      >
        {messages.map((msg) => (
          <ChatBubble key={msg.id} role={msg.role} content={msg.content} time={msg.time} />
        ))}
        {typing && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar — fixed above bottom nav */}
      <div
        style={{
          position: 'fixed',
          bottom: 'var(--nav-h)',
          left: 0,
          right: 0,
          padding: '10px 16px',
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-end',
          zIndex: 80,
        }}
      >
        <textarea
          className="input"
          placeholder="Ask me anything…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          rows={1}
          style={{
            resize: 'none', overflowY: 'auto', maxHeight: 96,
            minHeight: 44, flex: 1,
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || typing}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: input.trim() && !typing ? 'var(--grad-button)' : 'var(--bg-elevated)',
            border: 'none', cursor: input.trim() && !typing ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.2s ease',
            color: input.trim() && !typing ? '#fff' : 'var(--text-muted)',
            boxShadow: input.trim() && !typing ? '0 2px 10px color-mix(in srgb, var(--accent) 30%, transparent)' : 'none',
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </>
  );
}
