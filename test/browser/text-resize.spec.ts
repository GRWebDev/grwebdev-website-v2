import { expect, test } from "playwright/test";

test("navigation and page content remain usable at 200% text size", async ({
	page,
}) => {
	await page.route("https://widgets.givebutter.com/**", (route) =>
		route.abort(),
	);

	for (const width of [320, 390, 768]) {
		await page.setViewportSize({ width, height: 800 });

		for (const route of [
			"/about/",
			"/board/",
			"/board/amanda-clouse/",
			"/sponsors/lafleur-marketing/",
		]) {
			await page.goto(route);
			await page.evaluate(() => {
				document.documentElement.style.fontSize = "200%";
			});

			const pageWidth = await page.evaluate(
				() => document.documentElement.scrollWidth,
			);
			expect(pageWidth, `${route} at ${width}px`).toBeLessThanOrEqual(width);
		}

		await page.getByLabel("Toggle navigation menu").click();
		const boardLink = page.locator(".site-header__mobile-menu a", {
			hasText: "Board",
		});
		await expect(boardLink).toBeVisible();
		const boardBounds = await boardLink.boundingBox();
		expect(boardBounds?.x).toBeGreaterThanOrEqual(0);
		expect(
			(boardBounds?.x ?? 0) + (boardBounds?.width ?? 0),
		).toBeLessThanOrEqual(width);
	}
});
