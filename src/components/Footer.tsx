import { invitation } from '../data/invitation'
import { Item, ScriptTitle, Stagger } from '../lib/motion'
import { FallingPetals } from './florals/Florals'
import { SectionFrame } from './SectionFrame'

/** Closing screen: framed thank-you with corner florals and gently falling petals. */
export function Footer() {
  const { couple, footer, dateDisplay } = invitation

  return (
    <footer className="relative pb-16">
      <SectionFrame labelledBy="closing-title" className="text-center">
        {/* petals stay inside the rounded frame (content box is inset by the frame padding) */}
        <div className="pointer-events-none absolute -inset-x-6 -inset-y-16 overflow-hidden rounded-[28px]">
          <FallingPetals className="absolute" />
        </div>
        <Stagger className="relative py-10" delay={0.2}>
          <ScriptTitle id="closing-title" className="font-script text-6xl text-olive">
            {footer.thankYou}
          </ScriptTitle>
          <Item className="mx-auto mt-5 flex w-24 items-center justify-center gap-2">
            <span className="h-px flex-1 bg-gold/70" />
            <span className="size-1.5 rotate-45 border border-gold" />
            <span className="h-px flex-1 bg-gold/70" />
          </Item>
          <Item as="p" className="mt-5 font-serif text-[1.35rem] font-medium text-muted italic">
            {footer.note}
          </Item>
          <Item as="p" className="mt-8 font-script text-[2.6rem] leading-tight whitespace-nowrap text-olive">
            {couple.partner1}
            <span className="mx-3 text-gold">&amp;</span>
            {couple.partner2}
          </Item>
          <Item as="p" className="label mt-3">
            {dateDisplay}
          </Item>
        </Stagger>
      </SectionFrame>
    </footer>
  )
}
