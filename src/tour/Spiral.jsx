import { useEffect, useRef } from 'react'
import { SPIRAL_GHOSTS, SPIRAL_SLOTS, fifthName, noteLabel } from './tuning.js'
import { useTour } from './useTour.jsx'

const INK = '27, 30, 36'
const GREY = '160, 167, 177'
const ACCENT = '48, 86, 190'
const COMMA = '194, 86, 43'
const SERIF = '"EB Garamond", "Cormorant Garamond", Georgia, "Times New Roman", serif'

const STEPS = SPIRAL_SLOTS + SPIRAL_GHOSTS // slots 0 … 17
const ELEV_3D = 0.34 // camera elevation for the 3D view (radians)
const ELEV_TOP = Math.PI / 2
const SPIN = (Math.PI * 2) / 95 // radians per second: one turn every ~1.5 minutes
const RISE = 0.15 // height gained per fifth
// Pythagorean drift per fifth, exaggerated so the comma is visible: after twelve fifths
// the spiral has turned 12° too far and moved 18% further out.
const TURN_DRIFT = Math.PI / 180
const RADIUS_DRIFT = 0.015

const clamp01 = (v) => Math.max(0, Math.min(1, v))
const lerp = (a, b, u) => a + (b - a) * u

/**
 * The spiral of fifths: slot k is k pure fifths above C. With `tune` = 0 (Pythagorean)
 * it spirals outward and never closes; at `tune` = 1 (equal temperament) every twelfth
 * slot lands exactly on top of another, so from above it becomes the circle of fifths.
 *
 * filled: how many slots (from C) are filled · next: slot to invite · view: '3d' | 'top'
 * highlight: slots drawn in the comma colour (C and B♯).
 */
export default function Spiral({ filled = SPIRAL_SLOTS, next = -1, view = '3d', tune = 0, highlight = [], maxHeight = 600 }) {
  const { t, lang } = useTour()
  const wrap = useRef(null)
  const canvas = useRef(null)
  const props = useRef({})
  props.current = { filled, next, view, tune, highlight, lang, maxHeight }
  const fillTimes = useRef({})
  const lastFilled = useRef(filled)

  // Remember when each slot was filled so it can glow for a moment.
  if (filled > lastFilled.current) {
    for (let k = lastFilled.current; k < filled; k++) fillTimes.current[k] = performance.now()
  }
  lastFilled.current = filled

  useEffect(() => {
    const cv = canvas.current
    const ctx = cv.getContext('2d')
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let w = 0
    let h = 0
    let raf = 0
    let last = performance.now()
    const cam = { yaw: -0.5, elev: ELEV_3D, drag: null }

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      w = wrap.current.clientWidth
      h = Math.round(Math.min(w * 1.08, props.current.maxHeight))
      cv.width = Math.round(w * dpr)
      cv.height = Math.round(h * dpr)
      cv.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(wrap.current)
    resize()

    const down = (e) => {
      if (props.current.view !== '3d') return
      cam.drag = { x: e.clientX, yaw: cam.yaw }
      cv.setPointerCapture(e.pointerId)
    }
    const move = (e) => {
      if (cam.drag) cam.yaw = cam.drag.yaw + (e.clientX - cam.drag.x) * 0.008
    }
    const up = () => {
      cam.drag = null
    }
    cv.addEventListener('pointerdown', down)
    cv.addEventListener('pointermove', move)
    cv.addEventListener('pointerup', up)
    cv.addEventListener('pointercancel', up)

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const P = props.current

      // Camera: drift slowly in 3D; sweep up to a bird's-eye view with C at the top.
      if (P.view === 'top') {
        cam.elev += (ELEV_TOP - cam.elev) * (1 - Math.exp(-dt / 0.55))
        const home = Math.round(cam.yaw / (Math.PI * 2)) * Math.PI * 2
        cam.yaw += (home - cam.yaw) * (1 - Math.exp(-dt / 0.6))
      } else {
        cam.elev += (ELEV_3D - cam.elev) * (1 - Math.exp(-dt / 0.55))
        if (!cam.drag && !reduced) cam.yaw += SPIN * dt
      }
      const top = clamp01((cam.elev - ELEV_3D) / (ELEV_TOP - ELEV_3D))
      const sinE = Math.sin(cam.elev)
      const cosE = Math.cos(cam.elev)
      const persp = cosE * 0.22
      const scale = lerp(Math.min(w / 3.2, h / 3.75), Math.min(w, h) / 3.75, top)
      const cx = w / 2
      const cy = h / 2
      const drift = 1 - P.tune

      const place = (k, extra = 0) => {
        const theta = k * (Math.PI / 6 + TURN_DRIFT * drift) + cam.yaw
        const r = 1 + RADIUS_DRIFT * k * drift + extra
        const z = (k - (STEPS - 1) / 2) * RISE
        const x = r * Math.sin(theta)
        const y = r * Math.cos(theta)
        const upness = y * sinE + z * cosE
        const depth = -y * cosE + z * sinE
        const p = 1 + persp * depth
        return { x: cx + x * scale * p, y: cy - upness * scale * p, depth, p }
      }
      const fade = (depth) => lerp(0.3 + 0.7 * clamp01((depth + 1.3) / 2.6), 1, top)
      const ghostFade = (k) => (k < SPIRAL_SLOTS ? 1 : Math.max(0.12, 1 - ((k - SPIRAL_SLOTS + 1) / (SPIRAL_GHOSTS + 1)) * 0.9))

      ctx.clearRect(0, 0, w, h)

      // The circle the spiral "wants" to be, drawn faintly under it.
      ctx.setLineDash([2, 5])
      ctx.lineWidth = 1
      ctx.strokeStyle = `rgba(${GREY}, ${lerp(0.35, 0.45, top)})`
      ctx.beginPath()
      for (let i = 0; i <= 96; i++) {
        const a = (i / 96) * Math.PI * 2 + cam.yaw
        const z = (-(STEPS - 1) / 2) * RISE
        const upness = Math.cos(a) * sinE + z * cosE
        const depth = -Math.cos(a) * cosE + z * sinE
        const p = 1 + persp * depth
        const X = cx + Math.sin(a) * scale * p
        const Y = cy - upness * scale * p
        i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y)
      }
      ctx.stroke()
      ctx.setLineDash([])

      // The spiral itself: dark where the chain has already reached.
      let prev = place(0)
      for (let u = 0.1; u <= STEPS - 1 + 1e-6; u += 0.1) {
        const pt = place(u)
        const walked = u <= P.filled - 1 + 1e-6
        const a = fade((pt.depth + prev.depth) / 2) * ghostFade(Math.floor(u))
        ctx.strokeStyle = walked ? `rgba(${INK}, ${0.7 * a})` : `rgba(${GREY}, ${0.55 * a})`
        ctx.lineWidth = walked ? 1.6 : 1
        ctx.beginPath()
        ctx.moveTo(prev.x, prev.y)
        ctx.lineTo(pt.x, pt.y)
        ctx.stroke()
        prev = pt
      }

      // The comma: a short line from C to B♯.
      if (P.highlight.includes(0) && P.highlight.includes(12)) {
        const a = place(0)
        const b = place(12)
        ctx.strokeStyle = `rgba(${COMMA}, 0.8)`
        ctx.lineWidth = 1.4
        ctx.setLineDash([3, 3])
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Slots, back to front.
      const slots = []
      for (let k = 0; k < STEPS; k++) slots.push({ k, ...place(k) })
      slots.sort((a, b) => a.depth - b.depth)
      for (const s of slots) {
        const { k } = s
        const ghost = k >= SPIRAL_SLOTS
        const isFilled = !ghost && k < P.filled
        const alpha = fade(s.depth) * ghostFade(k)
        const hot = P.highlight.includes(k)
        const col = hot ? COMMA : INK
        const size = (ghost ? 4 : 8.5) * s.p

        const since = fillTimes.current[k] != null ? (now - fillTimes.current[k]) / 1000 : 99
        if (isFilled && since < 1.6) {
          const g = 1 - since / 1.6
          const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 34 * s.p)
          halo.addColorStop(0, `rgba(${ACCENT}, ${0.35 * g})`)
          halo.addColorStop(1, `rgba(${ACCENT}, 0)`)
          ctx.fillStyle = halo
          ctx.beginPath()
          ctx.arc(s.x, s.y, 34 * s.p, 0, Math.PI * 2)
          ctx.fill()
        }
        if (k === P.next) {
          const ph = (now / 1700) % 1
          ctx.strokeStyle = `rgba(${ACCENT}, ${0.55 * (1 - ph)})`
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.arc(s.x, s.y, size + 2 + ph * 12, 0, Math.PI * 2)
          ctx.stroke()
        }

        ctx.beginPath()
        ctx.arc(s.x, s.y, size, 0, Math.PI * 2)
        if (isFilled) {
          ctx.fillStyle = `rgba(${col}, ${alpha})`
          ctx.fill()
        } else {
          // Ghosts are outlines only, so they never hide the notes they land on.
          if (!ghost) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
            ctx.fill()
          }
          ctx.lineWidth = k === P.next ? 1.5 : 1.1
          // Ghost rings fade away as they come to rest on real notes.
          ctx.strokeStyle = k === P.next ? `rgba(${ACCENT}, 0.9)` : `rgba(${GREY}, ${ghost ? alpha * drift : alpha})`
          ctx.stroke()
        }

        if (isFilled || ghost) {
          // Labels sit just outside the spiral; from above, each lap gets its own ring.
          const lap = Math.floor(k / 12)
          const l = place(k, 0.26 + top * 0.24 * lap)
          const fs = Math.round((ghost ? 14 : 19) * lerp(s.p, 1, 0.5))
          ctx.font = `${ghost ? 'italic ' : ''}500 ${fs}px ${SERIF}`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = `rgba(${hot ? COMMA : ghost ? GREY : INK}, ${alpha})`
          ctx.fillText(noteLabel(fifthName(k), P.lang), l.x, l.y)
        }
      }

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      cv.removeEventListener('pointerdown', down)
      cv.removeEventListener('pointermove', move)
      cv.removeEventListener('pointerup', up)
      cv.removeEventListener('pointercancel', up)
    }
  }, [])

  return (
    <figure className="spiral" ref={wrap}>
      <canvas ref={canvas} className={view === '3d' ? 'is-draggable' : ''} aria-label={t('spiral')} role="img" />
      <figcaption className="tour-caption">
        {t('spiral')}
        {view === '3d' && <span className="tour-caption-hint"> · {t('dragHint')}</span>}
      </figcaption>
    </figure>
  )
}
