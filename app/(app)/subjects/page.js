'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import TopHeader from '@/components/TopHeader';
import SubjectCard from '@/components/SubjectCard';
import Modal from '@/components/Modal';
import { mockSubjects } from '@/lib/mock/subjects';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState(mockSubjects);
  const [query, setQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');

  const filtered = subjects.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleAdd = () => {
    if (!newName.trim() || !newDate) return;
    setSubjects((prev) => [
      ...prev,
      {
        id: `sub_${Date.now()}`,
        user_id: 'user_001',
        name: newName.trim(),
        exam_date: newDate,
        created_at: new Date().toISOString(),
        topics: [],
      },
    ]);
    setNewName('');
    setNewDate('');
    setShowAddModal(false);
  };

  const handleDelete = (id) => setSubjects((prev) => prev.filter((s) => s.id !== id));

  return (
    <>
      <TopHeader
        title="My Subjects"
        backHref="/dashboard"
        rightSlot={
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: 'var(--grad-button)', border: 'none', borderRadius: '50%',
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff',
              boxShadow: '0 2px 8px color-mix(in srgb, var(--accent) 30%, transparent)',
            }}
          >
            <Plus size={18} />
          </button>
        }
      />

      <div className="page-padding">
        {/* Search bar */}
        <div style={{ position: 'relative', marginBottom: 16 }} className="animate-fade-in">
          <Search
            size={16}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            className="input"
            placeholder="Search subjects…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>

        {/* Subject list */}
        {filtered.length === 0 ? (
          <div className="card animate-fade-in" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>
              {query ? '🔍' : '📚'}
            </div>
            <h3 style={{ marginBottom: 8 }}>
              {query ? 'No results found' : 'No subjects yet'}
            </h3>
            <p style={{ marginBottom: 20 }}>
              {query ? `No subjects match "${query}"` : 'Add your first subject to get started!'}
            </p>
            {!query && (
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                <Plus size={16} /> Add Subject
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((subject, i) => (
              <div key={subject.id} style={{ animationDelay: `${i * 0.04}s` }}>
                <SubjectCard
                  subject={subject}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => setShowAddModal(true)} aria-label="Add subject">
        <Plus size={24} />
      </button>

      {/* Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Subject">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Subject Name
            </label>
            <input
              className="input"
              placeholder="e.g. Computer Networks"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Exam Date
            </label>
            <input
              className="input"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              style={{ flex: 2 }}
              disabled={!newName.trim() || !newDate}
              onClick={handleAdd}
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
