import { expect, test } from "playwright/test";

test("event captions expose Meetup logistics without JavaScript", async ({
	browser,
}) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();
	await page.goto("/");

	const eventGrid = page.locator(".event-grid");
	await expect(eventGrid.locator("article")).toHaveCount(8);
	await expect(
		eventGrid.getByRole("link", {
			name: /Code \+ Commiserate.*8:00 AM EDT.*Online event/,
		}),
	).not.toHaveCount(0);
	await expect(
		eventGrid.getByRole("link", {
			name: /Coffee with Creators.*8:00 AM EDT.*The Factory.*77 Monroe Center St NW/,
		}),
	).not.toHaveCount(0);
	await expect(eventGrid.locator("img:not([alt=''])")).toHaveCount(0);
	await context.close();
});

test("event grid keeps its original visible counts and flyer proportions", async ({
	page,
}) => {
	for (const [width, expectedCount] of [
		[390, 3],
		[800, 4],
		[1400, 6],
		[1800, 8],
	] as const) {
		await page.setViewportSize({ width, height: 900 });
		await page.goto("/");
		const cards = page.locator(".event-grid article:visible");
		await expect(cards).toHaveCount(expectedCount);
		const image = cards.first().locator("img");
		const proportions = await image.evaluate((element) => {
			const img = element as HTMLImageElement;
			return {
				intrinsic: img.naturalWidth / img.naturalHeight,
				rendered: img.clientWidth / img.clientHeight,
			};
		});
		expect(proportions.rendered).toBeCloseTo(proportions.intrinsic, 2);
	}
});
