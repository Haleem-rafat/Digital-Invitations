/** Decorative horizontal divider: line, sprig, line. */
export function FloralDivider({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M8 20 H 92" opacity="0.6" />
      <path d="M148 20 H 232" opacity="0.6" />
      <g transform="translate(120 20)">
        {[0, 72, 144, 216, 288].map((r) => (
          <ellipse key={r} cx="0" cy="-5.5" rx="3.2" ry="5.5" transform={`rotate(${r})`} />
        ))}
        <circle r="1.6" fill="currentColor" />
      </g>
      <path d="M108 20 C 102 12 96 12 92 14 C 96 18 102 20 108 20 Z" />
      <path d="M132 20 C 138 28 144 28 148 26 C 144 22 138 20 132 20 Z" />
      <path d="M104 22 C 100 28 94 30 90 28" />
      <path d="M136 18 C 140 12 146 10 150 12" />
    </svg>
  )
}

/** Small leafy sprig used above section titles. */
export function Sprig({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 80 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 12 C 28 12 52 12 74 12" />
      {[18, 30, 42, 54].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 12 C ${x + 2} ${6 - (i % 2)} ${x + 7} 4 ${x + 10} 5 C ${x + 8} 9 ${x + 4} 11 ${x} 12 Z`} />
          <path d={`M${x} 12 C ${x + 2} ${18 + (i % 2)} ${x + 7} 20 ${x + 10} 19 C ${x + 8} 15 ${x + 4} 13 ${x} 12 Z`} />
        </g>
      ))}
    </svg>
  )
}
