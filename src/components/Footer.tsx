import { invitation } from '../data/invitation'
import { FloralDivider } from './Florals'
import { Reveal } from './Reveal'

export function Footer() {
  const { couple, footer, dateDisplay } = invitation

  return (
    <footer className="px-6 pt-12 pb-28 text-center">
      <Reveal>
        <FloralDivider className="mx-auto w-52 text-sage-dark" />
        <p className="mt-6 font-script text-6xl text-terracotta">{footer.thankYou}</p>
        <p className="mt-3 font-serif text-xl text-ink/80 italic">{footer.note}</p>
        <p className="mt-8 font-script text-3xl">
          {couple.partner1} &amp; {couple.partner2}
        </p>
        <p className="label mt-2">{dateDisplay}</p>
        <FloralDivider className="mx-auto mt-8 w-32 text-sage-dark" />
      </Reveal>
    </footer>
  )
}
