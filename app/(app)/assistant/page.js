'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import TopHeader from '@/components/TopHeader';
import ChatBubble, { TypingIndicator } from '@/components/ChatBubble';
import { auth } from '@/lib/firebase';

const QUICK_QUESTIONS = [
  'How do I add a subject?',
  'How does the study plan work?',
  'How do I take a quiz?',
  'How do I mark a topic as done?',
  'How do I change my theme?',
];

const INITIAL_MESSAGES = [
  {
    id: 'init_0',
    role: 'ai',
    content: "Hi! I'm the PlanU Assistant 🤖 I'm here to help you understand how to use the app. Ask me anything or tap a quick question below!",
    time: 'Now',
  },
];

export default function AssistantPage() {
  const router = useRouter();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (text) => {
    const msgText = text || input.trim();
    if (!msgText || typing) return;
    setInput('');

    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: `m_${Date.now()}`,
      role: 'user',
      content: msgText,
      time: timestamp,
    };

    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not authenticated');
      const idToken = await currentUser.getIdToken();

      const historyForAPI = messages
        .filter((msg) => msg.role === 'user' || msg.role === 'ai')
        .map((msg) => ({
          role: msg.role,
          text: msg.content,
        }));

      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: msgText,
          history: historyForAPI,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errMsg = data.error || 'AI response failed, please try again';
        setMessages((prev) => [
          ...prev,
          {
            id: `sys_${Date.now()}`,
            role: 'system',
            content: errMsg,
            time: timestamp,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `m_${Date.now() + 1}`,
            role: 'ai',
            content: data.data.reply,
            time: timestamp,
          },
        ]);
      }
    } catch (err) {
      console.error('[assistant] Send error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `sys_${Date.now()}`,
          role: 'system',
          content: 'AI response failed, please try again',
          time: timestamp,
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      <TopHeader title="PlanU Assistant" />

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((msg) => {
          if (msg.role === 'system') {
            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: 'center',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-btn)',
                  margin: '8px 0',
                  textAlign: 'center',
                  maxWidth: '85%'
                }}
              >
                ⚠️ {msg.content}
              </div>
            );
          }
          return <ChatBubble key={msg.id} role={msg.role} content={msg.content} time={msg.time} />;
        })}
        {typing && <TypingIndicator />}
        <div ref={endRef} />

        {/* Quick questions — show only at start */}
        {messages.length <= 2 && !typing && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>Quick Questions</p>
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                style={{
                  textAlign: 'left', padding: '10px 14px',
                  borderRadius: 'var(--radius-card)',
                  border: '1.5px solid var(--border)',
                  background: 'var(--bg-card)',
                  cursor: 'pointer', fontSize: '0.8125rem',
                  color: 'var(--accent)', fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}
              >
                💬 {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input bar */}
      <div
        style={{
          position: 'fixed', bottom: 'var(--nav-h)', left: 0, right: 0,
          padding: '10px 16px', background: 'var(--bg-card)',
          borderTop: '1px solid var(--border)',
          display: 'flex', gap: 10, alignItems: 'flex-end', zIndex: 80,
        }}
      >
        <textarea
          className="input"
          placeholder="Ask about PlanU features…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          rows={1}
          style={{ resize: 'none', maxHeight: 96, minHeight: 44, flex: 1 }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || typing}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: input.trim() && !typing ? 'var(--grad-button)' : 'var(--bg-elevated)',
            border: 'none', cursor: input.trim() && !typing ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.2s ease',
            color: input.trim() && !typing ? '#fff' : 'var(--text-muted)',
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </>
  );
}
