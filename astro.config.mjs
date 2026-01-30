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
});