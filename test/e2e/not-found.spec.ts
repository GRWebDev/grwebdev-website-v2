import { expect, test } from "playwright/test";

for (const { collection, route } of [
	{ collection: "board", route: "/board/missing-board-member" },
	{ collection: "sponsor", route: "/sponsors/missing-sponsor" },
]) {
	test(`missing ${collection} entries show a 404 without redirecting`, async ({
		page,
	}) => {
		const response = await page.goto(route, { waitUntil: "domcontentloaded" });
		expect(response?.status()).toBe(404);
		expect(response?.request().redirectedFrom()).toBeNull();
		expect(response?.headers().location).toBeUndefined();
		await expect(page).toHaveURL(route);
		await expect(
			page.getByRole("heading", { name: "Page not found", exact: true }),
		).toBeVisible();
	});
}

for (const { route, name } of [
	{ route: "/board/edward-grant", name: "Edward Grant" },
	{ route: "/sponsors/start-garden", name: "Start Garden" },
]) {
	test(`existing entry at ${route} remains available`, async ({ page }) => {
		const response = await page.goto(route, { waitUntil: "domcontentloaded" });
		expect(response?.status()).toBe(200);
		expect(response?.request().redirectedFrom()).toBeNull();
		await expect(page).toHaveURL(route);
		await expect(
			page.getByRole("heading", { name, exact: true }),
		).toBeVisible();
	});
}
