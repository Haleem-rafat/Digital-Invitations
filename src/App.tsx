import { MotionConfig } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Countdown } from './components/Countdown'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { VineDivider } from './components/florals/Florals'
import { EnvelopeIntro } from './components/intro/EnvelopeIntro'
import { Location } from './components/Location'
import { LoveStory } from './components/LoveStory'
import { MusicToggle } from './components/MusicToggle'
import { Program } from './components/Program'
import { Rsvp } from './components/Rsvp'
import { ScrollProgress } from './components/ScrollProgress'
import { invitation } from './data/invitation'
import { useBackgroundMusic } from './hooks/useBackgroundMusic'

function readGuestName(): string | null {
  const raw = new URLSearchParams(window.location.search).get('guest')?.trim()
  return raw ? raw.slice(0, 60) : null
}

/** Page colours from the config → CSS variables used by the Tailwind theme. */
function applyTheme() {
  const t = invitation.theme
  const vars: Record<string, string> = {
    '--color-page': t.page,
    '--color-cream': t.cream,
    '--color-olive': t.olive,
    '--color-olive-dark': t.oliveDark,
    '--color-sage': t.sage,
    '--color-blush': t.blush,
    '--color-rose': t.rose,
    '--color-gold': t.gold,
    '--color-ink': t.ink,
    '--color-muted': t.muted,
  }
  for (const [k, v] of Object.entries(vars)) document.documentElement.style.setProperty(k, v)
}
applyTheme()

export default function App() {
  const guestName = useMemo(readGuestName, [])
  const [phase, setPhase] = useState<'sealed' | 'opening' | 'open'>('sealed')
  const opened = phase === 'open'
  const music = useBackgroundMusic(invitation.music.src)
  const { rsvp } = invitation

  const handleTap = () => {
    setPhase('opening')
    // Music is off by default; when enabled it must start inside this tap (mobile autoplay rules).
    if (invitation.music.autoplay) music.play()
  }

  // Lock scrolling while the envelope covers the page.
  useEffect(() => {
    document.body.style.overflow = opened ? '' : 'hidden'
  }, [opened])

  return (
    <MotionConfig reducedMotion="user">
      {!opened && <EnvelopeIntro guestName={guestName} onTap={handleTap} onOpened={() => setPhase('open')} />}

      <main inert={!opened} className="mx-auto max-w-[430px] overflow-x-clip">
        <Hero play={phase !== 'sealed'} />
        <Countdown />
        <VineDivider />
        <LoveStory />
        <VineDivider />
        <Program />
        {rsvp.enabled && (
          <>
            <VineDivider />
            <Rsvp guestName={guestName} />
          </>
        )}
        <VineDivider />
        <Location />
        <VineDivider />
        <Footer />
      </main>

      {opened && <ScrollProgress />}
      {opened && invitation.music.toggle && <MusicToggle playing={music.playing} onToggle={music.toggle} />}
    </MotionConfig>
  )
}
