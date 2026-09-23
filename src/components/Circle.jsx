import { Chip, DropZone } from './dnd.jsx'
import { CIRCLE_ORDER, INTERVAL_LABELS, intervalColor } from '../theory.js'
import { useLang } from '../i18n.jsx'

/** Lays out 12 nodes clockwise around a ring, starting at 12 o'clock. */
export function CircleLayout({ renderNode, center, className = '' }) {
  return (
    <div className={`circle ${className}`}>
      <svg className="circle-ring" viewBox="0 0 100 100" aria-hidden>
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="50%" stopColor="#8b5cff" />
            <stop offset="100%" stopColor="#ff2bd6" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="38" fill="none" stroke="url(#ringGrad)" strokeWidth="0.6" opacity="0.7" />
        <circle cx="50" cy="50" r="24" fill="none" stroke="#2a2f3a" strokeWidth="0.4" strokeDasharray="1 1.5" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = ((i * 30 - 90) * Math.PI) / 180
          return (
            <line
              key={i}
              x1={50 + Math.cos(a) * 26}
              y1={50 + Math.sin(a) * 26}
              x2={50 + Math.cos(a) * 33}
              y2={50 + Math.sin(a) * 33}
              stroke="#2a2f3a"
              strokeWidth="0.4"
            />
          )
        })}
      </svg>
      {Array.from({ length: 12 }, (_, i) => {
        const a = ((i * 30 - 90) * Math.PI) / 180
        return (
          <div
            key={i}
            className="circle-node"
            style={{ left: `${50 + Math.cos(a) * 38}%`, top: `${50 + Math.sin(a) * 38}%` }}
          >
            {renderNode(i)}
          </div>
        )
      })}
      <div className="circle-center">{center}</div>
    </div>
  )
}

/** The circle of fifths as a palette of interval tiles that never run out. */
export function CirclePalette() {
  const { t } = useLang()
  return (
    <DropZone id="bank" className="panel circle-panel">
      <div className="panel-label">{t('circleDragFrom')}</div>
      <CircleLayout
        renderNode={(i) => {
          const v = CIRCLE_ORDER[i]
          return <Chip payload={{ itemId: v, fromSlot: null }} label={INTERVAL_LABELS[v]} color={intervalColor(v)} />
        }}
        center={<CircleCenter />}
      />
    </DropZone>
  )
}

export function CircleCenter() {
  const { t } = useLang()
  return (
    <>
      <span className="circle-center-title">{t('fifths')}</span>
      <span className="circle-center-sub">{t('clockwise')}</span>
    </>
  )
}

export const intervalItems = CIRCLE_ORDER.map((v) => ({
  id: v,
  value: v,
  label: INTERVAL_LABELS[v],
  group: 'interval',
  color: intervalColor(v),
  reusable: true,
}))
