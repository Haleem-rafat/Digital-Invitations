import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
  type Variants,
} from 'framer-motion'
import { useRef, type ReactNode, type RefObject } from 'react'

/** The page's single easing curve — slow, calm settle. */
export const EASE_LUX = [0.22, 1, 0.36, 1] as const

/** Shared viewport rule: reveal once, when 30% of the element is visible. */
export const VIEWPORT = { once: true, amount: 0.3 } as const

/** opacity 0→1, y 24→0, blur 6→0 over 0.9s. Reduced motion: opacity only. */
export function useRevealVariants(y = 24, x = 0): Variants {
  const reduce = useReducedMotion()
  return {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y, x, filter: 'blur(6px)' },
    show: {
      opacity: 1,
      y: 0,
      x: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.9, ease: EASE_LUX },
      transitionEnd: { filter: 'none' },
    },
  }
}

interface StaggerProps {
  children: ReactNode
  className?: string
  stagger?: number
  delay?: number
  amount?: number
  as?: 'div' | 'ul' | 'ol' | 'header' | 'footer'
}

/** Reveals its <Item> children one after another when it scrolls into view. */
export function Stagger({ children, className, stagger = 0.12, delay = 0, amount = 0.3, as = 'div' }: StaggerProps) {
  const Comp = motion[as]
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {children}
    </Comp>
  )
}

interface ItemProps {
  children: ReactNode
  className?: string
  y?: number
  x?: number
  as?: 'div' | 'li' | 'p' | 'span'
}

/** One staggered child: fades up and un-blurs. */
export function Item({ children, className, y, x, as = 'div' }: ItemProps) {
  const variants = useRevealVariants(y, x)
  const Comp = motion[as]
  return (
    <Comp className={className} variants={variants}>
      {children}
    </Comp>
  )
}

/** Script title with a "handwriting" reveal: clipped left → right over 1.2s. Use inside <Stagger>. */
export function ScriptTitle({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  const reduce = useReducedMotion()
  // Negative insets leave room for script swashes that overhang the text box.
  const variants: Variants = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.9 } } }
    : {
        hidden: { clipPath: 'inset(-30% 100% -30% -10%)' },
        show: { clipPath: 'inset(-30% -10% -30% -10%)', transition: { duration: 1.2, ease: EASE_LUX } },
      }
  return (
    <motion.h2 id={id} className={className} variants={variants}>
      {children}
    </motion.h2>
  )
}

/**
 * Gentle parallax: the element drifts so it appears to move at ~0.85× scroll speed.
 * Returns a ref for the element and its y motion value.
 */
export function useParallax<T extends HTMLElement>(strength = 0.15): [RefObject<T | null>, MotionValue<number> | 0] {
  const reduce = useReducedMotion()
  const ref = useRef<T>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  // Over the element's whole trip through the viewport (~1 screen + its height), lag by `strength`.
  const range = typeof window === 'undefined' ? 0 : (window.innerHeight * strength) / 2
  const y = useTransform(scrollYProgress, [0, 1], [-range, range])
  return [ref, reduce ? 0 : y]
}
