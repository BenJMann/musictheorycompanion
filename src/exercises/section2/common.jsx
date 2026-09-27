import { useState } from 'react'
import { shuffle } from '../../components/board.jsx'
import { Segmented } from '../../components/Shell.jsx'
import { useLang } from '../../i18n.jsx'
import { keyName, NATURAL_KEYS, NOTE_PALETTE, noteColor, prettyNote } from '../../theory.js'

/** Big buttons for choosing one of the natural keys before an exercise starts. */
export function KeyPicker({ onChoose }) {
  const { lang, t } = useLang()
  return (
    <div className="panel key-picker">
      <div className="panel-label">{t('chooseKey')}</div>
      <p className="key-picker-sub">{t('chooseKeySub')}</p>
      <div className="key-picker-keys">
        {NATURAL_KEYS.map((k) => (
          <button key={k} className="key-card" onClick={() => onChoose(k)}>
            <span className="key-card-note">{prettyNote(k, lang)}</span>
            <span className="key-card-name">{keyName(k, lang)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/** Compact key switch shown in the toolbar once a key has been chosen. */
export function KeySwitch({ value, onChange }) {
  const { lang, t } = useLang()
  return (
    <div className="key-switch">
      <span className="key-switch-label">{t('key')}</span>
      <Segmented value={value} onChange={onChange} options={NATURAL_KEYS.map((k) => ({ value: k, label: prettyNote(k, lang) }))} />
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

/** "End of the round" panel. */
export function RoundDone({ title, sub, onAgain }) {
  const { t } = useLang()
  return (
    <div className="panel finished">
      <div className="finished-title">{title}</div>
      <p>{sub}</p>
      <button className="btn btn-primary" onClick={onAgain}>
        ↻ {t('goAgain')}
      </button>
    </div>
  )
}
