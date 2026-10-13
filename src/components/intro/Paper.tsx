import { motion, type MotionValue } from 'framer-motion'
import { useEffect, useId, useState } from 'react'
import { FLORAL_TILE, floralTilePaths } from './geometry'

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
 * Raised floral pattern: the line art is never drawn, only its lighting —
 * blur → diffuse light from the top-left → remapped so flat paper is 50% grey,
 * then blended with soft-light. Petals get a light top-left edge and a dark bottom-right edge.
 */
function EmbossedFloral() {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  return (
    <svg className="absolute inset-0 size-full mix-blend-soft-light" aria-hidden="true">
      <defs>
        <pattern id={`${id}t`} width={FLORAL_TILE} height={FLORAL_TILE} patternUnits="userSpaceOnUse">
          <g fill="none" stroke="#000" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            {floralTilePaths.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
        </pattern>
        <filter id={`${id}f`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="bump" />
          <feDiffuseLighting in="bump" surfaceScale="3" diffuseConstant="1" lightingColor="#fff" result="light">
            <feDistantLight azimuth="225" elevation="45" />
          </feDiffuseLighting>
          {/* flat surface = sin(45°) ≈ .707 → map to .5 so soft-light leaves it untouched */}
          <feComponentTransfer in="light">
            <feFuncR type="linear" slope="0.7071" />
            <feFuncG type="linear" slope="0.7071" />
            <feFuncB type="linear" slope="0.7071" />
          </feComponentTransfer>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id}t)`} filter={`url(#${id}f)`} />
    </svg>
  )
}

interface PaperProps {
  color: string
  /** Moves the soft daylight gradient opposite to the tilt */
  lightX?: MotionValue<number>
  lightY?: MotionValue<number>
  emboss?: boolean
  /** Optional raster emboss; when the file exists it replaces the SVG relief (soft-light) */
  embossImage?: string
  vignette?: boolean
}

/** Layered paper: base colour, top-left daylight, vignette, grain, fibres, emboss. */
export function Paper({ color, lightX, lightY, emboss = true, embossImage, vignette = true }: PaperProps) {
  const hasImage = useImageExists(emboss ? embossImage : undefined)

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: color }} aria-hidden="true">
      <div
        className="absolute inset-0 opacity-[0.09] mix-blend-multiply"
        style={{ backgroundImage: GRAIN, backgroundSize: '256px' }}
      />
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-multiply"
        style={{ backgroundImage: FIBRES, backgroundSize: '512px' }}
      />
      {emboss &&
        (hasImage ? (
          <div
            className="absolute inset-0 mix-blend-soft-light"
            style={{ backgroundImage: `url("${embossImage}")`, backgroundSize: '240px' }}
          />
        ) : (
          <EmbossedFloral />
        ))}
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
