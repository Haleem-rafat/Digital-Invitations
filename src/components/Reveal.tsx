import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  /** Horizontal offset instead of vertical, e.g. for timeline items */
  x?: number
}

/** Fades and slides its children in the first time they scroll into view. */
export function Reveal({ children, className, delay = 0, x }: RevealProps) {
  const reduce = useReducedMotion()
  const offset = reduce ? {} : x !== undefined ? { x } : { y: 24 }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
