import { expect, test } from "playwright/test";

test("only the first Upcoming flyer receives eager loading and high priority", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 900 });
	await page.goto("/events/", { waitUntil: "networkidle" });
	const flyers = page.locator(".event-grid img");
	await expect(flyers.first()).toHaveAttribute("loading", "eager");
	await expect(page.locator(".event-grid img[loading=eager]")).toHaveCount(1);
	await expect(page.locator(".event-grid img[fetchpriority=high]")).toHaveCount(
		1,
	);
	const recentFlyer = page
		.getByRole("region", { name: "Recent", exact: true })
		.locator("img")
		.first();
	await expect(recentFlyer).toHaveAttribute("loading", "lazy");
	await expect(recentFlyer).toHaveAttribute("sizes", /^auto, /);
	await recentFlyer.scrollIntoViewIfNeeded();
	await expect
		.poll(() =>
			recentFlyer.evaluate((image: HTMLImageElement) => image.naturalWidth),
		)
		.toBeGreaterThan(0);
});

test("homepage flyers do not compete with the hero for priority", async ({
	page,
}) => {
	await page.route("https://widgets.givebutter.com/**", (route) =>
		route.abort(),
	);
	await page.goto("/");
	await expect(page.locator(".event-grid img")).not.toHaveCount(0);
	await expect(page.locator(".event-grid img[loading=eager]")).toHaveCount(0);
	await expect(page.locator(".event-grid img[fetchpriority=high]")).toHaveCount(
		0,
	);
});

for (const javaScriptEnabled of [true, false]) {
	for (const deviceScaleFactor of [1, 2]) {
		test.describe(`event sources at ${deviceScaleFactor}x with JavaScript ${javaScriptEnabled}`, () => {
			test.use({ javaScriptEnabled, deviceScaleFactor });

			for (const containerWidth of [300, 600, 961, 1281]) {
				test(`serves a ${containerWidth}px container independently of the viewport`, async ({
					page,
				}) => {
					await page.setViewportSize({ width: 1920, height: 900 });
					await page.route("**/events/", async (route) => {
						const response = await route.fetch();
						await route.fulfill({
							response,
							body: (await response.text()).replace(
								"</head>",
								`<style>.event-container { inline-size: ${containerWidth}px; }</style></head>`,
							),
						});
					});
					await page.goto("/events/");
					const flyer = page.locator(".event-grid img").nth(1);
					await expect(flyer).toHaveAttribute("sizes", /^auto, /);
					await flyer.scrollIntoViewIfNeeded();
					await expect
						.poll(() =>
							flyer.evaluate((image: HTMLImageElement) => image.naturalWidth),
						)
						.toBeGreaterThan(0);
					const source = await flyer.evaluate((image: HTMLImageElement) => ({
						width: image.getBoundingClientRect().width,
						selected: Number(new URL(image.currentSrc).searchParams.get("w")),
						candidates: image.srcset
							.split(",")
							.map((entry) =>
								Number.parseInt(entry.trim().split(" ").at(-1) ?? "0", 10),
							),
					}));
					const largest = Math.max(...source.candidates);
					const expected = source.candidates.find(
						(width) =>
							width >= Math.min(source.width * deviceScaleFactor, largest),
					);
					if (javaScriptEnabled) {
						expect(source.selected).toBe(expected);
					} else {
						expect(source.selected).toBeGreaterThanOrEqual(expected ?? largest);
					}
					expect(largest).toBeLessThanOrEqual(
						Number(await flyer.getAttribute("width")),
					);
				});
			}
		});
	}
}
