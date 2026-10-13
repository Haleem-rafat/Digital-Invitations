import { motion, useReducedMotion } from 'framer-motion'
import type { CSSProperties } from 'react'
import { EASE_LUX } from '../../lib/motion'
import { CORNER_SVG, WREATH_SVG, svgDataUri } from './art'

const CORNER = svgDataUri(CORNER_SVG)
const WREATH = svgDataUri(WREATH_SVG)

interface CornersProps {
  /** Width of each arrangement */
  className?: string
  /** CSS opacity, 0.6–0.8 */
  opacity?: number
  /** Bloom in when this becomes true (hero), otherwise when scrolled into view */
  bloom?: boolean
  bloomDelay?: number
}

/** Watercolour arrangements in the top-left and bottom-right corners of the parent (which must be relative). */
export function FloralCorners({ className = 'w-36', opacity = 0.72, bloom, bloomDelay = 0 }: CornersProps) {
  const reduce = useReducedMotion()
  const controlled = bloom !== undefined
  const corners = [
    { pos: '-top-5 -left-5', rotate: 0, delay: 0 },
    { pos: '-right-5 -bottom-5', rotate: 180, delay: 0.25 },
  ]
  return (
    <>
      {corners.map((c) => (
        <motion.div
          key={c.rotate}
          className={`pointer-events-none absolute ${c.pos} ${className}`}
          style={{ rotate: c.rotate, transformOrigin: 'center' }}
          initial={{ opacity: 0, scale: reduce ? 1 : 0.7 }}
          {...(controlled
            ? { animate: bloom ? { opacity, scale: 1 } : undefined }
            : { whileInView: { opacity, scale: 1 }, viewport: { once: true, amount: 0.2 } })}
          transition={{ duration: 1.6, delay: bloomDelay + c.delay, ease: EASE_LUX }}
          aria-hidden="true"
        >
          {/* sway pivots from the arrangement's own corner */}
          <img src={CORNER} alt="" className="sway w-full origin-top-left" loading="lazy" decoding="async" />
        </motion.div>
      ))}
    </>
  )
}

/** Floral wreath (olive, eucalyptus, roses, baby's breath) — sized relative to its parent. */
export function Wreath({ className = '' }: { className?: string }) {
  return <img src={WREATH} alt="" aria-hidden="true" className={`pointer-events-none select-none ${className}`} draggable={false} />
}

// Fixed so the drift looks the same on every load: left %, size px, seconds, delay s, drift px, spin deg, opacity, colour.
const PETALS = [
  { x: 8, s: 12, dur: 17, delay: -2, drift: 60, spin: 260, o: 0.7, c: 'blush' },
  { x: 22, s: 9, dur: 21, delay: -11, drift: -40, spin: -220, o: 0.6, c: 'white' },
  { x: 37, s: 11, dur: 19, delay: -6, drift: 50, spin: 300, o: 0.65, c: 'blush' },
  { x: 52, s: 8, dur: 23, delay: -15, drift: -60, spin: -180, o: 0.55, c: 'white' },
  { x: 66, s: 12, dur: 18, delay: -9, drift: 40, spin: 240, o: 0.7, c: 'rose' },
  { x: 79, s: 9, dur: 22, delay: -3, drift: -50, spin: -260, o: 0.6, c: 'white' },
  { x: 91, s: 10, dur: 20, delay: -13, drift: 30, spin: 200, o: 0.6, c: 'blush' },
]
const PETAL_FILL: Record<string, string> = {
  blush: 'radial-gradient(circle at 30% 30%, #F6E3DE, #E8C9C1 60%, #D4A5A0)',
  rose: 'radial-gradient(circle at 30% 30%, #F2D6D0, #D4A5A0 70%)',
  white: 'radial-gradient(circle at 30% 30%, #FFFFFF, #F4EEE6 60%, #E6DCD3)',
}

/** Gently falling petals — slow and sparse. Pure CSS (transform/opacity); hidden for reduced motion. */
export function FallingPetals({ className = 'fixed' }: { className?: string }) {
  return (
    <div className={`pointer-events-none inset-0 z-30 overflow-hidden ${className}`} aria-hidden="true">
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={
            {
              left: `${p.x}%`,
              '--dur': `${p.dur}s`,
              '--delay': `${p.delay}s`,
              '--drift': `${p.drift}px`,
              '--spin': `${p.spin}deg`,
              '--o': p.o,
            } as CSSProperties
          }
        >
          <span
            style={{
              width: p.s,
              height: p.s * 1.25,
              borderRadius: '70% 0 70% 0',
              background: PETAL_FILL[p.c],
              boxShadow: '0 1px 2px rgb(47 47 47 / 0.08)',
            }}
          />
        </span>
      ))}
    </div>
  )
}

/** Thin gold vine with olive leaves; the stem draws itself when scrolled into view. */
export function VineDivider() {
  const reduce = useReducedMotion()
  const leaves = [
    { x: 46, y: 17, a: -30 },
    { x: 70, y: 13, a: 25 },
    { x: 94, y: 16, a: -25 },
    { x: 146, y: 16, a: 205 },
    { x: 170, y: 13, a: 155 },
    { x: 194, y: 17, a: 210 },
  ]
  return (
    <div className="my-2 flex justify-center" aria-hidden="true">
      <svg viewBox="0 0 240 32" className="w-3/5 overflow-visible">
        <motion.path
          d="M8 18 C 40 8 80 24 120 16 C 160 8 200 24 232 14"
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="1"
          strokeLinecap="round"
          initial={{ pathLength: reduce ? 1 : 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
        />
        <motion.g
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 1.2, delay: 0.9, ease: EASE_LUX }}
        >
          {leaves.map((l, i) => (
            <path
              key={i}
              transform={`translate(${l.x} ${l.y}) rotate(${l.a})`}
              d="M0 0 C 4 -3.4 10 -3.2 14 0 C 10 3.2 4 3.4 0 0 Z"
              fill="var(--color-sage)"
              opacity="0.85"
            />
          ))}
          <circle cx="120" cy="16" r="3.2" fill="var(--color-blush)" />
          <circle cx="120" cy="16" r="1.3" fill="var(--color-gold)" />
        </motion.g>
      </svg>
    </div>
  )
}
