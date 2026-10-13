import { motion, useReducedMotion, type Transition } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { invitation } from '../data/invitation'
import { useCountdown } from '../hooks/useCountdown'
import { FloralDivider } from './Florals'
import { EASE, TIMELINE } from './intro/timeline'

const pad = (n: number) => String(n).padStart(2, '0')

// Arch geometry in a 300×420 box (matches the container's aspect ratio).
const OUTER_ARCH = 'M10 420V160A140 140 0 0 1 290 160V420Z'
const INNER_ARCH = 'M18 412V160A132 132 0 0 1 282 160V412Z'
const HAIRLINE = 'M32 398V160A118 118 0 0 1 268 160V398Z'

/** `play` flips to true the moment the seal is tapped; delays come from the intro timeline. */
export function Hero({ play }: { play: boolean }) {
  const reduce = useReducedMotion()
  const { couple, hero, dateDisplay, venue, dateISO } = invitation
  const { days, hours, minutes, seconds, isPast } = useCountdown(dateISO)
  const T = TIMELINE

  const crossfade: Transition = { duration: T.reduced.fade, delay: T.reduced.heroDelay, ease: 'easeInOut' }

  const fadeUp = (index: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : T.heroText.y },
    animate: play ? { opacity: 1, y: 0 } : undefined,
    transition: reduce
      ? crossfade
      : {
          duration: T.heroText.duration,
          delay: T.heroText.start + index * T.heroText.stagger,
          ease: EASE.arch,
        },
  })

  const units = [
    { label: 'Days', value: days },
    { label: 'Hours', value: pad(hours) },
    { label: 'Min', value: pad(minutes) },
    { label: 'Sec', value: pad(seconds) },
  ]

  return (
    <section aria-labelledby="hero-title" className="px-5 pt-8 pb-16 text-center">
      <div className="relative mx-auto aspect-[300/420] w-full overflow-hidden">
        {/* illustration */}
        <motion.div
          className="absolute inset-0 will-change-transform"
          initial={{ opacity: 0, scale: reduce ? 1 : T.heroBg.scaleFrom }}
          animate={play ? { opacity: 1, scale: 1 } : undefined}
          transition={reduce ? crossfade : { delay: T.heroBg.start, duration: T.heroBg.duration, ease: EASE.out }}
        >
          <img src={hero.image} alt={hero.imageAlt} className="size-full object-cover" fetchPriority="high" />
          {/* cream wash so the names stay legible on any replacement image */}
          <div className="absolute inset-0 bg-gradient-to-b from-cream/95 via-cream/55 via-45% to-transparent to-70%" />
        </motion.div>

        {/* arch frame overlay: cream surround + blush band, zooms in to frame the scene */}
        <motion.svg
          viewBox="0 0 300 420"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full will-change-transform [filter:drop-shadow(0_8px_14px_rgb(74_63_58/0.18))]"
          initial={{ scale: reduce ? 1 : T.arch.scaleFrom }}
          animate={play ? { scale: 1 } : undefined}
          transition={reduce ? { duration: 0 } : { delay: T.arch.start, duration: T.arch.duration, ease: EASE.arch }}
          aria-hidden="true"
        >
          <path d={`M0 0H300V420H0Z ${OUTER_ARCH}`} fill="#FBF6F1" fillRule="evenodd" />
          <path d={`${OUTER_ARCH} ${INNER_ARCH}`} fill="#F4E4DC" fillRule="evenodd" />
          <path d={OUTER_ARCH} fill="none" stroke="rgb(224 123 79 / 0.3)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <path d={HAIRLINE} fill="none" stroke="rgb(251 246 241 / 0.75)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </motion.svg>

        <div className="absolute inset-x-0 top-[18%] px-8">
          <motion.p {...fadeUp(0)} className="label !text-ink/70">
            {hero.label}
          </motion.p>
          <motion.h1 {...fadeUp(1)} id="hero-title" className="mt-3 font-script text-[3.6rem] leading-[1.05] text-ink">
            {couple.partner1}
            <span className="block text-4xl text-terracotta">&amp;</span>
            {couple.partner2}
          </motion.h1>
        </div>
      </div>

      <motion.div {...fadeUp(2)} className="mt-8">
        <FloralDivider className="mx-auto w-44 text-terracotta" />
        <p className="mt-3 font-serif text-2xl">{dateDisplay}</p>
        <p className="mt-2 flex items-center justify-center gap-1.5 font-sans text-xs font-light tracking-wider text-muted">
          <MapPin className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
          {venue.name}
        </p>
      </motion.div>

      <motion.div {...fadeUp(3)} className="mt-8">
        {isPast ? (
          <p className="font-script text-4xl text-terracotta">Just married!</p>
        ) : (
          <div
            className="mx-auto grid max-w-xs grid-cols-4 gap-2.5"
            role="timer"
            aria-label={`${days} days, ${hours} hours, ${minutes} minutes until the wedding`}
          >
            {units.map((u) => (
              <div key={u.label} className="rounded-2xl bg-white/70 py-3 shadow-soft ring-1 ring-blush">
                <span className="block font-serif text-3xl leading-none tabular-nums" aria-hidden="true">
                  {u.value}
                </span>
                <span className="label mt-1.5 block !text-[0.55rem] !tracking-[0.2em]" aria-hidden="true">
                  {u.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  )
}
