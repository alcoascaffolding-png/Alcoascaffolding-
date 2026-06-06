import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'
import { imagetools } from 'vite-imagetools'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const staticRoutes = [
  '/',
  '/ar',
  '/ar/products',
  '/ar/services',
  '/ar/contact-us',
  '/scaffolding-rental-dubai',
  '/products',
  '/aluminum-scaffolding-dubai',
  '/services',
  '/construction-scaffolding-uae',
  '/about-us',
  '/contact-us',
  '/scaffolding-near-me-uae',
  '/projects',
  '/safety',
  '/branches',
  '/scaffolding-rental-abu-dhabi',
  '/scaffolding-rental-musaffah',
  '/blog',
  '/blog/scaffolding-rental-cost-dubai-2026',
  '/blog/aluminium-vs-steel-scaffolding-uae',
  '/blog/scaffolding-near-me-uae-guide',
  '/blog/cuplock-scaffolding-components-guide',
  '/blog/uae-scaffolding-safety-regulations',
  '/blog/mobile-scaffolding-tower-setup-guide',
  '/products/aluminium-scaffolding',
  '/products/ladders',
  '/products/steel-cuplock-scaffolding',
  '/products/couplers',
]

function getServiceRoutes() {
  const file = fs.readFileSync(
    path.join(__dirname, 'src/data/servicesData.js'),
    'utf8'
  )
  return [...file.matchAll(/^\s+'([a-z0-9-]+)':\s*\{/gm)].map(
    (match) => `/services/${match[1]}`
  )
}

export const sitemapRoutes = [...staticRoutes, ...getServiceRoutes()]

export default defineConfig(async ({ mode }) => {
  const plugins = [
    react(),
    imagetools(),
    Sitemap({
      hostname: 'https://alcoascaffolding.com',
      dynamicRoutes: sitemapRoutes,
    }),
  ]

  if (mode === 'prerender') {
    const { default: vitePrerender } = await import('vite-plugin-prerender')
    plugins.push(
      vitePrerender({
        staticDir: path.join(__dirname, 'dist'),
        routes: sitemapRoutes,
        renderer: new vitePrerender.PuppeteerRenderer({
          renderAfterDocumentEvent: 'render-event',
          maxConcurrentRoutes: 4,
        }),
      })
    )
  }

  return {
    plugins,
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            motion: ['framer-motion'],
          },
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },
  }
})
