import { Fragment } from 'react'
import { useLang } from '../i18n.jsx'
import { TOUR_TEXT } from './content.js'

/** Tour strings in the current language, plus `rich` for **bold** / *italic* markup. */
export function useTour() {
  const { lang } = useLang()
  const text = TOUR_TEXT[lang] ?? TOUR_TEXT.en
  const t = (key, vars) => {
    let s = text[key] ?? TOUR_TEXT.en[key] ?? key
    if (vars && typeof s === 'string') for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v)
    return s
  }
  return { t, lang }
}

export function rich(s) {
  return s.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/).map((part, i) => {
    if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.length > 1) return <em key={i}>{part.slice(1, -1)}</em>
    return <Fragment key={i}>{part}</Fragment>
  })
}
