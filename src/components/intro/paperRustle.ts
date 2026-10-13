/**
 * A short, soft paper rustle synthesised with Web Audio (no file needed):
 * a few crackly noise bursts through a band-pass filter.
 * Must be called from a user gesture.
 */
export function playPaperRustle(volume = 0.18) {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return

  try {
    const ctx = new Ctx()
    const duration = 0.5
    const length = Math.floor(ctx.sampleRate * duration)
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    // Three overlapping crinkles with quick attack and soft decay
    const bursts = [
      { at: 0.0, decay: 0.07, gain: 1 },
      { at: 0.09, decay: 0.1, gain: 0.7 },
      { at: 0.22, decay: 0.14, gain: 0.45 },
    ]
    for (let i = 0; i < length; i++) {
      const t = i / ctx.sampleRate
      let env = 0
      for (const b of bursts) {
        const dt = t - b.at
        if (dt >= 0) env += b.gain * Math.min(1, dt / 0.006) * Math.exp(-dt / b.decay)
      }
      // sparse crackle on top of a softer hiss
      const crackle = Math.random() < 0.3 ? 1 : 0.3
      data[i] = (Math.random() * 2 - 1) * crackle * env
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer
    const band = ctx.createBiquadFilter()
    band.type = 'bandpass'
    band.frequency.value = 3200
    band.Q.value = 0.7
    const gain = ctx.createGain()
    gain.gain.value = volume
    source.connect(band).connect(gain).connect(ctx.destination)
    source.onended = () => void ctx.close()
    source.start()
  } catch {
    // Audio is a nice-to-have; never block the intro on it.
  }
}
