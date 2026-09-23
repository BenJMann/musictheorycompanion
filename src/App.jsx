import { useState } from 'react'
import MajorDegrees from './exercises/MajorDegrees.jsx'
import ChromaticIntervals from './exercises/ChromaticIntervals.jsx'
import ChromaticScale from './exercises/ChromaticScale.jsx'
import CircleOrder from './exercises/CircleOrder.jsx'
import { ModeChart, ModeSingle } from './exercises/ModeFormulas.jsx'
import { COLORS } from './theory.js'

const BLOCKS = [
  {
    name: 'Block 1',
    subtitle: 'Intervals & mode names',
    exercises: [
      {
        id: 'major-degrees',
        title: 'Major tone degrees and mode names',
        blurb: 'How many semitones is each major scale degree from the root — and which mode starts there?',
        accent: COLORS.cyan,
        Component: MajorDegrees,
      },
      {
        id: 'chromatic-intervals',
        title: 'Semitones to chromatic intervals',
        blurb: 'Name every interval in the octave: major, minor, perfect, augmented or diminished.',
        accent: COLORS.violet,
        Component: ChromaticIntervals,
      },
    ],
  },
  {
    name: 'Block 2',
    subtitle: 'Notes in order',
    exercises: [
      {
        id: 'chromatic-scale',
        title: 'The Chromatic Scale',
        blurb: 'Put all 12 semitones in order, placing the sharps in the right spots. Beware the decoy notes.',
        accent: COLORS.magenta,
        Component: ChromaticScale,
      },
    ],
  },
  {
    name: 'Block 3',
    subtitle: 'The circle of fifths & mode formulas',
    exercises: [
      {
        id: 'circle-order',
        title: 'Becoming familiar with the order of the circle of fifths',
        blurb: 'Drag the jumbled interval names into their places around the circle.',
        accent: COLORS.lime,
        Component: CircleOrder,
      },
      {
        id: 'mode-chart',
        title: 'The mode formulas through the circle of fifths',
        blurb: 'Complete the mode chart one row at a time, dragging intervals from the circle.',
        accent: COLORS.amber,
        Component: ModeChart,
      },
      {
        id: 'mode-single',
        title: 'Individual mode formula practice',
        blurb: 'One mode, no chart. Build its formula from the circle of fifths.',
        accent: COLORS.coral,
        Component: ModeSingle,
      },
    ],
  },
]

export default function App() {
  const [current, setCurrent] = useState(null)

  if (current) {
    const block = BLOCKS.find((b) => b.exercises.includes(current))
    const { Component } = current
    return (
      <div className="app">
        <Component
          onBack={() => setCurrent(null)}
          meta={{ title: current.title, block: `${block.name} · ${block.subtitle}`, accent: current.accent }}
        />
      </div>
    )
  }

  let n = 0
  return (
    <div className="app">
      <header className="app-header">
        <div className="logo" aria-hidden>
          <span className="logo-dot" />
        </div>
        <div>
          <h1 className="app-title">Music theory practice companion</h1>
          <p className="app-subtitle">Choose an exercise to start practising.</p>
        </div>
        <div className="meter" aria-hidden>
          {Array.from({ length: 16 }, (_, i) => (
            <span key={i} style={{ animationDelay: `${(i * 137) % 900}ms` }} />
          ))}
        </div>
      </header>

      <main className="menu">
        {BLOCKS.map((b) => (
          <section key={b.name} className="menu-block">
            <div className="menu-block-head">
              <span className="block-tag">{b.name}</span>
              <span className="menu-block-sub">{b.subtitle}</span>
            </div>
            <div className="menu-tracks">
              {b.exercises.map((ex) => {
                n += 1
                return (
                  <button
                    key={ex.id}
                    className="track"
                    style={{ '--accent': ex.accent }}
                    onClick={() => setCurrent(ex)}
                  >
                    <span className="track-num">{String(n).padStart(2, '0')}</span>
                    <span className="track-body">
                      <span className="track-title">{ex.title}</span>
                      <span className="track-blurb">{ex.blurb}</span>
                    </span>
                    <span className="track-play" aria-hidden>
                      ▶
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
