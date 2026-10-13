import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Owns a looping <audio> element. `play()` must be called from a user gesture
 * (the envelope tap) so mobile browsers allow playback.
 */
export function useBackgroundMusic(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  // Whether the user wants music on; used to resume after the tab becomes visible again.
  const wantedRef = useRef(false)

  useEffect(() => {
    const audio = new Audio(src)
    audio.loop = true
    audio.preload = 'none'
    audio.volume = 0.55
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    // A missing/undecodable file fires 'play' then 'error' without 'pause'.
    const onError = () => {
      wantedRef.current = false
      setPlaying(false)
    }
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('error', onError)
    audioRef.current = audio

    const onVisibility = () => {
      if (document.hidden) audio.pause()
      else if (wantedRef.current) audio.play().catch(() => {})
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      audio.pause()
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('error', onError)
      document.removeEventListener('visibilitychange', onVisibility)
      audioRef.current = null
    }
  }, [src])

  const play = useCallback(() => {
    wantedRef.current = true
    // A missing file or blocked autoplay just leaves the toggle in the "off" state.
    audioRef.current?.play().catch(() => {
      wantedRef.current = false
      setPlaying(false)
    })
  }, [])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) play()
    else {
      wantedRef.current = false
      audio.pause()
    }
  }, [play])

  return { playing, play, toggle }
}
