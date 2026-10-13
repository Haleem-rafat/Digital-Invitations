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
import { playPaperRustle } from './paperRustle'
import { fallbackTextures, useTexture } from './textures'
import { EASE, FLAP_OPEN_ANGLE, TIMELINE } from './timeline'

const PAPER = '#A9B892'
const FLAP_PAPER = '#9DAE86'
const INSIDE_PAPER = '#C9D4B8'
const GOLD = '#B8975A'
const INK = '#3F4A37'

const TRIANGLE = 'polygon(0 0, 100% 0, 50% 100%)'
const FLAP_HEIGHT = '38%'

interface EnvelopeIntroProps {
  guestName?: string | null
  /** Runs at the end of the tap handler (still inside the user gesture) — start music here. */
  onTap?: () => void
  /** Runs when the timeline has finished; unmount the intro. */
  onOpened: () => void
}

export function EnvelopeIntro({ guestName, onTap, onOpened }: EnvelopeIntroProps) {
  const reduce = useReducedMotion()
  const { couple, envelope } = invitation
  const paper = useTexture(envelope.textures.paper, fallbackTextures.paper)
  const emboss = useTexture(envelope.textures.emboss, fallbackTextures.emboss)
  const seal = useTexture(envelope.textures.seal, fallbackTextures.seal)

  const [opening, setOpening] = useState(false)
  const running = useRef<AnimationPlaybackControls[]>([])
  const breathing = useRef<AnimationPlaybackControls | null>(null)
  const doneTimer = useRef<number | undefined>(undefined)

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

  const paperBg = (tint: string | null, base: string): CSSProperties => ({
    backgroundColor: base,
    backgroundImage: tint ? `linear-gradient(${tint}, ${tint}), url("${paper}")` : `url("${paper}")`,
    backgroundSize: tint ? `auto, ${envelope.textures.paperSize}` : envelope.textures.paperSize,
  })

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden [perspective:1400px]"
      style={{ opacity: root }}
      role="dialog"
      aria-modal="true"
      aria-label={`${envelope.title} — ${couple.partner1} & ${couple.partner2}`}
    >
      {/* Card body */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ ...paperBg(null, PAPER), opacity: cardOpacity, scale: cardScale }}
      >
        <div
          className="absolute inset-0 opacity-35 mix-blend-multiply"
          style={{ backgroundImage: `url("${emboss}")`, backgroundSize: envelope.textures.embossSize }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgb(40_52_30/0.38)_100%)]"
          aria-hidden="true"
        />

        <div className="absolute inset-x-0 top-[54%] px-6 text-center" style={{ color: INK }}>
          {guestName && (
            <motion.p
              className="mb-1 font-serif text-2xl italic"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.9, ease: EASE.out }}
            >
              Dear {guestName},
            </motion.p>
          )}
          <motion.h1
            className="font-script text-6xl leading-tight"
            style={{
              color: GOLD,
              textShadow: '0 1px 0 rgba(255,255,255,.4), 0 -1px 0 rgba(0,0,0,.15)',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1, ease: EASE.out }}
          >
            {envelope.title}
          </motion.h1>
          <motion.p
            className="label mt-2"
            style={{ color: INK }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.9, duration: 0.9, ease: 'easeInOut' }}
          >
            {envelope.subtitle}
          </motion.p>
        </div>

        <motion.p
          className="label absolute inset-x-0 bottom-[max(2.5rem,env(safe-area-inset-bottom))] text-center"
          style={{ color: INK }}
          initial={{ opacity: 0 }}
          animate={opening ? { opacity: 0 } : { opacity: [0.35, 0.9, 0.35] }}
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

      {/* Top flap (direct child of the perspective container) */}
      <motion.div
        className="absolute inset-x-0 top-0 origin-top [transform-style:preserve-3d] will-change-transform"
        style={{ height: FLAP_HEIGHT, rotateX: flapAngle, y: flapY, opacity: flapOpacity }}
      >
        {/* front face */}
        <div className="absolute inset-0 [backface-visibility:hidden] [filter:drop-shadow(0_4px_6px_rgba(0,0,0,.25))]">
          <div className="absolute inset-0" style={{ ...paperBg('rgb(40 55 25 / 0.1)', FLAP_PAPER), clipPath: TRIANGLE }} />
          {/* thin highlight along the lower edges */}
          <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path
              d="M0 0 L50 100 L100 0"
              fill="none"
              stroke="rgba(255,255,255,.45)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {/* back face — the inside of the envelope */}
        <div
          className="absolute inset-0 [backface-visibility:hidden] [transform:rotateX(180deg)]"
          style={{ ...paperBg('rgb(255 255 255 / 0.4)', INSIDE_PAPER), clipPath: TRIANGLE }}
        />

        {/* wax seal rides on the flap tip and disappears when the flap turns edge-on */}
        <div
          className="absolute top-full left-1/2 size-[clamp(88px,26vw,116px)] [backface-visibility:hidden]"
          style={{ transform: 'translate(-50%, -50%) translateZ(1px)' }}
        >
          <motion.button
            type="button"
            onClick={open}
            disabled={opening}
            aria-label={`Open the invitation. ${envelope.tapHint}`}
            className="relative block size-full cursor-pointer rounded-full will-change-transform [filter:drop-shadow(0_6px_12px_rgba(0,0,0,.35))] disabled:cursor-default"
            style={{ scale: sealScale }}
          >
            <img src={seal} alt="" className="pointer-events-none size-full select-none" draggable={false} />

            {envelope.showInitialsOnSeal && (
              <span
                className="pointer-events-none absolute inset-0 grid place-items-center font-script text-[clamp(1.6rem,7.5vw,2.2rem)] leading-none"
                style={{
                  color: '#B8343A',
                  textShadow: '0 1px 0 rgba(255,255,255,.22), 0 -1px 0 rgba(0,0,0,.45), 0 0 6px rgba(0,0,0,.15)',
                }}
                aria-hidden="true"
              >
                {couple.initials}
              </span>
            )}

            {/* shine sweep, masked to the seal's own shape */}
            {!reduce && !opening && (
              <span
                className="pointer-events-none absolute inset-0 overflow-hidden"
                style={{
                  maskImage: `url("${seal}")`,
                  WebkitMaskImage: `url("${seal}")`,
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                }}
                aria-hidden="true"
              >
                <motion.span
                  className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/45 to-transparent will-change-transform"
                  initial={{ x: '-150%' }}
                  animate={{ x: '350%' }}
                  transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2.6, ease: 'easeInOut', delay: 1.5 }}
                />
              </span>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
