import { motion, type MotionValue } from 'framer-motion'
import { useId } from 'react'
import { sealOutline } from './geometry'

/** Mix a hex colour towards black (amount < 0) or white (amount > 0). */
function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16)
  const target = amount < 0 ? 0 : 255
  const t = Math.abs(amount)
  const ch = (v: number) => Math.round(v + (target - v) * t)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(ch)
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

interface WaxSealProps {
  color: string
  monogram: string
  /** Glossy spot drifts opposite to the tilt */
  highlightX?: MotionValue<number>
  highlightY?: MotionValue<number>
  shine?: boolean
}

/**
 * Layered vector wax seal (viewBox 120×120): bevelled irregular blob, darker inner rim,
 * raised ring, pressed-in centre with a debossed monogram, glossy highlight and shine sweep.
 */
export function WaxSeal({ color, monogram, highlightX, highlightY, shine = true }: WaxSealProps) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const u = (name: string) => `url(#${id}${name})`
  const deep = shade(color, -0.42)
  const pressed = shade(color, -0.18)
  const fontSize = monogram.length > 3 ? 19 : 25

  return (
    <svg viewBox="0 0 120 120" className="size-full overflow-visible" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}wax`} cx="0.36" cy="0.3" r="0.75">
          <stop offset="0" stopColor={shade(color, 0.22)} />
          <stop offset="0.5" stopColor={color} />
          <stop offset="1" stopColor={deep} />
        </radialGradient>
        <radialGradient id={`${id}disc`} cx="0.6" cy="0.65" r="0.6">
          <stop offset="0" stopColor={color} />
          <stop offset="1" stopColor={pressed} />
        </radialGradient>
        <radialGradient id={`${id}spot`}>
          <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}shine`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.38" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}clip`}>
          <path d={sealOutline} />
        </clipPath>

        {/* rounded, poured-wax body: lit top-left + specular gloss */}
        <filter id={`${id}bevel`} filterUnits="userSpaceOnUse" x="0" y="0" width="120" height="120" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.8" result="b" />
          <feDiffuseLighting in="b" surfaceScale="6" diffuseConstant="1.22" lightingColor="#fff" result="d">
            <feDistantLight azimuth="225" elevation="50" />
          </feDiffuseLighting>
          <feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1="1" result="lit" />
          <feSpecularLighting in="b" surfaceScale="6" specularConstant="0.8" specularExponent="26" lightingColor="#fff" result="s">
            <fePointLight x="26" y="16" z="70" />
          </feSpecularLighting>
          <feComposite in="s" in2="SourceAlpha" operator="in" result="s2" />
          <feComposite in="lit" in2="s2" operator="arithmetic" k2="1" k3="0.5" result="glossy" />
          <feComposite in="glossy" in2="SourceAlpha" operator="in" />
        </filter>

        {/* inset 0 -4px 8px rgba(0,0,0,.35): darker rim along the lower inside edge */}
        <filter id={`${id}rim`} filterUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">
          <feOffset in="SourceAlpha" dy="-4" result="off" />
          <feGaussianBlur in="off" stdDeviation="4" result="blur" />
          <feComposite in="SourceAlpha" in2="blur" operator="out" result="edge" />
          <feFlood floodColor="#000" floodOpacity="0.35" />
          <feComposite in2="edge" operator="in" />
        </filter>

        {/* raised ring */}
        <filter id={`${id}raised`} filterUnits="userSpaceOnUse" x="0" y="0" width="120" height="120" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.9" result="b" />
          <feDiffuseLighting in="b" surfaceScale="3" diffuseConstant="1.25" lightingColor="#fff" result="d">
            <feDistantLight azimuth="225" elevation="48" />
          </feDiffuseLighting>
          <feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1="1" result="lit" />
          <feComposite in="lit" in2="SourceAlpha" operator="in" />
        </filter>

        {/* pressed-in centre: lit from the opposite side so it reads as a recess */}
        <filter id={`${id}pressed`} filterUnits="userSpaceOnUse" x="0" y="0" width="120" height="120" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.6" result="b" />
          <feDiffuseLighting in="b" surfaceScale="2.4" diffuseConstant="1.22" lightingColor="#fff" result="d">
            <feDistantLight azimuth="45" elevation="50" />
          </feDiffuseLighting>
          <feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1="1" result="lit" />
          <feComposite in="lit" in2="SourceAlpha" operator="in" />
        </filter>
      </defs>

      <path d={sealOutline} fill={u('wax')} filter={u('bevel')} />
      <path d={sealOutline} fill="#000" filter={u('rim')} />

      <circle cx="60" cy="60" r="40" fill="none" stroke={shade(color, 0.08)} strokeWidth="3.4" filter={u('raised')} />
      <circle cx="60" cy="60" r="33" fill={u('disc')} filter={u('pressed')} />

      {/* debossed monogram: shadow on the top-left, highlight on the bottom-right */}
      <g fontFamily="'Pinyon Script', cursive" fontSize={fontSize} textAnchor="middle" dominantBaseline="central">
        <text x="60.7" y="61.9" fill="#fff" fillOpacity="0.26">
          {monogram}
        </text>
        <text x="59.3" y="60.3" fill="#000" fillOpacity="0.5">
          {monogram}
        </text>
        <text x="60" y="61" fill={shade(color, -0.12)}>
          {monogram}
        </text>
      </g>

      <g clipPath={u('clip')}>
        <motion.g style={{ x: highlightX, y: highlightY }}>
          <ellipse cx="40" cy="32" rx="15" ry="10" transform="rotate(-30 40 32)" fill={u('spot')} />
        </motion.g>
        {shine && <rect className="seal-shine" x="-40" y="-20" width="30" height="160" fill={u('shine')} />}
      </g>
    </svg>
  )
}
