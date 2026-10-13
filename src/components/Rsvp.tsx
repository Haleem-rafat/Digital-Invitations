import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { invitation } from '../data/invitation'
import { EASE_LUX } from '../lib/motion'
import { SectionFrame } from './SectionFrame'
import { SectionHeader } from './SectionHeader'

type Status = 'idle' | 'sending' | 'sent' | 'error'

// Bottom border only; its colour eases to olive on focus.
const field =
  'w-full border-0 border-b border-gold/50 bg-transparent px-0 py-2.5 font-serif text-lg text-ink placeholder:text-muted/60 transition-colors duration-500 focus:border-olive focus:ring-0 focus:outline-none'
const fieldLabel = 'label block !text-ink/60'

// Fixed burst directions so the petals look the same every time.
const PETALS = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2 + (i % 2) * 0.2
  const d = 70 + (i % 3) * 22
  return { x: Math.cos(a) * d, y: Math.sin(a) * d - 30, r: (i * 47) % 360, s: 0.7 + (i % 4) * 0.12 }
})

function PetalBurst() {
  return (
    <div className="pointer-events-none absolute top-14 left-1/2" aria-hidden="true">
      {PETALS.map((p, i) => (
        <motion.span
          key={i}
          className="absolute block h-3 w-2 rounded-[60%_60%_60%_0] bg-rose/70"
          initial={{ x: 0, y: 0, rotate: 0, opacity: 0, scale: 0.4 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 50], rotate: p.r, opacity: [0, 1, 0], scale: p.s }}
          transition={{ duration: 1.8, ease: EASE_LUX, times: [0, 0.4, 1] }}
        />
      ))}
    </div>
  )
}

export function Rsvp({ guestName }: { guestName: string | null }) {
  const { rsvp } = invitation
  const reduce = useReducedMotion()
  const [attending, setAttending] = useState<'yes' | 'no'>('yes')
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    setStatus('sending')
    try {
      if (rsvp.endpoint) {
        const res = await fetch(rsvp.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ ...data, submittedAt: new Date().toISOString() }),
        })
        if (!res.ok) throw new Error(`RSVP failed: ${res.status}`)
      } else {
        console.info('RSVP (no endpoint configured):', data)
        await new Promise((r) => setTimeout(r, 700))
      }
      setStatus('sent')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <SectionFrame labelledBy="rsvp-title">
      <SectionHeader id="rsvp-title" title={rsvp.title} subtitle={rsvp.subtitle} />

      <div className="relative">
          <AnimatePresence mode="wait" initial={false}>
            {status === 'sent' ? (
              <motion.div key="done" className="py-10 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status">
                {!reduce && <PetalBurst />}
                <motion.p
                  className="font-script text-6xl text-olive"
                  initial={reduce ? { opacity: 0 } : { clipPath: 'inset(-30% 100% -30% -10%)' }}
                  animate={reduce ? { opacity: 1 } : { clipPath: 'inset(-30% -10% -30% -10%)' }}
                  transition={{ duration: 1.2, delay: 0.2, ease: EASE_LUX }}
                >
                  Thank you!
                </motion.p>
                <p className="mt-3 font-serif text-lg text-muted italic">
                  {attending === 'yes' ? 'We can’t wait to celebrate with you.' : 'We’ll miss you — thank you for letting us know.'}
                </p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} className="space-y-6" exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <div>
                  <label htmlFor="rsvp-name" className={fieldLabel}>
                    Full name
                  </label>
                  <input id="rsvp-name" name="name" required autoComplete="name" defaultValue={guestName ?? ''} className={field} />
                </div>

                <fieldset>
                  <legend className={fieldLabel}>Will you attend?</legend>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    {(
                      [
                        ['yes', 'Joyfully accept'],
                        ['no', 'Regretfully decline'],
                      ] as const
                    ).map(([value, text]) => (
                      <label
                        key={value}
                        className={`cursor-pointer rounded-full border px-3 py-2.5 text-center font-serif text-base transition-colors duration-500 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-olive ${
                          attending === value ? 'border-olive bg-olive/10 text-ink' : 'border-gold/50 text-muted'
                        }`}
                      >
                        <input
                          type="radio"
                          name="attending"
                          value={value}
                          checked={attending === value}
                          onChange={() => setAttending(value)}
                          className="sr-only"
                        />
                        {text}
                      </label>
                    ))}
                  </div>
                </fieldset>

                {attending === 'yes' && (
                  <div className="grid grid-cols-[1fr_1.4fr] gap-5">
                    <div>
                      <label htmlFor="rsvp-guests" className={fieldLabel}>
                        Guests
                      </label>
                      <select id="rsvp-guests" name="guests" defaultValue="1" className={field}>
                        {Array.from({ length: rsvp.maxGuests }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="rsvp-diet" className={fieldLabel}>
                        Dietary notes
                      </label>
                      <input id="rsvp-diet" name="dietary" className={field} placeholder="Optional" />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="rsvp-message" className={fieldLabel}>
                    Message
                  </label>
                  <textarea id="rsvp-message" name="message" rows={2} className={`${field} resize-none`} placeholder="Optional" />
                </div>

                {status === 'error' && (
                  <p role="alert" className="font-sans text-xs text-wine">
                    Something went wrong sending your reply. Please try again.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="btn-pill w-full !py-4 disabled:opacity-70"
                >
                  {status === 'sending' && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                  {status === 'sending' ? 'Sending' : 'Send RSVP'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
      </div>
    </SectionFrame>
  )
}
