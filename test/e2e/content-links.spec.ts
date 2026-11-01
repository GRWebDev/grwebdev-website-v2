import { expect, test } from "playwright/test";

test.use({ javaScriptEnabled: false });

for (const route of [
	"/",
	"/about/",
	"/sponsors/lafleur-marketing/",
	"/sponsors/start-garden/",
	"/sponsors/west-mi-tech-talent/",
	"/404",
]) {
	test(`content links remain discoverable at rest and on keyboard focus in ${route}`, async ({
		context,
	}) => {
		await context.route("**/*", (request) =>
			new URL(request.request().url()).hostname === "127.0.0.1"
				? request.continue()
				: request.abort(),
		);
		for (const width of [320, 768, 1440]) {
			for (const textSize of [100, 200]) {
				const page = await context.newPage();
				await page.setViewportSize({ width, height: 900 });
				const response = await page.goto(route);
				if (route !== "/404") {
					expect(response?.status()).toBe(200);
				} else {
					await expect(
						page.getByRole("heading", { name: "Page not found" }),
					).toBeVisible();
				}
				await page.evaluate(async (size) => {
					document.documentElement.style.fontSize = `${size}%`;
					await document.fonts.ready;
				}, textSize);
				const links = page.locator("main p a");
				expect(await links.count()).toBeGreaterThan(0);
				for (const link of await links.all()) {
					await expect(link).toHaveCSS("text-decoration-line", "underline");
				}
				const first = links.first();
				const restingThickness = await first.evaluate((link) =>
					Number.parseFloat(getComputedStyle(link).textDecorationThickness),
				);
				await first.focus();
				await page.keyboard.press("Tab");
				await page.keyboard.press("Shift+Tab");
				await expect(first).toBeFocused();
				await expect(first).toHaveCSS("outline-style", "solid");
				await expect(first).toHaveCSS("outline-width", "2px");
				expect(
					await first.evaluate((link) =>
						Number.parseFloat(getComputedStyle(link).textDecorationThickness),
					),
				).toBeGreaterThan(restingThickness);
				if (route === "/") {
					expect((await first.boundingBox())?.height).toBeGreaterThanOrEqual(
						44,
					);
				}
				expect(
					await page.evaluate(() => document.documentElement.scrollWidth),
				).toBe(
					await page.evaluate(
						() => document.documentElement.getBoundingClientRect().width,
					),
				);
				await page.close();
			}
		}
	});
}

for (const route of ["/board/", "/sponsors/"]) {
	test(`linked rows retain title-only emphasis in ${route}`, async ({
		page,
	}) => {
		await page.goto(route);
		const row = page.locator("a.image-text").first();
		await expect(row).toHaveCSS("text-decoration-line", "none");
		await expect(row.locator(".board-title.name")).toHaveCSS(
			"text-decoration-line",
			"none",
		);
		await row.hover();
		await expect(row).toHaveCSS("text-decoration-line", "none");
		await expect(row.locator(".board-title.name")).toHaveCSS(
			"text-decoration-line",
			"underline",
		);
		await expect(row.locator("p")).toHaveCSS("text-decoration-line", "none");
	});
}
