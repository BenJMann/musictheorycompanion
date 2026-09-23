import { useMemo, useState } from 'react'
import { DndProvider } from '../components/dnd.jsx'
import { Bank, Slot, shuffle, useBoard } from '../components/board.jsx'
import { ActionBar, ExerciseShell, Segmented } from '../components/Shell.jsx'
import { KeyStrip } from './MajorDegrees.jsx'
import { CHROMATIC_INTERVALS, COLORS, INTERVAL_NUMBERS, intervalName, numberName, QUALITIES, qualityName } from '../theory.js'
import { useLang } from '../i18n.jsx'

const QUALITY_COLORS = {
  Perfect: COLORS.lime,
  Major: COLORS.cyan,
  Minor: COLORS.magenta,
  Augmented: COLORS.amber,
  Diminished: COLORS.coral,
}

const INSTRUCTIONS = {
  en: {
    1: (
      <ol>
        <li>
          Each row shows a distance in <strong>semitones</strong> above the root, from 0 up to a full octave (12).
        </li>
        <li>
          Name each interval using <strong>two tiles</strong>: drag a <strong>quality</strong> (Perfect, Major, Minor,
          Augmented or Diminished) into the <em>Quality</em> column, and an <strong>interval number</strong> (Unison,
          2nd … 7th, Octave) into the <em>Interval</em> column. Example: 3 semitones = <em>Minor</em> + <em>3rd</em>.
        </li>
        <li>These tiles never run out — you can use the same one as many times as you need.</li>
        <li>
          6 semitones (the tritone) has two correct spellings: <em>Augmented 4th</em> or <em>Diminished 5th</em>.
          Either is accepted.
        </li>
        <li>When every box is full, press <strong>Submit</strong>.</li>
      </ol>
    ),
    2: (
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
    ),
  },
  es: {
    1: (
      <ol>
        <li>
          Cada fila muestra una distancia en <strong>semitonos</strong> por encima de la tónica, desde 0 hasta una
          octava completa (12).
        </li>
        <li>
          Nombra cada intervalo con <strong>dos fichas</strong>: arrastra una <strong>cualidad</strong> (Justa, Mayor,
          Menor, Aumentada o Disminuida) a la columna <em>Cualidad</em>, y un <strong>número de intervalo</strong>{' '}
          (Unísono, 2ª … 7ª, Octava) a la columna <em>Intervalo</em>. Ejemplo: 3 semitonos = <em>Menor</em> +{' '}
          <em>3ª</em>.
        </li>
        <li>Estas fichas nunca se agotan: puedes usar la misma tantas veces como necesites.</li>
        <li>
          6 semitonos (el tritono) tiene dos nombres correctos: <em>4ª aumentada</em> o <em>5ª disminuida</em>. Se
          acepta cualquiera de los dos.
        </li>
        <li>Cuando todas las casillas estén llenas, pulsa <strong>Enviar</strong>.</li>
      </ol>
    ),
    2: (
      <ol>
        <li>
          Ahora cada fila muestra el <strong>nombre de un intervalo</strong>. Las filas están desordenadas.
        </li>
        <li>
          Arrastra el número de <strong>semitonos</strong> que abarca ese intervalo desde el banco a la columna{' '}
          <em>Semitonos</em>. Cada número se usa exactamente una vez.
        </li>
        <li>Cuando todas las casillas estén llenas, pulsa <strong>Enviar</strong>.</li>
      </ol>
    ),
  },
}

export default function ChromaticIntervals({ onBack, meta }) {
  const [way, setWay] = useState(1)
  const [round, setRound] = useState(0)
  const switchWay = (w) => {
    setWay(w)
    setRound((r) => r + 1)
  }

  const { lang, t } = useLang()
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
            { value: 1, label: t('way1SemisGiven') },
            { value: 2, label: t('way2IntervalsGiven') },
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
  const { t } = useLang()
  const [reveal, setReveal] = useState(false)
  const rows = CHROMATIC_INTERVALS
  const slots = useMemo(
    () => rows.flatMap((r) => [{ id: `q${r.semitones}`, accepts: 'quality' }, { id: `n${r.semitones}`, accepts: 'number' }]),
    [rows],
  )
  const items = useMemo(
    () => [
      ...QUALITIES.map((q) => ({ id: q, value: q, label: (lang) => qualityName(q, lang), group: 'quality', color: QUALITY_COLORS[q], reusable: true })),
      ...INTERVAL_NUMBERS.map((n) => ({ id: n, value: n, label: (lang) => numberName(n, lang), group: 'number', color: COLORS.violet, reusable: true })),
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
            <div className="chart-head">{t('headSemis')}</div>
            <div className="chart-head">{t('headQuality')}</div>
            <div className="chart-head">{t('headInterval')}</div>
            {rows.map((r) => (
              <Row3 key={r.semitones} r={r} board={board} results={results} reveal={reveal} />
            ))}
          </div>
        </div>
        <div className="banks">
          <Bank board={board} group="quality" title={t('bankQualities')} />
          <Bank board={board} group="number" title={t('bankNumbers')} />
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

function Row3({ r, board, results, reveal }) {
  const { lang, t } = useLang()
  const answerQ = r.answers.map((a) => qualityName(a[0], lang)).join(' / ')
  const answerN = r.answers.map((a) => numberName(a[1], lang)).join(' / ')
  return (
    <>
      <div className="chart-given">
        <div className="semi-given">
          <span className="semi-num">{r.semitones}</span>
          <KeyStrip lit={r.semitones} />
        </div>
      </div>
      <Slot board={board} id={`q${r.semitones}`} status={results[`q${r.semitones}`]} placeholder={t('phQuality')} answer={answerQ} reveal={reveal} />
      <Slot board={board} id={`n${r.semitones}`} status={results[`n${r.semitones}`]} placeholder={t('phInterval')} answer={answerN} reveal={reveal} />
    </>
  )
}

function SemitoneBoard({ onRetry, onContinue }) {
  const { t } = useLang()
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
            <div className="chart-head">{t('headInterval')}</div>
            <div className="chart-head">{t('headSemis')}</div>
            {rows.map((r) => (
              <IntervalRow key={r.semitones} r={r} board={board} results={results} reveal={reveal} />
            ))}
          </div>
        </div>
        <div className="banks">
          <Bank board={board} group="semi" title={t('bankSemis')} />
        </div>
      </div>
      <ActionBar
        board={board}
        score={{ correct, total: slots.length }}
        onRetry={onRetry}
        onContinue={onContinue}
        continueLabel={t('continueWay1')}
        reveal={reveal}
        onToggleReveal={() => setReveal((v) => !v)}
      />
    </DndProvider>
  )
}

function IntervalRow({ r, board, results, reveal }) {
  const { lang, t } = useLang()
  return (
    <>
      <div className="chart-given interval-name">
        {r.answers.map(([q, n], i) => (
          <span key={i}>
            {i > 0 && <span className="muted"> / </span>}
            <span style={{ color: QUALITY_COLORS[q] }}>{intervalName(q, n, lang)}</span>
          </span>
        ))}
      </div>
      <Slot
        board={board}
        id={`s${r.semitones}`}
        status={results[`s${r.semitones}`]}
        placeholder={t('phSemis')}
        answer={`${r.semitones}`}
        reveal={reveal}
      />
    </>
  )
}
