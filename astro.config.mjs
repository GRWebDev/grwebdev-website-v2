// @ts-check
import { defineConfig, svgoOptimizer } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: 'https://grwebdev.github.io',
  base: '/grwebdev-website-v2/',
  experimental: {
    svgOptimizer: svgoOptimizer(),
  }
});
