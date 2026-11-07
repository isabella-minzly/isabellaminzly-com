// @ts-check
import { defineConfig } from 'astro/config';

// SITE and BASE_PATH are set by the preview build (GitHub Pages serves the site in a subfolder)
export default defineConfig({
  site: process.env.SITE ?? 'https://isabellaminzly.com',
  base: process.env.BASE_PATH ?? '/',
  output: 'static',
  trailingSlash: 'always',
});
