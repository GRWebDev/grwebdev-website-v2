import assert from "node:assert/strict";
import test from "node:test";
import { parseMeetupEventDetails } from "../scripts/meetup-event-details.ts";

test("reads an online event's time and public location", () => {
	const details = parseMeetupEventDetails(`<html><head>
		<script type="application/ld+json">{
			"@type":"Event",
			"startDate":"2026-09-25T08:00:00-04:00",
			"endDate":"2026-09-25T09:00:00-04:00",
			"eventAttendanceMode":"https://schema.org/OnlineEventAttendanceMode",
			"location":{"@type":"VirtualLocation","url":"https://www.meetup.com/grwebdev/events/313908056/"}
		}</script>
	</head></html>`);

	assert.deepEqual(details, {
		startDateTime: "2026-09-25T08:00:00-04:00",
		endDateTime: "2026-09-25T09:00:00-04:00",
		attendanceMode: "online",
		locationName: "Online event",
	});
});

test("reads an in-person venue and address from JSON-LD", () => {
	const details = parseMeetupEventDetails(`<html><head>
		<script data-next-head="" type="application/ld+json">{
			"@graph":[{"@type":"Organization","name":"GRWebDev"},{
				"@type":"Event",
				"startDate":"2026-10-15T08:00:00-04:00",
				"eventAttendanceMode":"https://schema.org/OfflineEventAttendanceMode",
				"location":{"@type":"Place","name":"The Factory","address":{
					"@type":"PostalAddress","streetAddress":"77 Monroe Center St NW Suite 600, Grand Rapids, MI"
				}}
			}]
		}</script>
	</head></html>`);

	assert.deepEqual(details, {
		startDateTime: "2026-10-15T08:00:00-04:00",
		attendanceMode: "in-person",
		locationName: "The Factory",
		locationAddress: "77 Monroe Center St NW Suite 600, Grand Rapids, MI",
	});
});

test("rejects a page without event details", () => {
	assert.throws(
		() => parseMeetupEventDetails("<html><body>No event</body></html>"),
		/Event JSON-LD/,
	);
});
