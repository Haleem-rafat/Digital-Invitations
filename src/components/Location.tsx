import { MapPin, Navigation } from 'lucide-react'
import { invitation } from '../data/invitation'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'

export function Location() {
  const { venue } = invitation

  return (
    <section aria-labelledby="location-title" className="px-6 py-16">
      <SectionHeading id="location-title" title="Location" subtitle="Where the magic happens" />

      <Reveal className="overflow-hidden rounded-3xl bg-white/80 shadow-card ring-1 ring-blush">
        <iframe
          title={`Map showing ${venue.name}`}
          src={venue.mapEmbedUrl}
          className="h-60 w-full border-0 grayscale-[35%] sepia-[15%]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="p-6 text-center">
          <h3 className="font-serif text-2xl">{venue.name}</h3>
          {venue.address && (
            <p className="mt-1 flex items-start justify-center gap-1.5 font-sans text-xs font-light leading-relaxed text-muted">
              <MapPin className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              {venue.address}
            </p>
          )}
          <a
            href={venue.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-terracotta px-6 py-3 font-sans text-xs font-medium tracking-[0.2em] text-white uppercase shadow-soft transition hover:bg-terracotta-dark active:scale-[0.98]"
          >
            <Navigation className="size-4" strokeWidth={1.5} aria-hidden="true" />
            Get directions
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </Reveal>
    </section>
  )
}
