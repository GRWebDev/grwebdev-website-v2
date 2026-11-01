import { expect, test } from "playwright/test";

for (const javaScriptEnabled of [true, false]) {
	test.describe(`skip navigation with JavaScript ${javaScriptEnabled ? "enabled" : "disabled"}`, () => {
		test.use({ javaScriptEnabled });

		for (const route of [
			"/",
			"/events/",
			"/about/",
			"/sponsors/lafleur-marketing/",
		]) {
			test(`focuses unobscured content and continues into ${route}`, async ({
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
						await page.goto(route);
						await page.evaluate(async (size) => {
							document.documentElement.style.fontSize = `${size}%`;
							await document.fonts.ready;
						}, textSize);

						await page.keyboard.press("Tab");
						await expect(
							page.getByRole("link", { name: "Skip to content" }),
						).toBeFocused();
						await page.keyboard.press("Enter");
						await expect(page.locator("main")).toBeFocused();
						expect(
							await page.locator("main h1").evaluate((heading) => {
								const header = document.querySelector("header");
								return (
									heading.getBoundingClientRect().top >=
									(header?.getBoundingClientRect().bottom ?? 0)
								);
							}),
						).toBe(true);
						await expect(page.locator("main")).toHaveCSS(
							"outline-style",
							"solid",
						);
						await page.keyboard.press("Tab");
						await expect(
							page.locator("main a:visible, main iframe:visible").first(),
						).toBeFocused();
						await page.close();
					}
				}
			});
		}
	});
}
