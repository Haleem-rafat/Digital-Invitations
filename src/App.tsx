import { useEffect, useMemo, useState } from 'react'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { EnvelopeIntro } from './components/intro/EnvelopeIntro'
import { Journey } from './components/Journey'
import { Location } from './components/Location'
import { MusicToggle } from './components/MusicToggle'
import { Program } from './components/Program'
import { invitation } from './data/invitation'
import { useBackgroundMusic } from './hooks/useBackgroundMusic'

function readGuestName(): string | null {
  const raw = new URLSearchParams(window.location.search).get('guest')?.trim()
  return raw ? raw.slice(0, 60) : null
}

export default function App() {
  const guestName = useMemo(readGuestName, [])
  const [phase, setPhase] = useState<'sealed' | 'opening' | 'open'>('sealed')
  const opened = phase === 'open'
  const music = useBackgroundMusic(invitation.music)

  const handleTap = () => {
    setPhase('opening')
    music.play()
  }

  // Lock scrolling while the envelope covers the page.
  useEffect(() => {
    document.body.style.overflow = opened ? '' : 'hidden'
  }, [opened])

  return (
    <>
      {!opened && <EnvelopeIntro guestName={guestName} onTap={handleTap} onOpened={() => setPhase('open')} />}

      <main inert={!opened} className="mx-auto max-w-[430px] overflow-x-clip bg-cream/60 shadow-[0_0_60px_-20px_rgb(74_63_58/0.25)]">
        <Hero play={phase !== 'sealed'} />
        <Journey />
        <Program />
        <Location />
        <Footer />
      </main>

      {opened && <MusicToggle playing={music.playing} onToggle={music.toggle} />}
    </>
  )
}
