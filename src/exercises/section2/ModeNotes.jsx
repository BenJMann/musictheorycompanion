import { useMemo, useState } from 'react'
import { DndProvider } from '../../components/dnd.jsx'
import { Bank, Slot, useBoard } from '../../components/board.jsx'
import { ActionBar, ExerciseShell, ProgressPips } from '../../components/Shell.jsx'
import { useLang } from '../../i18n.jsx'
import { DEGREE_MODES, keyName, modeName, modeNotes, NATURAL_KEYS, noteColor, prettyNote } from '../../theory.js'
import { KeyPicker, noteItems, randomInt, RoundDone, useKeyedWays, useRoundQueue, WaysToolbar } from './common.jsx'

/*
 * Section 2 · Block 3. The notes of every mode of the natural keys:
 * 7 keys × 7 modes = 49 modes, 343 notes.
 */

const DEGREES = ['1', '2', '3', '4', '5', '6', '7']

const INSTRUCTIONS = {
  en: {
    intro: (
      <>
        Each mode of a key uses exactly the same notes as the key — it just <strong>starts somewhere else</strong>.
        G Dorian starts on A (degree 2 of G major) and runs through G major's notes: A B C D E F♯ G. Across the 7
        natural keys that's 49 modes and 343 notes.
      </>
    ),
    tiles: (
      <li>
        The note tiles never run out, and there are more spellings than you need (C♯ and D♭ …) — pick the one the key
        actually uses.
      </li>
    ),
    0: <li>First, choose the key you want to practise. Ways 1 and 2 both use it.</li>,
    1: (
      <li>
        The chart shows every mode of the key, one per row. All rows are filled in except the{' '}
        <strong>glowing row</strong>: drag its seven notes in, press <strong>Submit</strong>, then{' '}
        <strong>Next mode</strong> to empty a different row.
      </li>
    ),
    2: (
      <li>
        One mode of the key at a time, with no chart. Drag its seven notes into the boxes and press{' '}
        <strong>Submit</strong>. A round goes through all seven modes in a random order.
      </li>
    ),
    3: (
      <li>
        A random natural key and a random mode every time. Drag the seven notes of that mode into the boxes and press{' '}
        <strong>Submit</strong>.
      </li>
    ),
    4: (
      <li>
        A random key, mode and scale degree every time. Drag the single note that sits on that degree of the mode into
        the box and press <strong>Submit</strong>.
      </li>
    ),
  },
  es: {
    intro: (
      <>
        Cada modo de una tonalidad usa exactamente las mismas notas que la tonalidad: solo{' '}
        <strong>empieza en otro sitio</strong>. Sol dórico empieza en La (el grado 2 de Sol mayor) y recorre las notas
        de Sol mayor: La Si Do Re Mi Fa♯ Sol. En las 7 tonalidades naturales son 49 modos y 343 notas.
      </>
    ),
    tiles: (
      <li>
        Las fichas de notas nunca se agotan, y hay más grafías de las que necesitas (Do♯ y Re♭ …): elige la que usa de
        verdad la tonalidad.
      </li>
    ),
    0: <li>Primero, elige la tonalidad que quieres practicar. Las formas 1 y 2 la usan.</li>,
    1: (
      <li>
        La tabla muestra todos los modos de la tonalidad, uno por fila. Todas las filas están completas excepto{' '}
        <strong>la fila que brilla</strong>: arrastra sus siete notas, pulsa <strong>Enviar</strong> y después{' '}
        <strong>Siguiente modo</strong> para vaciar otra fila.
      </li>
    ),
    2: (
      <li>
        Un modo de la tonalidad cada vez, sin tabla. Arrastra sus siete notas a las casillas y pulsa{' '}
        <strong>Enviar</strong>. Cada ronda recorre los siete modos en orden aleatorio.
      </li>
    ),
    3: (
      <li>
        Cada vez, una tonalidad natural al azar y un modo al azar. Arrastra las siete notas de ese modo a las casillas
        y pulsa <strong>Enviar</strong>.
      </li>
    ),
    4: (
      <li>
        Cada vez, una tonalidad, un modo y un grado al azar. Arrastra la única nota que ocupa ese grado del modo a la
        casilla y pulsa <strong>Enviar</strong>.
      </li>
    ),
  },
}

export default function ModeNotes({ onBack, meta }) {
  const { lang, t } = useLang()
  const kw = useKeyedWays([3, 4])
  const text = INSTRUCTIONS[lang]
  const ways = [
    { value: 1, label: t('way1Chart') },
    { value: 2, label: t('way2OneMode') },
    { value: 3, label: t('way3RandomKey') },
    { value: 4, label: t('way4OneNote') },
  ]
  return (
    <ExerciseShell
      {...meta}
      onBack={onBack}
      instructions={
        <>
          <p className="instructions-intro">{text.intro}</p>
          <ol>
            {kw.key ? text[kw.way] : text[0]}
            {kw.key && text.tiles}
          </ol>
        </>
      }
      toolbar={<WaysToolbar kw={kw} ways={ways} />}
    >
      {!kw.key ? (
        <KeyPicker onChoose={kw.setKey} />
      ) : kw.way === 1 ? (
        <Chart key={`${kw.key}-${kw.round}`} musicKey={kw.key} />
      ) : kw.way === 2 ? (
        <OneMode key={`${kw.key}-${kw.round}`} musicKey={kw.key} />
      ) : (
        <RandomQuestions key={`${kw.way}-${kw.round}`} single={kw.way === 4} />
      )}
    </ExerciseShell>
  )
}

/** Seven boxes for the notes of one mode, checked against the answer. */
function useNotesBoard(answers) {
  const slots = useMemo(() => answers.map((_, i) => ({ id: `n${i}`, accepts: 'note' })), [answers.length]) // eslint-disable-line react-hooks/exhaustive-deps
  const board = useBoard(slots, noteItems)
  const results = board.submitted
    ? Object.fromEntries(answers.map((n, i) => [`n${i}`, board.valueAt(`n${i}`) === n]))
    : {}
  const correct = Object.values(results).filter(Boolean).length
  return { board, results, score: { correct, total: slots.length } }
}

function NoteSlots({ board, answers, results, reveal, placeholders = DEGREES }) {
  const { lang } = useLang()
  return answers.map((n, i) => (
    <Slot
      key={i}
      board={board}
      id={`n${i}`}
      status={results[`n${i}`]}
      placeholder={placeholders[i]}
      answer={prettyNote(n, lang)}
      reveal={reveal}
    />
  ))
}

const NoteBank = ({ board }) => {
  const { t } = useLang()
  return <Bank board={board} title={t('bankNotesReusable')} className="note-bank" />
}

/* ───────── Way 1: the key's chart, one empty row at a time ───────── */

function Chart({ musicKey }) {
  const { t } = useLang()
  const rq = useRoundQueue(7)
  const [attempt, setAttempt] = useState(0)
  if (rq.done) return <RoundDone title={t('roundDone')} sub={t('roundDoneModesSub')} onAgain={rq.restart} />
  return (
    <ChartBoard
      key={`${rq.round}-${rq.pos}-${attempt}`}
      musicKey={musicKey}
      active={rq.current}
      progress={<ProgressPips count={7} pos={rq.pos} />}
      onRetry={() => setAttempt((a) => a + 1)}
      onContinue={rq.next}
      continueLabel={rq.last ? t('finish') : t('nextMode')}
    />
  )
}

function ChartBoard({ musicKey, active, progress, onRetry, onContinue, continueLabel }) {
  const { lang, t } = useLang()
  const [reveal, setReveal] = useState(false)
  const answers = modeNotes(musicKey, active)
  const { board, results, score } = useNotesBoard(answers)
  return (
    <DndProvider onDrop={board.handleDrop} disabled={board.submitted}>
      <div className="workspace">
        <div className="panel chart mode-chart">
          <div className="question-top">
            <span className="key-badge">{keyName(musicKey, lang)}</span>
            {progress}
          </div>
          <div className="chart-grid cols-mode">
            <div className="chart-head">{t('headMode')}</div>
            {DEGREES.map((d) => (
              <div className="chart-head center" key={d}>
                {d}
              </div>
            ))}
            {DEGREE_MODES.map((m, mi) =>
              mi === active ? (
                <div className="mode-row is-active" key={m}>
                  <div className="mode-name">
                    {modeName(m, lang)}
                    <span className="your-turn">{t('yourTurn')}</span>
                  </div>
                  <NoteSlots board={board} answers={answers} results={results} reveal={reveal} />
                </div>
              ) : (
                <div className="mode-row" key={m}>
                  <div className="mode-name">{modeName(m, lang)}</div>
                  {modeNotes(musicKey, mi).map((n, i) => (
                    <div className="formula-cell" key={i} style={{ '--chip-color': noteColor(n) }}>
                      {prettyNote(n, lang)}
                    </div>
                  ))}
                </div>
              ),
            )}
          </div>
        </div>
        <div className="banks">
          <NoteBank board={board} />
        </div>
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

/* ───────── Ways 2–4: a single mode (or a single note of it) ───────── */

function OneMode({ musicKey }) {
  const { t } = useLang()
  const rq = useRoundQueue(7)
  const [attempt, setAttempt] = useState(0)
  if (rq.done) return <RoundDone title={t('roundDone')} sub={t('roundDoneModesSub')} onAgain={rq.restart} />
  return (
    <ModeQuestion
      key={`${rq.round}-${rq.pos}-${attempt}`}
      musicKey={musicKey}
      degree={rq.current}
      progress={<ProgressPips count={7} pos={rq.pos} />}
      onRetry={() => setAttempt((a) => a + 1)}
      onContinue={rq.next}
      continueLabel={rq.last ? t('finish') : t('nextMode')}
    />
  )
}

function RandomQuestions({ single }) {
  const { t } = useLang()
  const pick = (prev) => {
    let q
    do q = { key: NATURAL_KEYS[randomInt(7)], degree: randomInt(7), step: single ? randomInt(7) : null }
    while (prev && q.key === prev.key && q.degree === prev.degree && q.step === prev.step)
    return q
  }
  const [q, setQ] = useState(() => pick())
  const [n, setN] = useState(0)
  return (
    <ModeQuestion
      key={n}
      musicKey={q.key}
      degree={q.degree}
      step={q.step}
      onRetry={() => setN((x) => x + 1)}
      onContinue={() => {
        setQ(pick(q))
        setN((x) => x + 1)
      }}
      continueLabel={t('nextQuestion')}
    />
  )
}

/** The notes of one mode — or, when step is set, just the note on that degree. */
function ModeQuestion({ musicKey, degree, step = null, progress, onRetry, onContinue, continueLabel }) {
  const { lang, t } = useLang()
  const [reveal, setReveal] = useState(false)
  const notes = modeNotes(musicKey, degree)
  const answers = step == null ? notes : [notes[step]]
  const { board, results, score } = useNotesBoard(answers)
  const mode = modeName(DEGREE_MODES[degree], lang)
  return (
    <DndProvider onDrop={board.handleDrop} disabled={board.submitted}>
      <div className="workspace">
        <div className="panel single-mode question">
          <div className="question-top">
            <span className="key-badge">{keyName(musicKey, lang)}</span>
            {progress}
          </div>
          <div className="single-mode-name">{mode}</div>
          {step == null ? (
            <>
              <p className="question-prompt">{t('writeNotesOf', { mode, key: keyName(musicKey, lang) })}</p>
              <div className="single-mode-slots">
                <NoteSlots board={board} answers={answers} results={results} reveal={reveal} />
              </div>
            </>
          ) : (
            <>
              <p className="question-prompt">
                {t('whichNoteOnDegree', { degree: step + 1, mode, key: keyName(musicKey, lang) })}
              </p>
              <div className="question-slot">
                <NoteSlots
                  board={board}
                  answers={answers}
                  results={results}
                  reveal={reveal}
                  placeholders={[String(step + 1)]}
                />
              </div>
            </>
          )}
        </div>
        <div className="banks">
          <NoteBank board={board} />
        </div>
      </div>
      <ActionBar
        board={board}
        score={score}
        celebrate={step == null}
        onRetry={onRetry}
        onContinue={onContinue}
        continueLabel={continueLabel}
        reveal={reveal}
        onToggleReveal={() => setReveal((v) => !v)}
      />
    </DndProvider>
  )
}
