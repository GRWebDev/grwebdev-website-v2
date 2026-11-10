import { expect, test } from "playwright/test";

test("Donate uses the working Givebutter widget", async ({ page }) => {
	await page.route("https://widgets.givebutter.com/**", (route) =>
		route.abort(),
	);
	await page.goto("/");

	await expect(page.locator("givebutter-widget")).toHaveAttribute(
		"id",
		"gMnZYp",
	);
});

for (const javaScriptEnabled of [true, false]) {
	test.describe(`donation fallback with JavaScript ${javaScriptEnabled ? "enabled" : "disabled"}`, () => {
		test.use({ javaScriptEnabled });

		test("Donate links to the current campaign when the widget cannot load", async ({
			page,
		}) => {
			await page.route("https://widgets.givebutter.com/**", (route) =>
				route.abort(),
			);
			await page.goto("/");

			const donate = page.getByRole("link", { name: "Donate to GRWebDev" });
			await expect(donate).toBeVisible();
			await expect(donate).toHaveAttribute(
				"href",
				"https://givebutter.com/supportgrwebdev",
			);
		});
	});
}
