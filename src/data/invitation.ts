/**
 * Everything specific to one invitation lives here.
 * To make a new invitation: copy this file, edit the values, replace the images/audio in /public.
 */

export type ProgramIcon =
  | 'arrival'
  | 'ceremony'
  | 'katb'
  | 'cocktail'
  | 'dinner'
  | 'dance'
  | 'party'
  | 'end'

export interface InvitationConfig {
  couple: {
    partner1: string
    partner2: string
    /** Shown on the wax seal, e.g. "A&D" */
    initials: string
  }
  /** ISO 8601 with timezone offset, used for the countdown */
  dateISO: string
  /** Human-friendly date shown on the page */
  dateDisplay: string
  /** Compact date for small print, e.g. on the envelope */
  dateShort: string
  envelope: {
    title: string
    tapHint: string
    /** Debossed into the wax seal (Pinyon Script) */
    monogram: string
    /** Optional raster emboss; if this file exists it replaces the SVG floral emboss (blended soft-light) */
    embossImage: string
    colors: {
      /** Card paper */
      paper: string
      /** Top flap, slightly darker */
      flap: string
      /** Inside of the envelope (flap back face) */
      inside: string
      wax: string
      /** "Dear Name," and the tap hint */
      ink: string
      /** Gold-foil gradient stops for "You're invited" (115deg) */
      foil: string[]
      /** Small gold names/date line */
      gold: string
    }
  }
  hero: {
    label: string
    /** Replace /public/images/hero.svg with your own illustration */
    image: string
    imageAlt: string
  }
  venue: {
    name: string
    /** Optional; hidden when empty */
    address: string
    /** Google Maps embed URL (Share → Embed a map → copy src, or `https://www.google.com/maps?q=LAT,LNG&output=embed`) */
    mapEmbedUrl: string
    /** Link opened by "Get directions" */
    directionsUrl: string
  }
  journey: {
    title: string
    items: { year: string; title: string; text: string }[]
  }
  program: {
    title: string
    subtitle: string
    events: { time: string; name: string; subtitle?: string; icon: ProgramIcon }[]
  }
  footer: {
    thankYou: string
    note: string
  }
  /** Background music played after opening the envelope */
  music: string
}

const VENUE_LAT_LNG = '31.009851,29.745279'

export const invitation: InvitationConfig = {
  couple: {
    partner1: 'Mohamed',
    partner2: 'Mai',
    initials: 'M&M',
  },
  dateISO: '2026-12-11T16:30:00+02:00',
  dateDisplay: 'Friday, December 11, 2026',
  dateShort: '11.12.2026',
  envelope: {
    title: "You're invited",
    tapHint: 'Tap the seal to open',
    monogram: 'M&M',
    embossImage: '/textures/emboss-floral.png',
    colors: {
      paper: '#A9B892',
      flap: '#9AAB84',
      inside: '#C9D4B8',
      wax: '#A8232A',
      ink: '#3F4A37',
      foil: ['#8C6A2F 0%', '#E9CF8A 30%', '#B8924A 50%', '#F5E3A8 65%', '#8C6A2F 100%'],
      gold: '#9A7A3C',
    },
  },
  hero: {
    label: "We're getting married",
    image: '/images/hero.svg',
    imageAlt: 'Illustration of an arch framed by palm trees',
  },
  venue: {
    name: 'Wedding Venue',
    address: '',
    mapEmbedUrl: `https://www.google.com/maps?q=${VENUE_LAT_LNG}&output=embed`,
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${VENUE_LAT_LNG}`,
  },
  journey: {
    title: 'Our Journey',
    items: [
      {
        year: '31 January 2025',
        title: 'Engagement',
        text: 'The day we promised each other forever.',
      },
      {
        year: '11 December 2026',
        title: 'Our Wedding',
        text: 'And now we begin our life together — we would love you to be there.',
      },
    ],
  },
  program: {
    title: 'Day Program',
    subtitle: 'What we have prepared for you',
    events: [
      { time: '4:30 PM', name: 'Guest Arrival', icon: 'arrival' },
      { time: '5:00 PM', name: 'Katb El Ketab', icon: 'katb' },
      { time: '6:00 PM', name: 'First Dance', icon: 'dance' },
      { time: '8:00 PM', name: 'Dinner', icon: 'dinner' },
      { time: '9:00 PM', name: 'Second Dance', icon: 'party' },
      { time: '11:00 PM', name: 'Ending', icon: 'end' },
    ],
  },
  footer: {
    thankYou: 'Thank you',
    note: 'We can’t wait to celebrate with you.',
  },
  music: '/audio/music.mp3',
}
