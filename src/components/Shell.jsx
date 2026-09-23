import { useEffect, useState } from 'react'
import Celebration from './Celebration.jsx'
import { useLang } from '../i18n.jsx'

export function ExerciseShell({ title, block, accent, instructions, toolbar, onBack, children }) {
  const { t } = useLang()
  return (
    <div className="exercise" style={{ '--accent': accent }}>
      <header className="exercise-header">
        <button className="btn btn-ghost back-btn" onClick={onBack}>
          <span aria-hidden>←</span> {t('backToExercises')}
        </button>
        <div className="exercise-title">
          <span className="block-tag">{block}</span>
          <h1>{title}</h1>
        </div>
        <div className="exercise-toolbar">{toolbar}</div>
      </header>

      <section className="instructions panel">
        <div className="panel-label">{t('howTo')}</div>
        <div className="instructions-body">{instructions}</div>
        <p className="instructions-tip">
          <strong>{t('tipPlacingLabel')}</strong> {t('tipPlacing')} <strong>{t('tipFixingLabel')}</strong>{' '}
          {t('tipFixingA')} <span className="kbd">×</span> {t('tipFixingB')}
        </p>
      </section>

      {children}
    </div>
  )
}

/** Submit / Clear before checking; score, retry and continue afterwards. */
export function ActionBar({ board, score, onRetry, onContinue, continueLabel, reveal, onToggleReveal }) {
  const { t } = useLang()
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
          {t('clearAll')}
        </button>
        <span className="action-hint">
          {board.complete ? t('ready') : t('fillAll')}
        </span>
        <button className="btn btn-primary" onClick={board.submit} disabled={!board.complete}>
          {t('submit')}
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
            <strong>{score.correct}</strong> {t('correctOf', { total: score.total })}
          </span>
        </div>
        <div className="action-buttons">
          {score.correct < score.total && onToggleReveal && (
            <button className="btn btn-ghost" onClick={onToggleReveal}>
              {reveal ? t('hideAnswers') : t('showAnswers')}
            </button>
          )}
          <button className="btn btn-secondary" onClick={onRetry}>
            ↻ {t('tryAgain')}
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
