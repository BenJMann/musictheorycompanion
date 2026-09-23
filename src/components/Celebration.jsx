import { useEffect, useRef } from 'react'

const NEON = ['#00e5ff', '#ff2bd6', '#b6ff3b', '#ffb020', '#8b5cff', '#ff4d6d']

const MESSAGES = {
  perfect: { title: 'PERFECT!', sub: 'Every single answer right. Flawless mix.' },
  allwrong: {
    title: 'ALL WRONG — AND THAT RULES!',
    sub: "Zero right means you're still in there trying. That's exactly how learning sounds. Hit Try again!",
  },
}

/**
 * Full-screen celebration. "perfect" gets a big confetti burst;
 * "allwrong" gets an even brighter one: rainbow strobe, fireworks and more of everything.
 */
export default function Celebration({ kind, onDone }) {
  const canvasRef = useRef(null)
  const bright = kind === 'allwrong'
  const duration = bright ? 5200 : 4000

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)
    const W = () => window.innerWidth
    const H = () => window.innerHeight

    const particles = []
    const colorFor = () =>
      bright ? `hsl(${Math.floor(Math.random() * 360)}, 100%, ${60 + Math.random() * 15}%)` : NEON[Math.floor(Math.random() * NEON.length)]

    const burst = (x, y, count, speed, spread = Math.PI * 2, angle = 0) => {
      for (let i = 0; i < count; i++) {
        const a = angle + (Math.random() - 0.5) * spread
        const v = speed * (0.4 + Math.random() * 0.8)
        particles.push({
          x,
          y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          size: 4 + Math.random() * (bright ? 8 : 6),
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.3,
          color: colorFor(),
          life: 1,
          decay: 0.004 + Math.random() * 0.006,
          shape: Math.random() < 0.5 ? 'rect' : Math.random() < 0.5 ? 'circle' : 'star',
        })
      }
    }

    // Side cannons
    const cannons = () => {
      burst(0, H() * 0.8, bright ? 160 : 110, 18, 0.9, -Math.PI / 3)
      burst(W(), H() * 0.8, bright ? 160 : 110, 18, 0.9, (-Math.PI * 2) / 3)
    }
    cannons()
    const timers = [setTimeout(cannons, 700)]
    if (bright) {
      // Fireworks all over the screen
      for (let i = 0; i < 9; i++) {
        timers.push(
          setTimeout(() => burst(W() * (0.15 + Math.random() * 0.7), H() * (0.15 + Math.random() * 0.45), 90, 11), 250 + i * 380),
        )
      }
      timers.push(setTimeout(cannons, 1600))
    } else {
      timers.push(setTimeout(() => burst(W() / 2, H() * 0.35, 140, 13), 300))
    }

    const drawStar = (r) => {
      ctx.beginPath()
      for (let i = 0; i < 10; i++) {
        const rr = i % 2 ? r / 2.2 : r
        const a = (i * Math.PI) / 5
        ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
      }
      ctx.closePath()
      ctx.fill()
    }

    let raf
    const tick = () => {
      ctx.clearRect(0, 0, W(), H())
      ctx.globalCompositeOperation = 'lighter'
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.vy += 0.28
        p.vx *= 0.985
        p.vy *= 0.985
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        p.life -= p.decay
        if (p.life <= 0 || p.y > H() + 40) {
          particles.splice(i, 1)
          continue
        }
        ctx.save()
        ctx.globalAlpha = Math.min(1, p.life * 1.5)
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        else if (p.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2.5, 0, Math.PI * 2)
          ctx.fill()
        } else drawStar(p.size / 1.6)
        ctx.restore()
      }
      raf = requestAnimationFrame(tick)
    }
    tick()

    const end = setTimeout(onDone, duration)
    return () => {
      cancelAnimationFrame(raf)
      timers.forEach(clearTimeout)
      clearTimeout(end)
      window.removeEventListener('resize', resize)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const msg = MESSAGES[kind]
  return (
    <div className={`celebration celebration-${kind}`} onClick={onDone} style={{ '--dur': `${duration}ms` }}>
      <div className="celebration-flash" />
      <canvas ref={canvasRef} className="celebration-canvas" />
      <div className="celebration-text">
        <div className="celebration-title">{msg.title}</div>
        <div className="celebration-sub">{msg.sub}</div>
        <div className="celebration-dismiss">click anywhere to close</div>
      </div>
    </div>
  )
}
