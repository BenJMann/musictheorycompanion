import { useMemo, useState } from 'react'
import { DndProvider } from '../components/dnd.jsx'
import { Bank, Slot, shuffle, useBoard } from '../components/board.jsx'
import { ActionBar, ExerciseShell, Segmented } from '../components/Shell.jsx'
import { COLORS, MAJOR_SCALE } from '../theory.js'

const degreeLabel = (d) => (
  <span className="degree-tile">
    <b>{d.degree}</b>
    <small>{d.name}</small>
  </span>
)

export default function MajorDegrees({ onBack, meta }) {
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
          Each row shows how many <strong>semitones</strong> a note is above the root of the major scale (the little
          keyboard strip lights up that semitone).
        </li>
        <li>
          Drag the matching <strong>scale degree</strong> (1 to 7, with its interval name) from the purple bank into
          the <em>Scale degree</em> column.
        </li>
        <li>
          Drag the <strong>mode</strong> that starts on that degree from the green bank into the <em>Mode</em> column
          (e.g. the mode built on degree 1 is Ionian).
        </li>
        <li>When every box is full, press <strong>Submit</strong>.</li>
      </ol>
    ) : (
      <ol>
        <li>
          Each row now shows a <strong>scale degree</strong> of the major scale. The rows are shuffled, so read each
          one carefully.
        </li>
        <li>
          Drag the number of <strong>semitones</strong> that degree sits above the root from the cyan bank into the{' '}
          <em>Semitones</em> column.
        </li>
        <li>
          Drag the <strong>mode</strong> that starts on that degree from the green bank into the <em>Mode</em> column.
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
            { value: 2, label: 'Way 2 · Degrees given' },
          ]}
        />
      }
    >
      <Board
        key={`${way}-${round}`}
        way={way}
        onRetry={() => setRound((r) => r + 1)}
        onContinue={() => switchWay(way === 1 ? 2 : 1)}
      />
    </ExerciseShell>
  )
}

function Board({ way, onRetry, onContinue }) {
  const [reveal, setReveal] = useState(false)
  const rows = useMemo(() => (way === 1 ? MAJOR_SCALE : shuffle(MAJOR_SCALE)), [way])
  const askGroup = way === 1 ? 'degree' : 'semi'

  const slots = useMemo(
    () => rows.flatMap((r) => [{ id: `ask-${r.degree}`, accepts: askGroup }, { id: `mode-${r.degree}`, accepts: 'mode' }]),
    [rows, askGroup],
  )
  const items = useMemo(
    () => [
      ...shuffle(
        MAJOR_SCALE.map((d) =>
          way === 1
            ? { id: `d${d.degree}`, value: d.degree, label: degreeLabel(d), group: 'degree', color: COLORS.violet }
            : { id: `s${d.semitones}`, value: d.degree, label: `${d.semitones}`, group: 'semi', color: COLORS.cyan },
        ),
      ),
      ...shuffle(MAJOR_SCALE.map((d) => ({ id: `m${d.mode}`, value: d.mode, label: d.mode, group: 'mode', color: COLORS.lime }))),
    ],
    [way],
  )
  const board = useBoard(slots, items)

  const results = board.submitted
    ? Object.fromEntries(
        rows.flatMap((r) => [
          [`ask-${r.degree}`, board.valueAt(`ask-${r.degree}`) === r.degree],
          [`mode-${r.degree}`, board.valueAt(`mode-${r.degree}`) === r.mode],
        ]),
      )
    : {}
  const correct = Object.values(results).filter(Boolean).length

  return (
    <DndProvider onDrop={board.handleDrop} disabled={board.submitted}>
      <div className="workspace">
        <div className="panel chart">
          <div className="chart-grid cols-3">
            <div className="chart-head">{way === 1 ? 'Semitones from root' : 'Scale degree'}</div>
            <div className="chart-head">{way === 1 ? 'Scale degree' : 'Semitones from root'}</div>
            <div className="chart-head">Mode</div>
            {rows.map((r) => (
              <Row key={r.degree} r={r} way={way} board={board} results={results} reveal={reveal} />
            ))}
          </div>
        </div>
        <div className="banks">
          <Bank board={board} group={askGroup} title={way === 1 ? 'Scale degrees' : 'Semitones'} />
          <Bank board={board} group="mode" title="Mode names" />
        </div>
      </div>
      <ActionBar
        board={board}
        score={{ correct, total: slots.length }}
        onRetry={onRetry}
        onContinue={onContinue}
        continueLabel={way === 1 ? 'Continue to Way 2' : 'Continue to Way 1'}
        reveal={reveal}
        onToggleReveal={() => setReveal((v) => !v)}
      />
    </DndProvider>
  )
}

function Row({ r, way, board, results, reveal }) {
  return (
    <>
      <div className="chart-given">
        {way === 1 ? (
          <div className="semi-given">
            <span className="semi-num">{r.semitones}</span>
            <KeyStrip lit={r.semitones} />
          </div>
        ) : (
          degreeLabel(r)
        )}
      </div>
      <Slot
        board={board}
        id={`ask-${r.degree}`}
        status={results[`ask-${r.degree}`]}
        placeholder={way === 1 ? 'degree' : 'semitones'}
        answer={way === 1 ? `${r.degree} · ${r.name}` : `${r.semitones}`}
        reveal={reveal}
      />
      <Slot
        board={board}
        id={`mode-${r.degree}`}
        status={results[`mode-${r.degree}`]}
        placeholder="mode"
        answer={r.mode}
        reveal={reveal}
      />
    </>
  )
}

/** A tiny one-octave strip lighting up a semitone (0–12). */
export function KeyStrip({ lit }) {
  const black = [1, 3, 6, 8, 10]
  return (
    <div className="keystrip" aria-hidden>
      {Array.from({ length: 13 }, (_, i) => (
        <span
          key={i}
          className={`key ${black.includes(i % 12) ? 'key-black' : ''} ${i === lit ? 'key-lit' : ''} ${
            i === 0 ? 'key-root' : ''
          }`}
        />
      ))}
    </div>
  )
}
