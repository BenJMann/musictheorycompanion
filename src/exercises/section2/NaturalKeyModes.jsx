import { Fragment, useMemo, useState } from 'react'
import { DndProvider } from '../../components/dnd.jsx'
import { Bank, Slot, shuffle, useBoard } from '../../components/board.jsx'
import { ActionBar, ExerciseShell, ProgressPips } from '../../components/Shell.jsx'
import { useLang } from '../../i18n.jsx'
import { COLORS, DEGREE_MODES, keyName, majorScale, modeName, NATURAL_KEYS, noteColor, prettyNote } from '../../theory.js'
import {
  chromaticItems,
  KeyCards,
  KeyPicker,
  randomInt,
  RoundDone,
  TallyBadge,
  useKeyedWays,
  useRoundQueue,
  useTally,
  WaysToolbar,
} from './common.jsx'

/*
 * Section 2 · Block 1. Two mirror-image exercises on the modes of a natural key:
 *   dir 'mode' – you're given a note of the key and name the mode that starts on it
 *   dir 'root' – you're given a mode and name the note of the key it starts on
 */

const INSTRUCTIONS = {
  mode: {
    en: {
      intro: (
        <>
          Every note of a major key is the starting point of one of the seven modes: start on degree 1 and you get{' '}
          <strong>Ionian</strong>, on degree 2 <strong>Dorian</strong>, and so on up to <strong>Locrian</strong> on
          degree 7. Here you're given the note and name the mode.
        </>
      ),
      0: <li>First, choose the key you want to practise. Ways 1 and 2 both use it.</li>,
      1: (
        <li>
          The notes of the key are listed on the left, jumbled. Drag the mode that starts on each note from the bank
          into the <em>Mode</em> column, then press <strong>Submit</strong>.
        </li>
      ),
      2: (
        <li>
          One note of the key at a time. Drag the mode that starts on it into the box and press{' '}
          <strong>Submit</strong>. A round goes through all seven notes in a random order; at the end you can pick a
          new key, which starts again at Way 1.
        </li>
      ),
      3: (
        <li>
          A random natural key and a random note of it every time. Drag the mode that starts on that note into the box
          and press <strong>Submit</strong>.
        </li>
      ),
    },
    es: {
      intro: (
        <>
          Cada nota de una tonalidad mayor es el punto de partida de uno de los siete modos: si empiezas en el grado 1
          obtienes el <strong>Jónico</strong>, en el grado 2 el <strong>Dórico</strong>, y así hasta el{' '}
          <strong>Locrio</strong> en el grado 7. Aquí se te da la nota y nombras el modo.
        </>
      ),
      0: <li>Primero, elige la tonalidad que quieres practicar. Las formas 1 y 2 la usan.</li>,
      1: (
        <li>
          Las notas de la tonalidad aparecen a la izquierda, desordenadas. Arrastra el modo que empieza en cada nota
          desde el banco a la columna <em>Modo</em> y pulsa <strong>Enviar</strong>.
        </li>
      ),
      2: (
        <li>
          Una nota de la tonalidad cada vez. Arrastra el modo que empieza en ella a la casilla y pulsa{' '}
          <strong>Enviar</strong>. Cada ronda recorre las siete notas en orden aleatorio; al final puedes elegir otra
          tonalidad, que empieza de nuevo en la forma 1.
        </li>
      ),
      3: (
        <li>
          Cada vez, una tonalidad natural al azar y una nota suya al azar. Arrastra el modo que empieza en esa nota a
          la casilla y pulsa <strong>Enviar</strong>.
        </li>
      ),
    },
  },
  root: {
    en: {
      intro: (
        <>
          The opposite of the previous exercise: you're given a <strong>mode</strong> of the key and name its{' '}
          <strong>root</strong> — the note of the key it starts on. Ionian starts on degree 1, Dorian on degree 2 … and
          Locrian on degree 7.
        </>
      ),
      0: <li>First, choose the key you want to practise. Ways 1 and 2 both use it.</li>,
      1: (
        <li>
          The seven modes are listed on the left, jumbled. Drag the note each one starts on from the bank into the{' '}
          <em>Root</em> column, then press <strong>Submit</strong>.
        </li>
      ),
      2: (
        <li>
          One mode at a time. Drag its root note into the box and press <strong>Submit</strong>. A round goes through
          all seven modes in a random order; at the end you can pick a new key, which starts again at Way 1.
        </li>
      ),
      3: (
        <li>
          A random natural key and a random mode every time. Drag the note of that key the mode starts on into the box
          and press <strong>Submit</strong>.
        </li>
      ),
      4: (
        <li>
          Like Way 3, but the bank is the whole chromatic scale, with both the sharp and the flat name of each black
          note. Pick the note with the spelling the key actually uses, then press <strong>Submit</strong>.
        </li>
      ),
    },
    es: {
      intro: (
        <>
          Lo contrario del ejercicio anterior: se te da un <strong>modo</strong> de la tonalidad y nombras su{' '}
          <strong>tónica</strong>, la nota de la tonalidad en la que empieza. El Jónico empieza en el grado 1, el
          Dórico en el grado 2 … y el Locrio en el grado 7.
        </>
      ),
      0: <li>Primero, elige la tonalidad que quieres practicar. Las formas 1 y 2 la usan.</li>,
      1: (
        <li>
          Los siete modos aparecen a la izquierda, desordenados. Arrastra la nota en la que empieza cada uno desde el
          banco a la columna <em>Tónica</em> y pulsa <strong>Enviar</strong>.
        </li>
      ),
      2: (
        <li>
          Un modo cada vez. Arrastra su tónica a la casilla y pulsa <strong>Enviar</strong>. Cada ronda recorre los
          siete modos en orden aleatorio; al final puedes elegir otra tonalidad, que empieza de nuevo en la forma 1.
        </li>
      ),
      3: (
        <li>
          Cada vez, una tonalidad natural al azar y un modo al azar. Arrastra la nota de esa tonalidad en la que
          empieza el modo a la casilla y pulsa <strong>Enviar</strong>.
        </li>
      ),
      4: (
        <li>
          Como la forma 3, pero el banco es la escala cromática entera, con el nombre en sostenido y en bemol de cada
          tecla negra. Elige la nota con la grafía que usa de verdad la tonalidad y pulsa <strong>Enviar</strong>.
        </li>
      ),
    },
  },
}

export const ModesOfKeys = (props) => <NaturalKeyExercise dir="mode" {...props} />
export const RootsOfModes = (props) => <NaturalKeyExercise dir="root" {...props} />

function NaturalKeyExercise({ dir, onBack, meta }) {
  const { lang, t } = useLang()
  const kw = useKeyedWays([3, 4])
  const text = INSTRUCTIONS[dir][lang]
  const ways = [
    { value: 1, label: t('way1WholeKey') },
    { value: 2, label: t('way2OneAtATime') },
    { value: 3, label: t('way3RandomKey') },
    ...(dir === 'root' ? [{ value: 4, label: t('way4Chromatic') }] : []),
  ]
  return (
    <ExerciseShell
      {...meta}
      onBack={onBack}
      instructions={
        <>
          <p className="instructions-intro">{text.intro}</p>
          <ol>{kw.key ? text[kw.way] : text[0]}</ol>
        </>
      }
      toolbar={<WaysToolbar kw={kw} ways={ways} />}
    >
      {!kw.key ? (
        <KeyPicker onChoose={kw.setKey} />
      ) : kw.way === 1 ? (
        <WholeKey key={`${kw.key}-${kw.round}`} dir={dir} musicKey={kw.key} onRetry={kw.bump} onContinue={() => kw.setWay(2)} />
      ) : kw.way === 2 ? (
        <OneAtATime
          key={`${kw.key}-${kw.round}`}
          dir={dir}
          musicKey={kw.key}
          onNewKey={(k) => kw.start(k, 1)}
        />
      ) : (
        <RandomKey key={kw.round} dir={dir} chromatic={kw.way === 4} />
      )}
    </ExerciseShell>
  )
}

// What each degree of a key asks for, and the answer.
const givenOf = (dir, key, k) => (dir === 'mode' ? majorScale(key)[k] : DEGREE_MODES[k])
const answerOf = (dir, key, k) => (dir === 'mode' ? DEGREE_MODES[k] : majorScale(key)[k])
const labelOf = (dir, value, lang) => (dir === 'mode' ? modeName(value, lang) : prettyNote(value, lang))

/** The seven answer tiles: the mode names, or the notes of the key. */
function answerTiles(dir, key) {
  return shuffle(
    dir === 'mode'
      ? DEGREE_MODES.map((m) => ({ id: `m${m}`, value: m, label: (lang) => modeName(m, lang), group: 'ans', color: COLORS.lime }))
      : majorScale(key).map((n) => ({ id: `n${n}`, value: n, label: (lang) => prettyNote(n, lang), group: 'ans', color: noteColor(n) })),
  )
}

function Given({ dir, value }) {
  const { lang } = useLang()
  return dir === 'mode' ? (
    <span className="given-note">{prettyNote(value, lang)}</span>
  ) : (
    <span className="given-mode">{modeName(value, lang)}</span>
  )
}

/* ───────── Way 1: the whole key as a chart ───────── */

function WholeKey({ dir, musicKey, onRetry, onContinue }) {
  const { lang, t } = useLang()
  const [reveal, setReveal] = useState(false)
  const slots = useMemo(() => DEGREE_MODES.map((_, k) => ({ id: `a${k}` })), [])
  // Rows in a random order (and without degree numbers), so the answers can't be read off top to bottom.
  const order = useMemo(() => shuffle(slots.map((_, k) => k)), [slots])
  const items = useMemo(() => answerTiles(dir, musicKey), [dir, musicKey])
  const board = useBoard(slots, items)
  const results = board.submitted
    ? Object.fromEntries(slots.map((s, k) => [s.id, board.valueAt(s.id) === answerOf(dir, musicKey, k)]))
    : {}
  const correct = Object.values(results).filter(Boolean).length
  const heads = [t('headRootNote'), t('headMode')]
  if (dir === 'root') heads.reverse()

  return (
    <DndProvider onDrop={board.handleDrop} disabled={board.submitted}>
      <div className="workspace">
        <div className="panel chart">
          <div className="panel-label">{t('keyOf', { key: keyName(musicKey, lang) })}</div>
          <div className="chart-grid cols-2">
            <div className="chart-head">{heads[0]}</div>
            <div className="chart-head">{heads[1]}</div>
            {order.map((k) => (
              <Fragment key={k}>
                <div className="chart-given">
                  <Given dir={dir} value={givenOf(dir, musicKey, k)} />
                </div>
                <Slot
                  board={board}
                  id={slots[k].id}
                  status={results[slots[k].id]}
                  placeholder={dir === 'mode' ? t('phMode') : t('phRoot')}
                  answer={labelOf(dir, answerOf(dir, musicKey, k), lang)}
                  reveal={reveal}
                />
              </Fragment>
            ))}
          </div>
        </div>
        <div className="banks">
          <Bank board={board} title={dir === 'mode' ? t('bankModes') : t('bankNotesOfKey')} />
        </div>
      </div>
      <ActionBar
        board={board}
        score={{ correct, total: slots.length }}
        onRetry={onRetry}
        onContinue={onContinue}
        continueLabel={t('continueWay2')}
        reveal={reveal}
        onToggleReveal={() => setReveal((v) => !v)}
      />
    </DndProvider>
  )
}

/* ───────── Ways 2 and 3: one question at a time ───────── */

function OneAtATime({ dir, musicKey, onNewKey }) {
  const { t } = useLang()
  const rq = useRoundQueue(7)
  const tally = useTally()
  const [attempt, setAttempt] = useState(0)
  if (rq.done)
    return (
      <RoundDone
        title={t('roundDone')}
        sub={dir === 'mode' ? t('roundDoneNotesSub') : t('roundDoneModesSub')}
        tally={tally}
        onAgain={() => {
          tally.reset()
          rq.restart()
        }}
      >
        <div className="finished-next">
          <div className="panel-label">{t('orNewKey')}</div>
          <KeyCards onChoose={onNewKey} current={musicKey} />
        </div>
      </RoundDone>
    )
  return (
    <Question
      key={`${rq.round}-${rq.pos}-${attempt}`}
      dir={dir}
      musicKey={musicKey}
      degree={rq.current}
      progress={<ProgressPips count={7} pos={rq.pos} />}
      tally={tally}
      questionId={`${rq.round}-${rq.pos}`}
      onRetry={() => setAttempt((a) => a + 1)}
      onContinue={rq.next}
      continueLabel={rq.last ? t('finish') : t('nextQuestion')}
    />
  )
}

function RandomKey({ dir, chromatic }) {
  const { t } = useLang()
  const pick = (prev) => {
    let q
    do q = { key: NATURAL_KEYS[randomInt(7)], degree: randomInt(7) }
    while (prev && q.key === prev.key && q.degree === prev.degree)
    return q
  }
  const [q, setQ] = useState(() => pick())
  const [n, setN] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const tally = useTally()
  return (
    <Question
      key={`${n}-${attempt}`}
      dir={dir}
      musicKey={q.key}
      degree={q.degree}
      chromatic={chromatic}
      tally={tally}
      questionId={n}
      onRetry={() => setAttempt((a) => a + 1)}
      onContinue={() => {
        setQ(pick(q))
        setN((x) => x + 1)
        setAttempt(0)
      }}
      continueLabel={t('nextQuestion')}
    />
  )
}

function Question({ dir, musicKey, degree, chromatic, progress, tally, questionId, onRetry, onContinue, continueLabel }) {
  const { lang, t } = useLang()
  const [reveal, setReveal] = useState(false)
  const slots = useMemo(() => [{ id: 'ans' }], [])
  // Way 4 offers the whole chromatic scale in order; otherwise the jumbled answers for this key.
  const items = useMemo(() => (chromatic ? chromaticItems : answerTiles(dir, musicKey)), [chromatic, dir, musicKey])
  const board = useBoard(slots, items)
  const answer = answerOf(dir, musicKey, degree)
  const given = givenOf(dir, musicKey, degree)
  const status = board.submitted ? board.valueAt('ans') === answer : undefined
  const prompt =
    dir === 'mode'
      ? t('whichModeStartsOn', { note: prettyNote(given, lang) })
      : t('whichNoteIsRootOf', { mode: modeName(given, lang) })

  return (
    <DndProvider onDrop={board.handleDrop} disabled={board.submitted}>
      <div className="workspace">
        <div className="panel single-mode question">
          <div className="question-top">
            <span className="key-badge">{keyName(musicKey, lang)}</span>
            {progress}
            <TallyBadge tally={tally} />
          </div>
          <div className="single-mode-name">
            {dir === 'mode' ? prettyNote(given, lang) : modeName(given, lang)}
          </div>
          <p className="question-prompt">{prompt}</p>
          <div className="question-slot">
            <Slot
              board={board}
              id="ans"
              status={status}
              placeholder={dir === 'mode' ? t('phMode') : t('phRoot')}
              answer={labelOf(dir, answer, lang)}
              reveal={reveal}
            />
          </div>
        </div>
        <div className="banks">
          <Bank board={board} title={chromatic ? t('bankChromatic') : dir === 'mode' ? t('bankModes') : t('bankNotesOfKey')} />
        </div>
      </div>
      <ActionBar
        board={board}
        score={{ correct: status ? 1 : 0, total: 1 }}
        celebrate={false}
        onResult={(ok) => tally.record(questionId, ok)}
        onRetry={onRetry}
        onContinue={onContinue}
        continueLabel={continueLabel}
        reveal={reveal}
        onToggleReveal={() => setReveal((v) => !v)}
      />
    </DndProvider>
  )
}
