import { useMemo, useState } from 'react'
import { DndProvider } from '../components/dnd.jsx'
import { Bank, Slot, shuffle, useBoard } from '../components/board.jsx'
import { ActionBar, ExerciseShell, Segmented } from '../components/Shell.jsx'
import { KeyStrip } from './MajorDegrees.jsx'
import { CHROMATIC_INTERVALS, COLORS, INTERVAL_NUMBERS, QUALITIES } from '../theory.js'

const QUALITY_COLORS = {
  Perfect: COLORS.lime,
  Major: COLORS.cyan,
  Minor: COLORS.magenta,
  Augmented: COLORS.amber,
  Diminished: COLORS.coral,
}

export default function ChromaticIntervals({ onBack, meta }) {
  const [way, setWay] = useState(1)
  const [round, setRound] = useState(0)
  const switchWay = (w) => {
    setWay(w)
    setRound((r) => r + 1)
  }

  const instructions =
    way === 1 ? (
      <ol>
        <li>
          Each row shows a distance in <strong>semitones</strong> above the root, from 0 up to a full octave (12).
        </li>
        <li>
          Name each interval using <strong>two tiles</strong>: drag a <strong>quality</strong> (Perfect, Major, Minor,
          Augmented or Diminished) into the <em>Quality</em> column, and an <strong>interval number</strong> (Unison,
          2nd … 7th, Octave) into the <em>Interval</em> column. Example: 3 semitones = <em>Minor</em> + <em>3rd</em>.
        </li>
        <li>
          These tiles never run out — you can use the same one as many times as you need.
        </li>
        <li>
          6 semitones (the tritone) has two correct spellings: <em>Augmented 4th</em> or <em>Diminished 5th</em>.
          Either is accepted.
        </li>
        <li>When every box is full, press <strong>Submit</strong>.</li>
      </ol>
    ) : (
      <ol>
        <li>
          Each row now shows an <strong>interval name</strong>. The rows are shuffled.
        </li>
        <li>
          Drag the number of <strong>semitones</strong> that interval spans from the bank into the{' '}
          <em>Semitones</em> column. Each number is used exactly once.
        </li>
        <li>When every box is full, press <strong>Submit</strong>.</li>
      </ol>
    )

  return (
    <ExerciseShell
      {...meta}
      onBack={onBack}
      instructions={instructions}
      toolbar={
        <Segmented
          value={way}
          onChange={switchWay}
          options={[
            { value: 1, label: 'Way 1 · Semitones given' },
            { value: 2, label: 'Way 2 · Intervals given' },
          ]}
        />
      }
    >
      {way === 1 ? (
        <NameBoard key={round} onRetry={() => setRound((r) => r + 1)} onContinue={() => switchWay(2)} />
      ) : (
        <SemitoneBoard key={round} onRetry={() => setRound((r) => r + 1)} onContinue={() => switchWay(1)} />
      )}
    </ExerciseShell>
  )
}

function NameBoard({ onRetry, onContinue }) {
  const [reveal, setReveal] = useState(false)
  const rows = CHROMATIC_INTERVALS
  const slots = useMemo(
    () => rows.flatMap((r) => [{ id: `q${r.semitones}`, accepts: 'quality' }, { id: `n${r.semitones}`, accepts: 'number' }]),
    [rows],
  )
  const items = useMemo(
    () => [
      ...QUALITIES.map((q) => ({ id: q, value: q, label: q, group: 'quality', color: QUALITY_COLORS[q], reusable: true })),
      ...INTERVAL_NUMBERS.map((n) => ({ id: n, value: n, label: n, group: 'number', color: COLORS.violet, reusable: true })),
    ],
    [],
  )
  const board = useBoard(slots, items)

  const results = {}
  if (board.submitted) {
    for (const r of rows) {
      const q = board.valueAt(`q${r.semitones}`)
      const n = board.valueAt(`n${r.semitones}`)
      const match = r.answers.find((a) => a[1] === n)
      results[`n${r.semitones}`] = !!match
      results[`q${r.semitones}`] = match ? match[0] === q : r.answers.some((a) => a[0] === q)
    }
  }
  const correct = Object.values(results).filter(Boolean).length

  return (
    <DndProvider onDrop={board.handleDrop} disabled={board.submitted}>
      <div className="workspace">
        <div className="panel chart">
          <div className="chart-grid cols-3">
            <div className="chart-head">Semitones from root</div>
            <div className="chart-head">Quality</div>
            <div className="chart-head">Interval</div>
            {rows.map((r) => (
              <Row3 key={r.semitones} r={r} board={board} results={results} reveal={reveal} />
            ))}
          </div>
        </div>
        <div className="banks">
          <Bank board={board} group="quality" title="Qualities (reusable)" />
          <Bank board={board} group="number" title="Interval numbers (reusable)" />
        </div>
      </div>
      <ActionBar
        board={board}
        score={{ correct, total: slots.length }}
        onRetry={onRetry}
        onContinue={onContinue}
        continueLabel="Continue to Way 2"
        reveal={reveal}
        onToggleReveal={() => setReveal((v) => !v)}
      />
    </DndProvider>
  )
}

function Row3({ r, board, results, reveal }) {
  const answerQ = r.answers.map((a) => a[0]).join(' / ')
  const answerN = r.answers.map((a) => a[1]).join(' / ')
  return (
    <>
      <div className="chart-given">
        <div className="semi-given">
          <span className="semi-num">{r.semitones}</span>
          <KeyStrip lit={r.semitones} />
        </div>
      </div>
      <Slot board={board} id={`q${r.semitones}`} status={results[`q${r.semitones}`]} placeholder="quality" answer={answerQ} reveal={reveal} />
      <Slot board={board} id={`n${r.semitones}`} status={results[`n${r.semitones}`]} placeholder="interval" answer={answerN} reveal={reveal} />
    </>
  )
}

function SemitoneBoard({ onRetry, onContinue }) {
  const [reveal, setReveal] = useState(false)
  const rows = useMemo(() => shuffle(CHROMATIC_INTERVALS), [])
  const slots = useMemo(() => rows.map((r) => ({ id: `s${r.semitones}`, accepts: 'semi' })), [rows])
  const items = useMemo(
    () =>
      shuffle(CHROMATIC_INTERVALS).map((r) => ({
        id: `t${r.semitones}`,
        value: r.semitones,
        label: `${r.semitones}`,
        group: 'semi',
        color: COLORS.cyan,
      })),
    [],
  )
  const board = useBoard(slots, items)
  const results = board.submitted
    ? Object.fromEntries(rows.map((r) => [`s${r.semitones}`, board.valueAt(`s${r.semitones}`) === r.semitones]))
    : {}
  const correct = Object.values(results).filter(Boolean).length

  return (
    <DndProvider onDrop={board.handleDrop} disabled={board.submitted}>
      <div className="workspace">
        <div className="panel chart">
          <div className="chart-grid cols-2">
            <div className="chart-head">Interval</div>
            <div className="chart-head">Semitones from root</div>
            {rows.map((r) => (
              <IntervalRow key={r.semitones} r={r} board={board} results={results} reveal={reveal} />
            ))}
          </div>
        </div>
        <div className="banks">
          <Bank board={board} group="semi" title="Semitones" />
        </div>
      </div>
      <ActionBar
        board={board}
        score={{ correct, total: slots.length }}
        onRetry={onRetry}
        onContinue={onContinue}
        continueLabel="Continue to Way 1"
        reveal={reveal}
        onToggleReveal={() => setReveal((v) => !v)}
      />
    </DndProvider>
  )
}

function IntervalRow({ r, board, results, reveal }) {
  return (
    <>
      <div className="chart-given interval-name">
        {r.answers.map(([q, n], i) => (
          <span key={i}>
            {i > 0 && <span className="muted"> / </span>}
            <span style={{ color: QUALITY_COLORS[q] }}>{q}</span> {n}
          </span>
        ))}
      </div>
      <Slot
        board={board}
        id={`s${r.semitones}`}
        status={results[`s${r.semitones}`]}
        placeholder="semitones"
        answer={`${r.semitones}`}
        reveal={reveal}
      />
    </>
  )
}
