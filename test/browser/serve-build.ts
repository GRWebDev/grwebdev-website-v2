import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { build, preview } from "astro";

const outDir = await mkdtemp(join(tmpdir(), "grwebdev-browser-"));
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
