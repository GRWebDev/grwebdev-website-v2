import assert from "node:assert/strict";
import test from "node:test";

import { formatEventDate, isEventUpcoming } from "../src/utils/event-date.ts";

test("event calendar dates keep their published day in the event time zone", () => {
	assert.equal(
		formatEventDate({
			date: new Date("2026-07-24T00:00:00.000Z"),
		}),
		"July 24, 2026",
	);
});

test("events stay upcoming through their local calendar day", () => {
	assert.equal(
		isEventUpcoming({
			date: new Date("2026-07-24T00:00:00.000Z"),
			now: new Date("2026-07-25T03:59:59.000Z"),
			timeZone: "America/New_York",
		}),
		true,
	);
});
