// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';
import vercel from '@astrojs/vercel';

const SITE_URL = process.env.PUBLIC_SITE_URL || 'http://localhost:4321';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: false },
    imageService: true,
  }),
  integrations: [
    tailwind({ applyBaseStyles: false }),
    preact({ compat: true }),
  ],
  image: {
    domains: ['images.unsplash.com', 'plus.unsplash.com'],
    remotePatterns: [{ protocol: 'https' }],
  },
});
