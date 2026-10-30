import { readdir } from "node:fs/promises";
import { expect, test } from "playwright/test";
import {
	formatEventDate,
	isEventUpcoming,
} from "../../src/utils/event-date.ts";

test.use({ javaScriptEnabled: false });

test("homepage reveals the events page with all available flyers in each section", async ({
	page,
}) => {
	const now = new Date();
	const files = await readdir(
		new URL("../../src/content/Events/", import.meta.url),
	);
	const upcomingCount = files.filter((file) =>
		isEventUpcoming({
			date: new Date(file.slice(0, 10)),
			now,
			timeZone: "America/New_York",
		}),
	).length;
	await page.setViewportSize({ width: 390, height: 900 });
	await page.goto("/");
	const viewAll = page.getByRole("link", { name: "View all events" });
	await expect(viewAll).toBeVisible();
	const gridBox = await page.locator(".event-grid").boundingBox();
	const linkBox = await viewAll.boundingBox();
	expect(gridBox).not.toBeNull();
	expect(linkBox).not.toBeNull();
	if (gridBox && linkBox) {
		expect(linkBox.y).toBeGreaterThan(gridBox.y + gridBox.height);
		expect(
			Math.abs(linkBox.x + linkBox.width - gridBox.x - gridBox.width),
		).toBeLessThan(1);
	}
	await viewAll.click();
	await expect(page).toHaveURL(/\/events\/$/);
	await expect(
		page.getByRole("heading", { name: "Events", level: 1 }),
	).toBeVisible();
	const upcoming = page.getByRole("region", { name: "Upcoming", exact: true });
	const recent = page.getByRole("region", { name: "Recent", exact: true });
	await expect(upcoming.locator(".event-grid a")).toHaveCount(
		Math.min(8, upcomingCount),
	);
	await expect(recent.locator(".event-grid a")).toHaveCount(
		Math.min(8, files.length - upcomingCount),
	);
	for (const [section, upcoming] of [
		["Upcoming", true],
		["Recent", false],
	] as const) {
		const dates = files
			.filter(
				(file) =>
					isEventUpcoming({
						date: new Date(file.slice(0, 10)),
						now,
						timeZone: "America/New_York",
					}) === upcoming,
			)
			.sort();
		const selected = upcoming ? dates.slice(0, 8) : dates.slice(-8);
		const links = page
			.getByRole("region", { name: section, exact: true })
			.locator(".event-grid a");
		for (const [index, file] of selected.entries()) {
			await expect(links.nth(index)).toHaveAttribute(
				"aria-label",
				new RegExp(
					`${formatEventDate({ date: new Date(file.slice(0, 10)) })} on Meetup$`,
				),
			);
		}
	}
	for (const width of [320, 390, 768, 1440, 1920]) {
		await page.setViewportSize({ width, height: 900 });
		await expect(page.locator(".event-grid a:visible")).toHaveCount(
			Math.min(8, upcomingCount) + Math.min(8, files.length - upcomingCount),
		);
	}
});

test("homepage flyer limits follow container inline size, not viewport width", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1920, height: 900 });
	await page.goto("/");
	const total = await page.locator(".event-grid a").count();
	for (const [width, visible] of [
		[620, 3],
		[621, 4],
		[960, 4],
		[961, 6],
		[1280, 6],
		[1281, 8],
	]) {
		await page.locator(".event-container").evaluate((container, size) => {
			(container as HTMLElement).style.inlineSize = `${size}px`;
		}, width);
		await expect(page.locator(".event-grid a:visible")).toHaveCount(
			Math.min(total, visible),
		);
		await expect(
			page.getByRole("link", { name: "View all events" }),
		).toBeVisible();
	}
});
