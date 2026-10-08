import { cp, mkdtemp, realpath, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dev } from "astro";

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
const fixtureRoot = await realpath(
	await mkdtemp(path.join(tmpdir(), "grwebdev-404-")),
);
let server: Awaited<ReturnType<typeof dev>> | undefined;

async function stop() {
	try {
		await server?.stop();
	} finally {
		await rm(fixtureRoot, { recursive: true, force: true });
	}
}

try {
	for (const entry of [
		"src",
		"public",
		"scripts",
		"astro.config.ts",
		"tsconfig.json",
		"package.json",
	]) {
		await cp(path.join(repoRoot, entry), path.join(fixtureRoot, entry), {
			recursive: true,
		});
	}
	await symlink(
		path.join(repoRoot, "node_modules"),
		path.join(fixtureRoot, "node_modules"),
		"dir",
	);
	await cp(
		path.join(fixtureRoot, "src/content.config.ts"),
		path.join(fixtureRoot, "src/content.production.ts"),
	);
	await cp(
		path.join(repoRoot, "test/e2e/fixtures/content.config.ts"),
		path.join(fixtureRoot, "src/content.config.ts"),
	);
	// These entries generate static paths whose slugs have no matching entry ID.
	// The real page guards must handle that inconsistency, rather than the router.
	for (const collection of ["Board", "Sponsors"]) {
		await cp(
			path.join(repoRoot, "test/e2e/fixtures", collection),
			path.join(fixtureRoot, "src/content", collection),
			{ recursive: true },
		);
	}
	server = await dev({
		root: fixtureRoot,
		server: { host: "127.0.0.1", port: 4397 },
		devToolbar: { enabled: false },
		vite: { server: { fs: { allow: [fixtureRoot, repoRoot] } } },
	});
	for (const signal of ["SIGINT", "SIGTERM"] as const) {
		process.once(signal, () => {
			void stop().then(() => process.exit(0));
		});
	}
} catch (error) {
	await stop();
	throw error;
}
