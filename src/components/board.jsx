import { useMemo, useState } from 'react'
import { Chip, DropZone } from './dnd.jsx'
import { useLang } from '../i18n.jsx'

// Item labels may be a function of the language so they follow the language switch.
const labelOf = (item, lang) => (typeof item.label === 'function' ? item.label(lang) : item.label)

/**
 * Board state shared by every exercise.
 *
 * slots: [{ id, accepts }]  – accepts is an item group name
 * items: [{ id, label, value, group, color, reusable }]
 *   reusable items stay in the bank after being placed (a palette);
 *   other items can only be in one place at a time.
 *   label may be a node or a function (lang) => node.
 */
export function useBoard(slots, items) {
  const [filled, setFilled] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const slotMap = useMemo(() => Object.fromEntries(slots.map((s) => [s.id, s])), [slots])
  const itemMap = useMemo(() => Object.fromEntries(items.map((i) => [i.id, i])), [items])

  const used = new Set(Object.values(filled))
  const bank = items.filter((i) => i.reusable || !used.has(i.id))
  const complete = slots.every((s) => filled[s.id])

  function handleDrop(target, payload) {
    if (submitted) return
    const { itemId, fromSlot } = payload
    const item = itemMap[itemId]
    setFilled((prev) => {
      const next = { ...prev }
      const slot = target && slotMap[target]
      if (!slot) {
        // Dropped on the bank or outside a box: take it out of its box
        if (fromSlot) delete next[fromSlot]
        return next
      }
      if (slot.accepts && item.group !== slot.accepts) return prev
      if (fromSlot === target) return prev
      const existing = next[target]
      next[target] = itemId
      if (fromSlot) {
        // Moving between boxes swaps the two tiles when that makes sense
        const existingItem = existing && itemMap[existing]
        const fromAccepts = slotMap[fromSlot].accepts
        if (existingItem && (!fromAccepts || existingItem.group === fromAccepts)) next[fromSlot] = existing
        else delete next[fromSlot]
      }
      return next
    })
  }

  return {
    filled,
    bank,
    complete,
    submitted,
    itemAt: (slotId) => itemMap[filled[slotId]],
    valueAt: (slotId) => itemMap[filled[slotId]]?.value,
    handleDrop,
    clear: (slotId) =>
      !submitted &&
      setFilled((prev) => {
        const next = { ...prev }
        delete next[slotId]
        return next
      }),
    clearAll: () => !submitted && setFilled({}),
    submit: () => setSubmitted(true),
  }
}

/** A box that receives one tile. status: undefined | true | false */
export function Slot({ board, id, status, placeholder = '', answer, reveal, className = '', renderLabel }) {
  const { lang, t } = useLang()
  const item = board.itemAt(id)
  const label = item ? (renderLabel ? renderLabel(item, lang) : labelOf(item, lang)) : null
  return (
    <DropZone
      id={id}
      className={`slot ${item ? 'is-filled' : ''} ${
        status === true ? 'is-right' : status === false ? 'is-wrong' : ''
      } ${className}`}
    >
      {item ? (
        <Chip payload={{ itemId: item.id, fromSlot: id }} label={label} color={item.color} small />
      ) : (
        <span className="slot-placeholder">{placeholder}</span>
      )}
      {item && !board.submitted && (
        <button
          className="slot-remove"
          title={t('removeTile')}
          aria-label={t('removeTile')}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            board.clear(id)
          }}
        >
          ×
        </button>
      )}
      {status === true && <span className="mark mark-right" aria-label="correct">✓</span>}
      {status === false && <span className="mark mark-wrong" aria-label="incorrect">✕</span>}
      {status === false && reveal && answer != null && <span className="slot-answer">{answer}</span>}
    </DropZone>
  )
}

/** The pool of tiles to drag from. */
export function Bank({ board, title, group, className = '' }) {
  const { lang, t } = useLang()
  const tiles = group ? board.bank.filter((i) => i.group === group) : board.bank
  return (
    <DropZone id={`bank${group ? ':' + group : ''}`} className={`bank panel ${className}`}>
      <div className="panel-label">{title}</div>
      <div className="bank-tiles">
        {tiles.map((i) => (
          <Chip key={i.id} payload={{ itemId: i.id, fromSlot: null }} label={labelOf(i, lang)} color={i.color} />
        ))}
        {tiles.length === 0 && <span className="bank-empty">{t('allPlaced')}</span>}
      </div>
    </DropZone>
  )
}

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
