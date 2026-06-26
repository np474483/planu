'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import TopHeader from '@/components/TopHeader';
import ChatBubble, { TypingIndicator } from '@/components/ChatBubble';

const QUICK_QUESTIONS = [
  'How do I add a subject?',
  'How does the study plan work?',
  'How do I take a quiz?',
  'How do I mark a topic as done?',
  'How do I change my theme?',
];

const ASSISTANT_REPLIES = {
  'How do I add a subject?': "To add a subject, go to the **Dashboard** or the **Subjects** tab. Tap the ➕ button (FAB) at the bottom right. Enter your subject name and exam date, then tap 'Add Subject'. Done! 🎉",
  'How does the study plan work?': "The Study Plan is AI-powered! Go to the **Plan** tab and tap 'Generate My Plan'. The AI analyzes all your subjects, topics, exam dates, and your education level to create a day-by-day schedule. You can regenerate it anytime if you add new subjects. 🤖",
  'How do I take a quiz?': "You can take a quiz in two ways: (1) Go to any subject, then tap any topic's 3-dot menu → 'Take Quiz'. (2) Or tap the 'Take Quiz' button at the bottom of any topics list. The AI generates 5 MCQs for that specific topic instantly! 🎯",
  'How do I mark a topic as done?': "Inside any subject's topics list, tap the status badge (the colored pill) next to a topic. It cycles through: ⚪ Not Started → 🟡 In Progress → 🟢 Completed. Your progress bar updates instantly! 📈",
  'How do I change my theme?': "Tap the palette icon 🎨 in the top-right corner of the Dashboard, Profile, or Settings page. You can switch between 5 gradient themes: Ocean Teal, Midnight Purple, Forest Green, Sunset Orange, and Rose Dawn. Each works in both Light and Dark mode! ✨",
};

const DEFAULT_REPLY = "That's a great question! PlanU is designed to be super intuitive. You can navigate using the bottom bar: Home (Dashboard), Plan (AI Study Plan), Chat (AI Tutor), Progress tracker, and Profile. If you're unsure about anything specific, just ask me! 😊";

const INITIAL_MESSAGES = [
  {
    id: 'init_0',
    role: 'ai',
    content: "Hi! I'm the PlanU Assistant 🤖 I'm here to help you understand how to use the app. Ask me anything or tap a quick question below!",
    time: 'Now',
  },
];

export default function AssistantPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (text) => {
    const msgText = text || input.trim();
    if (!msgText || typing) return;
    setInput('');
    const userMsg = { id: `m_${Date.now()}`, role: 'user', content: msgText, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 500));
    const reply = ASSISTANT_REPLIES[msgText] ?? DEFAULT_REPLY;
    setMessages((prev) => [
      ...prev,
      { id: `m_${Date.now() + 1}`, role: 'ai', content: reply, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setTyping(false);
  };

  return (
    <>
      <TopHeader title="PlanU Assistant" />

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((msg) => (
          <ChatBubble key={msg.id} role={msg.role} content={msg.content} time={msg.time} />
        ))}
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
