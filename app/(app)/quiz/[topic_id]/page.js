'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { History, Trophy, RotateCcw, ChevronRight } from 'lucide-react';
import TopHeader from '@/components/TopHeader';
import QuizOption from '@/components/QuizOption';
import LoadingSpinner from '@/components/LoadingSpinner';
import { auth } from '@/lib/firebase';

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const topicId = params?.topic_id;

  const [questions, setQuestions] = useState([]);
  const [topicName, setTopicName] = useState('Quiz');
  const [subjectId, setSubjectId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({}); // { qIndex: selectedOptionIndex }
  const [revealed, setRevealed] = useState({}); // which questions have been answered
  const [done, setDone] = useState(false);

  const fetchQuizData = async () => {
    if (!topicId) return;
    try {
      setLoading(true);
      setError('');
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const idToken = await currentUser.getIdToken();

      const res = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic_id: parseInt(topicId, 10),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      setQuestions(data.data.questions || []);
      setTopicName(data.data.topic_name || 'Topic');
      setSubjectId(data.data.subject_id || '');
    } catch (err) {
      console.error('[quiz] Generation error:', err);
      setError(err.message || 'Something went wrong while generating the quiz');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchQuizData();
      } else {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [topicId, router]);

  const submitScore = async (finalScore) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const idToken = await currentUser.getIdToken();

      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic_id: parseInt(topicId, 10),
          score: finalScore,
          total: questions.length || 5,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        console.error('[quiz] Failed to save score record:', data.error);
      }
    } catch (err) {
      console.error('[quiz] Network error while saving score:', err);
    }
  };

  const question = questions[currentQ];
  const isAnswered = currentQ in revealed;

  const handleAnswer = (optionIndex) => {
    if (isAnswered) return;
    setAnswers((prev) => ({ ...prev, [currentQ]: optionIndex }));
    setRevealed((prev) => ({ ...prev, [currentQ]: true }));
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
    } else {
      setDone(true);
      submitScore(score);
    }
  };

  const score = Object.entries(answers).filter(
    ([qi, ans]) => questions[+qi]?.correct_index === ans
  ).length;

  const getScoreEmoji = () => {
    const pct = questions.length ? (score / questions.length) * 100 : 0;
    if (pct === 100) return '🏆';
    if (pct >= 80) return '🌟';
    if (pct >= 60) return '👍';
    if (pct >= 40) return '📚';
    return '💪';
  };

  if (loading) {
    return (
      <>
        <TopHeader title="Quiz" backHref={subjectId ? `/subjects/${subjectId}` : '/subjects'} />
        <div className="page-padding" style={{ display: 'flex', justifyContent: 'center', paddingTop: 48 }}>
          <LoadingSpinner size={40} label="Generating your quiz…" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <TopHeader title="Quiz Error" backHref={subjectId ? `/subjects/${subjectId}` : '/subjects'} />
        <div className="page-padding">
          <div className="card" style={{ textAlign: 'center', padding: 24, borderColor: 'var(--error)' }}>
            <p style={{ color: 'var(--error)', fontWeight: 600, marginBottom: 12 }}>{error}</p>
            <button className="btn btn-secondary btn-full" onClick={fetchQuizData}>Retry</button>
          </div>
        </div>
      </>
    );
  }

  if (done) {
    return (
      <>
        <TopHeader title="Quiz Results" />
        <div className="page-padding animate-fade-in" style={{ textAlign: 'center', paddingTop: 24 }}>
          {/* Score card */}
          <div
            className="grad-header"
            style={{ borderRadius: 'var(--radius-card)', padding: '32px 24px', marginBottom: 20 }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>{getScoreEmoji()}</div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
              {score}/{questions.length}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', marginTop: 6, fontSize: '0.875rem' }}>
              {questions.length ? Math.round((score / questions.length) * 100) : 0}% correct
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginTop: 4 }}>
              {topicName}
            </div>
          </div>

          {/* Review answers */}
          <div style={{ textAlign: 'left', marginBottom: 20 }}>
            <h2 style={{ fontSize: '0.9375rem', marginBottom: 12 }}>Review</h2>
            {questions.map((q, i) => {
              const selected = answers[i];
              const correct = q.correct_index;
              const isCorrect = selected === correct;
              return (
                <div key={q.id || i} className="card" style={{ marginBottom: 10, padding: 12 }}>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                    Q{i + 1}. {q.question}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: '0.75rem', color: isCorrect ? 'var(--success)' : 'var(--error)', fontWeight: 600 }}>
                      {isCorrect ? '✓ Correct' : '✗ Wrong'}
                    </span>
                    {!isCorrect && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Correct: {q.options[correct]}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.4 }}>
                    💡 {q.explanation}
                  </p>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => router.push(`/quiz/${topicId}/history`)}
            >
              <History size={15} /> History
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 2 }}
              onClick={() => {
                setCurrentQ(0); setAnswers({}); setRevealed({}); setDone(false);
              }}
            >
              <RotateCcw size={15} /> Retake Quiz
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopHeader
        title={`Quiz · Q${currentQ + 1}/${questions.length}`}
        backHref={subjectId ? `/subjects/${subjectId}` : '/subjects'}
      />

      <div className="page-padding">
        {/* Progress bar */}
        <div style={{ marginBottom: 20 }} className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>
              📚 {topicName}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {Object.keys(revealed).length}/{questions.length} answered
            </span>
          </div>
          <div className="progress-track" style={{ height: 6 }}>
            <div
              className="progress-fill"
              style={{ width: `${((currentQ) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        {question && (
          <div
            key={currentQ}
            className="grad-card animate-fade-in"
            style={{ padding: '20px 18px', marginBottom: 20 }}
          >
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginBottom: 8 }}>
              Question {currentQ + 1} of {questions.length}
            </div>
            <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#fff', lineHeight: 1.5 }}>
              {question.question}
            </p>
          </div>
        )}

        {/* Options */}
        {question && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {question.options.map((opt, i) => {
              let state = 'idle';
              if (isAnswered) {
                if (i === question.correct_index) state = 'correct';
                else if (i === answers[currentQ]) state = 'wrong';
              }
              return (
                <QuizOption
                  key={i}
                  index={i}
                  label={opt}
                  state={state}
                  disabled={isAnswered}
                  onClick={() => handleAnswer(i)}
                />
              );
            })}
          </div>
        )}

        {/* Explanation (shown after answering) */}
        {isAnswered && question && (
          <div
            className="card-elevated animate-fade-in"
            style={{ padding: '12px 14px', marginBottom: 20 }}
          >
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              💡 <strong>Explanation:</strong> {question.explanation}
            </p>
          </div>
        )}

        {/* Next button */}
        {isAnswered && (
          <button
            className="btn btn-primary btn-full animate-fade-in"
            onClick={handleNext}
          >
            {currentQ < questions.length - 1 ? (
              <>Next Question <ChevronRight size={16} /></>
            ) : (
              <><Trophy size={16} /> See Results</>
            )}
          </button>
        )}
      </div>
    </>
  );
}
