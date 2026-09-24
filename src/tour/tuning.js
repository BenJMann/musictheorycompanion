// Tuning maths for the guided tour.
//
// A note on the monochord is { k, e }: k divisions into thirds and e halvings of the
// whole string. Its frequency is C3 · 3^k · 2^e and its length is 1 / (3^k · 2^e),
// so every Pythagorean pitch is exact.

export const C3 = 130.8128 // the whole string
export const C4 = C3 * 2 // bottom of the octave target
export const MIN_LENGTH = 1 / 16

export const PURE_FIFTH_CENTS = 1200 * Math.log2(3 / 2) // 701.955…
export const COMMA_CENTS = 12 * PURE_FIFTH_CENTS - 7 * 1200 // 23.46…
export const SPIRAL_SLOTS = 13 // C … B♯
export const SPIRAL_GHOSTS = 5 // F𝄪 … A𝄪, fading out

const EPS = 1e-9

export const ratio = ({ k, e }) => 3 ** k * 2 ** e
export const freqOf = (n) => C3 * ratio(n)
export const lengthOf = (n) => 1 / ratio(n)
/** Octaves above C4: the note is inside the target when 0 ≤ pos < 1. */
export const posOf = (n) => Math.log2(freqOf(n) / C4)
export const inOctave = (pos) => pos > -EPS && pos < 1 - EPS
export const fitsString = (n) => lengthOf(n) <= 1 + EPS && lengthOf(n) >= MIN_LENGTH - EPS

/** The halvings e that put k fifths above C inside the target octave. */
export const foldE = (k) => 1 - Math.floor(k * Math.log2(3) + EPS)
export const folded = (k) => ({ k, e: foldE(k) })

/** "2/3" style fraction for the vibrating part of the string. */
export function lengthFraction({ k, e }) {
  const num = (k < 0 ? 3 ** -k : 1) * (e < 0 ? 2 ** -e : 1)
  const den = (k > 0 ? 3 ** k : 1) * (e > 0 ? 2 ** e : 1)
  return den === 1 ? String(num) : `${num}/${den}`
}

const LETTERS = 'FCGDAEB'
/** Name of the note k pure fifths above C: G, D … B#, F## (and F, Bb … below). */
export function fifthName(k) {
  const p = k + 1
  const letter = LETTERS[((p % 7) + 7) % 7]
  const acc = Math.floor(p / 7)
  return letter + (acc > 0 ? '#'.repeat(acc) : 'b'.repeat(-acc))
}

const SOLFEGE = { C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' }
const ACCIDENTALS = { '': '', '#': '♯', '##': '𝄪', b: '♭', bb: '𝄫' }
/** Display a note name: "C#" → "C♯" in English, "Do♯" in Spanish. */
export const noteLabel = (name, lang) =>
  (lang === 'es' ? SOLFEGE[name[0]] : name[0]) + ACCIDENTALS[name.slice(1)]

/**
 * Pitch of spiral slot k folded into the octave above C4, for a fifth of the given size.
 * Pure fifths (701.96 cents) give Pythagorean tuning, 700 cents give equal temperament.
 */
export function spiralFreq(k, fifthCents) {
  const octaves = (k * fifthCents) / 1200
  const frac = octaves - Math.floor(octaves + EPS)
  return C4 * 2 ** Math.max(0, frac)
}
