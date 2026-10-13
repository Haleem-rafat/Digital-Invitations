import { motion, useReducedMotion, type Variants } from 'framer-motion'
import {
  Heart,
  Music2,
  PartyPopper,
  Sparkles,
  Users,
  UtensilsCrossed,
  Wine,
  type LucideIcon,
} from 'lucide-react'
import { invitation, type ProgramIcon } from '../data/invitation'
import { EASE_LUX, useRevealVariants } from '../lib/motion'
import { SectionFrame } from './SectionFrame'
import { SectionHeader } from './SectionHeader'

const icons: Record<ProgramIcon, LucideIcon> = {
  arrival: Users,
  ceremony: Heart,
  katb: Heart,
  cocktail: Wine,
  dinner: UtensilsCrossed,
  dance: Music2,
  party: PartyPopper,
  end: Sparkles,
}

export function Program() {
  const reduce = useReducedMotion()
  const { program } = invitation
  const row = useRevealVariants()
  // the pill lands with a tiny bounce, just after its row
  const pill: Variants = reduce
    ? {}
    : {
        hidden: { scale: 0.85 },
        show: { scale: [0.85, 1.08, 1], transition: { duration: 0.6, delay: 0.25, ease: EASE_LUX } },
      }

  return (
    <SectionFrame labelledBy="program-title">
      <SectionHeader id="program-title" title={program.title} subtitle={program.subtitle} />

      <motion.ol
        className="relative mx-auto max-w-xs space-y-6"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
      >
        {/* faint dotted line connecting the icons */}
        <span className="absolute top-5 bottom-5 left-[20px] border-l border-dotted border-gold/60" aria-hidden="true" />
        {program.events.map((event) => {
          const Icon = icons[event.icon]
          return (
            <motion.li key={event.name} variants={row} className="relative flex items-start gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sage/20 text-olive ring-1 ring-gold/40 outline-4 outline-cream">
                <Icon className="size-5" strokeWidth={1.6} aria-hidden="true" />
              </span>
              <div className="pt-0.5">
                <motion.span
                  variants={pill}
                  className="inline-block rounded-full bg-olive px-3.5 py-1 font-sans text-[0.75rem] font-semibold tracking-wider text-cream"
                >
                  <time>{event.time}</time>
                </motion.span>
                <h3 className="mt-1.5 font-serif text-[1.65rem] font-semibold leading-tight">{event.name}</h3>
                {event.subtitle && <p className="font-sans text-sm font-medium text-muted">{event.subtitle}</p>}
              </div>
            </motion.li>
          )
        })}
      </motion.ol>
    </SectionFrame>
  )
}
