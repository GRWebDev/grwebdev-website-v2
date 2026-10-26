import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { build, preview } from "astro";

// Astro renames prerendered assets, which cannot cross filesystem boundaries.
const buildRoot = new URL("../../.astro/", import.meta.url);
await mkdir(buildRoot, { recursive: true });
const outDir = await mkdtemp(fileURLToPath(new URL("browser-", buildRoot)));
let server: Awaited<ReturnType<typeof preview>> | undefined;

async function stop() {
	try {
		await server?.stop();
	} finally {
		await rm(outDir, { recursive: true, force: true });
	}
}

try {
	await build({ outDir, logLevel: "error" });
	server = await preview({ outDir, server: { host: "127.0.0.1", port: 4328 } });
	for (const signal of ["SIGTERM", "SIGINT"] as const) {
		process.once(signal, () => {
			void stop().then(() => process.exit(0));
		});
	}
} catch (error) {
	await stop();
	throw error;
}
