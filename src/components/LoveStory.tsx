import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useRef } from 'react'
import { invitation } from '../data/invitation'
import { EASE_LUX, useRevealVariants } from '../lib/motion'
import { SectionFrame } from './SectionFrame'
import { SectionHeader } from './SectionHeader'

/** Tiny line-art heart that draws itself. */
function DrawnHeart() {
  const reduce = useReducedMotion()
  return (
    <svg viewBox="0 0 32 28" className="h-6 w-7 text-rose" fill="none" aria-hidden="true">
      <motion.path
        d="M16 26 C 6 19 1.5 13.5 1.5 8.5 C 1.5 4.5 4.6 1.5 8.4 1.5 C 11.6 1.5 14.2 3.4 16 6.2 C 17.8 3.4 20.4 1.5 23.6 1.5 C 27.4 1.5 30.5 4.5 30.5 8.5 C 30.5 13.5 26 19 16 26 Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        initial={{ pathLength: reduce ? 1 : 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.6, delay: 0.5, ease: 'easeInOut' }}
      />
    </svg>
  )
}

/** Dot "pops" when the growing line reaches it (crosses ~70% of the viewport). */
function Dot() {
  const reduce = useReducedMotion()
  return (
    <motion.span
      className="absolute top-1.5 -left-[7px] size-3.5 rounded-full bg-olive ring-4 ring-cream"
      initial={{ scale: reduce ? 1 : 0 }}
      whileInView={{ scale: reduce ? 1 : [0, 1.2, 1] }}
      viewport={{ once: true, margin: '0px 0px -30% 0px' }}
      transition={{ duration: 0.6, ease: EASE_LUX, times: [0, 0.6, 1] }}
      aria-hidden="true"
    />
  )
}

export function LoveStory() {
  const reduce = useReducedMotion()
  const { journey } = invitation
  const listRef = useRef<HTMLOListElement>(null)
  // Line grows from the list's top as it passes 70% of the viewport, completing near the end.
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 70%', 'end 60%'] })
  const grow = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })
  const itemVariants = useRevealVariants(0, -16)

  return (
    <SectionFrame id="story" labelledBy="story-title">
      <SectionHeader id="story-title" label={journey.label} title={journey.title} />
      <div className="-mt-6 mb-8 flex justify-center">
        <DrawnHeart />
      </div>

      <ol ref={listRef} className="relative ml-3 pb-10">
        <motion.span
          className="absolute top-0 bottom-0 left-0 w-px origin-top bg-gold/60 will-change-transform"
          style={{ scaleY: reduce ? 1 : grow }}
          aria-hidden="true"
        />
        {journey.items.map((item) => (
          <li key={item.year + item.title} className="relative pb-12 pl-8 last:pb-0">
            <Dot />
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={itemVariants}>
              <p className="font-sans text-[0.65rem] font-light tracking-[0.25em] text-olive uppercase">{item.year}</p>
              <h3 className="mt-1 font-serif text-[1.7rem] leading-tight">{item.title}</h3>
              <p className="mt-1 font-serif text-lg leading-snug text-muted">{item.text}</p>
            </motion.div>
          </li>
        ))}
        {/* end of the timeline */}
        <motion.li
          className="absolute -bottom-1 -left-[9px] list-none text-rose"
          initial={{ scale: reduce ? 1 : 0, opacity: 0 }}
          whileInView={{ scale: reduce ? 1 : [0, 1.2, 1], opacity: 1 }}
          viewport={{ once: true, margin: '0px 0px -30% 0px' }}
          transition={{ duration: 0.6, ease: EASE_LUX }}
          aria-hidden="true"
        >
          <Heart className="size-[18px] fill-current" strokeWidth={0} />
        </motion.li>
      </ol>
    </SectionFrame>
  )
}
