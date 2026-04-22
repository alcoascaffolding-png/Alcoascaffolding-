import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'
import { imagetools } from 'vite-imagetools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    imagetools(),
    Sitemap({
      hostname: 'https://alcoascaffolding.com',
      dynamicRoutes: [
        '/',
        '/services',
        '/products',
        '/about-us',
        '/contact-us',
        '/projects',
        '/safety',
        '/branches',
        '/services/aluminium-scaffolding',
        '/services/single-width-mobile-towers',
        '/services/double-width-mobile-towers',
        '/services/ms-rent',
        '/services/ms-sale',
        '/products/aluminium-scaffolding',
        '/products/ladders',
        '/products/steel-cuplock-scaffolding'
      ]
    })
  ],
  build: {
    rollupOptions: {
      output: {
        // Add timestamp to filenames for cache busting
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`
      }
    }
  }
})
