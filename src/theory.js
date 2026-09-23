// Music theory data used by the exercises.

export const COLORS = {
  cyan: '#00e5ff',
  magenta: '#ff2bd6',
  lime: '#b6ff3b',
  amber: '#ffb020',
  violet: '#8b5cff',
  coral: '#ff5e5e',
}

// Major scale: semitones from the root, scale degree and the mode built on that degree.
export const MAJOR_SCALE = [
  { semitones: 0, degree: '1', name: 'Root / Unison', mode: 'Ionian' },
  { semitones: 2, degree: '2', name: 'Major 2nd', mode: 'Dorian' },
  { semitones: 4, degree: '3', name: 'Major 3rd', mode: 'Phrygian' },
  { semitones: 5, degree: '4', name: 'Perfect 4th', mode: 'Lydian' },
  { semitones: 7, degree: '5', name: 'Perfect 5th', mode: 'Mixolydian' },
  { semitones: 9, degree: '6', name: 'Major 6th', mode: 'Aeolian' },
  { semitones: 11, degree: '7', name: 'Major 7th', mode: 'Locrian' },
]

// Every chromatic interval within an octave. The tritone has two correct names.
export const CHROMATIC_INTERVALS = [
  { semitones: 0, answers: [['Perfect', 'Unison']] },
  { semitones: 1, answers: [['Minor', '2nd']] },
  { semitones: 2, answers: [['Major', '2nd']] },
  { semitones: 3, answers: [['Minor', '3rd']] },
  { semitones: 4, answers: [['Major', '3rd']] },
  { semitones: 5, answers: [['Perfect', '4th']] },
  { semitones: 6, answers: [['Augmented', '4th'], ['Diminished', '5th']] },
  { semitones: 7, answers: [['Perfect', '5th']] },
  { semitones: 8, answers: [['Minor', '6th']] },
  { semitones: 9, answers: [['Major', '6th']] },
  { semitones: 10, answers: [['Minor', '7th']] },
  { semitones: 11, answers: [['Major', '7th']] },
  { semitones: 12, answers: [['Perfect', 'Octave']] },
]
export const QUALITIES = ['Perfect', 'Major', 'Minor', 'Augmented', 'Diminished']
export const INTERVAL_NUMBERS = ['Unison', '2nd', '3rd', '4th', '5th', '6th', '7th', 'Octave']

// Chromatic scale
export const CHROMATIC_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
export const CHROMATIC_FLATS_DESC = ['C', 'B', 'Bb', 'A', 'Ab', 'G', 'Gb', 'F', 'E', 'Eb', 'D', 'Db']
export const NOTE_BANK = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'E#', 'Fb', 'F', 'F#', 'Gb',
  'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B', 'B#', 'Cb',
]
const SOLFEGE = { C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' }
// Spanish uses fixed-do note names (Do, Re, Mi …).
export const prettyNote = (n, lang = 'en') =>
  (lang === 'es' ? SOLFEGE[n[0]] : n[0]) + (n[1] === '#' ? '♯' : n[1] === 'b' ? '♭' : '')

// Scale-degree intervals. "tt" is the tritone, written ♭5 or ♯4.
export const INTERVAL_LABELS = {
  1: '1', b2: '♭2', 2: '2', b3: '♭3', 3: '3', 4: '4', tt: '♭5/♯4',
  5: '5', b6: '♭6', 6: '6', b7: '♭7', 7: '7',
}
// Clockwise around the circle of fifths, starting with 1 at the top.
export const CIRCLE_ORDER = ['1', '5', '2', '6', '3', '7', 'tt', 'b2', 'b6', 'b3', 'b7', '4']

// Label for an interval in a given formula position (index 3 is the 4th, index 4 the 5th).
export const intervalLabelAt = (value, index) =>
  value === 'tt' ? (index === 3 ? '♯4' : index === 4 ? '♭5' : '♭5/♯4') : INTERVAL_LABELS[value]

// The modes in circle-of-fifths order, brightest to darkest.
export const MODES = [
  { name: 'Lydian', formula: ['1', '2', '3', 'tt', '5', '6', '7'] },
  { name: 'Ionian', formula: ['1', '2', '3', '4', '5', '6', '7'] },
  { name: 'Mixolydian', formula: ['1', '2', '3', '4', '5', '6', 'b7'] },
  { name: 'Dorian', formula: ['1', '2', 'b3', '4', '5', '6', 'b7'] },
  { name: 'Aeolian', formula: ['1', '2', 'b3', '4', '5', 'b6', 'b7'] },
  { name: 'Phrygian', formula: ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'] },
  { name: 'Locrian', formula: ['1', 'b2', 'b3', '4', 'tt', 'b6', 'b7'] },
]

// Colour for each interval tile: naturals cool, flats/tritone hot.
export const intervalColor = (v) =>
  v === 'tt' ? COLORS.coral : v.startsWith('b') ? COLORS.magenta : v === '1' ? COLORS.lime : COLORS.cyan

/* ───────── Spanish names ───────── */

const MODE_ES = {
  Ionian: 'Jónico',
  Dorian: 'Dórico',
  Phrygian: 'Frigio',
  Lydian: 'Lidio',
  Mixolydian: 'Mixolidio',
  Aeolian: 'Eólico',
  Locrian: 'Locrio',
}
export const modeName = (m, lang) => (lang === 'es' ? MODE_ES[m] : m)

const DEGREE_NAME_ES = {
  1: 'Tónica / Unísono',
  2: '2ª mayor',
  3: '3ª mayor',
  4: '4ª justa',
  5: '5ª justa',
  6: '6ª mayor',
  7: '7ª mayor',
}
export const degreeName = (d, lang) => (lang === 'es' ? DEGREE_NAME_ES[d.degree] : d.name)

const QUALITY_ES = { Perfect: 'Justa', Major: 'Mayor', Minor: 'Menor', Augmented: 'Aumentada', Diminished: 'Disminuida' }
const NUMBER_ES = {
  Unison: 'Unísono', '2nd': '2ª', '3rd': '3ª', '4th': '4ª', '5th': '5ª', '6th': '6ª', '7th': '7ª', Octave: 'Octava',
}
export const qualityName = (q, lang) => (lang === 'es' ? QUALITY_ES[q] : q)
export const numberName = (n, lang) => (lang === 'es' ? NUMBER_ES[n] : n)
// Full interval name: "Minor 3rd" in English, "3ª menor" in Spanish (unison is masculine: "Unísono justo").
export const intervalName = (q, n, lang) => {
  if (lang !== 'es') return `${q} ${n}`
  const quality = n === 'Unison' && q === 'Perfect' ? 'justo' : QUALITY_ES[q].toLowerCase()
  return `${NUMBER_ES[n]} ${quality}`
}
