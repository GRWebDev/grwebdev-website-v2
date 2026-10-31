import { readdir } from "node:fs/promises";
import { expect, test } from "playwright/test";
import {
	formatEventDate,
	isEventUpcoming,
} from "../../src/utils/event-date.ts";

test.use({ javaScriptEnabled: false });

test("event hover and keyboard focus emphasize only the title", async ({
	page,
}) => {
	await page.goto("/events/");
	const event = page.locator(".event-grid > a").first();
	const title = event.getByRole("heading", { level: 3 });
	await expect(event).toHaveCSS("border-bottom-width", "4px");
	await expect(title).toHaveCSS("text-decoration-line", "none");
	await expect(title.locator("svg")).toHaveAttribute("aria-hidden", "true");
	await event.hover();
	await expect(event).toHaveCSS("text-decoration-line", "none");
	await expect(title).toHaveCSS("text-decoration-line", "underline");
	await expect(event.locator("p").first()).toHaveCSS(
		"text-decoration-line",
		"none",
	);
	await page.mouse.move(0, 0);
	await event.focus();
	await page.keyboard.press("Tab");
	await page.keyboard.press("Shift+Tab");
	await expect(event).toBeFocused();
	await expect(event).toHaveCSS("outline-width", "2px");
	await expect(event).toHaveCSS("outline-style", "solid");
	await expect(event).toHaveCSS("text-decoration-line", "none");
	await expect(title).toHaveCSS("text-decoration-line", "underline");
	await expect(title).toHaveCSS(
		"text-decoration-color",
		await event.evaluate(
			(element) => getComputedStyle(element).borderBottomColor,
		),
	);
});

test("event logistics remain readable and accessible without flyer images", async ({
	page,
}) => {
	await page.route(/\/_astro\/.*\.(webp|jpe?g)(\?.*)?$/, (route) =>
		route.abort(),
	);
	await page.setViewportSize({ width: 320, height: 900 });
	await page.goto("/events/");
	const links = page.locator(".event-grid a");
	const count = await links.count();
	expect(count).toBeGreaterThan(0);
	const first = page
		.getByRole("link", { name: /Code \+ Commiserate.*Online event/ })
		.first();
	await expect(first).toHaveAccessibleName(
		/Code \+ Commiserate.*8:00 AM Eastern Time.*Online event.*Event details on Meetup/,
	);
	await expect(first.locator("time").first()).toHaveAttribute(
		"datetime",
		/^\d{4}-\d{2}-\d{2}$/,
	);
	await expect(first.locator("time").last()).toHaveAttribute(
		"datetime",
		"08:00",
	);
	await expect(first.locator("img")).toHaveAttribute("alt", "");
	await expect(page.locator(".event-details")).toHaveCount(count);
	for (const details of await page.locator(".event-details").all()) {
		await expect(details).not.toContainText("Start time on Meetup");
		await expect(details).not.toContainText("Location on Meetup");
	}
	await first.focus();
	await expect(first).toBeFocused();
	await expect(first).toHaveCSS("outline-width", "2px");
});

test("event captions wrap long and multilingual text at enlarged sizes", async ({
	page,
}) => {
	await page.goto("/events/");
	const count = await page.locator(".event-grid a").count();
	expect(count).toBeGreaterThan(0);
	await page.evaluate(() => {
		document.documentElement.style.fontSize = "200%";
		const title = document.querySelector(".event-details h3");
		if (title)
			title.textContent =
				"مرحبا 開発者 ".repeat(10) + "LongEventName".repeat(20);
	});
	for (const width of [320, 390, 768, 1440, 1920]) {
		await page.setViewportSize({ width, height: 900 });
		const contentWidth = await page.evaluate(
			() => document.documentElement.getBoundingClientRect().width,
		);
		expect(
			await page.evaluate(() => document.documentElement.scrollWidth),
		).toBe(contentWidth);
		await expect(page.locator(".event-grid a:visible")).toHaveCount(count);
	}
});

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
			await expect(links.nth(index)).toHaveAccessibleName(
				new RegExp(
					`${formatEventDate({ date: new Date(file.slice(0, 10)) })}.*Event details on Meetup$`,
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
