import assert from "node:assert/strict";
import test from "node:test";

import {
	formatEventDate,
	formatEventTime,
	isEventUpcoming,
} from "../src/utils/event-date.ts";

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

test("published wall-clock times keep their time zone across daylight saving changes", () => {
	for (const date of ["2026-07-24", "2026-11-13"]) {
		assert.equal(
			formatEventTime({
				date: new Date(date),
				startTime: "08:00",
				timeZone: "America/New_York",
			}),
			"8:00 AM Eastern Time",
		);
	}
	assert.match(
		formatEventTime({
			date: new Date("2026-11-13"),
			startTime: "00:00",
			timeZone: "UTC",
		}),
		/^12:00 AM (GMT(?:\+00:00)?|Coordinated Universal Time)$/,
	);
	assert.equal(
		formatEventTime({
			date: new Date("2026-11-23"),
			startTime: "18:00",
			timeZone: "America/New_York",
		}),
		"6:00 PM Eastern Time",
	);
});
