import { Reveal } from './Reveal'
import { Sprig } from './Florals'

interface SectionHeadingProps {
  id: string
  title: string
  subtitle?: string
}

export function SectionHeading({ id, title, subtitle }: SectionHeadingProps) {
  return (
    <Reveal className="mb-10 text-center">
      <Sprig className="mx-auto mb-2 w-16 text-sage-dark" />
      <h2 id={id} className="section-title">
        {title}
      </h2>
      {subtitle && <p className="label mt-2">{subtitle}</p>}
    </Reveal>
  )
}
