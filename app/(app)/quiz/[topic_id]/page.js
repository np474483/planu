'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { History, Trophy, RotateCcw, ChevronRight } from 'lucide-react';
import TopHeader from '@/components/TopHeader';
import QuizOption from '@/components/QuizOption';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getQuizOrDefault } from '@/lib/mock/quiz';
import { getTopicById } from '@/lib/mock/subjects';

export default function QuizPage({ params }) {
  const { topic_id } = use(params);
  const router = useRouter();

  const topic = getTopicById(topic_id);
  const quiz = getQuizOrDefault(topic_id, topic?.name ?? 'Topic', topic?.subjectName ?? 'Subject');

  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({}); // { qIndex: selectedOptionIndex }
  const [revealed, setRevealed] = useState({}); // which questions have been answered
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);

  const handleStart = async () => {
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setStarted(true);
  };

  // Auto-kick off loading on first render
  if (!started && loading) {
    setTimeout(handleStart, 100);
  }

  const question = quiz.questions[currentQ];
  const isAnswered = currentQ in revealed;

  const handleAnswer = (optionIndex) => {
    if (isAnswered) return;
    setAnswers((prev) => ({ ...prev, [currentQ]: optionIndex }));
    setRevealed((prev) => ({ ...prev, [currentQ]: true }));
  };

  const handleNext = () => {
    if (currentQ < quiz.questions.length - 1) {
      setCurrentQ((q) => q + 1);
    } else {
      setDone(true);
    }
  };

  const score = Object.entries(answers).filter(
    ([qi, ans]) => quiz.questions[+qi].correct_index === ans
  ).length;

  const getScoreEmoji = () => {
    const pct = (score / quiz.questions.length) * 100;
    if (pct === 100) return '🏆';
    if (pct >= 80)  return '🌟';
    if (pct >= 60)  return '👍';
    if (pct >= 40)  return '📚';
    return '💪';
  };

  if (loading) {
    return (
      <>
        <TopHeader title="Quiz" backHref={`/subjects/${topic?.subject_id ?? ''}`} />
        <div className="page-padding" style={{ display: 'flex', justifyContent: 'center', paddingTop: 48 }}>
          <LoadingSpinner size={40} label="Generating your quiz…" />
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
              {score}/{quiz.questions.length}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', marginTop: 6, fontSize: '0.875rem' }}>
              {Math.round((score / quiz.questions.length) * 100)}% correct
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginTop: 4 }}>
              {quiz.topic_name}
            </div>
          </div>

          {/* Review answers */}
          <div style={{ textAlign: 'left', marginBottom: 20 }}>
            <h2 style={{ fontSize: '0.9375rem', marginBottom: 12 }}>Review</h2>
            {quiz.questions.map((q, i) => {
              const selected = answers[i];
              const correct = q.correct_index;
              const isCorrect = selected === correct;
              return (
                <div key={q.id} className="card" style={{ marginBottom: 10, padding: 12 }}>
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
              onClick={() => router.push(`/quiz/${topic_id}/history`)}
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
        title={`Quiz · Q${currentQ + 1}/${quiz.questions.length}`}
        backHref={`/subjects/${topic?.subject_id ?? ''}`}
      />

      <div className="page-padding">
        {/* Progress bar */}
        <div style={{ marginBottom: 20 }} className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>
              📚 {quiz.topic_name}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {Object.keys(revealed).length}/{quiz.questions.length} answered
            </span>
          </div>
          <div className="progress-track" style={{ height: 6 }}>
            <div
              className="progress-fill"
              style={{ width: `${((currentQ) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div
          key={currentQ}
          className="grad-card animate-fade-in"
          style={{ padding: '20px 18px', marginBottom: 20 }}
        >
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginBottom: 8 }}>
            Question {currentQ + 1} of {quiz.questions.length}
          </div>
          <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#fff', lineHeight: 1.5 }}>
            {question.question}
          </p>
        </div>

        {/* Options */}
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

        {/* Explanation (shown after answering) */}
        {isAnswered && (
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
            {currentQ < quiz.questions.length - 1 ? (
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
