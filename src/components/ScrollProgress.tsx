import { motion, useScroll, useSpring } from 'framer-motion'

/** Thin gold bar at the top that fills as the page is scrolled. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 })
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-40 h-0.5 origin-left bg-gold will-change-transform"
      style={{ scaleX }}
      aria-hidden="true"
    />
  )
}
