import { Item, ScriptTitle, Stagger } from '../lib/motion'

interface SectionHeaderProps {
  id: string
  title: string
  /** Small spaced label above the title */
  label?: string
  subtitle?: string
  /** Script title with a handwriting reveal instead of the classic serif heading */
  script?: boolean
}

/** Label → title → thin gold rule → subtitle, staggered 0.12s. */
export function SectionHeader({ id, title, label, subtitle, script }: SectionHeaderProps) {
  return (
    <Stagger as="header" className="mb-10 text-center">
      {label && (
        <Item as="p" className="label">
          {label}
        </Item>
      )}
      {script ? (
        <ScriptTitle id={id} className="mt-2 font-script text-5xl leading-tight text-olive">
          {title}
        </ScriptTitle>
      ) : (
        <Item>
          <h2 id={id} className="section-title mt-2">
            {title}
          </h2>
        </Item>
      )}
      <Item className="mx-auto mt-4 flex w-24 items-center justify-center gap-2">
        <span className="h-px flex-1 bg-gold/70" />
        <span className="size-1.5 rotate-45 border border-gold" />
        <span className="h-px flex-1 bg-gold/70" />
      </Item>
      {subtitle && (
        <Item as="p" className="mt-4 font-sans text-[0.8rem] font-medium tracking-[0.16em] text-muted uppercase">
          {subtitle}
        </Item>
      )}
    </Stagger>
  )
}
