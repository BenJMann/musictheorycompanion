import { useMemo, useState } from 'react'
import { DndProvider } from '../components/dnd.jsx'
import { Bank, Slot, shuffle, useBoard } from '../components/board.jsx'
import { ActionBar, ExerciseShell, Segmented } from '../components/Shell.jsx'
import { CircleCenter, CircleLayout } from '../components/Circle.jsx'
import { useLang } from '../i18n.jsx'
import { CIRCLE_NOTES, CIRCLE_ORDER, circleNoteLabel, INTERVAL_LABELS, intervalColor } from '../theory.js'

const INSTRUCTIONS = {
  en: {
    1: (
      <ol>
        <li>
          The 12 interval names on the left are jumbled up. Put them in their correct places around the{' '}
          <strong>circle of fifths</strong>.
        </li>
        <li>
          The box at the very top (12 o'clock, marked <strong>START</strong>) is where <strong>1</strong> goes. From
          there, go <strong>clockwise</strong>: each step moves up a perfect fifth (7 semitones).
        </li>
        <li>
          Hint: the plain intervals (no ♭ or ♯) all sit next to each other on one side of the circle; the altered ones
          (♭ and ♭5/♯4) fill the other side.
        </li>
        <li>When all 12 boxes are full, press <strong>Submit</strong>.</li>
      </ol>
    ),
    2: (
      <ol>
        <li>
          This time the circle is built from <strong>note names</strong>. The 12 notes on the left are jumbled up: put
          them in their correct places around the <strong>circle of fifths</strong>.
        </li>
        <li>
          <strong>C</strong> goes in the box at the very top (12 o'clock, marked <strong>START</strong>). From there,
          go <strong>clockwise</strong>: each step moves up a perfect fifth (7 semitones), so the note after C is G.
        </li>
        <li>
          Hint: this is the same circle as Way 1 with C as the 1. The natural notes all sit together on one side; the
          flats and F♯/G♭ fill the other side.
        </li>
        <li>When all 12 boxes are full, press <strong>Submit</strong>.</li>
      </ol>
    ),
  },
  es: {
    1: (
      <ol>
        <li>
          Los 12 intervalos de la izquierda están desordenados. Colócalos en su sitio correcto alrededor del{' '}
          <strong>círculo de quintas</strong>.
        </li>
        <li>
          La casilla de arriba del todo (las 12 en punto, marcada como <strong>INICIO</strong>) es donde va el{' '}
          <strong>1</strong>. Desde ahí, avanza en <strong>sentido horario</strong>: cada paso sube una quinta justa (7
          semitonos).
        </li>
        <li>
          Pista: los intervalos naturales (sin ♭ ni ♯) están todos juntos en un lado del círculo; los alterados (♭ y
          ♭5/♯4) ocupan el otro lado.
        </li>
        <li>Cuando las 12 casillas estén llenas, pulsa <strong>Enviar</strong>.</li>
      </ol>
    ),
    2: (
      <ol>
        <li>
          Esta vez el círculo se construye con <strong>nombres de notas</strong>. Las 12 notas de la izquierda están
          desordenadas: colócalas en su sitio correcto alrededor del <strong>círculo de quintas</strong>.
        </li>
        <li>
          El <strong>Do</strong> va en la casilla de arriba del todo (las 12 en punto, marcada como{' '}
          <strong>INICIO</strong>). Desde ahí, avanza en <strong>sentido horario</strong>: cada paso sube una quinta
          justa (7 semitonos), así que la nota que sigue a Do es Sol.
        </li>
        <li>
          Pista: es el mismo círculo que en la forma 1, con Do como el 1. Las notas naturales están todas juntas en un
          lado; los bemoles y Fa♯/Sol♭ ocupan el otro lado.
        </li>
        <li>Cuando las 12 casillas estén llenas, pulsa <strong>Enviar</strong>.</li>
      </ol>
    ),
  },
}

// Way 1 uses intervals, Way 2 note names. Each note takes the colour of its interval from C.
const WAYS = {
  1: {
    order: CIRCLE_ORDER,
    label: (v) => INTERVAL_LABELS[v],
    answer: (v) => INTERVAL_LABELS[v],
    color: (v) => intervalColor(v),
    bankTitle: 'jumbled',
  },
  2: {
    order: CIRCLE_NOTES,
    // The two-name F♯/G♭ tile uses smaller text to fit its round box.
    label: (v) => (lang) =>
      v === 'F#' ? <span className="chip-long">{circleNoteLabel(v, lang)}</span> : circleNoteLabel(v, lang),
    answer: (v, lang) => circleNoteLabel(v, lang),
    color: (v) => intervalColor(CIRCLE_ORDER[CIRCLE_NOTES.indexOf(v)]),
    bankTitle: 'jumbledNotes',
  },
}

export default function CircleOrder({ onBack, meta }) {
  const [way, setWay] = useState(1)
  const [round, setRound] = useState(0)
  const { lang, t } = useLang()
  const switchWay = (w) => {
    setWay(w)
    setRound((r) => r + 1)
  }
  return (
    <ExerciseShell
      {...meta}
      onBack={onBack}
      instructions={INSTRUCTIONS[lang][way]}
      toolbar={
        <Segmented
          value={way}
          onChange={switchWay}
          options={[
            { value: 1, label: t('way1Intervals') },
            { value: 2, label: t('way2NoteNames') },
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
  const { lang, t } = useLang()
  const [reveal, setReveal] = useState(false)
  const { order, label, answer, color, bankTitle } = WAYS[way]
  const slots = useMemo(() => order.map((_, i) => ({ id: `pos${i}` })), [order])
  const items = useMemo(
    () => shuffle(order).map((v) => ({ id: `i${v}`, value: v, label: label(v), group: 'circle', color: color(v) })),
    [order], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const board = useBoard(slots, items)
  const results = board.submitted
    ? Object.fromEntries(order.map((v, i) => [`pos${i}`, board.valueAt(`pos${i}`) === v]))
    : {}
  const correct = Object.values(results).filter(Boolean).length

  return (
    <DndProvider onDrop={board.handleDrop} disabled={board.submitted}>
      <div className="workspace circle-workspace">
        <Bank board={board} title={t(bankTitle)} className="circle-bank" />
        <div className="panel circle-panel">
          <div className="panel-label">{t('circleOfFifths')}</div>
          <CircleLayout
            className="circle-slots"
            renderNode={(i) => (
              <Slot
                board={board}
                id={`pos${i}`}
                status={results[`pos${i}`]}
                placeholder={i === 0 ? t('phTop') : ''}
                answer={answer(order[i], lang)}
                reveal={reveal}
                className="slot-round"
              />
            )}
            center={<CircleCenter />}
          />
        </div>
      </div>
      <ActionBar
        board={board}
        score={{ correct, total: slots.length }}
        onRetry={onRetry}
        onContinue={onContinue}
        continueLabel={way === 1 ? t('continueWay2') : t('continueWay1')}
        reveal={reveal}
        onToggleReveal={() => setReveal((v) => !v)}
      />
    </DndProvider>
  )
}
