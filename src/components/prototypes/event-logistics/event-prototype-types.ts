import type { CollectionEntry } from "astro:content";

type EventImage = CollectionEntry<"events">["data"]["images"]["light"];

export interface PrototypeEvent {
	address: string;
	dateLabel: string;
	dateTime: string;
	day: string;
	format: string;
	href: string;
	id: string;
	image: EventImage;
	month: string;
	name: string;
	time: string;
	venue: string;
}
