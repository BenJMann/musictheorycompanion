import { useEffect, useRef, useState } from 'react'
import { playNote } from './audio.js'
import { fifthName, fitsString, freqOf, lengthFraction, lengthOf, noteLabel } from './tuning.js'
import { useTour } from './useTour.jsx'

// Geometry of the monochord drawing (SVG user units).
const X0 = 50
const X1 = 950
const Y = 82
const xAt = (len) => X0 + len * (X1 - X0)
const TWEEN_MS = 380
const OCTAVE_TICKS = [1 / 2, 1 / 4, 1 / 8]

const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2)

/**
 * The monochord: a string whose vibrating length runs from the nut to a movable bridge.
 * Buttons halve or double the length (octaves) and, when allowed, divide it into thirds.
 */
export default function StringDiagram({ note, onChange, thirds = 'hidden', locked = false }) {
  const { t, lang } = useTour()
  const [pluckId, setPluckId] = useState(0)
  const [flash, setFlash] = useState(null)

  const len = lengthOf(note)
  const frac = lengthFraction(note)

  const pluck = (n = note) => {
    playNote(freqOf(n))
    setPluckId((p) => p + 1)
  }

  const apply = (next, divisions) => {
    if (locked || !fitsString(next)) return
    if (divisions) setFlash({ n: divisions, len, id: Date.now() })
    pluck(next)
    onChange(next, divisions === 3 ? 'thirds' : 'octave')
  }

  const canDouble = !locked && fitsString({ ...note, e: note.e - 1 })
  const canHalve = !locked && fitsString({ ...note, e: note.e + 1 })
  const canThird = !locked && thirds === 'on' && fitsString({ ...note, k: note.k + 1 })

  return (
    <div className="mono">
      <div className="mono-readout">
        <span className="mono-note" key={`${note.k}`}>
          {noteLabel(fifthName(note.k), lang)}
        </span>
        <span className="mono-meta">
          <span>{freqOf(note).toFixed(1)} Hz</span>
          <span className="mono-dot">·</span>
          <span>{frac === '1' ? t('wholeString') : t('ofString', { f: frac })}</span>
        </span>
      </div>

      <MonochordSvg len={len} pluckId={pluckId} flash={flash} onPluck={() => pluck()} label={t('pluck')} />

      <div className="mono-controls">
        <button className="tour-ctl" onClick={() => apply({ ...note, e: note.e - 1 }, 0)} disabled={!canDouble}>
          <span className="tour-ctl-glyph" aria-hidden>
            ×2
          </span>
          <span className="tour-ctl-text">
            {t('octDown')}
            <small>{t('octDownSub')}</small>
          </span>
        </button>
        <button className="tour-ctl" onClick={() => apply({ ...note, e: note.e + 1 }, 2)} disabled={!canHalve}>
          <span className="tour-ctl-glyph" aria-hidden>
            ½
          </span>
          <span className="tour-ctl-text">
            {t('octUp')}
            <small>{t('octUpSub')}</small>
          </span>
        </button>
        {thirds !== 'hidden' && (
          <button
            className="tour-ctl tour-ctl-third"
            onClick={() => apply({ ...note, k: note.k + 1 }, 3)}
            disabled={!canThird}
            title={thirds === 'used' ? t('thirdsUsed') : undefined}
          >
            <span className="tour-ctl-glyph" aria-hidden>
              ⅓
            </span>
            <span className="tour-ctl-text">
              {t('thirds')}
              <small>{thirds === 'used' ? t('thirdsUsed') : t('thirdsSub')}</small>
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

function MonochordSvg({ len, pluckId, flash, onPluck, label }) {
  const vib = useRef(null)
  const rest = useRef(null)
  const bridge = useRef(null)
  const anim = useRef({ len, from: len, to: len, t0: 0, pluckT: -1e9, raf: 0 })

  useEffect(() => {
    const a = anim.current
    const draw = (now) => {
      const u = Math.min(1, (now - a.t0) / TWEEN_MS)
      a.len = a.from + (a.to - a.from) * ease(u)
      const xl = xAt(a.len)
      const age = (now - a.pluckT) / 1000
      const amp = age >= 0 ? 9 * Math.exp(-age / 0.8) : 0
      // Shorter strings vibrate faster; slowed right down so the eye can follow.
      const phase = Math.sin(age * 2 * Math.PI * Math.min(26, 7 / Math.sqrt(a.len)))
      let d = `M ${X0} ${Y}`
      for (let i = 1; i <= 48; i++) {
        const x = X0 + ((xl - X0) * i) / 48
        d += ` L ${x.toFixed(1)} ${(Y + amp * phase * Math.sin((Math.PI * i) / 48)).toFixed(2)}`
      }
      vib.current?.setAttribute('d', d)
      rest.current?.setAttribute('d', `M ${xl} ${Y} L ${X1} ${Y}`)
      bridge.current?.setAttribute('transform', `translate(${xl} 0)`)
      a.raf = u < 1 || amp > 0.05 ? requestAnimationFrame(draw) : 0
    }
    a.kick = () => {
      if (!a.raf) a.raf = requestAnimationFrame(draw)
    }
    draw(performance.now())
    return () => {
      cancelAnimationFrame(a.raf)
      a.raf = 0
    }
  }, [])

  useEffect(() => {
    const a = anim.current
    if (a.to === len) return
    a.from = a.len
    a.to = len
    a.t0 = performance.now()
    a.kick?.()
  }, [len])

  useEffect(() => {
    if (!pluckId) return
    anim.current.pluckT = performance.now()
    anim.current.kick?.()
  }, [pluckId])

  return (
    <svg className="mono-svg" viewBox="0 0 1000 150" role="img" aria-label={label}>
      {/* the soundboard */}
      <line x1={X0 - 14} y1={122} x2={X1 + 14} y2={122} className="mono-board" />
      {OCTAVE_TICKS.map((f) => (
        <g key={f} transform={`translate(${xAt(f)} 0)`} className="mono-tick">
          <line y1={116} y2={122} />
          <text y={140}>{f === 0.5 ? '½' : f === 0.25 ? '¼' : '⅛'}</text>
        </g>
      ))}

      {/* flash of the divisions just made */}
      {flash && (
        <g key={flash.id} className="mono-divisions">
          {Array.from({ length: flash.n - 1 }, (_, i) => (
            <path
              key={i}
              d="M 0 92 L -9 110 L 9 110 Z"
              transform={`translate(${xAt((flash.len * (i + 1)) / flash.n)} 0)`}
              style={{ animationDelay: `${i * 90}ms` }}
            />
          ))}
        </g>
      )}

      {/* nut and far bridge */}
      <rect x={X0 - 8} y={Y - 16} width={8} height={40} rx={1.5} className="mono-nut" />
      <path d={`M ${X1} ${Y + 2} L ${X1 - 9} ${Y + 28} L ${X1 + 9} ${Y + 28} Z`} className="mono-end" />

      <path ref={rest} className="mono-rest" d={`M ${xAt(len)} ${Y} L ${X1} ${Y}`} />
      <path ref={vib} className="mono-string" d={`M ${X0} ${Y} L ${xAt(len)} ${Y}`} />
      {/* wide invisible hit area for plucking */}
      <rect x={X0} y={Y - 22} width={X1 - X0} height={44} className="mono-hit" onClick={onPluck} />

      <g ref={bridge} transform={`translate(${xAt(len)} 0)`} className="mono-bridge">
        <path d={`M 0 ${Y + 2} L -11 ${Y + 30} L 11 ${Y + 30} Z`} />
      </g>
    </svg>
  )
}
