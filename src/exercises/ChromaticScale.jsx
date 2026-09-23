import { useMemo, useState } from 'react'
import { DndProvider } from '../components/dnd.jsx'
import { Bank, Slot, shuffle, useBoard } from '../components/board.jsx'
import { ActionBar, ExerciseShell, Segmented } from '../components/Shell.jsx'
import { CHROMATIC_FLATS_DESC, CHROMATIC_SHARPS, COLORS, NOTE_BANK, prettyNote } from '../theory.js'
import { useLang } from '../i18n.jsx'

const noteColor = (n) => (n.length === 1 ? COLORS.cyan : n.endsWith('#') ? COLORS.magenta : COLORS.amber)

const VARIANTS = {
  up: { answer: CHROMATIC_SHARPS, label: 'ascSharps' },
  down: { answer: CHROMATIC_FLATS_DESC, label: 'descFlats' },
}

const INSTRUCTIONS = {
  en: {
    up: (
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
        <li>Watch out: not every pair of natural notes has a note between them.</li>
        <li>When all 12 boxes are full, press <strong>Submit</strong>.</li>
      </ol>
    ),
    down: (
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
    ),
  },
  es: {
    up: (
      <ol>
        <li>
          Construye la <strong>escala cromática ascendente empezando en Do</strong>: los 12 semitonos en orden, uno por
          casilla, de izquierda a derecha.
        </li>
        <li>
          Usa <strong>sostenidos (♯)</strong> para las notas que hay entre las notas naturales, como se escribe la
          escala al subir (p. ej., Do, Do♯, Re …).
        </li>
        <li>
          El banco de notas tiene <strong>más notas de las que necesitas</strong>, incluidos bemoles y nombres poco
          habituales como Mi♯ y Do♭. Elige con cuidado: algunas fichas son trampas y deben quedarse en el banco.
        </li>
        <li>Ojo: no todos los pares de notas naturales tienen una nota entre ellos.</li>
        <li>Cuando las 12 casillas estén llenas, pulsa <strong>Enviar</strong>.</li>
      </ol>
    ),
    down: (
      <ol>
        <li>
          Construye la <strong>escala cromática descendente empezando en Do</strong>: los 12 semitonos bajando, uno por
          casilla, de izquierda a derecha.
        </li>
        <li>
          Usa <strong>bemoles (♭)</strong> para las notas que hay entre las notas naturales, como se escribe la escala
          al bajar (p. ej., Do, Si, Si♭ …).
        </li>
        <li>
          El banco de notas tiene <strong>más notas de las que necesitas</strong>, incluidos sostenidos y nombres poco
          habituales como Fa♭ y Si♯. Algunas fichas son trampas.
        </li>
        <li>Cuando las 12 casillas estén llenas, pulsa <strong>Enviar</strong>.</li>
      </ol>
    ),
  },
}

export default function ChromaticScale({ onBack, meta }) {
  const { lang, t } = useLang()
  const [dir, setDir] = useState('up')
  const [round, setRound] = useState(0)
  const switchDir = (d) => {
    setDir(d)
    setRound((r) => r + 1)
  }

  return (
    <ExerciseShell
      {...meta}
      onBack={onBack}
      instructions={INSTRUCTIONS[lang][dir]}
      toolbar={
        <Segmented
          value={dir}
          onChange={switchDir}
          options={Object.entries(VARIANTS).map(([value, v]) => ({ value, label: t(v.label) }))}
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
  const { lang, t } = useLang()
  const [reveal, setReveal] = useState(false)
  const answer = VARIANTS[dir].answer
  const slots = useMemo(() => answer.map((_, i) => ({ id: `box${i}` })), [answer])
  const items = useMemo(
    () => shuffle(NOTE_BANK).map((n) => ({ id: n, value: n, label: (l) => prettyNote(n, l), group: 'note', color: noteColor(n) })),
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
          {dir === 'up' ? t('lineUp') : t('lineDown')}
        </div>
        <div className="chromatic-boxes">
          {answer.map((n, i) => (
            <div className="chromatic-step" key={i}>
              <span className="step-num">{i + 1}</span>
              <Slot
                board={board}
                id={`box${i}`}
                status={results[`box${i}`]}
                placeholder={i === 0 ? t('phStart') : ''}
                answer={prettyNote(n, lang)}
                reveal={reveal}
              />
            </div>
          ))}
        </div>
      </div>
      <Bank board={board} title={t('noteBank')} className="note-bank" />
      <ActionBar
        board={board}
        score={{ correct, total: slots.length }}
        onRetry={onRetry}
        onContinue={onContinue}
        continueLabel={dir === 'up' ? t('continueDesc') : t('continueAsc')}
        reveal={reveal}
        onToggleReveal={() => setReveal((v) => !v)}
      />
    </DndProvider>
  )
}
