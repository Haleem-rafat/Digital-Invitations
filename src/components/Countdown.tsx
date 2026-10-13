import { invitation } from '../data/invitation'
import { useCountdown } from '../hooks/useCountdown'
import { Item, Stagger } from '../lib/motion'
import { AddToCalendar } from './AddToCalendar'
import { SectionFrame } from './SectionFrame'
import { SectionHeader } from './SectionHeader'

const pad = (n: number) => String(n).padStart(2, '0')

/** Live countdown in gold-bordered cards, with Add to Calendar. */
export function Countdown() {
  const { countdown, dateISO, dateDisplay, timeDisplay } = invitation
  const { days, hours, minutes, seconds, isPast } = useCountdown(dateISO)
  const units = [
    { label: 'Days', value: days },
    { label: 'Hours', value: pad(hours) },
    { label: 'Min', value: pad(minutes) },
    { label: 'Sec', value: pad(seconds) },
  ]

  return (
    <SectionFrame labelledBy="countdown-title">
      <SectionHeader id="countdown-title" label={countdown.label} title={countdown.title} subtitle={`${dateDisplay} · ${timeDisplay}`} />

      <Stagger className="text-center">
        <Item>
          {isPast ? (
            <p className="font-script text-5xl text-olive">Just married!</p>
          ) : (
            <div
              className="mx-auto grid max-w-[20.5rem] grid-cols-4 gap-2.5"
              role="timer"
              aria-label={`${days} days, ${hours} hours, ${minutes} minutes until the wedding`}
            >
              {units.map((u) => (
                <div key={u.label} className="rounded-2xl border border-gold/70 bg-page/60 py-3 shadow-soft">
                  <span className="block font-serif text-[2.2rem] font-semibold leading-none text-olive tabular-nums" aria-hidden="true">
                    {u.value}
                  </span>
                  <span className="label mt-1.5 block !text-[0.66rem] !tracking-[0.12em]" aria-hidden="true">
                    {u.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Item>
        <Item className="mt-8 flex flex-col items-center">
          <div className="w-56 [&>button]:w-full">
            <AddToCalendar />
          </div>
        </Item>
      </Stagger>
    </SectionFrame>
  )
}
