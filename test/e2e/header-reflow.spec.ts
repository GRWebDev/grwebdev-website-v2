import { expect, test } from "playwright/test";

for (const textSize of [100, 200]) {
	test(`header reflows without replacing donation at ${textSize}% text`, async ({
		page,
	}) => {
		await page.route("https://widgets.givebutter.com/**", (route) =>
			route.abort(),
		);
		await page.goto("/board/");
		await expect(page.locator(".site-header__bar")).toHaveAttribute(
			"data-navigation-stage",
			/^(links|menu|menu-donation)$/,
		);
		await page.evaluate(async (size) => {
			document.documentElement.style.fontSize = `${size}%`;
			await document.fonts.ready;
		}, textSize);
		const widget = await page.locator("givebutter-widget").elementHandle();
		const stages = new Set<string>();
		for (const width of [
			1920, 1440, 1000, 768, 560, 390, 375, 320, 280, 375, 768, 1440, 1920,
		]) {
			await page.setViewportSize({ width, height: 900 });
			await page.evaluate(
				() =>
					new Promise<void>((resolve) => {
						requestAnimationFrame(() =>
							requestAnimationFrame(() =>
								requestAnimationFrame(() => resolve()),
							),
						);
					}),
			);
			const header = page.locator(".site-header__bar");
			const stage = await header.getAttribute("data-navigation-stage");
			expect(stage).toMatch(/^(links|menu|menu-donation)$/);
			stages.add(stage ?? "");
			expect(
				await page.evaluate(() => document.documentElement.scrollWidth),
			).toBe(width);
			expect(
				await page.evaluate(
					(original) =>
						original === document.querySelector("givebutter-widget"),
					widget,
				),
			).toBe(true);
			await expect(page.locator("givebutter-widget")).toHaveCount(1);
			const toggle = page.getByLabel("Toggle navigation menu");
			if (stage === "links") {
				await expect(toggle).toBeHidden();
				await expect(page.locator(".site-header__desktop-links")).toBeVisible();
			} else {
				await expect(toggle).toBeVisible();
				await toggle.click();
				await expect(page.locator("details ul")).toBeVisible();
				if (stage === "menu-donation") {
					await expect(
						page.locator("details .site-header__donate-fallback"),
					).toBeVisible();
				}
				expect(
					await page.evaluate(() => document.documentElement.scrollWidth),
				).toBe(width);
				await toggle.click();
			}
		}
		expect([...stages].sort()).toEqual(["links", "menu", "menu-donation"]);
		await expect(page.locator(".site-header__donate-fallback")).toHaveAttribute(
			"href",
			"https://givebutter.com/grwebdev-build-fund-23",
		);
		await expect(page.locator(".typography-prototype")).toHaveCount(0);
	});
}

test("navigation and campaign link work without JavaScript", async ({
	browser,
}) => {
	const context = await browser.newContext({
		javaScriptEnabled: false,
		viewport: { width: 375, height: 900 },
	});
	try {
		const page = await context.newPage();
		await page.goto("/board");
		await expect(page.locator(".site-header__donate-fallback")).toBeVisible();
		await page.getByLabel("Toggle navigation menu").click();
		await expect(
			page
				.locator("details")
				.getByRole("link", { name: "Sponsors", exact: true }),
		).toBeVisible();
		expect(
			await page.evaluate(() => document.documentElement.scrollWidth),
		).toBe(375);
	} finally {
		await context.close();
	}
});
