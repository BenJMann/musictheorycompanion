import { useEffect, useState } from 'react'
import Celebration from './Celebration.jsx'

export function ExerciseShell({ title, block, accent, instructions, toolbar, onBack, children }) {
  return (
    <div className="exercise" style={{ '--accent': accent }}>
      <header className="exercise-header">
        <button className="btn btn-ghost back-btn" onClick={onBack}>
          <span aria-hidden>←</span> Exercises
        </button>
        <div className="exercise-title">
          <span className="block-tag">{block}</span>
          <h1>{title}</h1>
        </div>
        <div className="exercise-toolbar">{toolbar}</div>
      </header>

      <section className="instructions panel">
        <div className="panel-label">How to do this exercise</div>
        <div className="instructions-body">{instructions}</div>
        <p className="instructions-tip">
          <strong>Placing tiles:</strong> drag a tile into a box — or click a tile, then click a box.{' '}
          <strong>Fixing a mistake:</strong> click the <span className="kbd">×</span> on any filled box to
          remove just that tile, drag it back to the bank, or drag it onto another box to swap.
        </p>
      </section>

      {children}
    </div>
  )
}

/** Submit / Clear before checking; score, retry and continue afterwards. */
export function ActionBar({ board, score, onRetry, onContinue, continueLabel, reveal, onToggleReveal }) {
  const [celebrate, setCelebrate] = useState(null)

  useEffect(() => {
    if (!board.submitted || !score) return
    if (score.correct === score.total) setCelebrate('perfect')
    else if (score.correct === 0) setCelebrate('allwrong')
  }, [board.submitted]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!board.submitted) {
    return (
      <div className="action-bar panel">
        <button className="btn btn-ghost" onClick={board.clearAll} disabled={!Object.keys(board.filled).length}>
          Clear all
        </button>
        <span className="action-hint">
          {board.complete ? 'Ready when you are.' : 'Fill every empty box to submit.'}
        </span>
        <button className="btn btn-primary" onClick={board.submit} disabled={!board.complete}>
          Submit
        </button>
      </div>
    )
  }

  const pct = Math.round((score.correct / score.total) * 100)
  return (
    <>
      <div className="action-bar panel is-result">
        <div className="score">
          <div className="score-meter">
            <div className="score-meter-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="score-text">
            <strong>{score.correct}</strong> / {score.total} correct
          </span>
        </div>
        <div className="action-buttons">
          {score.correct < score.total && onToggleReveal && (
            <button className="btn btn-ghost" onClick={onToggleReveal}>
              {reveal ? 'Hide answers' : 'Show answers'}
            </button>
          )}
          <button className="btn btn-secondary" onClick={onRetry}>
            ↻ Try again
          </button>
          {onContinue && (
            <button className="btn btn-primary" onClick={onContinue}>
              {continueLabel} →
            </button>
          )}
        </div>
      </div>
      {celebrate && <Celebration kind={celebrate} onDone={() => setCelebrate(null)} />}
    </>
  )
}

export function Segmented({ options, value, onChange }) {
  return (
    <div className="segmented" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          className={value === o.value ? 'is-active' : ''}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
