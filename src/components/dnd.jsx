import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

// A small pointer-based drag & drop system that works with mouse, pen and touch.
// Tiles can also be placed by clicking a tile and then clicking a box.

const DndContext = createContext(null)
const DRAG_THRESHOLD = 5

export function DndProvider({ onDrop, disabled = false, children }) {
  const [drag, setDrag] = useState(null) // { payload, label, color, x, y }
  const [hoverTarget, setHoverTarget] = useState(null)
  const [selected, setSelected] = useState(null) // payload chosen by click
  const onDropRef = useRef(onDrop)
  onDropRef.current = onDrop
  const selectedRef = useRef(selected)
  selectedRef.current = selected

  useEffect(() => {
    if (disabled) setSelected(null)
  }, [disabled])

  const targetAt = (x, y) => {
    const el = document.elementFromPoint(x, y)
    const zone = el && el.closest('[data-drop]')
    return zone ? zone.getAttribute('data-drop') : null
  }

  const startPointer = useCallback(
    (e, payload, label, color) => {
      if (disabled || e.button > 0) return
      e.preventDefault()
      const startX = e.clientX
      const startY = e.clientY
      let dragging = false

      const move = (ev) => {
        if (!dragging && Math.hypot(ev.clientX - startX, ev.clientY - startY) > DRAG_THRESHOLD) {
          dragging = true
          setSelected(null)
        }
        if (dragging) {
          setDrag({ payload, label, color, x: ev.clientX, y: ev.clientY })
          setHoverTarget(targetAt(ev.clientX, ev.clientY))
        }
      }
      const up = (ev) => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
        window.removeEventListener('pointercancel', up)
        if (dragging) {
          onDropRef.current(targetAt(ev.clientX, ev.clientY), payload)
          setDrag(null)
          setHoverTarget(null)
        } else {
          const cur = selectedRef.current
          const same = cur && cur.itemId === payload.itemId && cur.fromSlot === payload.fromSlot
          if (cur && !same && payload.fromSlot) {
            // A tile is already chosen and this tile sits in a box: put the chosen tile here instead
            onDropRef.current(payload.fromSlot, cur)
            setSelected(null)
            return
          }
          // Treat as a click: toggle selection of this tile
          setSelected((cur) =>
            cur && cur.itemId === payload.itemId && cur.fromSlot === payload.fromSlot ? null : payload,
          )
        }
      }
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
      window.addEventListener('pointercancel', up)
    },
    [disabled],
  )

  const clickTarget = useCallback(
    (target) => {
      if (!selected || disabled) return false
      onDropRef.current(target, selected)
      setSelected(null)
      return true
    },
    [selected, disabled],
  )

  return (
    <DndContext.Provider value={{ drag, hoverTarget, selected, startPointer, clickTarget, disabled }}>
      {children}
      {drag && (
        <div
          className="chip chip-ghost"
          style={{ left: drag.x, top: drag.y, '--chip-color': drag.color }}
        >
          {drag.label}
        </div>
      )}
    </DndContext.Provider>
  )
}

export function useDnd() {
  return useContext(DndContext)
}

/** A draggable tile. */
export function Chip({ payload, label, color, className = '', small = false }) {
  const { startPointer, selected, drag, disabled } = useDnd()
  const isSelected =
    selected && selected.itemId === payload.itemId && selected.fromSlot === payload.fromSlot
  const isDragging =
    drag && drag.payload.itemId === payload.itemId && drag.payload.fromSlot === payload.fromSlot
  return (
    <div
      className={`chip ${small ? 'chip-small' : ''} ${isSelected ? 'is-selected' : ''} ${
        isDragging ? 'is-dragging' : ''
      } ${disabled ? 'is-locked' : ''} ${className}`}
      style={{ '--chip-color': color }}
      onPointerDown={(e) => {
        e.stopPropagation()
        startPointer(e, payload, label, color)
      }}
      onClick={(e) => e.stopPropagation()}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={isSelected || undefined}
    >
      {label}
    </div>
  )
}

/** Any element that can receive tiles. */
export function DropZone({ id, className = '', children, style, ...rest }) {
  const { hoverTarget, selected, clickTarget } = useDnd()
  return (
    <div
      data-drop={id}
      className={`${className} ${hoverTarget === id ? 'is-hover' : ''} ${selected ? 'is-armed' : ''}`}
      style={style}
      onClick={() => clickTarget(id)}
      {...rest}
    >
      {children}
    </div>
  )
}
