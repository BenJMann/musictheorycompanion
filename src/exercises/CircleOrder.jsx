import { useMemo, useState } from 'react'
import { DndProvider } from '../components/dnd.jsx'
import { Bank, Slot, shuffle, useBoard } from '../components/board.jsx'
import { ActionBar, ExerciseShell } from '../components/Shell.jsx'
import { CircleCenter, CircleLayout } from '../components/Circle.jsx'
import { useLang } from '../i18n.jsx'
import { CIRCLE_ORDER, INTERVAL_LABELS, intervalColor } from '../theory.js'

const INSTRUCTIONS = {
  en: (
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
  es: (
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
}

export default function CircleOrder({ onBack, meta }) {
  const [round, setRound] = useState(0)
  const { lang } = useLang()
  return (
    <ExerciseShell {...meta} onBack={onBack} instructions={INSTRUCTIONS[lang]}>
      <Board key={round} onRetry={() => setRound((r) => r + 1)} />
    </ExerciseShell>
  )
}

function Board({ onRetry }) {
  const { t } = useLang()
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
        <Bank board={board} title={t('jumbled')} className="circle-bank" />
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
                answer={INTERVAL_LABELS[CIRCLE_ORDER[i]]}
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
        onContinue={onRetry}
        continueLabel={t('newJumble')}
        reveal={reveal}
        onToggleReveal={() => setReveal((v) => !v)}
      />
    </DndProvider>
  )
}
