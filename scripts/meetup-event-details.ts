export interface MeetupEventDetails {
	startDateTime: string;
	endDateTime?: string;
	attendanceMode: "online" | "in-person" | "hybrid";
	locationName: string;
	locationAddress?: string;
}

type JsonObject = Record<string, unknown>;

export function parseMeetupEventDetails(html: string): MeetupEventDetails {
	const scripts = html.matchAll(
		/<script\b[^>]*\btype=(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi,
	);

	for (const script of scripts) {
		let value: unknown;
		try {
			value = JSON.parse(script[2]);
		} catch {
			continue;
		}

		const event = findEvent(value);
		if (!event) continue;

		const startDateTime = stringValue(event.startDate);
		if (!startDateTime || Number.isNaN(Date.parse(startDateTime))) {
			throw new Error("Meetup event page has no valid start time");
		}

		const endDateTime = stringValue(event.endDate);
		const locations = Array.isArray(event.location)
			? event.location
			: [event.location];
		const place = locations.find(
			(location) => isObject(location) && hasType(location, "Place"),
		);
		const virtualLocation = locations.find(
			(location) => isObject(location) && hasType(location, "VirtualLocation"),
		);
		const mode = stringValue(event.eventAttendanceMode);
		const attendanceMode = mode?.endsWith("/MixedEventAttendanceMode")
			? "hybrid"
			: mode?.endsWith("/OnlineEventAttendanceMode") || virtualLocation
				? "online"
				: mode?.endsWith("/OfflineEventAttendanceMode") || place
					? "in-person"
					: undefined;

		if (!attendanceMode) {
			throw new Error("Meetup event page has no recognized attendance mode");
		}

		const address = isObject(place) ? place.address : undefined;
		const locationAddress = isObject(address)
			? stringValue(address.streetAddress)
			: stringValue(address);
		const locationName =
			attendanceMode === "online"
				? "Online event"
				: (isObject(place) && stringValue(place.name)) || "In-person event";

		return {
			startDateTime,
			...(endDateTime && !Number.isNaN(Date.parse(endDateTime))
				? { endDateTime }
				: {}),
			attendanceMode,
			locationName,
			...(locationAddress ? { locationAddress } : {}),
		};
	}

	throw new Error("Meetup event page has no Event JSON-LD");
}

function findEvent(value: unknown): JsonObject | undefined {
	if (Array.isArray(value)) {
		return value.map(findEvent).find((event) => event !== undefined);
	}
	if (!isObject(value)) return undefined;
	if (hasType(value, "Event")) return value;
	return findEvent(value["@graph"]);
}

function hasType(value: JsonObject, type: string): boolean {
	const actual = value["@type"];
	return actual === type || (Array.isArray(actual) && actual.includes(type));
}

function isObject(value: unknown): value is JsonObject {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | undefined {
	return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
