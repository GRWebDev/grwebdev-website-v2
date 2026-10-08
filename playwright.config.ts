import { defineConfig } from "playwright/test";

export default defineConfig({
	testDir: "./test/e2e",
	testMatch: "**/*.spec.ts",
	outputDir: "./test-results/e2e",
	workers: 1,
	forbidOnly: !!process.env.CI,
	use: {
		baseURL: "http://127.0.0.1:4397",
		browserName: "chromium",
		trace: "retain-on-failure",
	},
	webServer: {
		command: "node test/e2e/serve.ts",
		url: "http://127.0.0.1:4397",
		reuseExistingServer: false,
		gracefulShutdown: { signal: "SIGTERM", timeout: 10000 },
	},
});
