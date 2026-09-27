import { useRef, useState } from 'react'
import { shuffle } from '../../components/board.jsx'
import { Segmented } from '../../components/Shell.jsx'
import { useLang } from '../../i18n.jsx'
import { KEY_PICK_ORDER, keyName, NOTE_PALETTE, noteColor, prettyNote } from '../../theory.js'

/** One big button per natural key, in circle-of-fifths order. */
export function KeyCards({ onChoose, current }) {
  const { lang } = useLang()
  return (
    <div className="key-picker-keys">
      {KEY_PICK_ORDER.map((k) => (
        <button key={k} className={`key-card ${k === current ? 'is-current' : ''}`} onClick={() => onChoose(k)}>
          <span className="key-card-note">{prettyNote(k, lang)}</span>
          <span className="key-card-name">{keyName(k, lang)}</span>
        </button>
      ))}
    </div>
  )
}

/** Big buttons for choosing one of the natural keys before an exercise starts. */
export function KeyPicker({ onChoose }) {
  const { t } = useLang()
  return (
    <div className="panel key-picker">
      <div className="panel-label">{t('chooseKey')}</div>
      <p className="key-picker-sub">{t('chooseKeySub')}</p>
      <KeyCards onChoose={onChoose} />
    </div>
  )
}

/** Compact key switch shown in the toolbar once a key has been chosen. */
export function KeySwitch({ value, onChange }) {
  const { lang, t } = useLang()
  return (
    <div className="key-switch">
      <span className="key-switch-label">{t('key')}</span>
      <Segmented value={value} onChange={onChange} options={KEY_PICK_ORDER.map((k) => ({ value: k, label: prettyNote(k, lang) }))} />
    </div>
  )
}

/**
 * Chosen key, current way and a round counter (bumped to reset a board).
 * noKeyWays lists the ways that pick their own random key.
 */
export function useKeyedWays(noKeyWays = []) {
  const [key, setKeyState] = useState(null)
  const [way, setWayState] = useState(1)
  const [round, setRound] = useState(0)
  const bump = () => setRound((r) => r + 1)
  return {
    key,
    way,
    round,
    bump,
    usesKey: !noKeyWays.includes(way),
    setKey: (k) => {
      setKeyState(k)
      bump()
    },
    setWay: (w) => {
      setWayState(w)
      bump()
    },
    /** Switch key and way together. */
    start: (k, w) => {
      setKeyState(k)
      setWayState(w)
      bump()
    },
  }
}

/** Toolbar with the way tabs and, for ways that use it, the key switch. */
export function WaysToolbar({ kw, ways }) {
  if (!kw.key) return null
  return (
    <div className="toolbar-stack">
      <Segmented value={kw.way} onChange={kw.setWay} options={ways} />
      {kw.usesKey && <KeySwitch value={kw.key} onChange={kw.setKey} />}
    </div>
  )
}

/** A round that visits each of n items once, in random order. */
export function useRoundQueue(n) {
  const fresh = () => shuffle(Array.from({ length: n }, (_, i) => i))
  const [queue, setQueue] = useState(fresh)
  const [pos, setPos] = useState(0)
  const [round, setRound] = useState(0)
  return {
    queue,
    pos,
    round,
    current: queue[pos],
    done: pos >= n,
    last: pos + 1 >= n,
    next: () => setPos((p) => p + 1),
    restart: () => {
      setQueue(fresh())
      setPos(0)
      setRound((r) => r + 1)
    },
  }
}

/**
 * Running score across the questions of a round (or a run of random questions).
 * Only the first try at each question counts, so "Try again" doesn't pad the total.
 */
export function useTally() {
  const [tally, setTally] = useState({ right: 0, total: 0 })
  const seen = useRef(new Set())
  return {
    ...tally,
    record: (questionId, ok) => {
      if (seen.current.has(questionId)) return
      seen.current.add(questionId)
      setTally((s) => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }))
    },
    reset: () => {
      seen.current = new Set()
      setTally({ right: 0, total: 0 })
    },
  }
}

/** Compact running score, e.g. "Right first time 4 / 5". */
export function TallyBadge({ tally }) {
  const { t } = useLang()
  return (
    <span className="tally" title={t('tallyTitle')}>
      <span className="tally-label">{t('tallyLabel')}</span>
      <strong>{tally.right}</strong> / {tally.total}
    </span>
  )
}

export const randomInt = (n) => Math.floor(Math.random() * n)

/** Note tiles that never run out, for spelling scales. */
export const noteItems = NOTE_PALETTE.map((n) => ({
  id: `n${n}`,
  value: n,
  label: (lang) => prettyNote(n, lang),
  group: 'note',
  color: noteColor(n),
  reusable: true,
}))

/** Every note spelling a natural key uses, in chromatic order (C, C♯, D♭, D …), used once each. */
export const chromaticItems = NOTE_PALETTE.map((n) => ({
  id: `c${n}`,
  value: n,
  label: (lang) => prettyNote(n, lang),
  group: 'ans',
  color: noteColor(n),
}))

/** "End of the round" panel, with the round's score and anything extra (like a key choice) below. */
export function RoundDone({ title, sub, tally, onAgain, children }) {
  const { t } = useLang()
  return (
    <div className="panel finished">
      <div className="finished-title">{title}</div>
      {tally && tally.total > 0 && (
        <p className="finished-score">{t('roundScore', { right: tally.right, total: tally.total })}</p>
      )}
      <p>{sub}</p>
      <button className="btn btn-primary" onClick={onAgain}>
        ↻ {t('goAgain')}
      </button>
      {children}
    </div>
  )
}

/**
 * Seven letters, each with ♭ ♮ ♯ buttons, for spelling a major scale.
 * acc holds '', 'b' or '#' per letter; results (after checking) true/false per column.
 */
export function AccidentalGrid({ letters, acc, onChange, locked, results }) {
  const { lang } = useLang()
  return (
    <div className="acc-grid">
      {letters.map((l, i) => {
        const note = l + acc[i]
        const ok = results?.[i]
        return (
          <div
            key={i}
            className={`acc-col ${ok === true ? 'is-right' : ok === false ? 'is-wrong' : ''}`}
            style={{ '--chip-color': noteColor(note) }}
          >
            <span className="acc-degree">{i + 1}</span>
            <span className="acc-note">{prettyNote(note, lang)}</span>
            <div className="acc-btns">
              {[
                ['b', '♭'],
                ['', '♮'],
                ['#', '♯'],
              ].map(([a, sym]) => (
                <button
                  key={sym}
                  className={acc[i] === a ? 'is-active' : ''}
                  disabled={locked}
                  onClick={() => onChange(acc.map((x, j) => (j === i ? a : x)))}
                >
                  {sym}
                </button>
              ))}
            </div>
            {ok != null && <span className={`mark ${ok ? 'mark-right' : 'mark-wrong'}`}>{ok ? '✓' : '✕'}</span>}
          </div>
        )
      })}
    </div>
  )
}
