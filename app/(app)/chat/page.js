'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Send, ChevronDown, BookOpen } from 'lucide-react';
import TopHeader from '@/components/TopHeader';
import ChatBubble, { TypingIndicator } from '@/components/ChatBubble';
import LoadingSpinner from '@/components/LoadingSpinner';
import { auth } from '@/lib/firebase';

const INITIAL_MESSAGES = [
  {
    id: 'm0',
    role: 'ai',
    content: "Hi! I'm your AI Tutor 🤖 Ask me anything about your topics and I'll explain it at your level. Select a subject above to get started!",
    time: 'Now',
  },
];

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams?.get('subject');
  const topicParam = searchParams?.get('topic') || '';

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [activeSubjectId, setActiveSubjectId] = useState(subjectId || '');
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const messagesEndRef = useRef(null);

  const activeSubject = subjects.find((s) => String(s.id) === String(activeSubjectId));

  const loadSubjects = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const idToken = await currentUser.getIdToken();
      const res = await fetch('/api/subjects', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubjects(data.data.subjects || []);
      }
    } catch (err) {
      console.error('[chat] Failed to load subjects:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadSubjects();
      } else {
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async () => {
    if (!input.trim() || typing) return;

    const userMessageText = input.trim();
    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    const userMsg = {
      id: `m_${Date.now()}`,
      role: 'user',
      content: userMessageText,
      time: timestamp,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not authenticated');
      const idToken = await currentUser.getIdToken();

      // Format history: Array<{ role: 'user'|'ai', text: string }>
      const historyForAPI = messages
        .filter((msg) => msg.role === 'user' || msg.role === 'ai')
        .map((msg) => ({
          role: msg.role,
          text: msg.content,
        }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessageText,
          subjectName: activeSubject ? activeSubject.name : 'General Studies',
          topicName: topicParam,
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
      console.error('[chat] Send error:', err);
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
      <TopHeader
        title="AI Tutor"
        rightSlot={
          <button
            onClick={() => setShowSubjectPicker((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'var(--accent)', border: 'none',
              borderRadius: 'var(--radius-full)', padding: '4px 10px',
              cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
              color: '#fff', whiteSpace: 'nowrap',
            }}
          >
            {activeSubject ? (
              `📚 ${activeSubject.name.split(' ')[0]}`
            ) : (
              <>
                <BookOpen size={12} />
                Subject
                <ChevronDown size={12} />
              </>
            )}
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
            {subjects.map((s) => (
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

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50dvh' }}>
        <LoadingSpinner label="Loading chat..." />
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
