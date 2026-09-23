import { useMemo, useState } from 'react'
import { DndProvider } from '../components/dnd.jsx'
import { Bank, Slot, shuffle, useBoard } from '../components/board.jsx'
import { ActionBar, ExerciseShell, Segmented } from '../components/Shell.jsx'
import { COLORS, degreeName, MAJOR_SCALE, modeName } from '../theory.js'
import { useLang } from '../i18n.jsx'

const degreeLabel = (d, lang) => (
  <span className="degree-tile">
    <b>{d.degree}</b>
    <small>{degreeName(d, lang)}</small>
  </span>
)

const INSTRUCTIONS = {
  en: {
    1: (
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
    ),
    2: (
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
    ),
  },
  es: {
    1: (
      <ol>
        <li>
          Cada fila muestra a cuántos <strong>semitonos</strong> está una nota por encima de la tónica de la escala
          mayor (la pequeña tira de teclado ilumina ese semitono).
        </li>
        <li>
          Arrastra el <strong>grado de la escala</strong> correspondiente (del 1 al 7, con el nombre de su intervalo)
          desde el banco morado a la columna <em>Grado de la escala</em>.
        </li>
        <li>
          Arrastra el <strong>modo</strong> que empieza en ese grado desde el banco verde a la columna <em>Modo</em>{' '}
          (p. ej., el modo construido sobre el grado 1 es el Jónico).
        </li>
        <li>Cuando todas las casillas estén llenas, pulsa <strong>Enviar</strong>.</li>
      </ol>
    ),
    2: (
      <ol>
        <li>
          Ahora cada fila muestra un <strong>grado</strong> de la escala mayor. Las filas están desordenadas, así que
          lee cada una con atención.
        </li>
        <li>
          Arrastra el número de <strong>semitonos</strong> a los que ese grado está de la tónica desde el banco cian a
          la columna <em>Semitonos</em>.
        </li>
        <li>
          Arrastra el <strong>modo</strong> que empieza en ese grado desde el banco verde a la columna <em>Modo</em>.
        </li>
        <li>Cuando todas las casillas estén llenas, pulsa <strong>Enviar</strong>.</li>
      </ol>
    ),
  },
}

export default function MajorDegrees({ onBack, meta }) {
  const { lang, t } = useLang()
  const [way, setWay] = useState(1)
  const [round, setRound] = useState(0)
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
            { value: 1, label: t('way1SemisGiven') },
            { value: 2, label: t('way2DegreesGiven') },
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
  const { t } = useLang()
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
            ? { id: `d${d.degree}`, value: d.degree, label: (lang) => degreeLabel(d, lang), group: 'degree', color: COLORS.violet }
            : { id: `s${d.semitones}`, value: d.degree, label: `${d.semitones}`, group: 'semi', color: COLORS.cyan },
        ),
      ),
      ...shuffle(
        MAJOR_SCALE.map((d) => ({
          id: `m${d.mode}`,
          value: d.mode,
          label: (lang) => modeName(d.mode, lang),
          group: 'mode',
          color: COLORS.lime,
        })),
      ),
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
            <div className="chart-head">{way === 1 ? t('headSemis') : t('headDegree')}</div>
            <div className="chart-head">{way === 1 ? t('headDegree') : t('headSemis')}</div>
            <div className="chart-head">{t('headMode')}</div>
            {rows.map((r) => (
              <Row key={r.degree} r={r} way={way} board={board} results={results} reveal={reveal} />
            ))}
          </div>
        </div>
        <div className="banks">
          <Bank board={board} group={askGroup} title={way === 1 ? t('bankDegrees') : t('bankSemis')} />
          <Bank board={board} group="mode" title={t('bankModes')} />
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

function Row({ r, way, board, results, reveal }) {
  const { lang, t } = useLang()
  return (
    <>
      <div className="chart-given">
        {way === 1 ? (
          <div className="semi-given">
            <span className="semi-num">{r.semitones}</span>
            <KeyStrip lit={r.semitones} />
          </div>
        ) : (
          degreeLabel(r, lang)
        )}
      </div>
      <Slot
        board={board}
        id={`ask-${r.degree}`}
        status={results[`ask-${r.degree}`]}
        placeholder={way === 1 ? t('phDegree') : t('phSemis')}
        answer={way === 1 ? `${r.degree} · ${degreeName(r, lang)}` : `${r.semitones}`}
        reveal={reveal}
      />
      <Slot
        board={board}
        id={`mode-${r.degree}`}
        status={results[`mode-${r.degree}`]}
        placeholder={t('phMode')}
        answer={modeName(r.mode, lang)}
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
