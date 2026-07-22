// @ts-check
import { defineConfig, svgoOptimizer } from "astro/config";
import {
	formatBytes,
	pruneUnusedRasterAssets,
} from "./scripts/prune-unused-assets.mjs";

const pruneUnusedRasterAssetsIntegration = {
	name: "prune-unused-raster-assets",
	hooks: {
		"astro:build:done": async ({ dir, logger }) => {
			const removed = await pruneUnusedRasterAssets(dir);
			logger.info(
				`Removed ${removed.files.length} unreferenced raster assets (${formatBytes(removed.bytes)}).`,
			);
		},
	},
};

// https://astro.build/config
export default defineConfig({
	site: "https://grwebdev.github.io",
	base: "/grwebdev-website-v2/",
	integrations: [pruneUnusedRasterAssetsIntegration],
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
