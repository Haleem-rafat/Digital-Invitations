/**
 * Sounds played when the seal is tapped. Synthesised with Web Audio (no files needed),
 * or a custom audio file path. Must be called from the user gesture.
 *
 *  - 'envelope'  paper envelope opening: seal crack, flap peeling, card sliding out (timed to the animation)
 *  - 'chime'  soft bell arpeggio — light and magical
 *  - 'seal'   wax seal cracking, then paper sliding open
 *  - 'paper'  short paper rustle
 *  - 'none'   silent
 *  - '/audio/your-sound.mp3'  any file in /public
 */
import type { OpenSound } from '../../data/invitation'

type Ctx = AudioContext

function createContext(): Ctx | null {
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  return AC ? new AC() : null
}

/** A buffer of shaped noise. `env(t)` returns the amplitude at time t (seconds). */
function noiseBuffer(ctx: Ctx, seconds: number, env: (t: number) => number, crackle = 0.3) {
  const length = Math.floor(ctx.sampleRate * seconds)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) {
    const t = i / ctx.sampleRate
    const grain = Math.random() < crackle ? 1 : 0.3
    data[i] = (Math.random() * 2 - 1) * grain * env(t)
  }
  return buffer
}

function playNoise(
  ctx: Ctx,
  buffer: AudioBuffer,
  at: number,
  filter: BiquadFilterType,
  freq: number,
  q: number,
  gain: number,
  /** Optional filter sweep: frequency to glide to over the buffer's length */
  sweepTo?: number,
) {
  const src = ctx.createBufferSource()
  src.buffer = buffer
  const f = ctx.createBiquadFilter()
  f.type = filter
  f.frequency.setValueAtTime(freq, ctx.currentTime + at)
  if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, ctx.currentTime + at + buffer.duration)
  f.Q.value = q
  const g = ctx.createGain()
  g.gain.value = gain
  src.connect(f).connect(g).connect(ctx.destination)
  src.start(ctx.currentTime + at)
  return src
}

/** Soft bell: a sine with a quieter inharmonic partial, quick attack, long exponential decay. */
function bell(ctx: Ctx, out: AudioNode, freq: number, at: number, gain: number, decay = 1.8) {
  const t0 = ctx.currentTime + at
  for (const [ratio, level] of [
    [1, 1],
    [2.76, 0.22],
    [5.4, 0.06],
  ]) {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq * ratio
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t0)
    g.gain.linearRampToValueAtTime(gain * level, t0 + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + decay / ratio ** 0.4)
    osc.connect(g).connect(out)
    osc.start(t0)
    osc.stop(t0 + decay + 0.1)
  }
}

function chime(ctx: Ctx) {
  // gentle low-pass + a touch of echo for air
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 5200
  const delay = ctx.createDelay()
  delay.delayTime.value = 0.18
  const feedback = ctx.createGain()
  feedback.gain.value = 0.28
  const master = ctx.createGain()
  master.gain.value = 0.16
  lp.connect(master)
  lp.connect(delay)
  delay.connect(feedback).connect(delay)
  delay.connect(master)
  master.connect(ctx.destination)

  // rising major arpeggio: C6 E6 G6 C7, then a high sparkle
  const notes = [1046.5, 1318.5, 1568, 2093]
  notes.forEach((f, i) => bell(ctx, lp, f, i * 0.09, 0.9 - i * 0.12))
  bell(ctx, lp, 3136, 0.42, 0.25, 1.2)
  return 2.6
}

function seal(ctx: Ctx) {
  // sharp wax crack
  playNoise(ctx, noiseBuffer(ctx, 0.08, (t) => Math.exp(-t / 0.012), 0.6), 0, 'highpass', 2400, 0.7, 0.5)
  // small thump of the seal giving way
  const osc = ctx.createOscillator()
  osc.frequency.setValueAtTime(160, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.12)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.35, ctx.currentTime)
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14)
  osc.connect(g).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.16)
  // paper flap sliding open: soft swell of filtered noise
  playNoise(
    ctx,
    noiseBuffer(ctx, 0.75, (t) => Math.sin(Math.PI * Math.min(1, t / 0.75)) ** 1.5, 0.15),
    0.16,
    'bandpass',
    1800,
    0.6,
    0.22,
  )
  return 1.1
}

/** Paper envelope opening, timed to the intro: seal crack → flap peeling → card sliding out. */
function envelope(ctx: Ctx) {
  // 0.00s — small, dry crack as the seal is pressed and gives
  playNoise(ctx, noiseBuffer(ctx, 0.06, (t) => Math.exp(-t / 0.01), 0.7), 0, 'highpass', 3000, 0.6, 0.22)

  // 0.12–0.75s — flap peeling off the gummed edge: dense crinkles that build, then ease
  const peel = (t: number) => {
    const swell = Math.sin(Math.PI * Math.min(1, t / 0.62)) ** 0.8
    const flutter = 0.65 + 0.35 * Math.sin(t * 90) * Math.sin(t * 37)
    return swell * flutter
  }
  playNoise(ctx, noiseBuffer(ctx, 0.62, peel, 0.55), 0.12, 'bandpass', 2600, 0.55, 0.3, 3600)
  // body of the paper bending — lower, softer layer under the crinkle
  playNoise(ctx, noiseBuffer(ctx, 0.6, (t) => Math.sin(Math.PI * Math.min(1, t / 0.6)), 0.12), 0.15, 'lowpass', 900, 0.7, 0.18)

  // 0.85–1.75s — card sliding out: a smooth paper-on-paper swoosh that brightens as it leaves
  const slide = (t: number) => Math.sin(Math.PI * Math.min(1, t / 0.9)) ** 1.4 * (0.85 + 0.15 * Math.random())
  playNoise(ctx, noiseBuffer(ctx, 0.9, slide, 0.08), 0.85, 'bandpass', 1100, 0.45, 0.26, 3200)

  // 1.6s — soft tap as the card clears the envelope
  playNoise(ctx, noiseBuffer(ctx, 0.05, (t) => Math.exp(-t / 0.015), 0.4), 1.62, 'lowpass', 1400, 0.7, 0.12)
  return 2
}

function paper(ctx: Ctx) {
  const bursts = [
    { at: 0.0, decay: 0.07, gain: 1 },
    { at: 0.09, decay: 0.1, gain: 0.7 },
    { at: 0.22, decay: 0.14, gain: 0.45 },
  ]
  const env = (t: number) =>
    bursts.reduce((sum, b) => {
      const dt = t - b.at
      return dt < 0 ? sum : sum + b.gain * Math.min(1, dt / 0.006) * Math.exp(-dt / b.decay)
    }, 0)
  playNoise(ctx, noiseBuffer(ctx, 0.5, env), 0, 'bandpass', 3200, 0.7, 0.18)
  return 0.7
}

export function playOpenSound(sound: OpenSound) {
  if (sound === 'none') return
  const synths: Record<string, (ctx: Ctx) => number> = { envelope, chime, seal, paper }
  if (!(sound in synths)) {
    const audio = new Audio(sound)
    audio.volume = 0.6
    audio.play().catch(() => {})
    return
  }
  try {
    const ctx = createContext()
    if (!ctx) return
    const seconds = synths[sound](ctx)
    window.setTimeout(() => void ctx.close(), (seconds + 0.5) * 1000)
  } catch {
    // Sound is a nice-to-have; never block the intro on it.
  }
}
