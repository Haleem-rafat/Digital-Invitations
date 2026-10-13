import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
} from 'framer-motion'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { invitation } from '../../data/invitation'
import { FallingPetals } from '../florals/Florals'
import { DECKLE, deckleMaskSvg } from './geometry'
import { Paper } from './Paper'
import { playPaperRustle } from './paperRustle'
import { EASE, FLAP_OPEN_ANGLE, TIMELINE } from './timeline'
import { useTilt } from './useTilt'
import { WaxSeal } from './WaxSeal'

const TRIANGLE = 'polygon(0 0, 100% 0, 50% 100%)'
// The flap starts 4% above the screen (like the card) so tilting never reveals its hinge; tip stays at 38%.
const FLAP_OVERHANG = 4
const FLAP_HEIGHT = `${38 + FLAP_OVERHANG}%`

const svgUri = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`

// Card keeps everything above the torn strip, plus a repeating deckled edge along the bottom.
const DECKLE_MASK: CSSProperties = {
  maskImage: `linear-gradient(#000, #000), ${svgUri(deckleMaskSvg)}`,
  maskSize: `100% calc(100% - ${DECKLE.height}px), ${DECKLE.width}px ${DECKLE.height}px`,
  maskPosition: 'top, bottom',
  maskRepeat: 'no-repeat, repeat-x',
  WebkitMaskImage: `linear-gradient(#000, #000), ${svgUri(deckleMaskSvg)}`,
  WebkitMaskSize: `100% calc(100% - ${DECKLE.height}px), ${DECKLE.width}px ${DECKLE.height}px`,
  WebkitMaskPosition: 'top, bottom',
  WebkitMaskRepeat: 'no-repeat, repeat-x',
}
// Fixed so the composition is the same on every load: position %, size px, drift px, seconds, opacity.
const DUST = [
  { x: 14, y: 22, s: 3, dx: 18, dy: -60, dur: 14, delay: 0, o: 0.5 },
  { x: 78, y: 16, s: 2, dx: -14, dy: -48, dur: 17, delay: 3, o: 0.4 },
  { x: 62, y: 48, s: 4, dx: 22, dy: -70, dur: 19, delay: 1.5, o: 0.35 },
  { x: 24, y: 64, s: 2.5, dx: -16, dy: -54, dur: 15, delay: 6, o: 0.55 },
  { x: 86, y: 70, s: 3, dx: -24, dy: -66, dur: 18, delay: 4.5, o: 0.45 },
  { x: 40, y: 82, s: 2, dx: 12, dy: -50, dur: 16, delay: 8, o: 0.6 },
  { x: 8, y: 44, s: 3.5, dx: 20, dy: -58, dur: 20, delay: 10, o: 0.3 },
  { x: 54, y: 30, s: 2, dx: -10, dy: -44, dur: 13, delay: 7, o: 0.5 },
]

interface EnvelopeIntroProps {
  guestName?: string | null
  /** Runs at the end of the tap handler (still inside the user gesture) — start music here. */
  onTap?: () => void
  /** Runs when the timeline has finished; unmount the intro. */
  onOpened: () => void
}

export function EnvelopeIntro({ guestName, onTap, onOpened }: EnvelopeIntroProps) {
  const reduce = useReducedMotion()
  const { couple, envelope, dateShort } = invitation
  const colors = envelope.colors

  const [opening, setOpening] = useState(false)
  const [paused, setPaused] = useState(false)
  const running = useRef<AnimationPlaybackControls[]>([])
  const breathing = useRef<AnimationPlaybackControls | null>(null)
  const doneTimer = useRef<number | undefined>(undefined)
  const tilt = useTilt(!reduce && !opening)

  // Everything the timeline drives (transform/opacity only)
  const root = useMotionValue(1)
  const sealScale = useMotionValue(1)
  const flapAngle = useMotionValue(0)
  const flapY = useMotionValue('0%')
  const flapOpacity = useMotionValue(1)
  const cardOpacity = useMotionValue(1)
  const cardScale = useMotionValue(1)
  // Shadow spreads over the card as the flap lifts, peaks edge-on, then clears.
  const shadowOpacity = useTransform(flapAngle, [0, FLAP_OPEN_ANGLE / 2, FLAP_OPEN_ANGLE], [0, 1, 0])

  // Idle: the seal gently breathes.
  useEffect(() => {
    if (reduce) return
    breathing.current = animate(sealScale, 1.03, {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'mirror',
    })
    return () => breathing.current?.stop()
  }, [reduce, sealScale])

  useEffect(
    () => () => {
      running.current.forEach((c) => c.stop())
      window.clearTimeout(doneTimer.current)
    },
    [],
  )

  // Pause ambient CSS animations (dust, flare, shimmer, shine) while the tab is hidden.
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  function open() {
    if (opening) return
    setOpening(true)
    breathing.current?.stop()
    navigator.vibrate?.(15)
    playPaperRustle()

    const T = TIMELINE
    const play = (c: AnimationPlaybackControls) => running.current.push(c)

    if (reduce) {
      play(animate(root, 0, { duration: T.reduced.fade, ease: 'easeInOut' }))
      doneTimer.current = window.setTimeout(onOpened, T.reduced.done * 1000)
    } else {
      const pressEnd = T.press.duration / (T.press.duration + T.press.release)
      play(
        animate(sealScale, [sealScale.get(), 0.94, 1], {
          delay: T.press.start,
          duration: T.press.duration + T.press.release,
          times: [0, pressEnd, 1],
          ease: ['easeOut', 'easeInOut'],
        }),
      )
      play(animate(flapAngle, FLAP_OPEN_ANGLE, { delay: T.flap.start, duration: T.flap.duration, ease: EASE.flap }))
      play(animate(flapY, '-110%', { delay: T.flapExit.start, duration: T.flapExit.duration, ease: EASE.inOut }))
      play(animate(flapOpacity, 0, { delay: T.flapExit.start, duration: T.flapExit.duration, ease: EASE.inOut }))
      play(animate(cardOpacity, 0, { delay: T.card.start, duration: T.card.duration, ease: EASE.inOut }))
      play(animate(cardScale, T.card.scaleTo, { delay: T.card.start, duration: T.card.duration, ease: EASE.inOut }))
      doneTimer.current = window.setTimeout(onOpened, T.done * 1000)
    }

    // Last, so it's still within the user gesture for mobile autoplay rules.
    onTap?.()
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden [perspective:1400px]"
      style={{ opacity: root }}
      role="dialog"
      aria-modal="true"
      aria-label={`${envelope.title} — ${couple.partner1} & ${couple.partner2}`}
      data-paused={paused || undefined}
      onPointerDown={tilt.requestGyro}
    >
      {/* Tilt wrapper: the whole envelope leans with the phone / mouse.
          Kept flat (not preserve-3d) so the flap always paints above the card while it folds back;
          its own perspective drives the flap's 3D fold. */}
      <motion.div
        className="absolute inset-0 [perspective:1400px] will-change-transform"
        style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY }}
      >
        {/* Card body — oversized on three sides so the tilt never shows an edge; deckled at the bottom */}
        <motion.div
          className="absolute -inset-x-[4%] -top-[4%] bottom-0 will-change-transform"
          style={{ ...DECKLE_MASK, opacity: cardOpacity, scale: cardScale }}
        >
          <Paper
            color={colors.paper}
            lightX={tilt.lightX}
            lightY={tilt.lightY}
            ink={colors.pattern}
            patternImage={envelope.patternImage}
            clearAt="50% 63%"
          />

          {/* soft floating light flare */}
          <div
            className="light-flare pointer-events-none absolute top-[8%] left-[2%] size-[85vmax] rounded-full mix-blend-soft-light"
            style={{ background: 'radial-gradient(circle, rgba(255,250,235,.55), rgba(255,250,235,0) 60%)' }}
            aria-hidden="true"
          />

          {/* gold dust */}
          {DUST.map((d, i) => (
            <span
              key={i}
              className="gold-dust pointer-events-none absolute rounded-full"
              style={
                {
                  left: `${d.x}%`,
                  top: `${d.y}%`,
                  width: d.s,
                  height: d.s,
                  background: 'radial-gradient(circle, #FFF3C4 0%, #D9B76A 45%, rgba(217,183,106,0) 72%)',
                  boxShadow: '0 0 6px rgba(240,210,140,.6)',
                  '--dx': `${d.dx}px`,
                  '--dy': `${d.dy}px`,
                  '--dur': `${d.dur}s`,
                  '--delay': `${d.delay}s`,
                  '--o': d.o,
                } as CSSProperties
              }
              aria-hidden="true"
            />
          ))}

          <div className="absolute inset-x-0 top-[55%] px-6 text-center">
            {guestName && (
              <motion.p
                className="mb-1 font-serif text-[1.7rem] font-medium italic"
                style={{ color: colors.ink, textShadow: '0 1px 0 rgba(255,255,255,.3)' }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.9, ease: EASE.out }}
              >
                Dear {guestName},
              </motion.p>
            )}
            <motion.h1
              className="foil-text inline-block px-3 font-pinyon text-[clamp(3.8rem,17vw,5rem)] leading-[1.35]"
              style={{ backgroundImage: `linear-gradient(115deg, ${colors.foil.join(', ')})` }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1, ease: EASE.out }}
            >
              {envelope.title}
            </motion.h1>
            <motion.p
              className="mt-1 font-sans text-[0.74rem] font-semibold tracking-[0.3em] uppercase"
              style={{ color: colors.gold, textShadow: '0 1px 0 rgba(255,255,255,.35), 0 0 12px rgba(255,255,255,.25)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.9, ease: 'easeInOut' }}
            >
              {couple.partner1} &amp; {couple.partner2} · {dateShort}
            </motion.p>
          </div>

          <motion.p
            className="absolute inset-x-0 bottom-[max(3rem,calc(env(safe-area-inset-bottom)+1.5rem))] text-center font-sans text-[0.68rem] font-normal tracking-[0.3em] uppercase"
            style={{ color: colors.ink, textShadow: '0 1px 0 rgba(255,255,255,.3)' }}
            initial={{ opacity: 0 }}
            animate={opening ? { opacity: 0 } : { opacity: [0.55, 1, 0.55] }}
            transition={
              opening
                ? { duration: 0.25, ease: 'easeInOut' }
                : { delay: 1.4, duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
            }
            aria-hidden="true"
          >
            {envelope.tapHint}
          </motion.p>
        </motion.div>

        {/* Shadow cast by the lifting flap */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-black/45 to-transparent will-change-[opacity]"
          style={{ opacity: shadowOpacity }}
          aria-hidden="true"
        />

        {/* Top flap */}
        <motion.div
          className="absolute -inset-x-[4%] origin-top [transform-style:preserve-3d] will-change-transform"
          style={{ top: `-${FLAP_OVERHANG}%`, height: FLAP_HEIGHT, rotateX: flapAngle, y: flapY, opacity: flapOpacity }}
        >
          {/* front face: paper thickness = light edge line + two-step shadow beneath */}
          <div className="absolute inset-0 [backface-visibility:hidden] [filter:drop-shadow(0_3px_5px_rgba(0,0,0,.22))_drop-shadow(0_10px_18px_rgba(0,0,0,.12))]">
            <div className="absolute inset-0" style={{ clipPath: TRIANGLE }}>
              <Paper
                color={colors.flap}
                lightX={tilt.lightX}
                lightY={tilt.lightY}
                ink={colors.pattern}
                patternImage={envelope.patternImage}
                vignette={false}
              />
              {/* fold crease where the flap hinges */}
              <div className="absolute inset-x-0 h-px bg-black/10" style={{ top: `calc(${(FLAP_OVERHANG / 42) * 100}% + 8px)` }} />
              <div className="absolute inset-x-0 h-px bg-white/25" style={{ top: `calc(${(FLAP_OVERHANG / 42) * 100}% + 9px)` }} />
            </div>
            <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path
                d="M0 0 L50 100 L100 0"
                fill="none"
                stroke="rgba(255,255,255,.35)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          {/* back face — the inside of the envelope */}
          <div
            className="absolute inset-0 [backface-visibility:hidden] [transform:rotateX(180deg)]"
            style={{ clipPath: TRIANGLE }}
          >
            <Paper color={colors.inside} vignette={false} />
          </div>

          {/* wax seal rides on the flap tip and disappears when the flap turns edge-on */}
          <div
            className="absolute top-full left-1/2 size-[clamp(124px,36vw,156px)] [backface-visibility:hidden]"
            style={{ transform: 'translate(-50%, -50%) translateZ(1px)' }}
          >
            <motion.button
              type="button"
              onClick={open}
              disabled={opening}
              aria-label={`Open the invitation. ${envelope.tapHint}`}
              className="relative block size-full cursor-pointer rounded-full will-change-transform [filter:drop-shadow(0_2px_3px_rgba(0,0,0,.35))_drop-shadow(0_8px_16px_rgba(0,0,0,.25))] disabled:cursor-default"
              style={{ scale: sealScale }}
            >
              <WaxSeal
                color={colors.wax}
                monogram={envelope.monogram}
                monogramColor={colors.monogram}
                emblem={envelope.sealEmblem}
                highlightX={tilt.glossX}
                highlightY={tilt.glossY}
                shine={!reduce && !opening}
              />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* slow, sparse falling petals over the envelope */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: cardOpacity }}>
        <FallingPetals className="absolute" />
      </motion.div>
    </motion.div>
  )
}
