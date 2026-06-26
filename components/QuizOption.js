// components/QuizOption.js
// MCQ answer option button for Quiz screen

/**
 * QuizOption
 * Props:
 *   label     (string)  — option text
 *   index     (number)  — 0-3 for A/B/C/D prefix
 *   state     ('idle' | 'correct' | 'wrong' | 'selected') — visual state
 *   disabled  (bool)
 *   onClick   (fn)
 */
export default function QuizOption({ label, index, state = 'idle', disabled = false, onClick }) {
  const LETTERS = ['A', 'B', 'C', 'D'];
  const letter = LETTERS[index] ?? index;

  const stateStyles = {
    idle:     {},
    selected: { borderColor: 'var(--accent)', background: 'var(--accent-light)' },
    correct:  {},
    wrong:    {},
  };

  return (
    <button
      className={`quiz-option${state === 'correct' ? ' correct' : state === 'wrong' ? ' wrong' : ''}`}
      style={{ ...stateStyles[state] }}
      disabled={disabled}
      onClick={onClick}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 26,
          height: 26,
          borderRadius: '50%',
          fontSize: '0.75rem',
          fontWeight: 700,
          marginRight: 10,
          flexShrink: 0,
          background: state === 'correct'
            ? 'var(--success)'
            : state === 'wrong'
            ? 'var(--error)'
            : state === 'selected'
            ? 'var(--accent)'
            : 'var(--bg-elevated)',
          color: ['correct', 'wrong', 'selected'].includes(state) ? '#fff' : 'var(--text-secondary)',
        }}
      >
        {letter}
      </span>
      {label}
    </button>
  );
}
