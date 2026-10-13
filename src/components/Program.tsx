import {
  GlassWater,
  Heart,
  Martini,
  Moon,
  Music,
  PartyPopper,
  ScrollText,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import { invitation, type ProgramIcon } from '../data/invitation'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'

const icons: Record<ProgramIcon, LucideIcon> = {
  arrival: GlassWater,
  ceremony: Heart,
  katb: ScrollText,
  cocktail: Martini,
  dinner: UtensilsCrossed,
  dance: Music,
  party: PartyPopper,
  end: Moon,
}

export function Program() {
  const { program } = invitation

  return (
    <section aria-labelledby="program-title" className="bg-blush/50 px-6 py-16">
      <SectionHeading id="program-title" title={program.title} subtitle={program.subtitle} />

      <ol className="relative space-y-7">
        {/* dotted connector behind the icons */}
        <span
          className="absolute top-7 bottom-7 left-7 border-l border-dashed border-terracotta/40"
          aria-hidden="true"
        />
        {program.events.map((event, i) => {
          const Icon = icons[event.icon]
          return (
            <li key={event.name}>
              <Reveal delay={i * 0.04} className="relative flex items-center gap-5">
                <span className="grid size-14 shrink-0 place-items-center rounded-full border border-terracotta/40 bg-cream text-terracotta shadow-soft">
                  <Icon className="size-6" strokeWidth={1.25} aria-hidden="true" />
                </span>
                <div>
                  <span className="inline-block rounded-full bg-terracotta px-3 py-0.5 font-sans text-[0.68rem] font-medium tracking-widest text-white">
                    <time>{event.time}</time>
                  </span>
                  <h3 className="mt-1 font-serif text-2xl leading-tight">{event.name}</h3>
                  {event.subtitle && <p className="font-sans text-xs font-light text-muted">{event.subtitle}</p>}
                </div>
              </Reveal>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
