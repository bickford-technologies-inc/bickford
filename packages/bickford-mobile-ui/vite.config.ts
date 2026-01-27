import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

/**
 * FINAL, HARD-OVERRIDE PWA CONFIG
 * - Prevents injectManifest merge paths
 * - Forces generateSW strategy
 * - Replaces (not merges) all Workbox options
 * - Makes forbidden keys structurally impossible
 */

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 🔒 Disable all legacy / implicit injection paths
      strategies: "generateSW",
      injectRegister: false,
      // 🔒 Hard replacement — nothing upstream can add keys
      workbox: {
        sourcemap: false,
        globPatterns: ["**/*.{js,js,css,html,ico,png,svg}"],
      },
      registerType: "autoUpdate",
      manifest: {
        name: "Bickford",
        short_name: "Bickford",
        start_url: "/",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#000000",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: 5174,
    proxy: {
      "/api": "http://localhost:4000",
      "/metrics": "http://localhost:4000",
    },
  },
});
