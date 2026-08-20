import { readdir, readFile, stat, unlink } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const rasterExtensions = new Set([".avif", ".jpeg", ".jpg", ".png", ".webp"]);
const searchableExtensions = new Set([
	".css",
	".html",
	".js",
	".json",
	".mjs",
	".svg",
	".txt",
	".webmanifest",
	".xml",
]);

interface RemovedAsset {
	file: string;
	bytes: number;
}

interface PrunedAssets {
	files: RemovedAsset[];
	bytes: number;
}

async function walk(directory: string): Promise<string[]> {
	const entries = await readdir(directory, { withFileTypes: true });
	const files: string[] = [];

	for (const entry of entries) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await walk(path)));
		} else {
			files.push(path);
		}
	}

	return files;
}

export async function pruneUnusedRasterAssets(
	outputDirectory: string | URL,
): Promise<PrunedAssets> {
	const outputPath =
		outputDirectory instanceof URL
			? fileURLToPath(outputDirectory)
			: outputDirectory;
	const assetPath = join(outputPath, "_astro");
	const outputFiles = await walk(outputPath);
	const searchableFiles = outputFiles.filter((file) =>
		searchableExtensions.has(extname(file).toLowerCase()),
	);
	const documents = await Promise.all(
		searchableFiles.map((file) => readFile(file, "utf8")),
	);
	const rasterAssets = (await walk(assetPath)).filter((file) =>
		rasterExtensions.has(extname(file).toLowerCase()),
	);
	const removed: RemovedAsset[] = [];

	for (const file of rasterAssets) {
		const assetName = relative(outputPath, file).replaceAll("\\", "/");
		if (documents.some((document) => document.includes(assetName))) {
			continue;
		}

		removed.push({
			file: assetName,
			bytes: (await stat(file)).size,
		});
		await unlink(file);
	}

	return {
		bytes: removed.reduce((total, asset) => total + asset.bytes, 0),
		files: removed,
	};
}

export function formatBytes(bytes: number): string {
	return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
}
