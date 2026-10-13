import { motion } from 'framer-motion'
import { Music, VolumeX } from 'lucide-react'

export function MusicToggle({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-label={playing ? 'Pause music' : 'Play music'}
      aria-pressed={playing}
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-40 grid size-12 place-items-center rounded-full bg-cream/90 text-terracotta shadow-card ring-1 ring-terracotta/30 backdrop-blur"
      // keep the button inside the 430px column on wide screens
      style={{ right: 'max(1.25rem, calc((100vw - 430px) / 2 + 1.25rem))' }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {playing && (
        <motion.span
          className="absolute inset-0 rounded-full border border-terracotta/50"
          animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          aria-hidden="true"
        />
      )}
      {playing ? (
        <motion.span
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          className="grid place-items-center"
        >
          <Music className="size-5" strokeWidth={1.5} aria-hidden="true" />
        </motion.span>
      ) : (
        <VolumeX className="size-5 text-muted" strokeWidth={1.5} aria-hidden="true" />
      )}
    </motion.button>
  )
}
