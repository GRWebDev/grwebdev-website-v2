import { defineConfig } from "playwright/test";

export default defineConfig({
	testDir: ".",
	testMatch: "*.spec.ts",
	outputDir: "../../test-results/browser",
	workers: 1,
	forbidOnly: !!process.env.CI,
	use: { baseURL: "http://127.0.0.1:4328" },
	webServer: {
		command: "node test/browser/serve-build.ts",
		cwd: process.cwd(),
		url: "http://127.0.0.1:4328",
		timeout: 120_000,
		gracefulShutdown: { signal: "SIGTERM", timeout: 10000 },
	},
});
