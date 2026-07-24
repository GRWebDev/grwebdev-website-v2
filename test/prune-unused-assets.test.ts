import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { pruneUnusedRasterAssets } from "../scripts/prune-unused-assets.ts";

test("build cleanup removes only unreferenced raster assets", async () => {
	const outputDirectory = await mkdtemp(join(tmpdir(), "grwebdev-assets-"));
	const assetDirectory = join(outputDirectory, "_astro");

	try {
		await mkdir(assetDirectory);
		await Promise.all([
			writeFile(
				join(outputDirectory, "index.html"),
				'<img src="/site/_astro/used.hash.webp">',
			),
			writeFile(join(assetDirectory, "used.hash.webp"), "used"),
			writeFile(join(assetDirectory, "unused-source.hash.jpg"), "unused"),
			writeFile(join(assetDirectory, "unrelated.hash.svg"), "<svg></svg>"),
		]);

		const result = await pruneUnusedRasterAssets(outputDirectory);

		assert.deepEqual(result.files, [
			{ file: "_astro/unused-source.hash.jpg", bytes: 6 },
		]);
		assert.equal(
			await readFile(join(assetDirectory, "used.hash.webp"), "utf8"),
			"used",
		);
		assert.equal(
			await readFile(join(assetDirectory, "unrelated.hash.svg"), "utf8"),
			"<svg></svg>",
		);
		await assert.rejects(
			readFile(join(assetDirectory, "unused-source.hash.jpg")),
		);
	} finally {
		await rm(outputDirectory, { recursive: true, force: true });
	}
});
