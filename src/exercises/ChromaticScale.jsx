import { useMemo, useState } from 'react'
import { DndProvider } from '../components/dnd.jsx'
import { Bank, Slot, shuffle, useBoard } from '../components/board.jsx'
import { ActionBar, ExerciseShell, Segmented } from '../components/Shell.jsx'
import { CHROMATIC_FLATS_DESC, CHROMATIC_SHARPS, COLORS, NOTE_BANK, prettyNote } from '../theory.js'

const noteColor = (n) => (n.length === 1 ? COLORS.cyan : n.endsWith('#') ? COLORS.magenta : COLORS.amber)

const VARIANTS = {
  up: { answer: CHROMATIC_SHARPS, label: 'Ascending · sharps' },
  down: { answer: CHROMATIC_FLATS_DESC, label: 'Descending · flats' },
}

export default function ChromaticScale({ onBack, meta }) {
  const [dir, setDir] = useState('up')
  const [round, setRound] = useState(0)
  const switchDir = (d) => {
    setDir(d)
    setRound((r) => r + 1)
  }

  const instructions =
    dir === 'up' ? (
      <ol>
        <li>
          Build the <strong>ascending chromatic scale starting on C</strong>: all 12 semitones in order, one per box,
          from left to right.
        </li>
        <li>
          Use <strong>sharps (♯)</strong> for the notes between the natural notes — the way the scale is written going
          up (e.g. C, C♯, D …).
        </li>
        <li>
          The note bank holds <strong>more notes than you need</strong>, including flats and unusual spellings like
          E♯ and C♭. Choose carefully — some tiles are decoys and should stay in the bank.
        </li>
        <li>
          Watch out: not every pair of natural notes has a note between them.
        </li>
        <li>When all 12 boxes are full, press <strong>Submit</strong>.</li>
      </ol>
    ) : (
      <ol>
        <li>
          Build the <strong>descending chromatic scale starting on C</strong>: all 12 semitones going down, one per
          box, from left to right.
        </li>
        <li>
          Use <strong>flats (♭)</strong> for the notes between the natural notes — the way the scale is written going
          down (e.g. C, B, B♭ …).
        </li>
        <li>
          The note bank holds <strong>more notes than you need</strong>, including sharps and unusual spellings like
          F♭ and B♯. Some tiles are decoys.
        </li>
        <li>When all 12 boxes are full, press <strong>Submit</strong>.</li>
      </ol>
    )

  return (
    <ExerciseShell
      {...meta}
      onBack={onBack}
      instructions={instructions}
      toolbar={
        <Segmented
          value={dir}
          onChange={switchDir}
          options={Object.entries(VARIANTS).map(([value, v]) => ({ value, label: v.label }))}
        />
      }
    >
      <Board
        key={`${dir}-${round}`}
        dir={dir}
        onRetry={() => setRound((r) => r + 1)}
        onContinue={() => switchDir(dir === 'up' ? 'down' : 'up')}
      />
    </ExerciseShell>
  )
}

function Board({ dir, onRetry, onContinue }) {
  const [reveal, setReveal] = useState(false)
  const answer = VARIANTS[dir].answer
  const slots = useMemo(() => answer.map((_, i) => ({ id: `box${i}` })), [answer])
  const items = useMemo(
    () => shuffle(NOTE_BANK).map((n) => ({ id: n, value: n, label: prettyNote(n), group: 'note', color: noteColor(n) })),
    [],
  )
  const board = useBoard(slots, items)
  const results = board.submitted
    ? Object.fromEntries(answer.map((n, i) => [`box${i}`, board.valueAt(`box${i}`) === n]))
    : {}
  const correct = Object.values(results).filter(Boolean).length

  return (
    <DndProvider onDrop={board.handleDrop} disabled={board.submitted}>
      <div className="panel chromatic-line">
        <div className="panel-label">
          {dir === 'up' ? 'C → up by semitones →' : 'C → down by semitones →'}
        </div>
        <div className="chromatic-boxes">
          {answer.map((n, i) => (
            <div className="chromatic-step" key={i}>
              <span className="step-num">{i + 1}</span>
              <Slot
                board={board}
                id={`box${i}`}
                status={results[`box${i}`]}
                placeholder={i === 0 ? 'start' : ''}
                answer={prettyNote(n)}
                reveal={reveal}
              />
            </div>
          ))}
        </div>
      </div>
      <Bank board={board} title="Note bank (more notes than you need)" className="note-bank" />
      <ActionBar
        board={board}
        score={{ correct, total: slots.length }}
        onRetry={onRetry}
        onContinue={onContinue}
        continueLabel={dir === 'up' ? 'Continue: descending with flats' : 'Continue: ascending with sharps'}
        reveal={reveal}
        onToggleReveal={() => setReveal((v) => !v)}
      />
    </DndProvider>
  )
}
