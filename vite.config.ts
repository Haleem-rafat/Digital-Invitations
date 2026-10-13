import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { invitation } from './src/data/invitation.ts'

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Full site address: config → SITE_URL → Vercel production domain → Netlify / Cloudflare Pages. */
function siteUrl() {
  const env = process.env
  const host =
    invitation.share.siteUrl ||
    env.SITE_URL ||
    env.VERCEL_PROJECT_PRODUCTION_URL ||
    env.URL ||
    env.CF_PAGES_URL ||
    ''
  if (!host) return ''
  return (host.startsWith('http') ? host : `https://${host}`).replace(/\/$/, '')
}

/** Writes the page title and link-preview tags (Open Graph, Twitter/X) from invitation.share. */
function invitationMeta(): Plugin {
  return {
    name: 'invitation-meta',
    transformIndexHtml(html) {
      const { share, theme } = invitation
      const site = siteUrl()
      if (!site) {
        this.warn('share: no site URL — link previews will not show the image. Set invitation.share.siteUrl.')
      }
      const abs = (path: string) => (site ? `${site}${path}` : path)
      const image = abs(share.image)
      const type = share.image.endsWith('.png') ? 'image/png' : 'image/jpeg'
      const meta = [
        ['name', 'description', share.description],
        ['property', 'og:type', 'website'],
        ['property', 'og:site_name', share.siteName],
        ['property', 'og:title', share.title],
        ['property', 'og:description', share.description],
        ['property', 'og:image', image],
        ['property', 'og:image:secure_url', image],
        ['property', 'og:image:type', type],
        ['property', 'og:image:width', '1200'],
        ['property', 'og:image:height', '630'],
        ['property', 'og:image:alt', share.imageAlt],
        ...(site ? [['property', 'og:url', `${site}/`]] : []),
        ['name', 'twitter:card', 'summary_large_image'],
        ['name', 'twitter:title', share.title],
        ['name', 'twitter:description', share.description],
        ['name', 'twitter:image', image],
        ['name', 'twitter:image:alt', share.imageAlt],
        ['name', 'theme-color', theme.page],
      ]
        .map(([attr, key, value]) => `    <meta ${attr}="${key}" content="${escapeHtml(value)}" />`)
        .join('\n')
      const links = [
        `    <link rel="image_src" href="${escapeHtml(image)}" />`,
        ...(site ? [`    <link rel="canonical" href="${site}/" />`] : []),
      ].join('\n')
      return html
        .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(share.title)}</title>`)
        .replace('</head>', `${meta}\n${links}\n  </head>`)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), invitationMeta()],
})
