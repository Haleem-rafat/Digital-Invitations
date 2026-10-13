# Digital Invitations

Mobile-first wedding invitation — React + Vite + Tailwind v4 + Framer Motion.

```bash
npm install
npm run dev      # http://localhost:5173/?guest=Sarah
npm run build    # static output in dist/
```

## Making a new invitation

1. Edit **`src/data/invitation.ts`** — names, date + countdown (`dateISO`), page colours (`theme`), love story, program, gifts (**replace the placeholder bank details**), event details & map, RSVP (`rsvp.enabled`), footer, envelope colours.
2. Hero look: `hero.variant` is `'olive'` or `'light'`. Preview both with `?hero=olive` / `?hero=light`. Illustrations: `public/images/hero-olive.svg` and `hero-light.svg` (replace with your own).
3. Music is off by default. Add **`public/audio/music.mp3`** and set `music.autoplay` / `music.toggle` to `true` to play it on the seal tap and show the round toggle.
4. "Add to Calendar" uses `dateISO` + `calendar` (title, duration, location) — offers an .ics file (Apple/Outlook) and a Google Calendar link.
5. Personalise links with `?guest=Name` → the envelope shows "Dear Name,".

### Map
In Google Maps: *Share → Embed a map*, copy the `src` URL into `venue.mapEmbedUrl`. `venue.directionsUrl` can be any Maps link.

### Envelope intro
- Timings for the whole envelope → hero reveal live in `src/components/intro/timeline.ts`.
- Colours (paper, flap, inside, wax, gold foil), the seal monogram and the short date are in `src/data/invitation.ts` → `envelope`.
- Paper grain, the printed botanical pattern and the wax seal are all vector, so they stay crisp on retina — no image files needed.
- `envelope.sealEmblem`: `'flower'` (embossed sprig) or `'monogram'`. Optional: `public/textures/botanical-pattern.png` replaces the SVG print.
