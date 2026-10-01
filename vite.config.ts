import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Guarda uma cópia do index.html sem conteúdo como app.html, com noindex.
 * Ela atende as rotas do app (painel, editor...), enquanto o index.html
 * vira a página inicial pré-renderizada. Roda antes do PWA gerar o service worker.
 */
function casca(): Plugin {
  return {
    name: 'q3-casca-do-app',
    apply: 'build',
    writeBundle(opcoes) {
      if (!opcoes.dir || this.environment?.config.build.ssr) return
      const origem = join(opcoes.dir, 'index.html')
      const destino = join(opcoes.dir, 'app.html')
      copyFileSync(origem, destino)
      const noindex = '<meta name="robots" content="noindex" />'
      const html = readFileSync(destino, 'utf8').replace('<!--seo-->', `<!--seo-->\n    ${noindex}`)
      writeFileSync(destino, html)
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    casca(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icone-192.png'],
      manifest: {
        name: 'Q3 Orça - Orçamentos profissionais',
        short_name: 'Q3 Orça',
        description: 'Monte orçamentos em 2 minutos, envie pelo WhatsApp e receba por Pix.',
        lang: 'pt-BR',
        theme_color: '#ff5a1f',
        background_color: '#faf6f0',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icone-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icone-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icone-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: '/app.html',
        // Páginas do site pré-renderizadas vêm da rede, para o Google e o visitante verem o HTML completo.
        navigateFallbackDenylist: [/^\/$/, /^\/marca/, /^\/modelo/, /^\/termos/, /^\/privacidade/, /^\/contato/],
        // Fontes da marca ficam guardadas para o app abrir bonito também sem internet.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'fontes', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
})
