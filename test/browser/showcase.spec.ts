import { expect, test } from "playwright/test";

const invitationName = "Community Code Showcase on Monday, November 23";

test("visitors can find the showcase form above Events without JavaScript", async ({
	browser,
}) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();
	await page.goto("http://127.0.0.1:4328/");
	const invitation = page.getByRole("region", {
		name: invitationName,
	});
	await expect(invitation).toBeVisible();
	await expect(invitation).toContainText(invitationName);
	await expect(invitation).toContainText(
		"Submit your idea by Friday, November 13.",
	);
	const link = invitation.getByRole("link", { name: /Submit your idea/ });
	await expect(link).toHaveAttribute(
		"href",
		"https://forms.gle/2GJXyVBTEgTXV2uy5",
	);
	await expect(link).toHaveAttribute("target", "_blank");
	await expect(link).toHaveAccessibleName(/new tab/i);
	await expect(
		invitation.locator("xpath=following-sibling::section[1]"),
	).toHaveAccessibleName("Events");
	await expect(
		page.getByRole("dialog", { name: invitationName }),
	).not.toBeVisible();
	await context.close();
});

test("a build at midnight Eastern after the deadline omits the invitation", async ({
	page,
}) => {
	await page.goto("http://127.0.0.1:4329/");
	await expect(
		page.getByRole("heading", { name: "Events", exact: true }),
	).toBeVisible();
	await expect(
		page.getByRole("heading", {
			name: invitationName,
			includeHidden: true,
		}),
	).toHaveCount(0);
	await expect(
		page.getByRole("link", { name: /Submit your idea/, includeHidden: true }),
	).toHaveCount(0);
	await expect(
		page.getByRole("dialog", {
			name: invitationName,
			includeHidden: true,
		}),
	).toHaveCount(0);
});
