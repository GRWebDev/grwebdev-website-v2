// @ts-check
import { defineConfig, svgoOptimizer } from "astro/config";

// https://astro.build/config
export default defineConfig({
	site: "https://grwebdev.github.io",
	base: "/grwebdev-website-v2/",
	compressHTML: true,
	experimental: {
		svgOptimizer: svgoOptimizer({
			plugins: [
				{
					name: "preset-default",
					params: {
						overrides: {
							// Keep SVG ids stable for assets that reference internal clips.
							cleanupIds: false,
						},
					},
				},
			],
		}),
	},
	vite: {
		build: {
			assetsInlineLimit: 0,
		},
	},
});
