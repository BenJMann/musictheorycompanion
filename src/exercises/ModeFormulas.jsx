import { useMemo, useState } from 'react'
import { DndProvider } from '../components/dnd.jsx'
import { Slot, shuffle, useBoard } from '../components/board.jsx'
import { ActionBar, ExerciseShell } from '../components/Shell.jsx'
import { CirclePalette, intervalItems } from '../components/Circle.jsx'
import { intervalColor, intervalLabelAt, MODES } from '../theory.js'

const DEGREES = ['1', '2', '3', '4', '5', '6', '7']

/** One row of seven formula boxes for a mode. */
function FormulaSlots({ board, modeIndex, results, reveal }) {
  const mode = MODES[modeIndex]
  return mode.formula.map((v, i) => (
    <Slot
      key={i}
      board={board}
      id={`f${i}`}
      status={results[`f${i}`]}
      placeholder={DEGREES[i]}
      answer={intervalLabelAt(v, i)}
      reveal={reveal}
      renderLabel={(item) => intervalLabelAt(item.value, i)}
    />
  ))
}

function useFormulaBoard(modeIndex) {
  const slots = useMemo(() => DEGREES.map((_, i) => ({ id: `f${i}`, accepts: 'interval' })), [])
  const board = useBoard(slots, intervalItems)
  const formula = MODES[modeIndex].formula
  const results = board.submitted
    ? Object.fromEntries(formula.map((v, i) => [`f${i}`, board.valueAt(`f${i}`) === v]))
    : {}
  const correct = Object.values(results).filter(Boolean).length
  return { board, results, score: { correct, total: slots.length } }
}

const formulaSteps = (
  <>
    <li>
      Drag intervals from the <strong>circle of fifths</strong> (on the right — or below, on small screens) into the seven empty boxes, in scale order —
      the box labels (1, 2, 3 …) tell you which degree goes where.
    </li>
    <li>
      Every formula starts on <strong>1</strong>. For each degree, decide whether it is natural or flattened (♭). The
      only sharp you'll need is <strong>♯4</strong> — use the <strong>♭5/♯4</strong> tile for it, and for ♭5 too.
      Example of the format: a formula that starts <em>1 ♭2 …</em> has a flattened second.
    </li>
    <li>The circle's tiles never run out, so use any tile as often as you need.</li>
  </>
)

/* ───────────── Exercise 3.2: the whole chart, one empty row at a time ───────────── */

export function ModeChart({ onBack, meta }) {
  const [queue, setQueue] = useState(() => shuffle(MODES.map((_, i) => i)))
  const [pos, setPos] = useState(0)
  const [round, setRound] = useState(0)
  const done = pos >= queue.length
  const active = done ? null : queue[pos]

  const next = () => {
    if (pos + 1 >= queue.length) setPos(queue.length)
    else setPos(pos + 1)
  }
  const restart = () => {
    setQueue(shuffle(MODES.map((_, i) => i)))
    setPos(0)
    setRound((r) => r + 1)
  }

  const instructions = (
    <ol>
      <li>
        The chart lists all seven modes in <strong>circle-of-fifths order</strong>, from the brightest (Lydian) to the
        darkest (Locrian). Every row is filled in except the <strong>one glowing row</strong> — that's the one you
        complete.
      </li>
      {formulaSteps}
      <li>
        Press <strong>Submit</strong> to check the row, then <strong>Next mode</strong> to empty a different row. Work
        through all seven.
      </li>
    </ol>
  )

  return (
    <ExerciseShell
      {...meta}
      onBack={onBack}
      instructions={instructions}
      toolbar={
        <div className="progress-pips" title="Modes completed">
          {queue.map((m, i) => (
            <span key={m} className={`pip ${i < pos ? 'pip-done' : i === pos ? 'pip-active' : ''}`} />
          ))}
          <span className="progress-text">
            {Math.min(pos + 1, 7)} / 7
          </span>
        </div>
      }
    >
      {done ? (
        <div className="panel finished">
          <div className="finished-title">All seven modes complete</div>
          <p>You've filled in every row of the chart. Go again with a fresh random order?</p>
          <button className="btn btn-primary" onClick={restart}>
            ↻ Start the chart again
          </button>
        </div>
      ) : (
        <ChartBoard
          key={`${active}-${round}`}
          active={active}
          onRetry={() => setRound((r) => r + 1)}
          onContinue={next}
          continueLabel={pos + 1 >= queue.length ? 'Finish' : 'Next mode'}
        />
      )}
    </ExerciseShell>
  )
}

function ChartBoard({ active, onRetry, onContinue, continueLabel }) {
  const [reveal, setReveal] = useState(false)
  const { board, results, score } = useFormulaBoard(active)
  return (
    <DndProvider onDrop={board.handleDrop} disabled={board.submitted}>
      <div className="workspace mode-workspace">
        <div className="panel chart mode-chart">
          <div className="chart-grid cols-mode">
            <div className="chart-head">Mode</div>
            {DEGREES.map((d) => (
              <div className="chart-head center" key={d}>
                {d}
              </div>
            ))}
            {MODES.map((m, mi) =>
              mi === active ? (
                <div className="mode-row is-active" key={m.name}>
                  <div className="mode-name">
                    <span className="brightness" style={{ '--b': 1 - mi / 6 }} />
                    {m.name}
                    <span className="your-turn">your turn</span>
                  </div>
                  <FormulaSlots board={board} modeIndex={mi} results={results} reveal={reveal} />
                </div>
              ) : (
                <div className="mode-row" key={m.name}>
                  <div className="mode-name">
                    <span className="brightness" style={{ '--b': 1 - mi / 6 }} />
                    {m.name}
                  </div>
                  {m.formula.map((v, i) => (
                    <div className="formula-cell" key={i} style={{ '--chip-color': intervalColor(v) }}>
                      {intervalLabelAt(v, i)}
                    </div>
                  ))}
                </div>
              ),
            )}
          </div>
        </div>
        <CirclePalette />
      </div>
      <ActionBar
        board={board}
        score={score}
        onRetry={onRetry}
        onContinue={onContinue}
        continueLabel={continueLabel}
        reveal={reveal}
        onToggleReveal={() => setReveal((v) => !v)}
      />
    </DndProvider>
  )
}

/* ───────────── Exercise 3.3: one mode on its own ───────────── */

export function ModeSingle({ onBack, meta }) {
  const [mode, setMode] = useState(() => Math.floor(Math.random() * MODES.length))
  const [round, setRound] = useState(0)
  const nextMode = () => {
    let m
    do m = Math.floor(Math.random() * MODES.length)
    while (m === mode)
    setMode(m)
    setRound((r) => r + 1)
  }
  const instructions = (
    <ol>
      <li>
        You're given the name of <strong>one mode</strong> — no chart to lean on this time. Build its formula from
        memory.
      </li>
      {formulaSteps}
      <li>
        Press <strong>Submit</strong> to check, then <strong>Next mode</strong> for a new one.
      </li>
    </ol>
  )
  return (
    <ExerciseShell {...meta} onBack={onBack} instructions={instructions}>
      <SingleBoard key={`${mode}-${round}`} mode={mode} onRetry={() => setRound((r) => r + 1)} onContinue={nextMode} />
    </ExerciseShell>
  )
}

function SingleBoard({ mode, onRetry, onContinue }) {
  const [reveal, setReveal] = useState(false)
  const { board, results, score } = useFormulaBoard(mode)
  return (
    <DndProvider onDrop={board.handleDrop} disabled={board.submitted}>
      <div className="workspace mode-workspace">
        <div className="panel single-mode">
          <div className="panel-label">Complete the formula for</div>
          <div className="single-mode-name">{MODES[mode].name}</div>
          <div className="single-mode-slots">
            <FormulaSlots board={board} modeIndex={mode} results={results} reveal={reveal} />
          </div>
        </div>
        <CirclePalette />
      </div>
      <ActionBar
        board={board}
        score={score}
        onRetry={onRetry}
        onContinue={onContinue}
        continueLabel="Next mode"
        reveal={reveal}
        onToggleReveal={() => setReveal((v) => !v)}
      />
    </DndProvider>
  )
}
