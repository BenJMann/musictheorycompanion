import { useEffect, useRef, useState } from 'react'
import { ExerciseShell, ProgressPips, Segmented } from '../../components/Shell.jsx'
import { playSequence } from '../../tour/audio.js'
import { useLang } from '../../i18n.jsx'
import {
  DEGREE_MODES,
  intervalColor,
  intervalLabelAt,
  KEY_PICK_ORDER,
  MAJOR_SCALE,
  modeFormula,
  MODES,
  modeName,
  prettyNote,
} from '../../theory.js'
import { randomInt, RoundDone, useRoundQueue } from './common.jsx'

/*
 * Section 2 · Block 4. The sound of the modes.
 *   Way 1 – click any mode to hear it on a root of your choice
 *   Way 2 – hear a mode on a random root and name it; a round plays every mode once, in random order
 */

// Roots from C3 to C4, so the whole scale stays in a comfortable middle range.
const LOW_ROOT = 48
const HIGH_ROOT = 60
const freq = (midi) => 440 * 2 ** ((midi - 69) / 12)
const PITCH_NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

/** Semitones of a mode from its root, plus the octave. */
function modeSteps(degree) {
  const semis = MAJOR_SCALE.map((d) => d.semitones)
  const steps = semis.map((_, k) => (semis[(degree + k) % 7] - semis[degree] + 12) % 12)
  return [...steps, 12]
}

const NOTE_GAP = 0.34
// Up the scale and back down again: 15 notes.
const PLAY_MS = 15 * NOTE_GAP * 1000 + 800

/** Plays a mode up and back down; returns a function that stops it. */
function playMode(root, degree) {
  const up = modeSteps(degree).map((s) => freq(root + s))
  return playSequence([...up, ...up.slice(0, -1).reverse()], { gap: NOTE_GAP, dur: 1.4, gain: 0.32 })
}

const INSTRUCTIONS = {
  explore: {
    en: (
      <ol>
        <li>Choose a root note, then click any mode to hear it played up and back down from that root.</li>
        <li>
          Keeping the root the same makes the differences easy to hear. The modes are laid out from brightest
          (Lydian) to darkest (Locrian); each card shows the formula that gives it its colour.
        </li>
      </ol>
    ),
    es: (
      <ol>
        <li>Elige una tónica y haz clic en cualquier modo para oírlo hacia arriba y de vuelta hacia abajo desde ella.</li>
        <li>
          Con la misma tónica las diferencias se oyen fácilmente. Los modos van del más brillante (lidio) al más
          oscuro (locrio); cada tarjeta muestra la fórmula que le da su color.
        </li>
      </ol>
    ),
  },
  quiz: {
    en: (
      <ol>
        <li>
          Press <strong>Play</strong> to hear a mode, played up and back down from a random root note.
        </li>
        <li>
          Listen to its character — bright like Lydian, dark like Phrygian or Locrian — and click the mode you think it
          is. Play it again as often as you like.
        </li>
        <li>
          Press <strong>Check</strong>, then <strong>Next mode</strong>. A round plays each of the seven modes once, in a
          random order.
        </li>
      </ol>
    ),
    es: (
      <ol>
        <li>
          Pulsa <strong>Reproducir</strong> para oír un modo, tocado hacia arriba y de vuelta hacia abajo desde una
          tónica al azar.
        </li>
        <li>
          Escucha su carácter (brillante como el lidio, oscuro como el frigio o el locrio) y haz clic en el modo que
          creas que es. Puedes volver a oírlo tantas veces como quieras.
        </li>
        <li>
          Pulsa <strong>Comprobar</strong> y después <strong>Siguiente modo</strong>. Cada ronda toca los siete modos
          una vez, en orden aleatorio.
        </li>
      </ol>
    ),
  },
}

export default function ModeSounds({ onBack, meta }) {
  const { lang, t } = useLang()
  const [way, setWay] = useState(1)
  const rq = useRoundQueue(7)
  const [score, setScore] = useState(0)
  // Browsers only allow sound after a click, so the first mode waits for the Play button.
  const heard = useRef(false)
  const again = () => {
    setScore(0)
    rq.restart()
  }
  const ways = [
    { value: 1, label: t('way1Explore') },
    { value: 2, label: t('way2NameIt') },
  ]
  return (
    <ExerciseShell
      {...meta}
      onBack={onBack}
      tip={false}
      instructions={INSTRUCTIONS[way === 1 ? 'explore' : 'quiz'][lang]}
      toolbar={
        <div className="toolbar-stack">
          <Segmented value={way} onChange={setWay} options={ways} />
          {way === 2 && <ProgressPips count={7} pos={rq.pos} />}
        </div>
      }
    >
      {way === 1 ? (
        <Explore />
      ) : rq.done ? (
        <RoundDone title={t('roundDone')} sub={t('soundsDoneSub', { score, total: 7 })} onAgain={again} />
      ) : (
        <Listen
          key={`${rq.round}-${rq.pos}`}
          degree={rq.current}
          heard={heard}
          onAnswered={(right) => right && setScore((s) => s + 1)}
          onNext={rq.next}
          nextLabel={rq.last ? t('finish') : t('nextMode')}
        />
      )}
    </ExerciseShell>
  )
}

/* ───────── Way 1: hear each mode on demand ───────── */

// Root notes offered, in circle-of-fifths order like the key pickers, around C3–B3.
const ROOT_MIDI = { C: 48, D: 50, E: 52, F: 53, G: 55, A: 57, B: 59 }

function Explore() {
  const { lang, t } = useLang()
  const [root, setRoot] = useState('C')
  const [playing, setPlaying] = useState(null)
  const stop = useRef(null)
  const timer = useRef(null)

  const halt = () => {
    stop.current?.()
    clearTimeout(timer.current)
    setPlaying(null)
  }
  useEffect(() => halt, [])

  const play = (name) => {
    halt()
    stop.current = playMode(ROOT_MIDI[root], DEGREE_MODES.indexOf(name))
    setPlaying(name)
    timer.current = setTimeout(() => setPlaying(null), PLAY_MS)
  }

  return (
    <>
      <div className="panel explore-root">
        <span className="key-switch-label">{t('rootNote')}</span>
        <Segmented
          value={root}
          onChange={(r) => {
            halt()
            setRoot(r)
          }}
          options={KEY_PICK_ORDER.map((k) => ({ value: k, label: prettyNote(k, lang) }))}
        />
      </div>
      <div className="mode-cards">
        {MODES.map(({ name }) => (
          <button
            key={name}
            className={`mode-card ${playing === name ? 'is-playing' : ''}`}
            onClick={() => (playing === name ? halt() : play(name))}
          >
            <span className="mode-card-top">
              <span className="mode-card-name">
                {prettyNote(root, lang)} {modeName(name, lang)}
              </span>
              <span className="mode-card-icon" aria-hidden>
                {playing === name ? '■' : '▶'}
              </span>
            </span>
            <span className="mode-card-formula">
              {modeFormula(name).map((v, i) => (
                <span key={i} style={{ '--chip-color': intervalColor(v) }}>
                  {intervalLabelAt(v, i)}
                </span>
              ))}
            </span>
          </button>
        ))}
      </div>
    </>
  )
}

/* ───────── Way 2: name the mode you hear ───────── */

function Listen({ degree, heard, onAnswered, onNext, nextLabel }) {
  const { lang, t } = useLang()
  const [root] = useState(() => LOW_ROOT + randomInt(HIGH_ROOT - LOW_ROOT + 1))
  const [choice, setChoice] = useState(null)
  const [checked, setChecked] = useState(false)
  const [playing, setPlaying] = useState(false)
  const answer = DEGREE_MODES[degree]
  const right = choice === answer

  const play = () => {
    heard.current = true
    playMode(root, degree)
    setPlaying(true)
  }
  // Once the first mode has been played, each new one plays by itself (only once, even in StrictMode).
  const autoPlayed = useRef(false)
  useEffect(() => {
    if (heard.current && !autoPlayed.current) {
      autoPlayed.current = true
      play()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!playing) return
    const id = setTimeout(() => setPlaying(false), PLAY_MS)
    return () => clearTimeout(id)
  }, [playing])

  const check = () => {
    setChecked(true)
    onAnswered(right)
  }

  return (
    <>
      <div className="panel listen">
        <button className={`play-btn ${playing ? 'is-playing' : ''}`} onClick={play} aria-label={t('play')}>
          <span className="play-icon" aria-hidden>
            ▶
          </span>
        </button>
        <div className="listen-text">
          <span className="listen-title">{heard.current ? t('playAgain') : t('play')}</span>
          <span className="listen-sub">{t('whichModeIsThis')}</span>
        </div>
        <div className={`eq ${playing ? 'is-playing' : ''}`} aria-hidden>
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} style={{ animationDelay: `${(i * 173) % 700}ms` }} />
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-label">{t('bankModes')}</div>
        <div className="choice-grid">
          {DEGREE_MODES.map((m) => (
            <button
              key={m}
              className={`choice ${choice === m ? 'is-selected' : ''} ${
                checked && choice === m ? (right ? 'is-right' : 'is-wrong') : ''
              } ${checked && !right && m === answer ? 'is-answer' : ''}`}
              disabled={checked}
              onClick={() => setChoice(m)}
            >
              {modeName(m, lang)}
            </button>
          ))}
        </div>
      </div>

      <div className={`action-bar panel ${checked ? 'is-result' : ''}`}>
        {checked ? (
          <span className={`action-hint ${right ? 'action-hint-good' : ''}`}>
            {right ? t('rightItWas') : t('wrongItWas')}{' '}
            <strong>
              {prettyNote(PITCH_NAMES[root % 12], lang)} {modeName(answer, lang)}
            </strong>
          </span>
        ) : (
          <span className="action-hint">{choice ? t('ready') : t('pickAMode')}</span>
        )}
        <div className="action-buttons">
          {checked ? (
            <button className="btn btn-primary" onClick={onNext}>
              {nextLabel} →
            </button>
          ) : (
            <button className="btn btn-primary" disabled={!choice} onClick={check}>
              {t('check')}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
