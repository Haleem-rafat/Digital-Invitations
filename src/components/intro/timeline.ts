/**
 * The whole envelope → hero reveal in one place.
 * All times are in seconds, measured from the moment the seal is tapped.
 * Each segment runs from `start` to `start + duration`.
 */

type Bezier = [number, number, number, number]

export const EASE = {
  /** Flap lift — slow start, slow settle */
  flap: [0.65, 0, 0.35, 1] as Bezier,
  inOut: [0.45, 0, 0.55, 1] as Bezier,
  /** Soft landing for things arriving on screen */
  out: [0.16, 1, 0.3, 1] as Bezier,
  /** Arch zoom + hero text */
  arch: [0.22, 1, 0.36, 1] as Bezier,
}

/** -180 folds the flap back away from the viewer; use 180 to lift it towards the viewer instead. */
export const FLAP_OPEN_ANGLE = -180

export const TIMELINE = {
  /** Seal presses down to 0.94, then springs back to 1 over `release` */
  press: { start: 0, duration: 0.15, release: 0.4 },
  /** Flap rotates open; the shadow under it peaks halfway (-90°) */
  flap: { start: 0.15, duration: 0.95 },
  /** Opened flap + seal slide up (-110%) and fade */
  flapExit: { start: 0.9, duration: 0.5 },
  /** Card body fades out and scales 1 → 1.04 (camera moving in) */
  card: { start: 1.3, duration: 0.6, scaleTo: 1.04 },
  /** Hero illustration fades in, scaling 1.08 → 1 */
  heroBg: { start: 1.5, duration: 0.8, scaleFrom: 1.08 },
  /** Arch frame overlay zooms 1.6 → 1 */
  arch: { start: 2.2, duration: 1.0, scaleFrom: 1.6 },
  /** Hero label, names, date, countdown fade up one after another */
  heroText: { start: 2.6, duration: 0.8, stagger: 0.12, y: 16 },
  /** Intro unmounts and the page becomes scrollable */
  done: 3.2,

  /** prefers-reduced-motion: a simple crossfade instead of the above */
  reduced: { fade: 0.6, heroDelay: 0.2, done: 0.8 },
}
