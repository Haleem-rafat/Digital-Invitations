# Digital Invitations

Mobile-first wedding invitation — React + Vite + Tailwind v4 + Framer Motion.

```bash
npm install
npm run dev      # http://localhost:5173/?guest=Sarah
npm run build    # static output in dist/
```

## Making a new invitation

1. Edit **`src/data/invitation.ts`** — names, initials (wax seal), date + countdown (`dateISO`), venue & map, journey, program, footer, envelope textures.
2. Replace **`public/images/hero.svg`** with your illustration (or point `hero.image` at a new file, e.g. `/images/hero.jpg`). Keep light colours at the top so the names stay legible.
3. Add background music at **`public/audio/music.mp3`** (or change `music`). If it's missing, the toggle simply stays muted.
4. Personalise links with `?guest=Name` → the envelope shows "Dear Name,".

### Map
In Google Maps: *Share → Embed a map*, copy the `src` URL into `venue.mapEmbedUrl`. `venue.directionsUrl` can be any Maps link.

### Envelope intro
- Timings for the whole envelope → hero reveal live in `src/components/intro/timeline.ts`.
- Textures: `public/textures/paper-sage.jpg`, `emboss-floral.png`, `wax-seal.png` (rendered from the SVGs in `src/components/intro/svg/`). Replace them with real photos/PNGs any time; if a file is missing, the SVG-filter version is used automatically.
- The seal PNG has no monogram; initials come from the config. If your own seal PNG has one, set `envelope.showInitialsOnSeal: false`.
