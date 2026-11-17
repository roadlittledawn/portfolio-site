import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  site: 'https://clintonlangosch.com',
  output: 'hybrid', // Static by default, SSR where needed
  adapter: netlify(),
  integrations: [tailwind(), react()],
  // Local clang-auth testing runs on *.localtest.me so cookies are shared
  // (see docs/auth-flow-diagram.md#local-development).
  vite: { server: { allowedHosts: ['.localtest.me'] } },
});