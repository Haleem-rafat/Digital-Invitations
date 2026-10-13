import { invitation } from '../data/invitation'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'

export function Journey() {
  const { journey } = invitation

  return (
    <section aria-labelledby="journey-title" className="px-6 py-16">
      <SectionHeading id="journey-title" title={journey.title} />

      <ol className="relative ml-3 border-l border-terracotta/35">
        {journey.items.map((item, i) => (
          <li key={item.year + item.title} className="relative pb-10 pl-8 last:pb-0">
            <span
              className="absolute top-1.5 -left-[7px] size-3.5 rounded-full bg-terracotta ring-4 ring-cream"
              aria-hidden="true"
            />
            <Reveal x={20} delay={i * 0.05}>
              <p className="font-serif text-sm tracking-[0.2em] text-terracotta">{item.year}</p>
              <h3 className="font-script text-4xl leading-tight">{item.title}</h3>
              <p className="mt-1 font-serif text-lg leading-snug text-ink/80">{item.text}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  )
}
