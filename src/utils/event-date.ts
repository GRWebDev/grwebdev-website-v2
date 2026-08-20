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
export function formatEventDate({ date }: { date: Date }): string {
	return eventDateFormatter.format(date);
}

/**
 * Compare date-only event content against the current calendar date where the
 * event takes place. Events remain upcoming for their whole local day.
 */
export function isEventUpcoming({
	date,
	timeZone,
	now = new Date(),
}: {
	date: Date;
	timeZone: string;
	now?: Date;
}): boolean {
	return eventDateKey(date) >= dateKeyInTimeZone(now, timeZone);
}

function eventDateKey(date: Date): string {
	return date.toISOString().slice(0, 10);
}

function dateKeyInTimeZone(date: Date, timeZone: string): string {
	const parts = new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		month: "2-digit",
		timeZone,
		year: "numeric",
	}).formatToParts(date);
	const year = parts.find(({ type }) => type === "year")?.value;
	const month = parts.find(({ type }) => type === "month")?.value;
	const day = parts.find(({ type }) => type === "day")?.value;

	if (!year || !month || !day) {
		throw new RangeError(`Could not format a date in time zone "${timeZone}"`);
	}

	return `${year}-${month}-${day}`;
}
