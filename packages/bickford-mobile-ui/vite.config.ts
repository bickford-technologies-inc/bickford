import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    manifest: {
      name: 'Bickford Mobile UI',
      short_name: 'Bickford',
      start_url: '.',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#1976d2',
      icons: [
        {
          src: 'icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }
  })],
  server: {
    host: true,
    port: 5174,
    proxy: {
      '/api': 'http://localhost:3000',
      '/metrics': 'http://localhost:3000',
    },
  }
});
