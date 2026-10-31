import { expect, test } from "playwright/test";

for (const javaScriptEnabled of [true, false]) {
	test.describe(`header with JavaScript ${javaScriptEnabled ? "enabled" : "disabled"}`, () => {
		test.use({ javaScriptEnabled });

		for (const textSize of [100, 200]) {
			test(`container queries reflow one donation widget at ${textSize}% text`, async ({
				page,
			}) => {
				await page.route("https://widgets.givebutter.com/**", (route) =>
					route.abort(),
				);
				await page.goto("/board/", { waitUntil: "networkidle" });
				await page.evaluate(async (size) => {
					document.documentElement.style.fontSize = `${size}%`;
					await document.fonts.ready;
				}, textSize);
				const widget = await page.locator("givebutter-widget").elementHandle();
				const stages = new Set<string>();
				const toggle = page.getByLabel("Toggle navigation menu");
				const donation = page.getByRole("link", {
					name: "Donate to GRWebDev",
					exact: true,
				});
				const links = page.locator(".site-header__page-links");

				for (const width of [
					1920, 1440, 1000, 768, 560, 390, 375, 320, 280, 375, 768, 1440, 1920,
				]) {
					await page.setViewportSize({ width, height: 900 });
					const stage = !(await toggle.isVisible())
						? "links"
						: (await donation.isVisible())
							? "menu"
							: "menu-donation";
					stages.add(stage);
					expect(
						await page
							.locator(".site-header__bar")
							.evaluate((header, layout) => {
								const selectors =
									layout === "links"
										? [
												".site-header__brand",
												".site-header__page-links",
												".site-header__donation",
											]
										: layout === "menu"
											? [
													".site-header__brand",
													".site-header__donation",
													"summary",
												]
											: [".site-header__brand", "summary"];
								const bar = header.getBoundingClientRect();
								const rectangles = selectors.map((selector) =>
									header.querySelector(selector)?.getBoundingClientRect(),
								);
								return rectangles.every(
									(rect, index) =>
										rect &&
										rect.top >= bar.top &&
										rect.bottom <= bar.bottom &&
										(index === 0 ||
											rect.left >= (rectangles[index - 1]?.right ?? 0)),
								);
							}, stage),
					).toBe(true);
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
					await expect(
						page.locator(
							".site-header__donation-list > .site-header__donation > givebutter-widget",
						),
					).toHaveCount(1);

					if (stage === "links") {
						await expect(links).toBeVisible();
						await expect(donation).toBeVisible();
					} else {
						await expect(links).toBeHidden();
						await toggle.click();
						await expect(links).toBeVisible();
						await expect(donation).toBeVisible();
						expect(
							await page.evaluate(() => document.documentElement.scrollWidth),
						).toBe(width);
						await toggle.click();
						if (stage === "menu") {
							await page.keyboard.press("Tab");
							await expect(donation).toBeFocused();
						}
					}
				}
				expect([...stages].sort()).toEqual(["links", "menu", "menu-donation"]);
				await expect(donation).toHaveAttribute(
					"href",
					"https://givebutter.com/grwebdev-build-fund-23",
				);
				await expect(page.locator("[data-navigation-stage]")).toHaveCount(0);
			});
		}
	});
}

test("native disclosure stays open across container breakpoints", async ({
	page,
}) => {
	await page.route("https://widgets.givebutter.com/**", (route) =>
		route.abort(),
	);
	await page.setViewportSize({ width: 375, height: 900 });
	await page.goto("/board/");
	await page.getByLabel("Toggle navigation menu").click();
	for (const width of [768, 1440, 375]) {
		await page.setViewportSize({ width, height: 900 });
		await expect(page.locator(".site-header__mobile-menu")).toHaveAttribute(
			"open",
			"",
		);
		await expect(
			page.getByRole("link", { name: "Sponsors", exact: true }).first(),
		).toBeVisible();
	}
});
