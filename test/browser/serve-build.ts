import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mock } from "node:test";
import { build, preview } from "astro";

const outputs: string[] = [];
const servers: Awaited<ReturnType<typeof preview>>[] = [];
// Exercise both sides of midnight Eastern, using non-Eastern build timezones.
for (const [instant, timeZone, port] of [
	["2026-11-14T04:59:59Z", "Asia/Tokyo", 4328],
	["2026-11-14T05:00:00Z", "America/Los_Angeles", 4329],
] as const) {
	const outDir = await mkdtemp(join(tmpdir(), "grwebdev-showcase-"));
	outputs.push(outDir);
	process.env.TZ = timeZone;
	mock.timers.enable({ apis: ["Date"], now: Date.parse(instant) });
	await build({ outDir, logLevel: "error" });
	mock.timers.reset();
	servers.push(await preview({ outDir, server: { host: "127.0.0.1", port } }));
}

async function stop() {
	await Promise.all(servers.map((server) => server.stop()));
	await Promise.all(
		outputs.map((outDir) => rm(outDir, { recursive: true, force: true })),
	);
	process.exit(0);
}
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
