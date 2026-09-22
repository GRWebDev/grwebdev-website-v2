import { expect, test } from "playwright/test";

test("a first homepage visit opens an accessible showcase dialog", async ({
	page,
}) => {
	await page.goto("/");
	const dialog = page.getByRole("dialog", {
		name: "Show us what you've been building",
	});
	await expect(dialog).toBeVisible();
	await expect(
		dialog.getByRole("button", { name: "Close invitation" }),
	).toBeFocused();
	await expect(
		dialog.getByRole("link", { name: /Submit your idea/ }),
	).toHaveAttribute("href", "https://forms.gle/2GJXyVBTEgTXV2uy5");
});

test("showing the invitation prevents another opening throughout the browser session", async ({
	page,
	context,
}) => {
	await page.goto("/");
	await expect(
		page.getByRole("dialog", { name: "Show us what you've been building" }),
	).toBeVisible();
	await page.reload();
	await expect(
		page.getByRole("dialog", { name: "Show us what you've been building" }),
	).not.toBeVisible();
	const cookies = await context.cookies();
	expect(
		cookies.find((cookie) => cookie.name === "grwebdev-showcase-2026-seen")
			?.expires,
	).toBe(-1);
	await page.goto("/about/");
	await expect(
		page.getByRole("dialog", {
			name: "Show us what you've been building",
			includeHidden: true,
		}),
	).toHaveCount(0);
	await page.goto("/");
	await expect(
		page.getByRole("dialog", { name: "Show us what you've been building" }),
	).not.toBeVisible();
	const anotherTab = await context.newPage();
	await anotherTab.goto("/");
	await expect(
		anotherTab.getByRole("dialog", {
			name: "Show us what you've been building",
		}),
	).not.toBeVisible();
});

test("visitors can dismiss with the close X, Maybe later, or Escape and keep the form link", async ({
	browser,
}) => {
	for (const action of ["Close invitation", "Maybe later", "Escape"]) {
		const context = await browser.newContext();
		const page = await context.newPage();
		await page.goto("http://127.0.0.1:4328/");
		const dialog = page.getByRole("dialog", {
			name: "Show us what you've been building",
		});
		await expect(dialog).toBeVisible();
		if (action === "Escape") await page.keyboard.press("Escape");
		else
			await dialog.getByRole("button", { name: action, exact: true }).click();
		await expect(dialog).not.toBeVisible();
		const formLink = page
			.getByRole("region", { name: "Show us what you've been building" })
			.getByRole("link", { name: /Submit your idea/ });
		await expect(formLink).toBeVisible();
		await expect(formLink).toBeFocused();
		expect(
			(await context.cookies()).some(
				(cookie) => cookie.name === "grwebdev-showcase-2026-submitted",
			),
		).toBe(false);
		await context.close();
	}
});

test("already-submitted visitors can suppress the invitation until January 1 Eastern", async ({
	page,
	context,
	browser,
}) => {
	await page.goto("/");
	const submitted = page.getByRole("button", {
		name: "I've already submitted",
	});
	await expect(submitted).toBeVisible();
	await submitted.click();
	await expect(
		page.getByRole("dialog", { name: "Show us what you've been building" }),
	).not.toBeVisible();
	const persistent = (await context.cookies()).filter(
		(cookie) => cookie.name === "grwebdev-showcase-2026-submitted",
	);
	expect(persistent).toHaveLength(1);
	expect(persistent[0].expires).toBe(Date.parse("2027-01-01T05:00:00Z") / 1000);
	// A new browser session retains only the persistent cookie.
	const nextSession = await browser.newContext({
		storageState: { cookies: persistent, origins: [] },
	});
	const nextPage = await nextSession.newPage();
	await nextPage.goto("http://127.0.0.1:4328/");
	await expect(
		nextPage.getByRole("dialog", { name: "Show us what you've been building" }),
	).not.toBeVisible();
	await expect(
		nextPage
			.getByRole("region", { name: "Show us what you've been building" })
			.getByRole("link", { name: /Submit your idea/ }),
	).toBeVisible();
	await nextSession.close();
});

test("opening the form uses a new tab and closes the invitation after 500 ms without claiming submission", async ({
	page,
	context,
}) => {
	await context.route("https://forms.gle/**", (route) =>
		route.fulfill({ body: "Form destination" }),
	);
	await page.clock.install({ time: new Date("2026-10-01T12:00:00Z") });
	await page.clock.pauseAt(new Date("2026-10-01T12:00:00Z"));
	await page.goto("/");
	const dialog = page.getByRole("dialog", {
		name: "Show us what you've been building",
	});
	const popupPromise = context.waitForEvent("page");
	await dialog.getByRole("link", { name: /Submit your idea/ }).click();
	const popup = await popupPromise;
	await expect(popup).toHaveURL("https://forms.gle/2GJXyVBTEgTXV2uy5");
	await page.clock.runFor(499);
	await expect(dialog).toBeVisible();
	await page.clock.runFor(1);
	await expect(dialog).not.toBeVisible();
	expect(
		(await context.cookies()).some(
			(cookie) => cookie.name === "grwebdev-showcase-2026-submitted",
		),
	).toBe(false);
});

test("unavailable cookies leave the static invitation usable without opening the dialog", async ({
	browser,
}) => {
	for (const mode of ["ignored", "denied"] as const) {
		const context = await browser.newContext();
		await context.addInitScript((failure) => {
			Object.defineProperty(Document.prototype, "cookie", {
				configurable: true,
				get() {
					if (failure === "denied")
						throw new DOMException("Cookies blocked", "SecurityError");
					return "";
				},
				set() {},
			});
		}, mode);
		const page = await context.newPage();
		const errors: string[] = [];
		page.on("pageerror", (error) => errors.push(error.message));
		await page.goto("http://127.0.0.1:4328/");
		await expect(
			page.getByRole("dialog", { name: "Show us what you've been building" }),
		).not.toBeVisible();
		await expect(
			page
				.getByRole("region", { name: "Show us what you've been building" })
				.getByRole("link", { name: /Submit your idea/ }),
		).toBeVisible();
		expect(errors).toEqual([]);
		await context.close();
	}
});

test("the modal contains keyboard focus and fits mobile and desktop screens", async ({
	browser,
}, testInfo) => {
	for (const viewport of [
		{ width: 390, height: 844 },
		{ width: 1280, height: 800 },
	]) {
		const context = await browser.newContext({ viewport });
		const page = await context.newPage();
		await page.goto("http://127.0.0.1:4328/");
		const dialog = page.getByRole("dialog", {
			name: "Show us what you've been building",
		});
		await expect(dialog).toBeVisible();
		const close = dialog.getByRole("button", { name: "Close invitation" });
		const submitted = dialog.getByRole("button", {
			name: "I've already submitted",
		});
		await expect(close).toBeFocused();
		await close.press("Shift+Tab");
		await expect(submitted).toBeFocused();
		await submitted.press("Tab");
		await expect(close).toBeFocused();
		const bounds = await dialog.boundingBox();
		if (!bounds) throw new Error("Dialog bounds unavailable");
		expect(bounds.x).toBeGreaterThanOrEqual(0);
		expect(bounds.y).toBeGreaterThanOrEqual(0);
		expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width);
		expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height);
		await page.screenshot({
			path: testInfo.outputPath(`dialog-${viewport.width}.png`),
		});
		await context.close();
	}
});
