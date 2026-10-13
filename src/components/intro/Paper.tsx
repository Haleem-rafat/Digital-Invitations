import { motion, type MotionValue } from 'framer-motion'
import { useEffect, useState } from 'react'
import { BOTANICAL_TILE, botanicalTilePaths } from './geometry'

const svgUri = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`

// Luminance → grey, alpha forced to 1, so multiply only adds texture, never colour.
const GREY = '0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 0 1'

const noiseTile = (size: number, frequency: number, octaves: number, seed: number) =>
  svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
      `<filter id="n" x="0" y="0" width="100%" height="100%">` +
      `<feTurbulence type="fractalNoise" baseFrequency="${frequency}" numOctaves="${octaves}" seed="${seed}" stitchTiles="stitch"/>` +
      `<feColorMatrix values="${GREY}"/></filter>` +
      `<rect width="100%" height="100%" filter="url(#n)"/></svg>`,
  )

/** Fine paper grain (baseFrequency 0.9) and larger cotton fibres (0.04). Vector, so crisp at any DPR. */
const GRAIN = noiseTile(256, 0.9, 3, 4)
const FIBRES = noiseTile(512, 0.04, 3, 9)

/** Returns true once `src` has loaded as an image (false while loading or if missing). */
function useImageExists(src: string | undefined) {
  const [exists, setExists] = useState(false)
  useEffect(() => {
    if (!src) return
    let alive = true
    const img = new Image()
    img.onload = () => alive && setExists(true)
    img.src = src
    return () => {
      alive = false
    }
  }, [src])
  return exists
}

/**
 * Printed botanical engraving (toile-style), drawn as fine ink lines on the paper.
 * Built as a cached SVG background tile so the flap can rotate in 3D cheaply. The pattern is rotated by
 * atan(1/4) ≈ 14°: at that angle the rotated lattice repeats on an axis-aligned square of side T·√17,
 * so the tile is seamless and doesn't read as a grid.
 */
const PRINT_TILE = BOTANICAL_TILE * Math.sqrt(17)
const printCache = new Map<string, string>()
function botanicalPrint(ink: string) {
  const cached = printCache.get(ink)
  if (cached) return cached
  const T = BOTANICAL_TILE
  const S = PRINT_TILE
  const angle = (-Math.atan(1 / 4) * 180) / Math.PI
  const art = botanicalTilePaths.map((d) => `<path d="${d}"/>`).join('')
  const uri = svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">` +
      `<defs><pattern id="p" width="${T}" height="${T}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})">` +
      `<g fill="none" stroke="${ink}" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round">${art}</g></pattern></defs>` +
      `<rect width="${S}" height="${S}" fill="url(#p)"/></svg>`,
  )
  printCache.set(ink, uri)
  return uri
}

interface PaperProps {
  color: string
  /** Moves the soft daylight gradient opposite to the tilt */
  lightX?: MotionValue<number>
  lightY?: MotionValue<number>
  /** Ink colour of the printed botanical pattern; omit for plain paper */
  ink?: string
  /** Optional raster pattern; when the file exists it replaces the SVG print */
  patternImage?: string
  vignette?: boolean
  /** Fades the pattern in an elliptical panel (CSS position, e.g. '50% 62%') so text stays clear */
  clearAt?: string
}

/** Layered paper: base colour, printed botanical pattern, grain, fibres, top-left daylight, vignette. */
export function Paper({ color, lightX, lightY, ink, patternImage, vignette = true, clearAt }: PaperProps) {
  const clearMask = clearAt
    ? `radial-gradient(ellipse 66% 14% at ${clearAt}, rgba(0,0,0,.12) 40%, #000 100%)`
    : undefined
  const patternMask = { maskImage: clearMask, WebkitMaskImage: clearMask }

  const hasImage = useImageExists(ink ? patternImage : undefined)

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: color }} aria-hidden="true">
      {ink &&
        (hasImage ? (
          <div
            className="absolute inset-0"
            style={{ backgroundImage: `url("${patternImage}")`, backgroundSize: '360px', ...patternMask }}
          />
        ) : (
          <div
            className="absolute inset-0 opacity-80"
            style={{ backgroundImage: botanicalPrint(ink), backgroundSize: `${PRINT_TILE * 0.62}px`, ...patternMask }}
          />
        ))}
      {/* paper grain + cotton fibres over the ink, like ink printed into textured stock */}
      <div
        className="absolute inset-0 opacity-[0.12] mix-blend-multiply"
        style={{ backgroundImage: GRAIN, backgroundSize: '256px' }}
      />
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-multiply"
        style={{ backgroundImage: FIBRES, backgroundSize: '512px' }}
      />
      {/* soft daylight from the top-left; oversized so it can drift with the tilt */}
      <motion.div
        className="absolute -inset-[20%] will-change-transform"
        style={{
          x: lightX,
          y: lightY,
          backgroundImage: 'radial-gradient(circle at 34% 24%, rgba(255,255,255,.18), transparent 60%)',
        }}
      />
      {vignette && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(40,50,30,.25)_100%)]" />
      )}
    </div>
  )
}
