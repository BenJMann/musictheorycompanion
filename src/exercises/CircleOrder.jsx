import { useMemo, useState } from 'react'
import { DndProvider } from '../components/dnd.jsx'
import { Bank, Slot, shuffle, useBoard } from '../components/board.jsx'
import { ActionBar, ExerciseShell } from '../components/Shell.jsx'
import { CircleLayout } from '../components/Circle.jsx'
import { CIRCLE_ORDER, INTERVAL_LABELS, intervalColor } from '../theory.js'

export default function CircleOrder({ onBack, meta }) {
  const [round, setRound] = useState(0)
  const instructions = (
    <ol>
      <li>
        The 12 interval names on the left are jumbled up. Put them in their correct places around the{' '}
        <strong>circle of fifths</strong>.
      </li>
      <li>
        The box at the very top (12 o'clock, marked <strong>START</strong>) is <strong>4</strong>'s home. From there,
        go <strong>clockwise</strong>: each step moves up a perfect fifth (7 semitones).
      </li>
      <li>
        Hint: the plain intervals (no ♭ or ♯) all sit next to each other on one side of the circle; the altered ones
        (♭ and ♭5/♯4) fill the other side.
      </li>
      <li>When all 12 boxes are full, press <strong>Submit</strong>.</li>
    </ol>
  )
  return (
    <ExerciseShell {...meta} onBack={onBack} instructions={instructions}>
      <Board key={round} onRetry={() => setRound((r) => r + 1)} />
    </ExerciseShell>
  )
}

function Board({ onRetry }) {
  const [reveal, setReveal] = useState(false)
  const slots = useMemo(() => CIRCLE_ORDER.map((_, i) => ({ id: `pos${i}` })), [])
  const items = useMemo(
    () =>
      shuffle(CIRCLE_ORDER).map((v) => ({ id: `i${v}`, value: v, label: INTERVAL_LABELS[v], group: 'interval', color: intervalColor(v) })),
    [],
  )
  const board = useBoard(slots, items)
  const results = board.submitted
    ? Object.fromEntries(CIRCLE_ORDER.map((v, i) => [`pos${i}`, board.valueAt(`pos${i}`) === v]))
    : {}
  const correct = Object.values(results).filter(Boolean).length

  return (
    <DndProvider onDrop={board.handleDrop} disabled={board.submitted}>
      <div className="workspace circle-workspace">
        <Bank board={board} title="Jumbled intervals" className="circle-bank" />
        <div className="panel circle-panel">
          <div className="panel-label">Circle of fifths</div>
          <CircleLayout
            className="circle-slots"
            renderNode={(i) => (
              <Slot
                board={board}
                id={`pos${i}`}
                status={results[`pos${i}`]}
                placeholder={i === 0 ? 'START' : ''}
                answer={INTERVAL_LABELS[CIRCLE_ORDER[i]]}
                reveal={reveal}
                className="slot-round"
              />
            )}
            center={
              <>
                <span className="circle-center-title">5ths</span>
                <span className="circle-center-sub">clockwise ↻</span>
              </>
            }
          />
        </div>
      </div>
      <ActionBar
        board={board}
        score={{ correct, total: slots.length }}
        onRetry={onRetry}
        onContinue={onRetry}
        continueLabel="New jumble"
        reveal={reveal}
        onToggleReveal={() => setReveal((v) => !v)}
      />
    </DndProvider>
  )
}
