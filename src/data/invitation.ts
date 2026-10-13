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

export type HeroVariant = 'olive' | 'light'

export interface InvitationConfig {
  couple: {
    partner1: string
    partner2: string
  }
  /** ISO 8601 with timezone offset, used for the countdown */
  dateISO: string
  /** Human-friendly date shown on the page */
  dateDisplay: string
  /** Compact date for small print, e.g. on the envelope */
  dateShort: string
  /** Time shown under the date */
  timeDisplay: string
  /** Section with the live countdown, View Location and Add to Calendar */
  countdown: {
    label: string
    title: string
  }
  envelope: {
    title: string
    tapHint: string
    /** Debossed into the wax seal (Pinyon Script) */
    monogram: string
    /** What is pressed into the wax: a flower sprig or the monogram */
    sealEmblem: 'flower' | 'monogram'
    /** Optional raster pattern; if this file exists it replaces the SVG botanical print */
    patternImage: string
    colors: {
      /** Card paper */
      paper: string
      /** Top flap */
      flap: string
      /** Ink of the printed botanical pattern */
      pattern: string
      /** Inside of the envelope (flap back face) */
      inside: string
      wax: string
      /** Monogram pressed into the seal */
      monogram: string
      /** "Dear Name," and the tap hint */
      ink: string
      /** Gold-foil gradient stops for "You're invited" (115deg) */
      foil: string[]
      /** Small gold names/date line */
      gold: string
    }
  }
  /** Page colours (applied as CSS variables). The envelope has its own colours above. */
  theme: {
    /** Page background — soft light grey paper */
    page: string
    /** Card / section surface */
    cream: string
    olive: string
    oliveDark: string
    sage: string
    blush: string
    rose: string
    /** Thin lines, frames, dividers */
    gold: string
    ink: string
    muted: string
  }
  hero: {
    label: string
    /**
     * Two looks for the client to choose from: 'olive' (deep olive scene, cream text) or
     * 'light' (soft light scene, olive text). Preview either with ?hero=olive or ?hero=light.
     */
    variant: HeroVariant
    /** Full-height scene behind the arch, per variant. Replace with your own illustrations */
    images: Record<HeroVariant, string>
    imageAlt: string
    scrollHint: string
  }
  venue: {
    name: string
    /** Optional; hidden when empty */
    address: string
    /** Google Maps embed URL for the map in the Location section */
    mapEmbedUrl: string
    /** Link opened by "View Location" */
    directionsUrl: string
  }
  /** Location section (map + View Location), shown before the closing screen */
  location: {
    label: string
    title: string
  }
  /** "Add to Calendar" — starts at dateISO */
  calendar: {
    title: string
    description: string
    location: string
    durationHours: number
  }
  journey: {
    label: string
    title: string
    items: { year: string; title: string; text: string }[]
  }
  program: {
    title: string
    subtitle: string
    events: { time: string; name: string; subtitle?: string; icon: ProgramIcon }[]
  }
  rsvp: {
    enabled: boolean
    title: string
    subtitle: string
    maxGuests: number
    /** Optional endpoint that accepts a JSON POST (Formspree, Google Apps Script, your API). Empty = log only. */
    endpoint: string
  }
  footer: {
    thankYou: string
    note: string
  }
  music: {
    src: string
    /** Start playing when the seal is tapped */
    autoplay: boolean
    /** Show the round music toggle button */
    toggle: boolean
  }
}

const VENUE_LAT_LNG = '31.009851,29.745279'

export const invitation: InvitationConfig = {
  couple: {
    partner1: 'Mohamed',
    partner2: 'Mai',
  },
  dateISO: '2026-12-11T17:00:00+02:00',
  dateDisplay: 'Friday, December 11, 2026',
  dateShort: '11.12.2026',
  timeDisplay: '5:00 PM',
  countdown: {
    label: 'Save the date',
    title: 'Counting down to forever',
  },
  envelope: {
    title: "You're invited",
    tapHint: 'Tap the seal to open',
    monogram: 'M&M',
    sealEmblem: 'flower',
    patternImage: '/textures/botanical-pattern.png',
    colors: {
      paper: '#A7AE7E',
      flap: '#AAB181',
      pattern: '#55602F',
      inside: '#CDD2B2',
      wax: '#DDA699',
      monogram: '#C2A36B',
      ink: '#3F4A37',
      foil: ['#6E5020 0%', '#D9B766 30%', '#9C7632 50%', '#EBD08A 65%', '#6E5020 100%'],
      gold: '#6E5020',
    },
  },
  theme: {
    page: '#F3F3F1',
    cream: '#FAF7F0',
    olive: '#7A8450',
    oliveDark: '#646D40',
    sage: '#A3AD85',
    blush: '#E8C9C1',
    rose: '#D4A5A0',
    gold: '#C2A36B',
    ink: '#2F2F2F',
    muted: '#77746D',
  },
  hero: {
    label: "We're getting married",
    variant: 'olive',
    images: {
      olive: '/images/hero-olive.svg',
      light: '/images/hero-light.svg',
    },
    imageAlt: 'Illustration of an arch framed by palm trees and greenery',
    scrollHint: 'Our Journey',
  },
  venue: {
    name: 'Wedding Venue',
    address: '',
    mapEmbedUrl: `https://www.google.com/maps?q=${VENUE_LAT_LNG}&output=embed`,
    directionsUrl: `https://www.google.com/maps?daddr=${VENUE_LAT_LNG}`,
  },
  location: {
    label: 'Join us at',
    title: 'Location',
  },
  calendar: {
    title: 'Mohamed & Mai — Wedding',
    description: 'We can’t wait to celebrate with you.',
    location: VENUE_LAT_LNG,
    durationHours: 6,
  },
  journey: {
    label: 'Our Journey',
    title: 'Our Love Story',
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
  rsvp: {
    // Off: removed at the couple's request. Set to true to show the RSVP form again.
    enabled: false,
    title: 'RSVP',
    subtitle: 'Kindly let us know if you can join us',
    maxGuests: 4,
    endpoint: '',
  },
  footer: {
    thankYou: 'Thank you',
    note: 'We can’t wait to celebrate with you.',
  },
  music: {
    src: '/audio/music.mp3',
    // Off by default. Set both to true to play on the seal tap and show the round toggle.
    autoplay: false,
    toggle: false,
  },
}
