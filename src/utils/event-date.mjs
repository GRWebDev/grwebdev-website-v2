const eventDateFormatter = new Intl.DateTimeFormat("en-US", {
	day: "numeric",
	month: "long",
	timeZone: "UTC",
	year: "numeric",
});

/**
 * Format an event's date-only value without converting it through the build
 * machine's local time zone. The event time zone remains separate metadata.
 */
export function formatEventDate({ date }) {
	return eventDateFormatter.format(date);
}

/**
 * Compare date-only event content against the current calendar date where the
 * event takes place. Events remain upcoming for their whole local day.
 */
export function isEventUpcoming({ date, timeZone, now = new Date() }) {
	return eventDateKey(date) >= dateKeyInTimeZone(now, timeZone);
}

function eventDateKey(date) {
	return date.toISOString().slice(0, 10);
}

function dateKeyInTimeZone(date, timeZone) {
	const parts = new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		month: "2-digit",
		timeZone,
		year: "numeric",
	}).formatToParts(date);
	const values = Object.fromEntries(
		parts.map(({ type, value }) => [type, value]),
	);

	return `${values.year}-${values.month}-${values.day}`;
}
