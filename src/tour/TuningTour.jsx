import { useEffect, useRef, useState } from 'react'
import { LanguageToggle } from '../i18n.jsx'
import { playNote, playSequence, playTogether, startDrone } from './audio.js'
import OctaveTarget from './OctaveTarget.jsx'
import Spiral from './Spiral.jsx'
import StringDiagram from './StringDiagram.jsx'
import {
  C3,
  C4,
  COMMA_CENTS,
  PURE_FIFTH_CENTS,
  SPIRAL_SLOTS,
  fifthName,
  foldE,
  folded,
  freqOf,
  inOctave,
  noteLabel,
  posOf,
  spiralFreq,
} from './tuning.js'
import { rich, useTour } from './useTour.jsx'
import './tour.css'

const PARTS = [
  { id: 'octave', Body: PartOctave },
  { id: 'fold', Body: PartFold },
  { id: 'thirds', Body: PartThirds },
  { id: 'spiral', Body: PartSpiral },
  { id: 'comma', Body: PartComma },
  { id: 'equal', Body: PartEqual },
]
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI']

/** Block 0: a six-page guided tour of where our twelve notes come from. */
export default function TuningTour({ onBack }) {
  const { t } = useTour()
  const [part, setPart] = useState(0)
  const scroller = useRef(null)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
  }, [part])

  const n = part + 1
  const { Body } = PARTS[part]
  const title = (i) => t(`p${i + 1}Title`)

  return (
    <div className="tour" ref={scroller}>
      <header className="tour-top">
        <button className="tour-link" onClick={onBack}>
          <span aria-hidden>←</span> {t('back')}
        </button>
        <nav className="tour-steps" aria-label={t('tourName')}>
          {PARTS.map((p, i) => (
            <button
              key={p.id}
              className={`tour-step ${i === part ? 'is-current' : ''} ${i < part ? 'is-past' : ''}`}
              onClick={() => setPart(i)}
              aria-current={i === part ? 'step' : undefined}
              title={title(i)}
            >
              {ROMAN[i]}
            </button>
          ))}
        </nav>
        <LanguageToggle />
      </header>

      <article className={`tour-page tour-page-${PARTS[part].id}`} key={part}>
        <p className="tour-kicker">
          {t('part', { n })} <span aria-hidden>·</span> {t(`p${n}Kicker`)}
        </p>
        <h1 className="tour-title">{title(part)}</h1>
        <Body />
      </article>

      <footer className="tour-nav">
        {part > 0 ? (
          <button className="tour-link" onClick={() => setPart(part - 1)}>
            <span aria-hidden>←</span> {title(part - 1)}
          </button>
        ) : (
          <span />
        )}
        {part < PARTS.length - 1 ? (
          <button className="tour-next" onClick={() => setPart(part + 1)}>
            <small>{t('next')}</small>
            {title(part + 1)} <span aria-hidden>→</span>
          </button>
        ) : (
          <button className="tour-next" onClick={onBack}>
            {t('finish')} <span aria-hidden>→</span>
          </button>
        )}
      </footer>
    </div>
  )
}

/* ───────── Shared bits ───────── */

function Prose({ paras }) {
  return (
    <div className="tour-prose">
      {paras.map((p, i) => (
        <p key={i}>{rich(p)}</p>
      ))}
    </div>
  )
}

function TryIt({ children }) {
  const { t } = useTour()
  return (
    <p className="tour-try">
      <span className="tour-try-label">{t('tryIt')}</span>
      {children}
    </p>
  )
}

function Listen({ items }) {
  return (
    <div className="tour-listen">
      {items.map(([label, play]) => (
        <button key={label} className="tour-play" onClick={play}>
          <span className="tour-play-icon" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  )
}

function Figure({ caption, children, className = '' }) {
  return (
    <figure className={`tour-figure ${className}`}>
      {children}
      {caption && <figcaption className="tour-caption">{caption}</figcaption>}
    </figure>
  )
}

/** Timers that are cleared when the page unmounts. */
function useLater() {
  const timers = useRef([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  return (fn, ms) => timers.current.push(setTimeout(fn, ms))
}

let shotId = 0
const shotFor = (note) => ({ id: ++shotId, pos: posOf(note), name: fifthName(note.k) })
const markFor = (note, extra) => ({ key: `${note.k}`, pos: posOf(folded(note.k)), name: fifthName(note.k), ...extra })

/* ───────── Part 1 · The octave ───────── */

function PartOctave() {
  const { t } = useTour()
  const [note, setNote] = useState({ k: 0, e: 0 })
  return (
    <>
      <Prose paras={t('p1')} />
      <TryIt>{t('p1Try')}</TryIt>
      <Figure caption={t('monochord')}>
        <StringDiagram note={note} onChange={setNote} />
      </Figure>
    </>
  )
}

/* ───────── Part 2 · Folding into one octave ───────── */

const FOLD_ROUNDS = 6

function randomString(avoidK) {
  const ks = [-1, 0, 1, 2, 3, 4, 5, 6].filter((k) => k !== avoidK)
  const k = ks[Math.floor(Math.random() * ks.length)]
  // Out of the octave: one octave low, or one or two octaves high.
  const shifts = [-1, -1, 1, 2]
  return { k, e: foldE(k) + shifts[Math.floor(Math.random() * shifts.length)] }
}

function PartFold() {
  const { t } = useTour()
  const later = useLater()
  const [round, setRound] = useState(0)
  const [note, setNote] = useState(() => randomString())
  const [shot, setShot] = useState(null)
  const [solved, setSolved] = useState(false)
  const done = round === FOLD_ROUNDS - 1 && solved

  // Throw each new string at the target so you can see which way it's out.
  useEffect(() => {
    const id = setTimeout(() => setShot(shotFor(note)), 450)
    return () => clearTimeout(id)
  }, [round]) // eslint-disable-line react-hooks/exhaustive-deps

  const change = (next) => {
    setNote(next)
    setShot(shotFor(next))
    if (!inOctave(posOf(next))) return
    setSolved(true)
    if (round < FOLD_ROUNDS - 1) {
      later(() => {
        setNote((n) => randomString(n.k))
        setSolved(false)
        setRound((r) => r + 1)
      }, 1700)
    }
  }

  return (
    <>
      <Prose paras={t('p2')} />
      <TryIt>{t('p2Try')}</TryIt>
      <div className="tour-status">
        <Pips total={FOLD_ROUNDS} done={round + (solved ? 1 : 0)} />
        <span>{done ? rich(t('p2Done')) : t('p2Round', { n: round + 1, total: FOLD_ROUNDS })}</span>
      </div>
      <Figure caption={t('octaveTarget')}>
        <OctaveTarget shot={shot} marks={solved ? [markFor(note, { fresh: true })] : []} />
      </Figure>
      <Figure caption={t('monochord')}>
        <StringDiagram note={note} onChange={change} locked={solved} />
      </Figure>
    </>
  )
}

function Pips({ total, done }) {
  return (
    <span className="tour-pips" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < done ? 'is-done' : ''} />
      ))}
    </span>
  )
}

/* ───────── Part 3 · Dividing by three ───────── */

const THIRDS_STARTS = [0, 2, -1, 3, 1] // C, D, F, A, G

function PartThirds() {
  const { t, lang } = useTour()
  const later = useLater()
  const [round, setRound] = useState(0)
  const startK = THIRDS_STARTS[round]
  const [note, setNote] = useState(folded(startK))
  const [divided, setDivided] = useState(false)
  const [found, setFound] = useState(false)
  const [shot, setShot] = useState(null)
  const done = found && round === THIRDS_STARTS.length - 1

  const change = (next, op) => {
    const didDivide = divided || op === 'thirds'
    setNote(next)
    setDivided(didDivide)
    setShot(shotFor(next))
    if (didDivide && next.k === startK + 1 && inOctave(posOf(next))) {
      setFound(true)
      later(() => playTogether([freqOf(folded(startK)), freqOf(next)], { dur: 2.6 }), 900)
    }
  }

  const nextRound = () => {
    const r = round + 1
    setRound(r)
    setNote(folded(THIRDS_STARTS[r]))
    setDivided(false)
    setFound(false)
    playNote(freqOf(folded(THIRDS_STARTS[r])))
  }

  const marks = [markFor(folded(startK), { tone: 'start' })]
  if (found) marks.push(markFor(note, { fresh: true }))
  const name = (k) => noteLabel(fifthName(k), lang)
  const [l1, l2, l3, l4] = t('p3Listen')

  return (
    <>
      <Prose paras={t('p3')} />
      <Listen
        items={[
          [l1, () => playNote(C3)],
          [l2, () => playNote(C3 * 3)],
          [l3, () => playNote(C3 * 1.5)],
          [l4, () => playTogether([C3, C3 * 1.5], { dur: 3 })],
        ]}
      />
      <Prose paras={[t('p3After')]} />
      <TryIt>{t('p3Try')}</TryIt>
      <div className="tour-status">
        <Pips total={THIRDS_STARTS.length} done={round + (found ? 1 : 0)} />
        <span>
          {found
            ? t('p3Found', { a: name(startK), b: name(startK + 1) })
            : t('p3Start', { note: name(startK) })}
        </span>
        {found && !done && (
          <button className="tour-pill" onClick={nextRound}>
            {t('p3Next')} →
          </button>
        )}
      </div>
      {done && <p className="tour-done">{rich(t('p3Done'))}</p>}
      <Figure caption={t('octaveTarget')}>
        <OctaveTarget shot={shot} marks={marks} />
      </Figure>
      <Figure caption={t('monochord')}>
        <StringDiagram note={note} onChange={change} thirds={divided ? 'used' : 'on'} locked={found} />
      </Figure>
    </>
  )
}

/* ───────── Part 4 · The spiral of fifths ───────── */

function PartSpiral() {
  const { t } = useTour()
  const [filled, setFilled] = useState(1) // C is given
  const [note, setNote] = useState(folded(0))
  const [divided, setDivided] = useState(false)
  const [shot, setShot] = useState(null)
  const complete = filled >= SPIRAL_SLOTS

  const change = (next, op) => {
    const didDivide = divided || op === 'thirds'
    setNote(next)
    setDivided(didDivide)
    setShot(shotFor(next))
    if (didDivide && next.k === filled && inOctave(posOf(next))) {
      setFilled(filled + 1)
      setDivided(false)
    }
  }

  const fillRest = () => {
    playSequence(
      Array.from({ length: SPIRAL_SLOTS - filled }, (_, i) => freqOf(folded(filled + i))),
      { gap: 0.3, dur: 1.4 },
    )
    setFilled(SPIRAL_SLOTS)
    setNote(folded(SPIRAL_SLOTS - 1))
    setDivided(false)
  }

  const marks = Array.from({ length: filled }, (_, k) =>
    markFor(folded(k), { fresh: k === filled - 1 && k > 0, tone: complete && (k === 0 || k === 12) ? 'comma' : 'plain' }),
  )

  return (
    <>
      <Prose paras={t('p4')} />
      <div className="tour-split">
        <div className="tour-split-main">
          <Spiral filled={filled} next={complete ? -1 : filled} highlight={complete ? [0, 12] : []} />
        </div>
        <div className="tour-split-side">
          <TryIt>{t('p4Try')}</TryIt>
          <div className="tour-status">
            <span>{t('p4Progress', { n: filled - 1 })}</span>
            {!complete && (
              <button className="tour-link tour-link-small" onClick={fillRest}>
                {t('p4Skip')}
              </button>
            )}
          </div>
          {complete && <p className="tour-done">{rich(t('p4Done'))}</p>}
          <Figure caption={t('octaveTarget')}>
            <OctaveTarget shot={shot} marks={marks} />
          </Figure>
          <Figure caption={t('monochord')}>
            <StringDiagram note={note} onChange={change} thirds={divided || complete ? 'used' : 'on'} locked={complete} />
          </Figure>
        </div>
      </div>
    </>
  )
}

/* ───────── Part 5 · The Pythagorean comma ───────── */

const B_SHARP = freqOf(folded(12))

function PartComma() {
  const { t } = useTour()
  const [b1, b2, b3, b4] = t('p5Buttons')
  const marks = Array.from({ length: SPIRAL_SLOTS }, (_, k) =>
    markFor(folded(k), { tone: k === 0 || k === 12 ? 'comma' : 'plain' }),
  )
  return (
    <>
      <div className="tour-split tour-split-text">
        <div className="tour-split-side">
          <Prose paras={t('p5')} />
        </div>
        <div className="tour-split-main">
          <Spiral highlight={[0, 12]} />
        </div>
      </div>
      <TryIt>{t('p5Listen')}</TryIt>
      <Listen
        items={[
          [b1, () => playNote(C4, { dur: 2.2 })],
          [b2, () => playNote(B_SHARP, { dur: 2.2 })],
          [b3, () => playTogether([C4, B_SHARP], { dur: 5 })],
          [b4, () => playSequence(Array.from({ length: SPIRAL_SLOTS }, (_, k) => freqOf(folded(k))), { gap: 0.36, dur: 1.5 })],
        ]}
      />
      <Figure caption={t('octaveTarget')}>
        <OctaveTarget marks={marks} />
      </Figure>
      <CommaScale />
    </>
  )
}

/** A semitone drawn to scale, with the comma marked inside it. */
function CommaScale() {
  const { t, lang } = useTour()
  const W = 600
  const comma = (COMMA_CENTS / 100) * W
  return (
    <figure className="tour-figure comma-scale">
      <svg viewBox="0 0 700 92" role="img" aria-label={t('comma')}>
        <g transform="translate(50 0)">
          <line x1={0} x2={W} y1={40} y2={40} className="comma-semitone" />
          <line x1={0} x2={0} y1={30} y2={50} className="comma-semitone" />
          <line x1={W} x2={W} y1={30} y2={50} className="comma-semitone" />
          <text x={W / 2} y={24} className="comma-label">
            {t('semitone')}
          </text>
          <rect x={0} y={36} width={comma} height={8} rx={2} className="comma-bar" />
          <text x={0} y={72} className="comma-note">
            {noteLabel('C', lang)}
          </text>
          <text x={comma} y={72} className="comma-note is-comma">
            {noteLabel('B#', lang)}
          </text>
          <text x={comma + 30} y={71} className="comma-label is-left">
            {t('comma')}
          </text>
          <text x={W} y={72} className="comma-note is-faint">
            {noteLabel('C#', lang)}
          </text>
        </g>
      </svg>
    </figure>
  )
}

/* ───────── Part 6 · Equal temperament ───────── */

function PartEqual() {
  const { t, lang } = useTour()
  const [tune, setTune] = useState(0)
  const [view, setView] = useState('3d')
  const [droning, setDroning] = useState(false)
  const drone = useRef(null)

  const fifth = PURE_FIFTH_CENTS + (700 - PURE_FIFTH_CENTS) * tune
  const gap = Math.max(0, 12 * fifth - 8400)
  const pair = [C4, spiralFreq(12, fifth)]
  const fmt = (c) => c.toLocaleString(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  // Sweep up to the bird's-eye view shortly after arriving.
  useEffect(() => {
    const id = setTimeout(() => setView('top'), 900)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    drone.current?.set(pair)
  }, [tune]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => drone.current?.stop(), [])

  const toggleDrone = () => {
    if (drone.current) {
      drone.current.stop()
      drone.current = null
      setDroning(false)
    } else {
      drone.current = startDrone(pair)
      setDroning(true)
    }
  }

  return (
    <>
      <div className="tour-split tour-split-text">
        <div className="tour-split-side">
          <Prose paras={t('p6')} />
          <p className="tour-formula" aria-label="f = f0 × 2^(n/12)">
            <i>f</i> = <i>f</i>
            <sub>0</sub> × 2
            <sup>
              <i>n</i>/12
            </sup>
          </p>
          <Prose paras={[t('p6FormulaNote'), t('p6History')]} />
        </div>
        <div className="tour-split-main">
          <Spiral view={view} tune={tune} highlight={tune < 1 ? [0, 12] : []} maxHeight={500} />
          <div className="tune">
            <input
              type="range"
              min={0}
              max={1000}
              value={Math.round(tune * 1000)}
              onChange={(e) => setTune(Number(e.target.value) / 1000)}
              aria-label={`${t('pythagorean')} – ${t('equal')}`}
              style={{ '--fill': `${tune * 100}%` }}
            />
            <div className="tune-ends">
              <button onClick={() => setTune(0)}>{t('pythagorean')}</button>
              <button onClick={() => setTune(1)}>{t('equal')}</button>
            </div>
            <dl className="tune-readout">
              <div>
                <dt>{t('fifthSize')}</dt>
                <dd>{t('cents', { c: fmt(fifth) })}</dd>
              </div>
              <div>
                <dt>{t('gapSize')}</dt>
                <dd className={gap < 0.005 ? 'is-zero' : ''}>{t('cents', { c: fmt(gap) })}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      <TryIt>{t('p6Try')}</TryIt>
      <div className="tour-listen">
        <button className={`tour-play ${droning ? 'is-on' : ''}`} onClick={toggleDrone}>
          <span className={droning ? 'tour-stop-icon' : 'tour-play-icon'} aria-hidden />
          {droning ? t('droneOff') : t('droneOn')}
        </button>
        <button
          className="tour-play"
          onClick={() =>
            playSequence(
              Array.from({ length: SPIRAL_SLOTS }, (_, k) => spiralFreq(k, fifth)),
              { gap: 0.34, dur: 1.4 },
            )
          }
        >
          <span className="tour-play-icon" aria-hidden />
          {t('playCircle')}
        </button>
      </div>
      {tune >= 1 && <p className="tour-done">{rich(t('p6Done'))}</p>}
    </>
  )
}
