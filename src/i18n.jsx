import { createContext, useContext } from 'react'

export const LANGUAGES = [
  { code: 'en', short: 'EN', name: 'English' },
  { code: 'es', short: 'ES', name: 'Español' },
]

// Interface text. Exercise instructions live next to each exercise.
const STRINGS = {
  en: {
    appTitle: 'Music theory practice companion',
    appSubtitle: 'Choose an exercise to start practising.',
    chooseLanguage: 'Choose your language',
    chooseLanguageSub: 'You can switch at any time with the button at the top of the screen.',
    language: 'Language',

    block0: 'Block 0',
    block0Sub: 'Where our notes come from',
    exTourTitle: 'How our notes were chosen: a guided tour',
    exTourBlurb: 'From a single string to the circle of fifths: octaves, Pythagoras, the spiral of fifths and equal temperament.',
    block1: 'Block 1',
    block1Sub: 'Intervals & mode names',
    block2: 'Block 2',
    block2Sub: 'Notes in order',
    block3: 'Block 3',
    block3Sub: 'The circle of fifths & mode formulas',
    exMajorTitle: 'Major tone degrees and mode names',
    exMajorBlurb: 'How many semitones is each major scale degree from the root — and which mode starts there?',
    exChromIntTitle: 'Semitones to chromatic intervals',
    exChromIntBlurb: 'Name every interval in the octave: major, minor, perfect, augmented or diminished.',
    exChromScaleTitle: 'The Chromatic Scale',
    exChromScaleBlurb: 'Put all 12 semitones in order, placing the sharps in the right spots. Beware the decoy notes.',
    exCircleTitle: 'Becoming familiar with the order of the circle of fifths',
    exCircleBlurb: 'Drag the jumbled interval names into their places around the circle.',
    exModeChartTitle: 'The mode formulas through the circle of fifths',
    exModeChartBlurb: 'Complete the mode chart one row at a time, dragging intervals from the circle.',
    exModeSingleTitle: 'Individual mode formula practice',
    exModeSingleBlurb: 'One mode, no chart. Build its formula from the circle of fifths.',

    backToExercises: 'Exercises',
    howTo: 'How to do this exercise',
    tipPlacingLabel: 'Placing tiles:',
    tipPlacing: 'drag a tile into a box — or click a tile, then click a box.',
    tipFixingLabel: 'Fixing a mistake:',
    tipFixingA: 'click the',
    tipFixingB: 'on any filled box to remove just that tile, drag it back to the bank, or drag it onto another box to swap.',
    clearAll: 'Clear all',
    ready: 'Ready when you are.',
    fillAll: 'Fill every empty box to submit.',
    submit: 'Submit',
    correctOf: '/ {total} correct',
    showAnswers: 'Show answers',
    hideAnswers: 'Hide answers',
    tryAgain: 'Try again',
    removeTile: 'Remove this tile',
    allPlaced: 'All tiles placed',

    perfectTitle: 'PERFECT!',
    perfectSub: 'Every single answer right. Flawless mix.',
    allWrongTitle: 'ALL WRONG — AND THAT RULES!',
    allWrongSub: "Zero right means you're still in there trying. That's exactly how learning sounds. Hit Try again!",
    clickToClose: 'click anywhere to close',

    way1SemisGiven: 'Way 1 · Semitones given',
    way2DegreesGiven: 'Way 2 · Degrees given',
    way2IntervalsGiven: 'Way 2 · Intervals given',
    continueWay1: 'Continue to Way 1',
    continueWay2: 'Continue to Way 2',
    headSemis: 'Semitones from root',
    headDegree: 'Scale degree',
    headMode: 'Mode',
    headQuality: 'Quality',
    headInterval: 'Interval',
    bankDegrees: 'Scale degrees',
    bankSemis: 'Semitones',
    bankModes: 'Mode names',
    bankQualities: 'Qualities (reusable)',
    bankNumbers: 'Interval numbers (reusable)',
    phDegree: 'degree',
    phSemis: 'semitones',
    phMode: 'mode',
    phQuality: 'quality',
    phInterval: 'interval',

    ascSharps: 'Ascending · sharps',
    descFlats: 'Descending · flats',
    lineUp: 'C → up by semitones →',
    lineDown: 'C → down by semitones →',
    noteBank: 'Note bank (more notes than you need)',
    phStart: 'start',
    continueDesc: 'Continue: descending with flats',
    continueAsc: 'Continue: ascending with sharps',

    jumbled: 'Jumbled intervals',
    circleOfFifths: 'Circle of fifths',
    circleDragFrom: 'Circle of fifths — drag from here',
    fifths: '5ths',
    clockwise: 'clockwise ↻',
    phTop: 'START',
    newJumble: 'New jumble',

    modesCompleted: 'Modes completed',
    yourTurn: 'your turn',
    allSevenDone: 'All seven modes complete',
    allSevenDoneSub: "You've filled in every row of the chart. Go again with a fresh random order?",
    startChartAgain: 'Start the chart again',
    finish: 'Finish',
    nextMode: 'Next mode',
    completeFormulaFor: 'Complete the formula for',
  },
  es: {
    appTitle: 'Compañero de práctica de teoría musical',
    appSubtitle: 'Elige un ejercicio para empezar a practicar.',
    chooseLanguage: 'Elige tu idioma',
    chooseLanguageSub: 'Puedes cambiarlo en cualquier momento con el botón de la parte superior de la pantalla.',
    language: 'Idioma',

    block0: 'Bloque 0',
    block0Sub: 'De dónde vienen nuestras notas',
    exTourTitle: 'Cómo se eligieron nuestras notas: una visita guiada',
    exTourBlurb: 'De una sola cuerda al círculo de quintas: octavas, Pitágoras, la espiral de quintas y el temperamento igual.',
    block1: 'Bloque 1',
    block1Sub: 'Intervalos y nombres de los modos',
    block2: 'Bloque 2',
    block2Sub: 'Notas en orden',
    block3: 'Bloque 3',
    block3Sub: 'El círculo de quintas y las fórmulas de los modos',
    exMajorTitle: 'Grados de la escala mayor y nombres de los modos',
    exMajorBlurb: '¿A cuántos semitonos de la tónica está cada grado de la escala mayor, y qué modo empieza en él?',
    exChromIntTitle: 'De semitonos a intervalos cromáticos',
    exChromIntBlurb: 'Nombra cada intervalo de la octava: mayor, menor, justo, aumentado o disminuido.',
    exChromScaleTitle: 'La escala cromática',
    exChromScaleBlurb: 'Ordena los 12 semitonos colocando los sostenidos en su sitio. ¡Cuidado con las notas trampa!',
    exCircleTitle: 'Familiarizarse con el orden del círculo de quintas',
    exCircleBlurb: 'Arrastra los intervalos desordenados a su lugar en el círculo.',
    exModeChartTitle: 'Las fórmulas de los modos a través del círculo de quintas',
    exModeChartBlurb: 'Completa la tabla de modos fila a fila, arrastrando intervalos desde el círculo.',
    exModeSingleTitle: 'Práctica individual de fórmulas de modos',
    exModeSingleBlurb: 'Un modo, sin tabla. Construye su fórmula desde el círculo de quintas.',

    backToExercises: 'Ejercicios',
    howTo: 'Cómo hacer este ejercicio',
    tipPlacingLabel: 'Colocar fichas:',
    tipPlacing: 'arrastra una ficha a una casilla, o haz clic en una ficha y luego en una casilla.',
    tipFixingLabel: 'Corregir un error:',
    tipFixingA: 'haz clic en la',
    tipFixingB:
      'de cualquier casilla llena para quitar solo esa ficha, arrástrala de vuelta al banco, o arrástrala a otra casilla para intercambiarlas.',
    clearAll: 'Vaciar todo',
    ready: 'Listo cuando quieras.',
    fillAll: 'Rellena todas las casillas para enviar.',
    submit: 'Enviar',
    correctOf: '/ {total} correctas',
    showAnswers: 'Ver respuestas',
    hideAnswers: 'Ocultar respuestas',
    tryAgain: 'Intentar de nuevo',
    removeTile: 'Quitar esta ficha',
    allPlaced: 'Todas las fichas colocadas',

    perfectTitle: '¡PERFECTO!',
    perfectSub: 'Todas las respuestas correctas. Una mezcla impecable.',
    allWrongTitle: '¡TODO MAL, Y ES GENIAL!',
    allWrongSub: 'Cero aciertos significa que sigues intentándolo. Así suena aprender. ¡Dale a Intentar de nuevo!',
    clickToClose: 'haz clic en cualquier sitio para cerrar',

    way1SemisGiven: 'Forma 1 · Con semitonos',
    way2DegreesGiven: 'Forma 2 · Con grados',
    way2IntervalsGiven: 'Forma 2 · Con intervalos',
    continueWay1: 'Continuar a la forma 1',
    continueWay2: 'Continuar a la forma 2',
    headSemis: 'Semitonos desde la tónica',
    headDegree: 'Grado de la escala',
    headMode: 'Modo',
    headQuality: 'Cualidad',
    headInterval: 'Intervalo',
    bankDegrees: 'Grados de la escala',
    bankSemis: 'Semitonos',
    bankModes: 'Nombres de los modos',
    bankQualities: 'Cualidades (reutilizables)',
    bankNumbers: 'Números de intervalo (reutilizables)',
    phDegree: 'grado',
    phSemis: 'semitonos',
    phMode: 'modo',
    phQuality: 'cualidad',
    phInterval: 'intervalo',

    ascSharps: 'Ascendente · sostenidos',
    descFlats: 'Descendente · bemoles',
    lineUp: 'Do → sube por semitonos →',
    lineDown: 'Do → baja por semitonos →',
    noteBank: 'Banco de notas (más de las que necesitas)',
    phStart: 'inicio',
    continueDesc: 'Continuar: descendente con bemoles',
    continueAsc: 'Continuar: ascendente con sostenidos',

    jumbled: 'Intervalos desordenados',
    circleOfFifths: 'Círculo de quintas',
    circleDragFrom: 'Círculo de quintas: arrastra desde aquí',
    fifths: '5ªs',
    clockwise: 'sentido horario ↻',
    phTop: 'INICIO',
    newJumble: 'Nuevo desorden',

    modesCompleted: 'Modos completados',
    yourTurn: 'tu turno',
    allSevenDone: 'Los siete modos completados',
    allSevenDoneSub: 'Has completado todas las filas de la tabla. ¿Otra vez con un nuevo orden aleatorio?',
    startChartAgain: 'Empezar la tabla de nuevo',
    finish: 'Terminar',
    nextMode: 'Siguiente modo',
    completeFormulaFor: 'Completa la fórmula de',
  },
}

export const LangContext = createContext({ lang: 'en', setLang: () => {} })

export function useLang() {
  const { lang, setLang } = useContext(LangContext)
  const t = (key, vars) => {
    let s = STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v)
    return s
  }
  return { lang, setLang, t }
}

/** Small EN | ES switch shown at the top of every screen. */
export function LanguageToggle() {
  const { lang, setLang, t } = useLang()
  return (
    <div className="lang-toggle" role="group" aria-label={t('language')}>
      <span className="lang-icon" aria-hidden>
        🌐
      </span>
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          className={lang === l.code ? 'is-active' : ''}
          aria-pressed={lang === l.code}
          title={l.name}
          onClick={() => setLang(l.code)}
        >
          {l.short}
        </button>
      ))}
    </div>
  )
}
