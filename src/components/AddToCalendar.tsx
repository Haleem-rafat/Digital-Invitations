import { AnimatePresence, motion } from 'framer-motion'
import { CalendarHeart, CalendarPlus } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { EASE_LUX } from '../lib/motion'
import { downloadIcs, googleCalendarUrl } from '../lib/calendar'

/** "Add to Calendar" pill; opens a small menu: Apple/Outlook (.ics) or Google Calendar. */
export function AddToCalendar({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const option =
    'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left font-sans text-[0.7rem] tracking-wider text-ink transition-colors hover:bg-blush/50'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className={variant === 'light' ? 'btn-pill-light' : 'btn-pill'}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
      >
        <CalendarPlus className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
        Add to Calendar
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            className="absolute top-full right-0 z-20 mt-2 w-52 rounded-2xl border border-gold/40 bg-cream p-1.5 shadow-card"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.3, ease: EASE_LUX }}
          >
            <button
              type="button"
              role="menuitem"
              className={option}
              onClick={() => {
                downloadIcs()
                setOpen(false)
              }}
            >
              <CalendarHeart className="size-4 text-olive" strokeWidth={1.5} aria-hidden="true" />
              Apple / Outlook (.ics)
            </button>
            <a
              role="menuitem"
              className={option}
              href={googleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
            >
              <CalendarPlus className="size-4 text-olive" strokeWidth={1.5} aria-hidden="true" />
              Google Calendar
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
