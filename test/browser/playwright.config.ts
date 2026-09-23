import { defineConfig } from "playwright/test";

export default defineConfig({
	testDir: ".",
	testMatch: "*.spec.ts",
	workers: 1,
	use: { baseURL: "http://127.0.0.1:4328" },
	webServer: {
		command: "node test/browser/serve-build.ts",
		cwd: process.cwd(),
		url: "http://127.0.0.1:4329",
		timeout: 120_000,
	},
});
