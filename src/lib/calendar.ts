import { invitation } from '../data/invitation'

/** 20261211T150000Z */
const utcStamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

function eventTimes() {
  const start = new Date(invitation.dateISO)
  const end = new Date(start.getTime() + invitation.calendar.durationHours * 3_600_000)
  return { start, end }
}

const escapeIcs = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')

/** Google Calendar "create event" link. */
export function googleCalendarUrl() {
  const { calendar, venue } = invitation
  const { start, end } = eventTimes()
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: calendar.title,
    dates: `${utcStamp(start)}/${utcStamp(end)}`,
    details: `${calendar.description}\n${venue.directionsUrl}`,
    location: calendar.location,
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

/** Downloads an .ics file — opens in Apple Calendar / Outlook / most Android calendars. */
export function downloadIcs() {
  const { calendar, venue } = invitation
  const { start, end } = eventTimes()
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Digital Invitations//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${utcStamp(start)}-${calendar.title.replace(/\W+/g, '').toLowerCase()}@invitation`,
    `DTSTAMP:${utcStamp(new Date())}`,
    `DTSTART:${utcStamp(start)}`,
    `DTEND:${utcStamp(end)}`,
    `SUMMARY:${escapeIcs(calendar.title)}`,
    `DESCRIPTION:${escapeIcs(`${calendar.description}\n${venue.directionsUrl}`)}`,
    `LOCATION:${escapeIcs(calendar.location)}`,
    `URL:${venue.directionsUrl}`,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcs(calendar.title)} — tomorrow`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `${calendar.title.replace(/[^\w]+/g, '-').replace(/^-|-$/g, '')}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
