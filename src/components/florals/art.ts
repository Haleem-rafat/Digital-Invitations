/**
 * Watercolour-style botanicals drawn as SVG and used as cached data-URI images
 * (rendered once, then only moved with transforms — cheap to sway and scroll).
 * Olive branches, eucalyptus, small white & blush roses, baby's breath.
 */

const r2 = (n: number) => Math.round(n * 100) / 100
export const svgDataUri = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`

const C = {
  stem: '#6F7A4A',
  olive: '#7A8450',
  oliveLight: '#A3AD85',
  euca: '#9FB2A4',
  eucaLight: '#C9D5C9',
  blush: '#E8C9C1',
  rose: '#D4A5A0',
  roseDeep: '#B9837E',
  white: '#FBF8F2',
  whiteShade: '#E7DCD3',
  breath: '#FFFFFF',
}

/** Soft bleeding edges + paper bloom, applied to each group. */
const DEFS = `
<filter id="wc" x="-15%" y="-15%" width="130%" height="130%">
  <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="8"/>
  <feDisplacementMap in="SourceGraphic" scale="4"/>
  <feGaussianBlur stdDeviation="0.45"/>
</filter>
<radialGradient id="blushRose" cx="0.45" cy="0.4" r="0.65">
  <stop offset="0" stop-color="${C.rose}"/><stop offset="0.45" stop-color="${C.blush}"/><stop offset="1" stop-color="${C.blush}" stop-opacity="0.55"/>
</radialGradient>
<radialGradient id="whiteRose" cx="0.45" cy="0.4" r="0.65">
  <stop offset="0" stop-color="${C.whiteShade}"/><stop offset="0.5" stop-color="${C.white}"/><stop offset="1" stop-color="${C.white}" stop-opacity="0.7"/>
</radialGradient>
<linearGradient id="oliveLeaf" x1="0" x2="1">
  <stop offset="0" stop-color="${C.olive}"/><stop offset="1" stop-color="${C.oliveLight}"/>
</linearGradient>
<radialGradient id="eucaLeaf" cx="0.4" cy="0.4" r="0.7">
  <stop offset="0" stop-color="${C.eucaLight}"/><stop offset="1" stop-color="${C.euca}"/>
</radialGradient>`

/** Narrow olive leaf at (x,y) pointing along `deg`. */
function oliveLeaf(x: number, y: number, len: number, deg: number) {
  const w = len * 0.17
  return `<path transform="translate(${r2(x)} ${r2(y)}) rotate(${r2(deg)})" d="M0 0 C ${r2(len * 0.3)} ${r2(-w)} ${r2(len * 0.75)} ${r2(-w * 0.9)} ${r2(len)} 0 C ${r2(len * 0.75)} ${r2(w * 0.9)} ${r2(len * 0.3)} ${r2(w)} 0 0 Z" fill="url(#oliveLeaf)" opacity="0.85"/>` +
    `<path transform="translate(${r2(x)} ${r2(y)}) rotate(${r2(deg)})" d="M1 0 L ${r2(len * 0.85)} 0" stroke="${C.stem}" stroke-width="0.5" opacity="0.5"/>`
}

/** Point on a cubic Bézier and its tangent angle (degrees). */
function onCubic(p: number[][], t: number) {
  const mt = 1 - t
  const x = mt ** 3 * p[0][0] + 3 * mt ** 2 * t * p[1][0] + 3 * mt * t ** 2 * p[2][0] + t ** 3 * p[3][0]
  const y = mt ** 3 * p[0][1] + 3 * mt ** 2 * t * p[1][1] + 3 * mt * t ** 2 * p[2][1] + t ** 3 * p[3][1]
  const dx = 3 * mt ** 2 * (p[1][0] - p[0][0]) + 6 * mt * t * (p[2][0] - p[1][0]) + 3 * t ** 2 * (p[3][0] - p[2][0])
  const dy = 3 * mt ** 2 * (p[1][1] - p[0][1]) + 6 * mt * t * (p[2][1] - p[1][1]) + 3 * t ** 2 * (p[3][1] - p[2][1])
  return { x, y, a: (Math.atan2(dy, dx) * 180) / Math.PI }
}

const cubicPath = (p: number[][]) => `M${p[0].join(' ')} C${p[1].join(' ')} ${p[2].join(' ')} ${p[3].join(' ')}`

/** Olive branch along a cubic, leaves alternating sides. */
function oliveBranch(p: number[][], count: number, len: number) {
  let out = `<path d="${cubicPath(p)}" fill="none" stroke="${C.stem}" stroke-width="1.1" stroke-linecap="round" opacity="0.8"/>`
  for (let i = 1; i <= count; i++) {
    const t = i / (count + 1)
    const { x, y, a } = onCubic(p, t)
    const side = i % 2 ? 1 : -1
    out += oliveLeaf(x, y, len * (1 - t * 0.35), a + side * 38)
  }
  const tip = onCubic(p, 1)
  return out + oliveLeaf(tip.x, tip.y, len * 0.6, tip.a)
}

/** Eucalyptus stem with round paired "coin" leaves. */
function eucalyptus(p: number[][], count: number, r: number) {
  let out = `<path d="${cubicPath(p)}" fill="none" stroke="${C.stem}" stroke-width="0.9" opacity="0.6"/>`
  for (let i = 1; i <= count; i++) {
    const t = i / (count + 0.6)
    const { x, y, a } = onCubic(p, t)
    const rr = r * (1 - t * 0.45)
    const rad = ((a + 90) * Math.PI) / 180
    for (const s of [1, -1]) {
      const cx = x + Math.cos(rad) * rr * 0.95 * s
      const cy = y + Math.sin(rad) * rr * 0.95 * s
      out += `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(rr)}" fill="url(#eucaLeaf)" opacity="0.72"/>`
    }
  }
  return out
}

/** Small cupped rose: soft base, overlapping petal strokes, curled heart. */
function rose(cx: number, cy: number, r: number, kind: 'blush' | 'white') {
  const stroke = kind === 'blush' ? C.roseDeep : '#CDBFB4'
  let out = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${kind}Rose)"/>`
  const arcs = [
    [0.82, 200, 140],
    [0.78, 20, 150],
    [0.6, 120, 130],
    [0.55, 290, 120],
    [0.38, 60, 160],
    [0.3, 230, 150],
  ]
  for (const [k, start, span] of arcs) {
    const rr = r * k
    const a0 = (start * Math.PI) / 180
    const a1 = ((start + span) * Math.PI) / 180
    out += `<path d="M${r2(cx + rr * Math.cos(a0))} ${r2(cy + rr * Math.sin(a0))} A${r2(rr)} ${r2(rr)} 0 0 1 ${r2(cx + rr * Math.cos(a1))} ${r2(cy + rr * Math.sin(a1))}" fill="none" stroke="${stroke}" stroke-width="${r2(Math.max(0.6, r * 0.05))}" stroke-linecap="round" opacity="0.55"/>`
  }
  out += `<circle cx="${r2(cx + r * 0.05)}" cy="${r2(cy - r * 0.02)}" r="${r2(r * 0.12)}" fill="${stroke}" opacity="0.35"/>`
  return out
}

/** Baby's breath: wiry stems ending in tiny white florets. */
function babysBreath(x: number, y: number, deg: number, len: number) {
  const a = (deg * Math.PI) / 180
  let out = ''
  const tips: number[][] = []
  for (let i = 0; i < 5; i++) {
    const spread = a + (i - 2) * 0.32
    const l = len * (0.7 + (i % 3) * 0.15)
    const tx = x + Math.cos(spread) * l
    const ty = y + Math.sin(spread) * l
    out += `<path d="M${r2(x)} ${r2(y)} Q ${r2(x + Math.cos(spread) * l * 0.5 + 3)} ${r2(y + Math.sin(spread) * l * 0.5 - 3)} ${r2(tx)} ${r2(ty)}" fill="none" stroke="#9AA07E" stroke-width="0.5" opacity="0.7"/>`
    tips.push([tx, ty])
  }
  for (const [tx, ty] of tips) {
    for (let j = 0; j < 4; j++) {
      const ox = Math.cos(j * 1.7) * 3.2
      const oy = Math.sin(j * 1.7) * 3.2
      out += `<circle cx="${r2(tx + ox)}" cy="${r2(ty + oy)}" r="${j === 0 ? 2.2 : 1.6}" fill="${C.breath}" stroke="#E2DCD0" stroke-width="0.4"/>`
    }
  }
  return out
}

const wrap = (w: number, h: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${DEFS}</defs><g filter="url(#wc)">${body}</g></svg>`

/** Arrangement growing out of the top-left corner of a 240×240 box. Rotate 180° for bottom-right. */
export const CORNER_SVG = wrap(
  240,
  240,
  eucalyptus([[18, 0], [40, 60], [56, 120], [70, 200]], 7, 9) +
    eucalyptus([[0, 22], [70, 34], [130, 30], [200, 18]], 6, 7) +
    oliveBranch([[0, 40], [60, 52], [120, 80], [190, 96]], 14, 38) +
    oliveBranch([[40, 0], [62, 50], [96, 100], [118, 170]], 12, 34) +
    babysBreath(70, 66, 35, 44) +
    babysBreath(46, 92, 80, 34) +
    babysBreath(110, 44, 10, 30) +
    rose(60, 56, 25, 'blush') +
    rose(100, 34, 17, 'white') +
    rose(36, 96, 13, 'white') +
    rose(84, 86, 10, 'blush'),
)

/** Wreath around the wax seal on the opening screen (300×300, clear centre). */
export const WREATH_SVG = (() => {
  const c = 150
  const R = 104
  const arc = (from: number, to: number) => {
    // cubic approximation of a circular arc for the branch spine
    const a0 = (from * Math.PI) / 180
    const a1 = (to * Math.PI) / 180
    const k = (4 / 3) * Math.tan((a1 - a0) / 4)
    const p0 = [c + R * Math.cos(a0), c + R * Math.sin(a0)]
    const p3 = [c + R * Math.cos(a1), c + R * Math.sin(a1)]
    const p1 = [p0[0] - k * R * Math.sin(a0), p0[1] + k * R * Math.cos(a0)]
    const p2 = [p3[0] + k * R * Math.sin(a1), p3[1] - k * R * Math.cos(a1)]
    return [p0, p1, p2, p3].map((p) => p.map(r2))
  }
  return wrap(
    300,
    300,
    // two olive branches sweeping up from the bottom, eucalyptus underneath
    eucalyptus(arc(95, 175), 6, 8) +
      eucalyptus(arc(85, 5), 6, 8) +
      oliveBranch(arc(100, 250), 22, 28) +
      oliveBranch(arc(80, -70), 22, 28) +
      babysBreath(150, 252, -90, 26) +
      babysBreath(88, 232, -140, 24) +
      babysBreath(212, 232, -40, 24) +
      rose(150, 256, 17, 'blush') +
      rose(124, 250, 12, 'white') +
      rose(176, 250, 12, 'white') +
      rose(62, 120, 10, 'blush') +
      rose(238, 120, 9, 'white'),
  )
})()
