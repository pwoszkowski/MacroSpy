// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";
import VitePWA from "@vite-pwa/astro";

const site = import.meta.env.SITE_URL ?? "https://macrospy.app";
const avoidOfflineFallbackCachingPlugin = {
  /**
   * Nie zapisuj fallbacku offline pod adresem nawigacji.
   * Zapobiega sytuacji, w której /dashboard zwraca stale stronę offline.
   * @param {{ response?: Response }} context
   */
  cacheWillUpdate: async ({ response }) => {
    if (!response || response.status !== 200) {
      return null;
    }

    if (response.url.includes("/offline")) {
      return null;
    }

    return response;
  },
};

// https://astro.build/config
export default defineConfig({
  site,
  output: "server",
  integrations: [
    react(),
    sitemap(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "icons/pwa-192x192.png",
        "icons/pwa-512x512.png",
        "icons/maskable-icon-512x512.png",
        "icons/apple-touch-icon.png",
      ],
      manifest: {
        name: "MacroSpy - Monitoruj dietę z AI",
        short_name: "MacroSpy",
        description: "Inteligentny licznik makroskładników z pomocą AI.",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "/icons/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: "/offline",
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /** @param {{ request: Request }} ctx */ (ctx) =>
              ["style", "script", "font"].includes(ctx.request.destination),
            handler: "CacheFirst",
            options: {
              cacheName: "static-assets-cache",
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /** @param {{ request: Request }} ctx */ (ctx) => ctx.request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages-cache-v2",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              plugins: [avoidOfflineFallbackCachingPlugin],
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
          {
            urlPattern: /** @param {{ request: Request; url: URL }} ctx */ (ctx) => {
              const isSupabaseRequest = ctx.url.hostname.endsWith(".supabase.co");
              const isSupabaseDataPath =
                ctx.url.pathname.startsWith("/rest/v1/") || ctx.url.pathname.startsWith("/storage/v1/object/public/");

              return isSupabaseRequest && isSupabaseDataPath && ctx.request.method === "GET";
            },
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-data-cache",
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 60 * 60 * 6,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /** @param {{ request: Request; url: URL }} ctx */ (ctx) =>
              ctx.request.destination === "image" && (ctx.url.protocol === "https:" || ctx.url.protocol === "http:"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "external-images-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 14,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        // SW w dev potrafi cache'ować zasoby Vite i psuć HMR/offline detection.
        enabled: false,
      },
    }),
  ],
  server: { port: 3000 },
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: cloudflare(),
  session: {
    cookie: {
      name: "macrospy-session",
    },
  },
});
