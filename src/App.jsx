import { useEffect, useState } from 'react'
import MajorDegrees from './exercises/MajorDegrees.jsx'
import ChromaticIntervals from './exercises/ChromaticIntervals.jsx'
import ChromaticScale from './exercises/ChromaticScale.jsx'
import CircleOrder from './exercises/CircleOrder.jsx'
import { ModeChart, ModeSingle } from './exercises/ModeFormulas.jsx'
import TuningTour from './tour/TuningTour.jsx'
import { ModesOfKeys, RootsOfModes } from './exercises/section2/NaturalKeyModes.jsx'
import WorkOutKey from './exercises/section2/WorkOutKey.jsx'
import ModeNotes from './exercises/section2/ModeNotes.jsx'
import ModeSounds from './exercises/section2/ModeSounds.jsx'
import { COLORS } from './theory.js'
import { LANGUAGES, LangContext, LanguageToggle, useLang } from './i18n.jsx'

const SECTION1_BLOCKS = [
  {
    name: 'block0',
    subtitle: 'block0Sub',
    exercises: [
      {
        id: 'tuning-tour',
        title: 'exTourTitle',
        blurb: 'exTourBlurb',
        accent: '#f4f1ea',
        Component: TuningTour,
      },
    ],
  },
  {
    name: 'block1',
    subtitle: 'block1Sub',
    exercises: [
      {
        id: 'major-degrees',
        title: 'exMajorTitle',
        blurb: 'exMajorBlurb',
        accent: COLORS.cyan,
        Component: MajorDegrees,
      },
      {
        id: 'chromatic-intervals',
        title: 'exChromIntTitle',
        blurb: 'exChromIntBlurb',
        accent: COLORS.violet,
        Component: ChromaticIntervals,
      },
    ],
  },
  {
    name: 'block2',
    subtitle: 'block2Sub',
    exercises: [
      {
        id: 'chromatic-scale',
        title: 'exChromScaleTitle',
        blurb: 'exChromScaleBlurb',
        accent: COLORS.magenta,
        Component: ChromaticScale,
      },
    ],
  },
  {
    name: 'block3',
    subtitle: 'block3Sub',
    exercises: [
      {
        id: 'circle-order',
        title: 'exCircleTitle',
        blurb: 'exCircleBlurb',
        accent: COLORS.lime,
        Component: CircleOrder,
      },
      {
        id: 'mode-chart',
        title: 'exModeChartTitle',
        blurb: 'exModeChartBlurb',
        accent: COLORS.amber,
        Component: ModeChart,
      },
      {
        id: 'mode-single',
        title: 'exModeSingleTitle',
        blurb: 'exModeSingleBlurb',
        accent: COLORS.coral,
        Component: ModeSingle,
      },
    ],
  },
]

const SECTION2_BLOCKS = [
  {
    name: 'block1',
    subtitle: 's2block1Sub',
    exercises: [
      {
        id: 'modes-of-keys',
        title: 'exModesOfKeysTitle',
        blurb: 'exModesOfKeysBlurb',
        accent: COLORS.cyan,
        Component: ModesOfKeys,
      },
      {
        id: 'roots-of-modes',
        title: 'exRootsOfModesTitle',
        blurb: 'exRootsOfModesBlurb',
        accent: COLORS.violet,
        Component: RootsOfModes,
      },
    ],
  },
  {
    name: 'block2',
    subtitle: 's2block2Sub',
    exercises: [
      {
        id: 'work-out-key',
        title: 'exWorkOutKeyTitle',
        blurb: 'exWorkOutKeyBlurb',
        accent: COLORS.magenta,
        Component: WorkOutKey,
      },
    ],
  },
  {
    name: 'block3',
    subtitle: 's2block3Sub',
    exercises: [
      {
        id: 'mode-notes',
        title: 'exModeNotesTitle',
        blurb: 'exModeNotesBlurb',
        accent: COLORS.amber,
        Component: ModeNotes,
      },
    ],
  },
  {
    name: 'block4',
    subtitle: 's2block4Sub',
    exercises: [
      {
        id: 'mode-sounds',
        title: 'exModeSoundsTitle',
        blurb: 'exModeSoundsBlurb',
        accent: COLORS.lime,
        Component: ModeSounds,
      },
    ],
  },
]

const SECTIONS = [
  { id: 's1', name: 'section1', subtitle: 'section1Sub', accent: COLORS.cyan, blocks: SECTION1_BLOCKS },
  { id: 's2', name: 'section2', subtitle: 'section2Sub', accent: COLORS.magenta, blocks: SECTION2_BLOCKS },
]

export default function App() {
  // No language yet means the language selection screen is shown first.
  const [lang, setLang] = useState(null)
  useEffect(() => {
    if (lang) document.documentElement.lang = lang
  }, [lang])
  return (
    <LangContext.Provider value={{ lang: lang ?? 'en', setLang }}>
      {lang ? (
        <>
          <div className="topbar">
            <LanguageToggle />
          </div>
          <Main />
        </>
      ) : (
        <LanguageSelect onChoose={setLang} />
      )}
    </LangContext.Provider>
  )
}

function LanguageSelect({ onChoose }) {
  return (
    <div className="lang-select">
      <div className="logo logo-big" aria-hidden>
        <span className="logo-dot" />
      </div>
      <h1 className="app-title">
        Music theory practice companion
        <span className="lang-select-alt">Compañero de práctica de teoría musical</span>
      </h1>
      <p className="lang-select-prompt">
        Choose your language <span className="muted">·</span> Elige tu idioma
      </p>
      <div className="lang-select-options">
        {LANGUAGES.map((l, i) => (
          <button
            key={l.code}
            className="lang-card"
            style={{ '--accent': i === 0 ? COLORS.cyan : COLORS.magenta }}
            onClick={() => onChoose(l.code)}
          >
            <span className="lang-card-code">{l.short}</span>
            <span className="lang-card-name">{l.name}</span>
          </button>
        ))}
      </div>
      <p className="lang-select-note">
        You can switch at any time with the button at the top of the screen.
        <br />
        Puedes cambiarlo en cualquier momento con el botón de la parte superior.
      </p>
    </div>
  )
}

function Main() {
  const { t } = useLang()
  const [sectionId, setSectionId] = useState('s1')
  const [current, setCurrent] = useState(null)
  const section = SECTIONS.find((s) => s.id === sectionId)

  if (current) {
    const block = section.blocks.find((b) => b.exercises.includes(current))
    const { Component } = current
    return (
      <div className="app">
        <Component
          onBack={() => setCurrent(null)}
          meta={{
            title: t(current.title),
            block: `${t(section.name)} · ${t(block.name)} · ${t(block.subtitle)}`,
            accent: current.accent,
          }}
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
          <h1 className="app-title">{t('appTitle')}</h1>
          <p className="app-subtitle">{t('appSubtitle')}</p>
        </div>
        <div className="meter" aria-hidden>
          {Array.from({ length: 16 }, (_, i) => (
            <span key={i} style={{ animationDelay: `${(i * 137) % 900}ms` }} />
          ))}
        </div>
      </header>

      <div className="menu-layout">
        <nav className="section-nav" aria-label={t('sections')}>
          <div className="panel-label">{t('sections')}</div>
          {SECTIONS.map((s, i) => {
            const count = s.blocks.reduce((sum, b) => sum + b.exercises.length, 0)
            return (
              <button
                key={s.id}
                className={`section-item ${s.id === sectionId ? 'is-active' : ''}`}
                style={{ '--accent': s.accent }}
                aria-current={s.id === sectionId ? 'page' : undefined}
                onClick={() => setSectionId(s.id)}
              >
                <span className="section-num">{i + 1}</span>
                <span className="section-body">
                  <span className="section-name">{t(s.name)}</span>
                  <span className="section-sub">{t(s.subtitle)}</span>
                  <span className="section-count">{t('exerciseCount', { n: count })}</span>
                </span>
              </button>
            )
          })}
        </nav>

        <main className="menu" key={sectionId}>
          {section.blocks.map((b) => (
            <section key={b.name} className="menu-block">
              <div className="menu-block-head">
                <span className="block-tag">{t(b.name)}</span>
                <span className="menu-block-sub">{t(b.subtitle)}</span>
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
                        <span className="track-title">{t(ex.title)}</span>
                        <span className="track-blurb">{t(ex.blurb)}</span>
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
    </div>
  )
}
