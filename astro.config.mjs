// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  trailingSlash: 'always',
  session: false,
  vite: {
    plugins: [tailwindcss()]
  },

  adapter: cloudflare({
    imageService: { build: 'compile', runtime: 'cloudflare-binding' },
    remoteBindings: false,
  })
});