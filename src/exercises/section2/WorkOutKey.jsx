import { useEffect, useRef, useState } from 'react'
import { ExerciseShell } from '../../components/Shell.jsx'
import Celebration from '../../components/Celebration.jsx'
import { useLang } from '../../i18n.jsx'
import {
  DEGREE_MODES,
  INTERVAL_LABELS,
  intervalColor,
  intervalLabelAt,
  keyName,
  majorScale,
  modeFormula,
  modeName,
  NATURAL_KEYS,
  noteColor,
  prettyNote,
  naturalsFrom,
} from '../../theory.js'
import { AccidentalGrid, KeyPicker, useKeyedWays, WaysToolbar } from './common.jsx'

/*
 * Section 2 · Block 2. How to work out the notes of a natural major key:
 * the natural keys starting on the root make a mode of C major; that mode's formula shows
 * exactly which notes to sharpen (or flatten) to turn it into the major scale.
 *   Way 1 – preparation questions first, then work out the key
 *   Way 2 – straight to working out the key
 */

const DEGREES = ['1', '2', '3', '4', '5', '6', '7']
const KEYPAD = ['1', 'b2', '2', 'b3', '3', '4', 'tt', '5', 'b6', '6', 'b7', '7']
// How a degree of a mode's formula has to move to become the major (Ionian) degree.
const changeOf = (v) => (v.startsWith('b') ? 'up' : v === 'tt' ? 'down' : 'same')

const INSTRUCTIONS = {
  en: {
    intro: (
      <>
        This is a trick for working out the notes of any <strong>natural major key</strong> (C, D, E, F, G, A or B
        major) from things you already know: the natural keys and the mode formulas.
      </>
    ),
    0: <li>First, choose a key. Both ways use it.</li>,
    1: (
      <>
        <li>
          First come three <strong>preparation questions</strong>; press <strong>Check answers</strong> and get them
          all right to move on.
        </li>
        <li>
          Then, in <strong>Work out the key</strong>, read how the trick works and use your answers to turn the
          natural-key notes into the major scale. <strong>Display answer</strong> animates the whole process for you.
        </li>
      </>
    ),
    2: (
      <li>
        No preparation: go straight to the last question and give each note a ♭, ♮ or ♯ to spell the major scale.{' '}
        <strong>Display answer</strong> animates the whole process for you.
      </li>
    ),
  },
  es: {
    intro: (
      <>
        Este es un truco para sacar las notas de cualquier <strong>tonalidad mayor natural</strong> (Do, Re, Mi, Fa,
        Sol, La o Si mayor) a partir de cosas que ya sabes: las notas naturales y las fórmulas de los modos.
      </>
    ),
    0: <li>Primero, elige una tonalidad. Las dos formas la usan.</li>,
    1: (
      <>
        <li>
          Primero hay tres <strong>preguntas de preparación</strong>; pulsa <strong>Comprobar respuestas</strong> y
          acierta todas para continuar.
        </li>
        <li>
          Después, en <strong>Saca la tonalidad</strong>, lee cómo funciona el truco y usa tus respuestas para
          convertir las notas naturales en la escala mayor. <strong>Mostrar respuesta</strong> anima todo el proceso.
        </li>
      </>
    ),
    2: (
      <li>
        Sin preparación: ve directamente a la última pregunta y dale a cada nota un ♭, ♮ o ♯ para escribir la escala
        mayor. <strong>Mostrar respuesta</strong> anima todo el proceso.
      </li>
    ),
  },
}

export default function WorkOutKey({ onBack, meta }) {
  const { lang, t } = useLang()
  const kw = useKeyedWays()
  const text = INSTRUCTIONS[lang]
  const ways = [
    { value: 1, label: t('way1WithPrep') },
    { value: 2, label: t('way2StraightToKey') },
  ]
  return (
    <ExerciseShell
      {...meta}
      onBack={onBack}
      tip={false}
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
        <WithPrep key={`${kw.key}-${kw.round}`} musicKey={kw.key} onAnother={() => kw.setKey(null)} />
      ) : (
        <WorkOut key={`${kw.key}-${kw.round}`} musicKey={kw.key} onAnother={() => kw.setKey(null)} />
      )}
    </ExerciseShell>
  )
}

/** Way 1: the preparation questions, then work out the key with the answers alongside. */
function WithPrep({ musicKey, onAnother }) {
  const { t } = useLang()
  const [stage, setStage] = useState('prep')
  return (
    <>
      <div className="stepper">
        <span className={`stepper-step ${stage === 'prep' ? 'is-active' : 'is-done'}`}>
          <b>1</b> {t('prepQuestions')}
        </span>
        <span className="stepper-line" />
        <span className={`stepper-step ${stage === 'work' ? 'is-active' : ''}`}>
          <b>2</b> {t('workOutTheKey')}
        </span>
      </div>
      {stage === 'prep' ? (
        <Prep musicKey={musicKey} onDone={() => setStage('work')} />
      ) : (
        <WorkOut musicKey={musicKey} showPrep onAnother={onAnother} />
      )}
    </>
  )
}

/* ───────── Preparation questions ───────── */

function Prep({ musicKey, onDone }) {
  const { lang, t } = useLang()
  const [offset, setOffset] = useState(0)
  const [mode, setMode] = useState(null)
  const [formula, setFormula] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [reveal, setReveal] = useState(false)
  const [celebrate, setCelebrate] = useState(null)

  const degree = NATURAL_KEYS.indexOf(musicKey)
  const rightMode = DEGREE_MODES[degree]
  const root = prettyNote(musicKey, lang)
  const q1 = offset === degree
  const q2 = mode === rightMode
  const target = mode ? modeFormula(mode) : []
  const boxRight = (i) => formula[i] === target[i]
  const q3 = formula.length === 7 && formula.every((_, i) => boxRight(i))
  const allRight = q1 && q2 && q3
  const ready = mode && formula.length === 7

  const check = () => {
    setSubmitted(true)
    setReveal(false)
    const n = [q1, q2, q3].filter(Boolean).length
    setCelebrate(n === 3 ? 'perfect' : n === 0 ? 'allwrong' : null)
  }
  const edit = (fn) => (...args) => !submitted && fn(...args)

  return (
    <>
      <section className="panel prep-q">
        <QuestionHead n={1} status={submitted ? q1 : undefined}>
          {t('q1', { root })}
        </QuestionHead>
        <p className="prep-hint">{t('q1Hint', { root })}</p>
        <Carousel offset={offset} onChange={edit(setOffset)} locked={submitted} />
        {submitted && !q1 && reveal && (
          <p className="prep-answer">
            → {naturalsFrom(musicKey).map((n) => prettyNote(n, lang)).join(' ')}
          </p>
        )}
      </section>

      <section className="panel prep-q">
        <QuestionHead n={2} status={submitted ? q2 : undefined}>
          {t('q2', { root })}
        </QuestionHead>
        <div className="choice-grid">
          {DEGREE_MODES.map((m) => (
            <button
              key={m}
              className={`choice ${mode === m ? 'is-selected' : ''} ${
                submitted && mode === m ? (q2 ? 'is-right' : 'is-wrong') : ''
              } ${submitted && reveal && !q2 && m === rightMode ? 'is-answer' : ''}`}
              onClick={edit(() => setMode(m))}
              disabled={submitted}
            >
              {modeName(m, lang)}
            </button>
          ))}
        </div>
      </section>

      {mode && (
        <section className="panel prep-q">
          <QuestionHead n={3} status={submitted ? q3 : undefined}>
            {t('q3', { mode: modeName(mode, lang) })}
          </QuestionHead>
          <p className="prep-hint">{t('q3Hint')}</p>
          <div className="formula-boxes">
            {DEGREES.map((d, i) => {
              const v = formula[i]
              const status = submitted ? boxRight(i) : undefined
              return (
                <div
                  key={d}
                  className={`formula-box ${v ? 'is-filled' : ''} ${i === formula.length && !submitted ? 'is-next' : ''} ${
                    status === true ? 'is-right' : status === false ? 'is-wrong' : ''
                  }`}
                  style={v ? { '--chip-color': intervalColor(v) } : undefined}
                >
                  {v ? intervalLabelAt(v, i) : <span className="slot-placeholder">{d}</span>}
                  {status === true && <span className="mark mark-right">✓</span>}
                  {status === false && <span className="mark mark-wrong">✕</span>}
                  {status === false && reveal && <span className="slot-answer">{intervalLabelAt(target[i], i)}</span>}
                </div>
              )
            })}
          </div>
          <div className="keypad">
            {KEYPAD.map((v) => (
              <button
                key={v}
                className="keypad-btn"
                style={{ '--chip-color': intervalColor(v) }}
                disabled={submitted || formula.length >= 7}
                onClick={() => setFormula((f) => [...f, v])}
              >
                {INTERVAL_LABELS[v]}
              </button>
            ))}
            <button className="keypad-btn keypad-tool" disabled={submitted || !formula.length} onClick={() => setFormula((f) => f.slice(0, -1))}>
              ⌫
            </button>
            <button className="keypad-btn keypad-tool" disabled={submitted || !formula.length} onClick={() => setFormula([])}>
              {t('clear')}
            </button>
          </div>
        </section>
      )}

      <div className={`action-bar panel ${submitted ? 'is-result' : ''}`}>
        {!submitted ? (
          <>
            <span className="action-hint">{ready ? t('ready') : t('answerAllThree')}</span>
            <button className="btn btn-primary" disabled={!ready} onClick={check}>
              {t('checkAnswers')}
            </button>
          </>
        ) : allRight ? (
          <>
            <span className="action-hint action-hint-good">{t('prepAllRight')}</span>
            <button className="btn btn-primary" onClick={onDone}>
              {t('workOutTheKey')} →
            </button>
          </>
        ) : (
          <>
            <span className="action-hint">{t('prepNotYet')}</span>
            <div className="action-buttons">
              <button className="btn btn-ghost" onClick={() => setReveal((v) => !v)}>
                {reveal ? t('hideAnswers') : t('showAnswers')}
              </button>
              <button className="btn btn-secondary" onClick={() => setSubmitted(false)}>
                ↻ {t('fixAnswers')}
              </button>
            </div>
          </>
        )}
      </div>
      {celebrate && <Celebration kind={celebrate} onDone={() => setCelebrate(null)} />}
    </>
  )
}

function QuestionHead({ n, status, children }) {
  return (
    <h2 className="prep-q-title">
      <span className="prep-q-num">Q{n}</span>
      <span>{children}</span>
      {status === true && <span className="mark mark-inline mark-right">✓</span>}
      {status === false && <span className="mark mark-inline mark-wrong">✕</span>}
    </h2>
  )
}

/** The notes of C major on a loop that can be dragged to start on any note. */
function Carousel({ offset, onChange, locked }) {
  const { lang, t } = useLang()
  const windowRef = useRef(null)
  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const rotate = (steps) => onChange((((offset + steps) % 7) + 7) % 7)

  const down = (e) => {
    if (locked || e.button > 0) return
    e.preventDefault()
    const startX = e.clientX
    const cell = windowRef.current.getBoundingClientRect().width / 7
    setDragging(true)
    const move = (ev) => setDx(ev.clientX - startX)
    const up = (ev) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      setDragging(false)
      setDx(0)
      rotate(Math.round(-(ev.clientX - startX) / cell))
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  // Three laps of the loop so there is always something to drag into view.
  const cells = Array.from({ length: 21 }, (_, i) => NATURAL_KEYS[(((offset + i - 7) % 7) + 7) % 7])
  return (
    <div className={`carousel ${locked ? 'is-locked' : ''}`}>
      <button className="carousel-arrow" onClick={() => rotate(-1)} disabled={locked} aria-label={t('previous')}>
        ‹
      </button>
      <div className="carousel-window" ref={windowRef} onPointerDown={down}>
        <div className="carousel-start">{t('startsHere')}</div>
        <div
          className="carousel-strip"
          style={{ transform: `translateX(calc(-100% / 3 + ${dx}px))`, transition: dragging ? 'none' : undefined }}
        >
          {cells.map((n, i) => (
            <span key={i} className={`carousel-note ${i === 7 ? 'is-first' : ''}`}>
              {prettyNote(n, lang)}
            </span>
          ))}
        </div>
      </div>
      <button className="carousel-arrow" onClick={() => rotate(1)} disabled={locked} aria-label={t('next')}>
        ›
      </button>
    </div>
  )
}

/* ───────── Work out the key ───────── */

function WorkOut({ musicKey, showPrep = false, onAnother }) {
  const { lang, t } = useLang()
  const degree = NATURAL_KEYS.indexOf(musicKey)
  const mode = DEGREE_MODES[degree]
  const letters = naturalsFrom(musicKey)
  const formula = modeFormula(mode)
  const major = majorScale(musicKey)
  const [acc, setAcc] = useState(() => letters.map(() => ''))
  const [submitted, setSubmitted] = useState(false)
  const [showAnswer, setShowAnswer] = useState(0)
  const [celebrate, setCelebrate] = useState(null)
  const top = useRef(null)
  useEffect(() => {
    if (showPrep) top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const notes = letters.map((l, i) => l + acc[i])
  const right = notes.map((n, i) => n === major[i])
  const correct = right.filter(Boolean).length

  const check = () => {
    setSubmitted(true)
    setCelebrate(correct === 7 ? 'perfect' : correct === 0 ? 'allwrong' : null)
  }
  const vars = {
    root: prettyNote(musicKey, lang),
    mode: modeName(mode, lang),
    key: keyName(musicKey, lang),
    notes: letters.map((n) => prettyNote(n, lang)).join(' '),
    formula: formula.map((v, i) => intervalLabelAt(v, i)).join(' '),
  }

  return (
    <>
      {showPrep && (
        <section className="panel workout-explain" ref={top}>
          <Explanation vars={vars} />
          <div className="panel-label">{t('yourPrepAnswers')}</div>
          <PrepAnswers letters={letters} formula={formula} vars={vars} />
        </section>
      )}

      <section className="panel prep-q">
        <QuestionHead n={4} status={submitted ? correct === 7 : undefined}>
          {t('q4', vars)}
        </QuestionHead>
        <p className="prep-hint">{t('q4Hint')}</p>
        <AccidentalGrid
          letters={letters}
          acc={acc}
          onChange={setAcc}
          locked={submitted}
          results={submitted ? right : undefined}
        />
      </section>

      {showAnswer > 0 && <AnswerAnimation key={showAnswer} musicKey={musicKey} />}

      <div className={`action-bar panel ${submitted ? 'is-result' : ''}`}>
        {submitted ? (
          <span className="score-text">
            <strong>{correct}</strong> {t('correctOf', { total: 7 })}
          </span>
        ) : (
          <span className="action-hint">{t('q4Ready')}</span>
        )}
        <div className="action-buttons">
          <button className="btn btn-ghost" onClick={() => setShowAnswer((n) => n + 1)}>
            ▶ {t('displayAnswer')}
          </button>
          {submitted ? (
            <>
              {correct < 7 && (
                <button className="btn btn-secondary" onClick={() => setSubmitted(false)}>
                  ↻ {t('fixAnswers')}
                </button>
              )}
              <button className="btn btn-primary" onClick={onAnother}>
                {t('tryAnotherKey')} →
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={check}>
              {t('submit')}
            </button>
          )}
        </div>
      </div>
      {celebrate && <Celebration kind={celebrate} onDone={() => setCelebrate(null)} />}
    </>
  )
}

/** The answers to prep questions 1 and 3, lined up against the major formula. */
function PrepAnswers({ letters, formula, vars }) {
  const { lang, t } = useLang()
  return (
    <div className="compare-grid">
      <span className="compare-label">{t('rowNaturalsFrom', vars)}</span>
      {letters.map((n, i) => (
        <span key={i} className="compare-cell compare-note" style={{ '--chip-color': noteColor(n) }}>
          {prettyNote(n, lang)}
        </span>
      ))}
      <span className="compare-label">{t('rowFormulaOf', vars)}</span>
      {formula.map((v, i) => (
        <span
          key={i}
          className={`compare-cell ${changeOf(v) !== 'same' ? 'is-altered' : ''}`}
          style={{ '--chip-color': intervalColor(v) }}
        >
          {intervalLabelAt(v, i)}
        </span>
      ))}
      <span className="compare-label">{t('rowIonian')}</span>
      {DEGREES.map((d) => (
        <span key={d} className="compare-cell compare-target">
          {d}
        </span>
      ))}
    </div>
  )
}

function Explanation({ vars }) {
  const { lang } = useLang()
  if (lang === 'es')
    return (
      <div className="explain">
        <h3>Cómo funciona el truco</h3>
        <ol>
          <li>
            Las notas naturales empezando en {vars.root} ({vars.notes}) <em>son</em> el modo{' '}
            <strong>
              {vars.root} {vars.mode.toLowerCase()}
            </strong>
            , y su fórmula es <strong>{vars.formula}</strong>.
          </li>
          <li>
            La escala <strong>mayor</strong> (el modo jónico) tiene la fórmula más sencilla de todas:{' '}
            <strong>1 2 3 4 5 6 7</strong>, sin bemoles ni sostenidos.
          </li>
          <li>
            Compara las dos fórmulas grado a grado y cambia solo las notas donde no coinciden:
            <ul>
              <li>
                Un <strong>♭</strong> en la fórmula del modo significa que esa nota está un semitono{' '}
                <em>por debajo</em> de lo que pide la escala mayor → <strong>súbela con un ♯</strong>.
              </li>
              <li>
                Un <strong>♯4</strong> significa que esa nota está un semitono <em>por encima</em> →{' '}
                <strong>bájala con un ♭</strong>.
              </li>
              <li>
                Un número sin alteración ya coincide con la escala mayor → <strong>déjala como está</strong>.
              </li>
            </ul>
          </li>
          <li>
            No cambies nunca la letra de una nota: solo añade ♯ o ♭. Toda escala mayor usa cada letra (Do, Re, Mi, Fa,
            Sol, La, Si) exactamente una vez.
          </li>
        </ol>
      </div>
    )
  return (
    <div className="explain">
      <h3>How the trick works</h3>
      <ol>
        <li>
          The natural keys starting on {vars.root} ({vars.notes}) <em>are</em> the mode{' '}
          <strong>
            {vars.root} {vars.mode}
          </strong>
          , and its formula is <strong>{vars.formula}</strong>.
        </li>
        <li>
          The <strong>major</strong> scale (Ionian) has the simplest formula of all: <strong>1 2 3 4 5 6 7</strong> —
          no flats, no sharps.
        </li>
        <li>
          Compare the two formulas degree by degree, and change only the notes where they differ:
          <ul>
            <li>
              A <strong>♭</strong> in the mode's formula means that note is a semitone <em>lower</em> than major wants
              → <strong>raise it with a ♯</strong>.
            </li>
            <li>
              A <strong>♯4</strong> means that note is a semitone <em>higher</em> than major wants →{' '}
              <strong>lower it with a ♭</strong>.
            </li>
            <li>
              A plain number already matches major → <strong>leave the note alone</strong>.
            </li>
          </ul>
        </li>
        <li>
          Never change a note's letter — only add a ♯ or ♭. Every major scale uses each letter (A to G) exactly once.
        </li>
      </ol>
    </div>
  )
}

/** Column by column, the mode's formula turns into 1 2 3 4 5 6 7 and the notes follow. */
function AnswerAnimation({ musicKey }) {
  const { lang, t } = useLang()
  const ref = useRef(null)
  const degree = NATURAL_KEYS.indexOf(musicKey)
  const letters = naturalsFrom(musicKey)
  const formula = modeFormula(DEGREE_MODES[degree])
  const major = majorScale(musicKey)
  const [step, setStep] = useState(-1)

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const id = setInterval(() => setStep((s) => (s >= 7 ? s : s + 1)), 1100)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="panel answer-anim" ref={ref}>
      <div className="panel-label">{t('answerFor', { key: keyName(musicKey, lang) })}</div>
      <div className="anim-grid">
        <span className="compare-label">{t('rowFormula')}</span>
        {formula.map((v, i) => {
          const done = step >= i
          return (
            <span
              key={i}
              className={`anim-cell ${step === i ? 'is-active' : ''} ${done && changeOf(v) !== 'same' ? 'is-changed' : ''}`}
              style={{ '--chip-color': intervalColor(done ? DEGREES[i] : v) }}
            >
              {done ? DEGREES[i] : intervalLabelAt(v, i)}
            </span>
          )
        })}
        <span />
        {formula.map((v, i) => {
          const change = changeOf(v)
          return (
            <span key={i} className={`anim-arrow anim-${change} ${step >= i ? 'is-shown' : ''}`}>
              {change === 'up' ? '♯ ↑' : change === 'down' ? '♭ ↓' : '='}
            </span>
          )
        })}
        <span className="compare-label">{t('rowNotes')}</span>
        {letters.map((l, i) => {
          const n = step >= i ? major[i] : l
          return (
            <span
              key={i}
              className={`anim-cell anim-note ${step === i ? 'is-active' : ''} ${
                step >= i && n !== l ? 'is-changed' : ''
              }`}
              style={{ '--chip-color': noteColor(n) }}
            >
              {prettyNote(n, lang)}
            </span>
          )
        })}
      </div>
      <p className={`anim-result ${step >= 7 ? 'is-shown' : ''}`}>
        {keyName(musicKey, lang)}: <strong>{major.map((n) => prettyNote(n, lang)).join(' ')}</strong>
      </p>
    </section>
  )
}
