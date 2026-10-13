import { motion, useReducedMotion, useScroll, useTransform, type Transition } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { invitation, type HeroVariant } from '../data/invitation'
import { EASE_LUX } from '../lib/motion'
import { FloralCorners } from './florals/Florals'
import { EASE, TIMELINE } from './intro/timeline'

/** Colours for each hero look. */
const LOOKS: Record<HeroVariant, { img: string; wash: string; inset: string; label: string; names: string; amp: string; date: string; hint: string }> = {
  olive: {
    img: '',
    wash: 'from-olive/70 via-olive/30 via-50% to-transparent',
    inset: 'inset 0 10px 30px rgb(20 24 10 / 0.35)',
    label: 'text-cream [text-shadow:0_1px_8px_rgb(20_24_10/0.35)]',
    names: 'text-cream [text-shadow:0_2px_16px_rgb(20_24_10/0.35)]',
    amp: 'text-gold [text-shadow:0_1px_10px_rgb(20_24_10/0.3)]',
    date: 'text-cream [text-shadow:0_1px_10px_rgb(20_24_10/0.35)]',
    hint: 'text-olive',
  },
  light: {
    img: 'opacity-80',
    wash: 'from-page/95 via-page/60 via-55% to-page/10',
    inset: 'inset 0 10px 26px rgb(47 47 47 / 0.08)',
    label: 'text-ink/85',
    names: 'text-olive',
    amp: 'text-gold',
    date: 'text-ink',
    hint: 'text-muted',
  },
}

/** Hero look from the config, overridable with ?hero=olive|light so the client can compare. */
function heroVariant(): HeroVariant {
  const q = new URLSearchParams(window.location.search).get('hero')
  return q === 'olive' || q === 'light' ? q : invitation.hero.variant
}

/** `play` flips to true the moment the seal is tapped; delays come from the intro timeline. */
export function Hero({ play }: { play: boolean }) {
  const variant = heroVariant()
  const look = LOOKS[variant]
  const reduce = useReducedMotion()
  const { couple, hero, dateDisplay, timeDisplay } = invitation
  const T = TIMELINE

  // Scene drifts at 0.85× scroll speed
  const { scrollY } = useScroll()
  const sceneY = useTransform(scrollY, (v) => (reduce ? 0 : v * 0.15))

  // label → names (handwriting) → date → scroll hint, one calm step at a time
  const names = T.heroText.start + T.heroText.stagger
  const at = {
    label: T.heroText.start,
    names,
    date: names + 0.8,
    hint: names + 1.0,
  }
  const crossfade: Transition = { duration: T.reduced.fade, delay: T.reduced.heroDelay, ease: 'easeInOut' }
  const reveal = (delay: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 24, filter: 'blur(6px)' },
    animate: play ? { opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } } : undefined,
    transition: reduce ? crossfade : { duration: 0.9, delay, ease: EASE_LUX },
  })

  return (
    <section aria-labelledby="hero-title" className="relative h-[100svh] min-h-[680px] overflow-hidden">
      {/* Visual layer — its bottom 30% fades into the page so there is no hard edge */}
      <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,#000_70%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,#000_70%,transparent)]">
        <motion.div className="absolute inset-0 will-change-transform" style={{ y: sceneY }}>
          <motion.div
            className="absolute inset-0 will-change-transform"
            initial={{ opacity: 0, scale: reduce ? 1 : T.heroBg.scaleFrom }}
            animate={play ? { opacity: 1, scale: 1 } : undefined}
            transition={reduce ? crossfade : { delay: T.heroBg.start, duration: T.heroBg.duration, ease: EASE.out }}
          >
            <img src={hero.images[variant]} alt={hero.imageAlt} className={`ken-burns size-full object-cover ${look.img}`} fetchPriority="high" />
            {/* light wash so the names stay legible on any replacement image */}
            <div className={`absolute inset-0 bg-gradient-to-b ${look.wash}`} />
          </motion.div>
        </motion.div>

        {/* Arch frame: page-coloured surround with an arched window, thin gold border; zooms 1.6 → 1 */}
        <motion.div
          className="absolute inset-x-4 top-4 -bottom-16 rounded-t-full border border-gold/70 will-change-transform"
          style={{ boxShadow: `0 0 0 100vmax var(--color-page), ${look.inset}` }}
          initial={{ scale: reduce ? 1 : T.arch.scaleFrom }}
          animate={play ? { scale: 1 } : undefined}
          transition={reduce ? { duration: 0 } : { delay: T.arch.start, duration: T.arch.duration, ease: EASE.arch }}
          aria-hidden="true"
        >
          <div className="absolute inset-[7px] rounded-t-full border border-gold/30" />
        </motion.div>
      </div>

      {/* Flowers bloom in once the arch has settled */}
      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-[18%]">
        <FloralCorners className="w-44" opacity={0.8} bloom={play} bloomDelay={reduce ? 0 : T.arch.start + 0.5} />
      </div>

      <div className="relative flex h-full flex-col items-center justify-center px-8 pb-[14svh] text-center">
        <motion.p {...reveal(at.label)} className={`font-sans text-sm font-semibold tracking-[0.3em] uppercase ${look.label}`}>
          {hero.label}
        </motion.p>

        <motion.h1
          id="hero-title"
          className={`mt-5 font-script text-[clamp(4.2rem,20vw,5.2rem)] leading-[1.02] ${look.names}`}
          initial={reduce ? { opacity: 0 } : { clipPath: 'inset(-30% 100% -30% -10%)' }}
          animate={play ? (reduce ? { opacity: 1 } : { clipPath: 'inset(-30% -10% -30% -10%)' }) : undefined}
          transition={reduce ? crossfade : { delay: at.names, duration: 1.2, ease: EASE_LUX }}
        >
          {couple.partner1}
          <span className={`block text-5xl ${look.amp}`}>&amp;</span>
          {couple.partner2}
        </motion.h1>

        <motion.div {...reveal(at.date)} className={`mt-6 ${look.date}`}>
          <div className="mx-auto mb-4 flex w-28 items-center gap-2" aria-hidden="true">
            <span className="h-px flex-1 bg-gold" />
            <span className="size-1.5 rotate-45 border border-gold" />
            <span className="h-px flex-1 bg-gold" />
          </div>
          <p className="font-serif text-[1.85rem] font-semibold tracking-wide">{dateDisplay}</p>
          <p className="mt-1 font-sans text-base font-semibold tracking-[0.25em] uppercase">{timeDisplay}</p>
        </motion.div>

        <motion.a
          {...reveal(at.hint)}
          href="#story"
          className={`absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col items-center gap-1 ${look.hint}`}
        >
          <span className="font-serif text-xl font-medium italic">{hero.scrollHint}</span>
          <ChevronDown className="bounce-soft size-5" strokeWidth={1.25} aria-hidden="true" />
        </motion.a>
      </div>
    </section>
  )
}
