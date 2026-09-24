// A small Web Audio synth with a soft, plucked-string tone.

let ctx = null
let master = null
let wave = null

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.55
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -18
    master.connect(comp)
    comp.connect(ctx.destination)
    // Harmonics falling away like a nylon string's.
    const n = 14
    const real = new Float32Array(n)
    const imag = new Float32Array(n)
    for (let i = 1; i < n; i++) imag[i] = (i % 2 ? 1 : 0.6) / i ** 1.7
    wave = ctx.createPeriodicWave(real, imag)
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// High notes sound louder than low ones at the same level, so tame them a little.
const loudness = (freq) => Math.min(1, (330 / freq) ** 0.35)

/**
 * Play one note. `sustain` keeps it ringing (for hearing two notes beat against each other);
 * otherwise it decays like a plucked string.
 */
export function playNote(freq, { when = 0, dur = 1.8, gain = 0.3, sustain = false } = {}) {
  const c = audio()
  if (!c) return
  const t = c.currentTime + 0.02 + when
  const peak = gain * loudness(freq)

  const osc = c.createOscillator()
  osc.setPeriodicWave(wave)
  osc.frequency.value = freq

  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.setValueAtTime(Math.min(freq * 9, 14000), t)
  lp.frequency.exponentialRampToValueAtTime(Math.max(freq * (sustain ? 3 : 1.5), 400), t + dur)

  const g = c.createGain()
  g.gain.setValueAtTime(0, t)
  if (sustain) {
    g.gain.linearRampToValueAtTime(peak, t + 0.06)
    g.gain.exponentialRampToValueAtTime(peak * 0.7, t + dur - 0.5)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  } else {
    g.gain.linearRampToValueAtTime(peak, t + 0.006)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  }

  osc.connect(lp).connect(g).connect(master)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

/** Several notes one after another. */
export function playSequence(freqs, { gap = 0.42, ...opts } = {}) {
  freqs.forEach((f, i) => playNote(f, { when: i * gap, ...opts }))
}

/** Several notes at once, held so any beating can be heard. */
export function playTogether(freqs, { dur = 4, gain = 0.22 } = {}) {
  freqs.forEach((f) => playNote(f, { dur, gain, sustain: true }))
}

/** A held drone whose pitches can be changed while it sounds. */
export function startDrone(freqs) {
  const c = audio()
  if (!c) return { set() {}, stop() {} }
  const out = c.createGain()
  out.gain.setValueAtTime(0, c.currentTime)
  out.gain.linearRampToValueAtTime(0.2, c.currentTime + 0.4)
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 1400
  lp.connect(out).connect(master)
  const oscs = freqs.map((f) => {
    const o = c.createOscillator()
    o.setPeriodicWave(wave)
    o.frequency.value = f
    o.connect(lp)
    o.start()
    return o
  })
  return {
    set(next) {
      next.forEach((f, i) => oscs[i]?.frequency.setTargetAtTime(f, c.currentTime, 0.03))
    },
    stop() {
      const now = c.currentTime
      out.gain.cancelScheduledValues(now)
      out.gain.setValueAtTime(out.gain.value, now)
      out.gain.linearRampToValueAtTime(0, now + 0.3)
      oscs.forEach((o) => o.stop(now + 0.35))
    },
  }
}
