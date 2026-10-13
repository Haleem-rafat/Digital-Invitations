/** Vector geometry for the envelope: floral line pattern, wax-seal outline, deckled edge. */

type Pt = [number, number]
const r2 = (n: number) => Math.round(n * 100) / 100
const fmt = ([x, y]: Pt) => `${r2(x)} ${r2(y)}`

/* ------------------------------------------------------------------ florals */

function polar(cx: number, cy: number, r: number, a: number): Pt {
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}

const deg = (d: number) => (d * Math.PI) / 180

/** Garden rose seen from above: curled heart, nested cupped petals, five open ruffled petals. */
function rose(cx: number, cy: number, R: number, rot = 0): string[] {
  const p = (r: number, a: number) => fmt(polar(cx, cy, r, a))
  const arc = (r: number, a: number, span: number, ox = 0, oy = 0) => {
    const c = (ang: number) => fmt(polar(cx + ox, cy + oy, r, ang))
    return `M${c(a)} A${r2(r)} ${r2(r)} 0 0 1 ${c(a + span)}`
  }
  const paths: string[] = []

  // curled heart: a small S of two arcs
  paths.push(arc(R * 0.1, rot + 0.4, 3.4, R * 0.03, 0))
  paths.push(arc(R * 0.17, rot + 3.6, 2.6, -R * 0.02, R * 0.02))

  // nested cupped petals, each slightly off-centre so they overlap like real petals
  const cups = [
    { r: 0.27, n: 3, span: 2.3 },
    { r: 0.4, n: 4, span: 1.9 },
    { r: 0.55, n: 5, span: 1.5 },
  ]
  cups.forEach((ring, k) => {
    for (let i = 0; i < ring.n; i++) {
      const a = rot + k * 0.6 + i * ((Math.PI * 2) / ring.n)
      const off = R * 0.035
      paths.push(arc(R * ring.r, a, ring.span, Math.cos(a + 1) * off, Math.sin(a + 1) * off))
    }
  })

  // open outer petals with a softly ruffled rim
  const n = 5
  const step = (Math.PI * 2) / n
  for (let i = 0; i < n; i++) {
    const a = rot + 0.35 + i * step
    const w = (step / 2) * 1.04
    const r0 = R * 0.6
    paths.push(
      `M${p(r0, a - w)} C${p(R * 0.98, a - w * 1.1)} ${p(R * 1.02, a - w * 0.5)} ${p(R * 0.97, a - w * 0.12)} ` +
        `Q${p(R * 1.04, a + w * 0.05)} ${p(R * 0.99, a + w * 0.2)} ` +
        `C${p(R * 1.04, a + w * 0.55)} ${p(R * 0.98, a + w * 1.1)} ${p(r0, a + w)}`,
    )
  }
  return paths
}

/** Small five-petal blossom. */
function blossom(cx: number, cy: number, r: number, rot = 0): string[] {
  const p = (rr: number, a: number) => fmt(polar(cx, cy, rr, a))
  const paths = [`M${fmt([cx, cy])} h0.1`]
  for (let i = 0; i < 5; i++) {
    const a = rot + i * ((Math.PI * 2) / 5)
    paths.push(`M${p(r * 0.3, a - 0.42)} C${p(r * 1.15, a - 0.55)} ${p(r * 1.15, a + 0.55)} ${p(r * 0.3, a + 0.42)}`)
  }
  return paths
}

/** Curved leaf with a midrib; base at (x,y), pointing along angle (degrees). */
function leaf(x: number, y: number, len: number, angleDeg: number, bend = 0.08, width = 0.3): string[] {
  const a = deg(angleDeg)
  const t = (u: number, v: number): Pt => {
    const vv = v + bend * len * Math.sin(Math.PI * (u / len)) // gentle curve along its length
    return [x + u * Math.cos(a) - vv * Math.sin(a), y + u * Math.sin(a) + vv * Math.cos(a)]
  }
  const w = len * width
  return [
    `M${fmt(t(0, 0))} C${fmt(t(len * 0.28, -w))} ${fmt(t(len * 0.72, -w * 0.85))} ${fmt(t(len, 0))} ` +
      `C${fmt(t(len * 0.72, w * 0.85))} ${fmt(t(len * 0.28, w))} ${fmt(t(0, 0))}`,
    `M${fmt(t(len * 0.06, 0))} Q${fmt(t(len * 0.5, 0))} ${fmt(t(len * 0.82, 0))}`,
  ]
}

/** Closed teardrop bud with two sepals, base at (x,y). */
function bud(x: number, y: number, len: number, angleDeg: number): string[] {
  const a = deg(angleDeg)
  const t = (u: number, v: number) => fmt([x + u * Math.cos(a) - v * Math.sin(a), y + u * Math.sin(a) + v * Math.cos(a)])
  return [
    `M${t(0, 0)} C${t(len * 0.35, -len * 0.42)} ${t(len * 0.85, -len * 0.2)} ${t(len, 0)} C${t(len * 0.85, len * 0.2)} ${t(len * 0.35, len * 0.42)} ${t(0, 0)}`,
    `M${t(0, 0)} Q${t(len * 0.3, -len * 0.5)} ${t(len * 0.55, -len * 0.42)}`,
    `M${t(0, 0)} Q${t(len * 0.3, len * 0.5)} ${t(len * 0.55, len * 0.42)}`,
  ]
}

/** Small spiral tendril ending at (x,y). */
function tendril(x: number, y: number, r: number, rot = 0): string {
  const pts: string[] = []
  for (let t = 0; t <= Math.PI * 2.6; t += 0.25) pts.push(fmt(polar(x, y, r * (1 - t / (Math.PI * 3)), rot + t)))
  return `M${pts.join(' L')}`
}

/** One 240×240 tile of roses, leaves, buds and vines (stroke-only line art, everything inside the tile). */
export const FLORAL_TILE = 240
export const floralTilePaths: string[] = [
  ...rose(70, 74, 34, 0.3),
  ...rose(176, 172, 22, -0.6),
  // vines
  'M100 96 C 122 118 128 140 150 152 C 156 156 160 158 164 160',
  'M50 102 C 40 132 46 160 30 188 C 24 198 18 204 14 212',
  'M196 156 C 214 128 222 96 212 66 C 208 56 204 50 198 46',
  'M104 60 C 124 46 140 40 160 38',
  'M160 194 C 150 210 134 218 116 220',
  tendril(198, 46, 7, 1.2),
  tendril(14, 212, 6, -0.6),
  tendril(160, 38, 6, 2.6),
  // leaves
  ...leaf(122, 118, 30, 70, 0.1),
  ...leaf(138, 142, 26, -30, -0.08),
  ...leaf(46, 132, 30, 150, 0.1),
  ...leaf(38, 168, 26, 20, -0.1),
  ...leaf(216, 108, 24, 190, 0.08),
  ...leaf(214, 80, 22, -40, -0.08),
  ...leaf(132, 44, 24, -80, 0.1),
  ...leaf(140, 214, 22, 120, -0.08),
  // buds and blossoms
  ...bud(160, 38, 14, -20),
  ...bud(116, 220, 12, 190),
  ...blossom(206, 24, 8, 0.2),
  ...blossom(26, 24, 7, -0.3),
  ...blossom(96, 182, 6, 0.6),
  // seed dots
  'M84 204 h0.1',
  'M76 196 h0.1',
  'M224 216 h0.1',
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

export const deckleMaskSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${DECKLE.width}" height="${DECKLE.height}"><path d="M0 0 H${DECKLE.width} V10 ${[...decklePoints].reverse().map(([x, y]) => `L${x} ${r2(y)}`).join(' ')} Z"/></svg>`


/* ------------------------------------------------------- botanical print */
/*
 * Vintage botanical engraving (wild roses, veined leaves, berry sprays, floret clusters)
 * drawn as fine ink lines — printed onto the envelope paper, like a toile pattern.
 */

type Cubic = [Pt, Pt, Pt, Pt]

function cubicAt(c: Cubic, t: number) {
  const mt = 1 - t
  const x = mt ** 3 * c[0][0] + 3 * mt ** 2 * t * c[1][0] + 3 * mt * t ** 2 * c[2][0] + t ** 3 * c[3][0]
  const y = mt ** 3 * c[0][1] + 3 * mt ** 2 * t * c[1][1] + 3 * mt * t ** 2 * c[2][1] + t ** 3 * c[3][1]
  const dx = 3 * mt ** 2 * (c[1][0] - c[0][0]) + 6 * mt * t * (c[2][0] - c[1][0]) + 3 * t ** 2 * (c[3][0] - c[2][0])
  const dy = 3 * mt ** 2 * (c[1][1] - c[0][1]) + 6 * mt * t * (c[2][1] - c[1][1]) + 3 * t ** 2 * (c[3][1] - c[2][1])
  return { p: [x, y] as Pt, deg: (Math.atan2(dy, dx) * 180) / Math.PI }
}
const cubicD = (c: Cubic) => `M${fmt(c[0])} C${fmt(c[1])} ${fmt(c[2])} ${fmt(c[3])}`

/** Wild rose: five broad notched petals with veins, a stamen ring and pollen dots. */
function wildRose(cx: number, cy: number, R: number, rot = 0): string[] {
  const p = (r: number, a: number) => fmt(polar(cx, cy, r, a))
  const paths: string[] = []
  const step = (Math.PI * 2) / 5
  for (let i = 0; i < 5; i++) {
    const a = rot + i * step
    const w = step * 0.56
    paths.push(
      `M${p(R * 0.3, a - w * 0.5)} C${p(R * 0.75, a - w * 1.05)} ${p(R * 1.08, a - w * 0.75)} ${p(R * 0.98, a - w * 0.22)} ` +
        `Q${p(R * 0.9, a)} ${p(R * 0.98, a + w * 0.22)} ` +
        `C${p(R * 1.08, a + w * 0.75)} ${p(R * 0.75, a + w * 1.05)} ${p(R * 0.3, a + w * 0.5)}`,
    )
    // veins fanning out from the petal base
    for (const k of [-0.5, -0.18, 0.18, 0.5]) {
      paths.push(`M${p(R * 0.42, a + w * k * 0.4)} Q${p(R * 0.6, a + w * k * 0.8)} ${p(R * (0.82 - Math.abs(k) * 0.12), a + w * k)}`)
    }
  }
  // stamen cluster: fine filaments of varied length, each tipped with an anther dot
  for (let i = 0; i < 26; i++) {
    const a = rot + (i / 26) * Math.PI * 2 + (i % 2) * 0.08
    const len = R * (0.2 + ((i * 7) % 5) * 0.035)
    paths.push(`M${p(R * 0.06, a)} Q${p(len * 0.6, a + 0.12)} ${p(len, a)}`)
    paths.push(`M${p(len + 1, a)} h0.1`)
  }
  return paths
}

/** Pointed leaf with midrib, forward-angled veins and a lightly serrated edge. */
function veinedLeaf(x: number, y: number, len: number, deg: number, bend = 0.06): string[] {
  const a = (deg * Math.PI) / 180
  const w = len * 0.3
  const t = (u: number, v: number): Pt => {
    const vv = v + bend * len * Math.sin(Math.PI * (u / len))
    return [x + u * Math.cos(a) - vv * Math.sin(a), y + u * Math.sin(a) + vv * Math.cos(a)]
  }
  const edge = (side: 1 | -1) => {
    const pts: Pt[] = []
    for (let i = 0; i <= 12; i++) {
      const u = (i / 12) * len
      const shape = Math.sin(Math.PI * Math.pow(i / 12, 0.8))
      const tooth = i % 2 ? 0.9 : 1
      pts.push(t(u, side * w * shape * tooth))
    }
    return pts
  }
  const top = edge(-1)
  const bottom = edge(1).reverse()
  const paths = [`M${top.map(fmt).join(' L')} L${bottom.map(fmt).join(' L')}`, `M${fmt(t(0, 0))} Q${fmt(t(len * 0.5, 0))} ${fmt(t(len * 0.94, 0))}`]
  for (const u of [0.2, 0.36, 0.52, 0.68, 0.82]) {
    const reach = Math.sin(Math.PI * Math.pow(u, 0.8)) * w * 0.85
    paths.push(`M${fmt(t(len * u, 0))} Q${fmt(t(len * (u + 0.06), -reach * 0.6))} ${fmt(t(len * (u + 0.12), -reach))}`)
    paths.push(`M${fmt(t(len * u, 0))} Q${fmt(t(len * (u + 0.06), reach * 0.6))} ${fmt(t(len * (u + 0.12), reach))}`)
  }
  return paths
}

/** Berry spray: a branching stem with round berries, each with a tiny highlight. */
function berrySpray(x: number, y: number, deg: number, len: number): string[] {
  const a = (deg * Math.PI) / 180
  const tip: Pt = [x + Math.cos(a) * len, y + Math.sin(a) * len]
  const paths = [`M${fmt([x, y])} Q${fmt([x + Math.cos(a + 0.25) * len * 0.5, y + Math.sin(a + 0.25) * len * 0.5])} ${fmt(tip)}`]
  for (let i = 0; i < 5; i++) {
    const u = 0.35 + i * 0.15
    const base: Pt = [x + Math.cos(a) * len * u, y + Math.sin(a) * len * u]
    const ba = a + (i % 2 ? 0.75 : -0.75)
    const end: Pt = [base[0] + Math.cos(ba) * 12, base[1] + Math.sin(ba) * 12]
    const r = 4.2 - i * 0.3
    paths.push(`M${fmt(base)} L${fmt(end)}`)
    paths.push(`M${r2(end[0] + r)} ${r2(end[1])} A${r} ${r} 0 1 1 ${r2(end[0] + r)} ${r2(end[1] - 0.01)}`)
    paths.push(`M${r2(end[0] - r * 0.5)} ${r2(end[1] - r * 0.2)} A${r * 0.6} ${r * 0.6} 0 0 1 ${r2(end[0] - r * 0.1)} ${r2(end[1] - r * 0.6)}`)
  }
  return paths
}

/** Cluster of tiny five-petal florets on fine stems (like elderflower / baby's breath). */
function floretCluster(x: number, y: number, r: number, deg: number): string[] {
  const a = (deg * Math.PI) / 180
  const hub: Pt = [x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9]
  const paths = [`M${fmt([x, y])} L${fmt(hub)}`]
  for (let i = 0; i < 9; i++) {
    const ang = a + (i - 4) * 0.28
    const d = r * (0.55 + (i % 3) * 0.18)
    const c: Pt = [hub[0] + Math.cos(ang) * d, hub[1] + Math.sin(ang) * d]
    paths.push(`M${fmt(hub)} L${fmt(c)}`)
    const fr = 2.6 + (i % 2) * 0.7
    for (let k = 0; k < 5; k++) {
      const pa = ang + (k * Math.PI * 2) / 5
      const pc: Pt = [c[0] + Math.cos(pa) * fr, c[1] + Math.sin(pa) * fr]
      paths.push(`M${r2(pc[0] + fr * 0.5)} ${r2(pc[1])} A${r2(fr * 0.5)} ${r2(fr * 0.5)} 0 1 1 ${r2(pc[0] + fr * 0.5)} ${r2(pc[1] - 0.01)}`)
    }
  }
  return paths
}

/** Closed rosebud with sepals on a short stem. */
function roseBud(x: number, y: number, len: number, deg: number): string[] {
  const a = (deg * Math.PI) / 180
  const t = (u: number, v: number) => fmt([x + u * Math.cos(a) - v * Math.sin(a), y + u * Math.sin(a) + v * Math.cos(a)])
  return [
    `M${t(0, 0)} C${t(len * 0.3, -len * 0.38)} ${t(len * 0.85, -len * 0.26)} ${t(len, 0)} C${t(len * 0.85, len * 0.26)} ${t(len * 0.3, len * 0.38)} ${t(0, 0)}`,
    `M${t(len * 0.25, -len * 0.18)} Q${t(len * 0.6, -len * 0.02)} ${t(len * 0.92, 0)}`,
    `M${t(0, 0)} Q${t(len * 0.25, -len * 0.5)} ${t(len * 0.6, -len * 0.34)}`,
    `M${t(0, 0)} Q${t(len * 0.25, len * 0.5)} ${t(len * 0.6, len * 0.34)}`,
    `M${t(0, 0)} L${t(-len * 0.7, len * 0.08)}`,
  ]
}

/** Stem with leaves placed along it (alternating sides). */
function leafyStem(c: Cubic, leaves: number, len: number): string[] {
  const out = [cubicD(c)]
  for (let i = 1; i <= leaves; i++) {
    const { p, deg } = cubicAt(c, i / (leaves + 1))
    out.push(...veinedLeaf(p[0], p[1], len * (1 - (i / (leaves + 1)) * 0.3), deg + (i % 2 ? 42 : -42)))
  }
  return out
}

/** One 360×360 tile of botanical engraving (everything kept inside the tile). */
export const BOTANICAL_TILE = 360
export const botanicalTilePaths: string[] = [
  // stems first, flowers drawn over them
  ...leafyStem([[60, 200], [90, 160], [120, 140], [150, 112]], 3, 34),
  ...leafyStem([[150, 112], [200, 180], [240, 230], [262, 270]], 4, 32),
  ...leafyStem([[262, 270], [300, 230], [330, 180], [340, 120]], 3, 26),
  ...leafyStem([[262, 270], [220, 300], [160, 320], [100, 330]], 3, 28),
  ...leafyStem([[150, 112], [160, 80], [190, 50], [230, 30]], 2, 26),
  ...wildRose(150, 112, 44, 0.4),
  ...wildRose(262, 270, 34, -0.2),
  ...roseBud(230, 30, 18, -20),
  ...roseBud(340, 120, 16, -80),
  ...roseBud(100, 330, 16, 170),
  ...berrySpray(60, 200, 110, 70),
  ...berrySpray(300, 330, -20, 44),
  ...floretCluster(240, 150, 28, -50),
  ...floretCluster(70, 90, 26, 210),
  ...floretCluster(30, 290, 22, 60),
  ...veinedLeaf(320, 40, 30, 150),
  ...veinedLeaf(24, 30, 28, 40),
]
