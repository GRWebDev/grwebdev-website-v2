import { expect, test } from "playwright/test";

const screenSizes = [
	{ width: 320, imageWidth: 768 },
	{ width: 375, imageWidth: 768 },
	{ width: 480, imageWidth: 768 },
	{ width: 481, imageWidth: 1024 },
	{ width: 768, imageWidth: 1024 },
	{ width: 1024, imageWidth: 1024 },
	{ width: 1025, imageWidth: 1440 },
	{ width: 1440, imageWidth: 1440 },
	{ width: 1441, imageWidth: 1920 },
	{ width: 1920, imageWidth: 1920 },
];

for (const deviceScaleFactor of [1, 2]) {
	test.describe(`homepage media at ${deviceScaleFactor}x density`, () => {
		test.use({ deviceScaleFactor, javaScriptEnabled: false });

		test("waits for its container before requesting a hero image", async ({
			page,
		}) => {
			await page.setViewportSize({ width: 481, height: 900 });
			await page.route("https://widgets.givebutter.com/**", (route) =>
				route.abort(),
			);
			await page.route("http://127.0.0.1:4397/", async (route) => {
				const response = await route.fetch();
				const html = await response.text();
				await route.fulfill({
					response,
					body: html.replace(
						"</head>",
						`<style id="deferred-container">body { container-type: normal !important; }</style></head>`,
					),
				});
			});
			const heroRequests: string[] = [];
			page.on("request", (request) => {
				if (
					request.resourceType() === "image" &&
					request.url().includes("hero")
				) {
					heroRequests.push(request.url());
				}
			});
			await page.goto("/", { waitUntil: "networkidle" });
			expect(heroRequests).toHaveLength(0);
			await page
				.locator("#deferred-container")
				.evaluate((style) => style.remove());
			await expect
				.poll(() =>
					heroRequests.map((url) => new URL(url).searchParams.get("w")),
				)
				.toEqual([String(1024 * deviceScaleFactor)]);
		});

		for (const { width, imageWidth } of screenSizes) {
			test(`loads only the matching hero at ${width}px`, async ({ page }) => {
				await page.setViewportSize({ width, height: 900 });
				await page.route("https://widgets.givebutter.com/**", (route) =>
					route.abort(),
				);
				const heroRequests: string[] = [];
				page.on("request", (request) => {
					if (
						request.resourceType() === "image" &&
						request.url().includes("hero")
					) {
						heroRequests.push(request.url());
					}
				});
				await page.goto("/", { waitUntil: "networkidle" });
				expect(heroRequests).toHaveLength(1);
				expect(new URL(heroRequests[0]).searchParams.get("w")).toBe(
					String(imageWidth * deviceScaleFactor),
				);
				await expect(page.getByRole("heading", { level: 1 })).toHaveText(
					"For the community, by the community.",
				);
				await expect(page.locator('[style*="--small:"]')).toHaveCount(1);
				await expect(page.locator(".hero")).toHaveAttribute(
					"style",
					/--small:/,
				);
				expect(
					await page.locator(".hero").evaluate((hero) => {
						const styles = getComputedStyle(hero);
						return {
							width: hero.getBoundingClientRect().width,
							size: styles.backgroundSize,
							position: styles.backgroundPosition,
							overlay: styles.backgroundImage.includes("0.55"),
						};
					}),
				).toEqual({
					width,
					size: "cover, cover",
					position: "50% 50%, 50% 50%",
					overlay: true,
				});
			});
		}
	});
}

test("hero image follows its container rather than the viewport", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1920, height: 900 });
	await page.route("https://widgets.givebutter.com/**", (route) =>
		route.abort(),
	);
	await page.goto("/", { waitUntil: "networkidle" });
	await page.locator("main").evaluate((container) => {
		container.style.containerType = "inline-size";
	});
	for (const { width, imageWidth } of screenSizes) {
		await page.locator("main").evaluate((container, containerWidth) => {
			(container as HTMLElement).style.inlineSize = `${containerWidth}px`;
		}, width);
		await expect
			.poll(() =>
				page
					.locator(".hero")
					.evaluate((hero) =>
						getComputedStyle(hero).getPropertyValue("--hero-image"),
					),
			)
			.toContain(`w=${imageWidth}&`);
	}
});
