import { motion } from 'framer-motion'
import { Music2, VolumeX } from 'lucide-react'

/** Optional round music toggle (shown only when invitation.music.toggle is true). */
export function MusicToggle({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-label={playing ? 'Pause music' : 'Play music'}
      aria-pressed={playing}
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-40 grid size-11 place-items-center rounded-full border border-gold/60 bg-cream/70 text-olive shadow-soft backdrop-blur"
      style={{ right: 'max(1.25rem, calc((100vw - 430px) / 2 + 1.25rem))' }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.92 }}
    >
      {playing && (
        <motion.span
          className="absolute inset-0 rounded-full border border-olive/40"
          animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
          aria-hidden="true"
        />
      )}
      {playing ? <Music2 className="size-4" strokeWidth={1.5} /> : <VolumeX className="size-4 text-muted" strokeWidth={1.5} />}
    </motion.button>
  )
}
