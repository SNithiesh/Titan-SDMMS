import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Titan SDMMS - Maintenance App',
        short_name: 'Titan SDMMS',
        description: 'Smart Digital Maintenance Management System for Titan Industries Pvt. Ltd. Back Cover Department',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=192&h=192&fit=crop',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=512&h=512&fit=crop',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
