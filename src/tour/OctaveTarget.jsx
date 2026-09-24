import { useEffect, useState } from 'react'
import { inOctave, noteLabel } from './tuning.js'
import { useTour } from './useTour.jsx'

// Geometry (SVG user units): the octave runs left to right from C to the next C.
const BX0 = 80
const BX1 = 920
const BY = 84
const xAt = (pos) => BX0 + pos * (BX1 - BX0)
const TOKEN_LIFE = 1900
const PARTICLES = Array.from({ length: 9 }, (_, i) => {
  const a = (i / 9) * Math.PI * 2 + 0.3
  const r = 26 + (i % 3) * 9
  return { dx: Math.cos(a) * r, dy: Math.sin(a) * r * 0.8 - 8 }
})

/**
 * One octave, C to C. Every new note (`shot`) is thrown at it: a note inside the octave
 * drops into place by pitch and dissolves; a note outside bounces off the nearer wall.
 * `marks` are notes that have already settled.
 */
export default function OctaveTarget({ shot, marks = [] }) {
  const { t, lang } = useTour()
  const [tokens, setTokens] = useState([])

  useEffect(() => {
    if (!shot) return
    setTokens((ts) => [...ts.slice(-4), shot])
    const timer = setTimeout(() => setTokens((ts) => ts.filter((x) => x.id !== shot.id)), TOKEN_LIFE)
    return () => clearTimeout(timer)
  }, [shot])

  const miss = (pos) => {
    if (pos < 0) {
      const n = Math.ceil(-pos - 1e-9)
      return n === 1 ? t('tooLow1') : t('tooLowN', { n })
    }
    const n = Math.floor(pos + 1e-9)
    return n === 1 ? t('tooHigh1') : t('tooHighN', { n })
  }

  // Alternate labels above and below the line when marks crowd together.
  const placed = [...marks].sort((a, b) => a.pos - b.pos)
  let lastX = -1e9
  let lastBelow = true
  const labelled = placed.map((m) => {
    const x = xAt(m.pos)
    const below = x - lastX < 46 ? !lastBelow : false
    lastX = x
    lastBelow = below
    return { ...m, x, below }
  })

  const lastMiss = [...tokens].reverse().find((tk) => !inOctave(tk.pos))

  return (
    <svg className="target-svg" viewBox="0 0 1000 160" role="img" aria-label={t('octaveTarget')}>
      <line x1={BX0} y1={BY} x2={BX1} y2={BY} className="target-line" />
      {Array.from({ length: 11 }, (_, i) => (
        <line key={i} x1={xAt((i + 1) / 12)} x2={xAt((i + 1) / 12)} y1={BY - 3} y2={BY + 3} className="target-tick" />
      ))}

      <g className={`target-wall ${lastMiss && lastMiss.pos < 0 ? 'is-hit' : ''}`} key={`l${lastMiss?.id}`}>
        <line x1={BX0} x2={BX0} y1={BY - 16} y2={BY + 16} />
      </g>
      <g className={`target-wall ${lastMiss && lastMiss.pos >= 1 ? 'is-hit' : ''}`} key={`r${lastMiss?.id}`}>
        <line x1={BX1} x2={BX1} y1={BY - 16} y2={BY + 16} />
      </g>
      <text x={BX0} y={BY + 64} className="target-end">
        {noteLabel('C', lang)}
      </text>
      <text x={BX1} y={BY + 64} className="target-end is-next">
        {noteLabel('C', lang)}
        <tspan className="target-end-sub" dx={6}>
          {t('nextOctave')}
        </tspan>
      </text>

      {labelled.map((m) => (
        <g key={m.key} className={`target-mark tone-${m.tone ?? 'plain'} ${m.fresh ? 'is-fresh' : ''}`}>
          <circle cx={m.x} cy={BY} r={5.5} />
          <text x={m.x} y={m.below ? BY + 32 : BY - 20}>
            {noteLabel(m.name, lang)}
          </text>
        </g>
      ))}

      {tokens.map((tk) =>
        inOctave(tk.pos) ? (
          <g key={tk.id}>
            <g className="tok tok-in" style={{ '--x': `${xAt(tk.pos)}px`, '--y': `${BY}px` }}>
              <g className="tok-body">
                <circle r={19} />
                <text dy={7}>{noteLabel(tk.name, lang)}</text>
              </g>
            </g>
            <circle cx={xAt(tk.pos)} cy={BY} r={6} className="tok-ring" />
            {PARTICLES.map((p, i) => (
              <circle
                key={i}
                cx={xAt(tk.pos)}
                cy={BY}
                r={2.2}
                className="tok-spark"
                style={{ '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, animationDelay: `${560 + i * 12}ms` }}
              />
            ))}
          </g>
        ) : (
          <g key={tk.id}>
            <g
              className="tok tok-out"
              style={{ '--wall': `${tk.pos < 0 ? BX0 : BX1}px`, '--dir': tk.pos < 0 ? -1 : 1, '--y': `${BY}px` }}
            >
              <g className="tok-body">
                <circle r={19} />
                <text dy={7}>{noteLabel(tk.name, lang)}</text>
              </g>
            </g>
            {tk.id === lastMiss?.id && (
            <text
              x={tk.pos < 0 ? BX0 + 14 : BX1 - 14}
              y={BY - 34}
              className="tok-miss"
              textAnchor={tk.pos < 0 ? 'start' : 'end'}
            >
              {miss(tk.pos)}
            </text>
            )}
          </g>
        ),
      )}
    </svg>
  )
}
