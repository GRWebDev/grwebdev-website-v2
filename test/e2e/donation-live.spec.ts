import { expect, test } from "playwright/test";

test.describe("live Givebutter checkout", () => {
	test.skip(
		process.env.GIVEBUTTER_LIVE !== "1",
		"Requires the live Givebutter service. Run with GIVEBUTTER_LIVE=1.",
	);
	test.setTimeout(90_000);

	for (const width of [1280, 390]) {
		test(`Donate opens amount selection and continues to payment at ${width}px`, async ({
			page,
		}, testInfo) => {
			const liveExpect = expect.configure({ timeout: 30_000 });
			await page.setViewportSize({ width, height: 900 });
			await page.goto("/");
			await page.getByRole("button", { name: "Donate", exact: true }).click();

			const dialog = page.getByRole("dialog", { name: "Campaign donation" });
			const checkout = dialog.frameLocator(
				'iframe[src^="https://givebutter.com/embed/c/"]',
			);
			await liveExpect(
				checkout.getByRole("heading", { name: "Choose amount", exact: true }),
			).toBeVisible();
			const continueButton = checkout.getByRole("button", {
				name: "Continue",
				exact: true,
			});
			await liveExpect(continueButton).toBeDisabled();
			await testInfo.attach("choose-amount", {
				body: await page.screenshot(),
				contentType: "image/png",
			});
			await checkout.getByRole("radio", { name: "$25", exact: true }).check();
			await continueButton.click();

			await liveExpect(
				checkout.getByRole("heading", { name: "Summary", exact: true }),
			).toBeVisible();
			await liveExpect(
				checkout.getByText("$25.00", { exact: true }),
			).toBeVisible();
			await liveExpect(
				checkout.getByText("Select a payment method", { exact: true }),
			).toBeVisible();
			await liveExpect(
				checkout.getByText("Credit or debit card", { exact: true }),
			).toBeVisible();
			await testInfo.attach("payment-summary", {
				body: await page.screenshot(),
				contentType: "image/png",
			});
		});
	}
});
