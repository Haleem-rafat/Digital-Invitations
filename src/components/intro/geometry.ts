/** Vector geometry for the envelope: peony line pattern, wax-seal outline, deckled edge. */

type Pt = [number, number]
const r2 = (n: number) => Math.round(n * 100) / 100
const fmt = ([x, y]: Pt) => `${r2(x)} ${r2(y)}`

/* ------------------------------------------------------------------ peonies */

function polar(cx: number, cy: number, r: number, a: number): Pt {
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}

/** A ruffled two-lobed petal between radii r0 → r1, centred on angle a, half-width w (radians). */
function petal(cx: number, cy: number, r0: number, r1: number, a: number, w: number) {
  const p = (r: number, ang: number) => fmt(polar(cx, cy, r, ang))
  return (
    `M${p(r0, a - w)} ` +
    `C${p(r1 * 1.12, a - w * 1.15)} ${p(r1 * 1.05, a - w * 0.3)} ${p(r1 * 0.9, a)} ` +
    `C${p(r1 * 1.05, a + w * 0.3)} ${p(r1 * 1.12, a + w * 1.15)} ${p(r0, a + w)}`
  )
}

function peony(cx: number, cy: number, R: number, rot = 0): string[] {
  const rings = [
    { n: 7, r0: 0.34, r1: 1, spread: 0.95, offset: 0 },
    { n: 6, r0: 0.24, r1: 0.7, spread: 0.9, offset: 0.5 },
    { n: 5, r0: 0.12, r1: 0.42, spread: 0.85, offset: 0.25 },
  ]
  const paths: string[] = []
  for (const ring of rings) {
    const step = (Math.PI * 2) / ring.n
    for (let i = 0; i < ring.n; i++) {
      const a = rot + (i + ring.offset) * step
      paths.push(petal(cx, cy, ring.r0 * R, ring.r1 * R, a, (step / 2) * ring.spread))
    }
  }
  // stamens
  for (let i = 0; i < 6; i++) {
    const a = rot + i * ((Math.PI * 2) / 6) + 0.3
    paths.push(`M${fmt(polar(cx, cy, R * 0.05, a))} L${fmt(polar(cx, cy, R * 0.14, a))}`)
  }
  return paths
}

/** Leaf with a midrib, base at (x,y), pointing along angle (degrees). */
function leaf(x: number, y: number, len: number, angleDeg: number, width = 0.32): string[] {
  const a = (angleDeg * Math.PI) / 180
  const t = (u: number, v: number): Pt => [x + u * Math.cos(a) - v * Math.sin(a), y + u * Math.sin(a) + v * Math.cos(a)]
  const w = len * width
  return [
    `M${fmt(t(0, 0))} C${fmt(t(len * 0.3, -w))} ${fmt(t(len * 0.75, -w * 0.8))} ${fmt(t(len, 0))} ` +
      `C${fmt(t(len * 0.75, w * 0.8))} ${fmt(t(len * 0.3, w))} ${fmt(t(0, 0))}`,
    `M${fmt(t(len * 0.08, 0))} Q${fmt(t(len * 0.5, w * 0.12))} ${fmt(t(len * 0.86, 0))}`,
  ]
}

/** One 240×240 tile of peonies, leaves and vines (stroke-only line art). */
export const FLORAL_TILE = 240
export const floralTilePaths: string[] = [
  ...peony(80, 82, 44, 0.2),
  ...peony(186, 186, 22, -0.4),
  // vines
  'M114 116 C 132 140 150 150 166 168',
  'M58 124 C 48 150 40 172 22 196 C 16 204 10 206 8 214',
  'M206 162 C 222 130 226 96 214 60 C 208 44 196 34 180 30',
  'M180 30 C 172 28 168 34 172 38 C 176 42 182 38 178 34',
  'M22 196 C 14 198 12 190 18 188 C 24 186 26 194 20 196',
  // leaves
  ...leaf(124, 128, 30, 75),
  ...leaf(146, 150, 28, -20),
  ...leaf(52, 140, 34, 140),
  ...leaf(36, 172, 28, 30),
  ...leaf(120, 46, 32, -35),
  ...leaf(218, 104, 26, 200),
  ...leaf(212, 70, 24, -60),
  ...leaf(160, 214, 22, 160),
]

/* ---------------------------------------------------------------- wax seal */

/** Closed, smooth blob through uneven points (Catmull-Rom → cubic Bézier). */
function smoothClosed(points: Pt[]) {
  const n = points.length
  let d = `M${fmt(points[0])}`
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n]
    const p1 = points[i]
    const p2 = points[(i + 1) % n]
    const p3 = points[(i + 2) % n]
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${fmt(c1)} ${fmt(c2)} ${fmt(p2)}`
  }
  return `${d} Z`
}

// 11 uneven bumps — fixed values so the seal looks the same on every load.
const SEAL_RADII = [52, 48.5, 53, 49, 54, 47.5, 52.5, 50, 53.5, 48, 51.5]
const SEAL_JITTER = [0, 5, -4, 3, -5, 4, -2, 6, -3, 2, -1]
export const sealOutline = smoothClosed(
  SEAL_RADII.map((r, i) => polar(60, 60, r, ((i * 360) / SEAL_RADII.length + SEAL_JITTER[i] - 90) * (Math.PI / 180))),
)

/* ------------------------------------------------------------ deckled edge */

/** Repeating torn-paper strip (black = keep). Starts and ends at the same height so it tiles. */
export const DECKLE = { width: 240, height: 18 }
const decklePoints: Pt[] = (() => {
  const pts: Pt[] = []
  let seed = 7
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  for (let x = 0; x <= DECKLE.width; x += 3) {
    const y = x === 0 || x >= DECKLE.width ? 10 : 7 + rand() * 6 + Math.sin(x / 17) * 1.5
    pts.push([x, y])
  }
  return pts
})()
const deckleLine = (dy: number) => decklePoints.map(([x, y]) => `L${x} ${r2(y + dy)}`).join(' ')

export const deckleMaskSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${DECKLE.width}" height="${DECKLE.height}"><path d="M0 0 H${DECKLE.width} V10 ${[...decklePoints].reverse().map(([x, y]) => `L${x} ${r2(y)}`).join(' ')} Z"/></svg>`

/** Thin band just above the torn edge — the lighter fibrous rim of handmade paper. */
export const deckleRimSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${DECKLE.width}" height="${DECKLE.height}"><path d="M0 ${10 - 2.6} ${deckleLine(-2.6)} V10 ${[...decklePoints].reverse().map(([x, y]) => `L${x} ${r2(y)}`).join(' ')} Z"/></svg>`
