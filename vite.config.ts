import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { invitation } from './src/data/invitation'

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Writes the page title and link-preview (Open Graph / Twitter) tags from invitation.share. */
function invitationMeta(): Plugin {
  return {
    name: 'invitation-meta',
    transformIndexHtml(html) {
      const { share, theme } = invitation
      const site = share.siteUrl.replace(/\/$/, '')
      const abs = (path: string) => (site ? `${site}${path}` : path)
      const tags = [
        ['name', 'description', share.description],
        ['property', 'og:type', 'website'],
        ['property', 'og:title', share.title],
        ['property', 'og:description', share.description],
        ['property', 'og:image', abs(share.image)],
        ['property', 'og:image:width', '1200'],
        ['property', 'og:image:height', '630'],
        ['property', 'og:image:alt', share.imageAlt],
        ...(site ? [['property', 'og:url', `${site}/`]] : []),
        ['name', 'twitter:card', 'summary_large_image'],
        ['name', 'twitter:title', share.title],
        ['name', 'twitter:description', share.description],
        ['name', 'twitter:image', abs(share.image)],
        ['name', 'theme-color', theme.page],
      ]
        .map(([attr, key, value]) => `    <meta ${attr}="${key}" content="${escapeHtml(value)}" />`)
        .join('\n')
      return html
        .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(share.title)}</title>`)
        .replace('</head>', `${tags}\n  </head>`)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), invitationMeta()],
})
