import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { EASE_LUX } from '../lib/motion'
import { FloralCorners } from './florals/Florals'

interface SectionFrameProps {
  children: ReactNode
  labelledBy: string
  id?: string
  className?: string
}

/** A section framed by a thin gold rounded border, with florals in the top-left and bottom-right corners. */
export function SectionFrame({ children, labelledBy, id, className = '' }: SectionFrameProps) {
  const reduce = useReducedMotion()
  return (
    <motion.section
      id={id}
      aria-labelledby={labelledBy}
      className={`relative mx-5 my-6 scroll-mt-8 rounded-[28px] border border-gold/45 bg-cream/70 px-6 pt-16 pb-16 ${className}`}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.9, ease: EASE_LUX }}
    >
      {/* inner hairline for a letterpress feel */}
      <div className="pointer-events-none absolute inset-[6px] rounded-[23px] border border-gold/20" aria-hidden="true" />
      <FloralCorners className="w-32" />
      <div className="relative">{children}</div>
    </motion.section>
  )
}
