import { MapPin } from 'lucide-react'
import { invitation } from '../data/invitation'
import { Item, Stagger } from '../lib/motion'
import { SectionFrame } from './SectionFrame'
import { SectionHeader } from './SectionHeader'

/** Venue with an embedded map and the "View Location" button. */
export function Location() {
  const { location, venue, timeDisplay } = invitation

  return (
    <SectionFrame labelledBy="location-title">
      <SectionHeader id="location-title" label={location.label} title={location.title} subtitle={`${venue.name} · ${timeDisplay}`} />
      <Stagger className="text-center">
        <Item>
          <div className="overflow-hidden rounded-[20px] border border-gold/60 bg-page p-1.5 shadow-soft">
            <iframe
              title={`Map showing ${venue.name}`}
              src={venue.mapEmbedUrl}
              className="h-64 w-full rounded-[15px] border-0 grayscale-[25%] sepia-[12%]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Item>
        {venue.address && (
          <Item as="p" className="mt-4 font-serif text-xl font-medium text-muted">
            {venue.address}
          </Item>
        )}
        <Item className="mt-7">
          <a href={venue.directionsUrl} target="_blank" rel="noopener noreferrer" className="btn-pill w-56">
            <MapPin className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
            View Location
            <span className="sr-only">(opens Google Maps in a new tab)</span>
          </a>
        </Item>
      </Stagger>
    </SectionFrame>
  )
}
