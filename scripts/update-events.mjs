#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const eventsDir = path.join(repoRoot, "src/content/Events");
const flyersDir = path.join(repoRoot, "src/assets/event-flyers");
const meetupIcalUrl = "https://www.meetup.com/grwebdev/events/ical/";
const flyerVariants = ["light", "dark"];

const args = parseArgs(process.argv.slice(2));

if (args.help) {
	printHelp();
	process.exit(0);
}

main().catch((error) => {
	console.error(`\nupdate:events failed: ${error.message}`);
	process.exit(1);
});

async function main() {
	const feedText = await readFeed();
	const feedEvents = parseIcal(feedText)
		.filter((event) => !args.event || event.url === args.event)
		.sort(
			(a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name),
		);

	if (args.event && feedEvents.length === 0) {
		throw new Error(`No matching event found in the feed for ${args.event}`);
	}

	const localEvents = await readLocalEvents();
	const cutoff = sixMonthsAgo(args.today ? parseDate(args.today) : new Date());
	const oldEvents = localEvents.filter(
		(event) => event.date <= formatDate(cutoff),
	);
	const { missing, stale, ambiguousStale } = compareEvents(
		feedEvents,
		localEvents,
	);
	const timeZoneUpdates = findTimeZoneUpdates(feedEvents, localEvents);

	printSummary({
		feedEvents,
		localEvents,
		missing,
		stale,
		timeZoneUpdates,
		ambiguousStale,
		oldEvents,
		cutoff,
	});

	if (args.dryRun) {
		console.log("\nDry run only. No files changed.");
		return;
	}

	if (!args.noCleanup) {
		for (const event of oldEvents) {
			await removeEvent(event);
		}
	}

	for (const event of stale) {
		await updateEventUrl(event.local.file, event.feed.url);
	}

	for (const event of timeZoneUpdates) {
		await updateEventTimeZone(event.local.file, event.feed.timeZone);
	}

	for (const event of missing) {
		const slug = slugFor(event);
		const outputBase = `${event.date}-${slug}`;
		const markdownPath = path.join(eventsDir, `${outputBase}.md`);

		await writeEventMarkdown({
			file: markdownPath,
			date: event.date,
			name: siteNameFor(event.summary),
			slug: outputBase,
			timeZone: event.timeZone,
			url: event.url,
		});

		if (!args.skipFlyers) {
			await exportFlyers({
				eventUrl: event.url,
				outputBase: path.join(flyersDir, outputBase),
			});
		}
	}

	console.log("\nDone.");
}

function parseArgs(argv) {
	const parsed = {
		dryRun: false,
		skipFlyers: false,
		noCleanup: false,
		help: false,
		event: "",
		feedFile: "",
		today: "",
	};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];

		if (arg === "--dry-run") parsed.dryRun = true;
		else if (arg === "--skip-flyers") parsed.skipFlyers = true;
		else if (arg === "--no-cleanup") parsed.noCleanup = true;
		else if (arg === "--help" || arg === "-h") parsed.help = true;
		else if (arg === "--event") parsed.event = readValue(argv, ++index, arg);
		else if (arg.startsWith("--event="))
			parsed.event = arg.slice("--event=".length);
		else if (arg === "--feed-file")
			parsed.feedFile = readValue(argv, ++index, arg);
		else if (arg.startsWith("--feed-file="))
			parsed.feedFile = arg.slice("--feed-file=".length);
		else if (arg === "--today") parsed.today = readValue(argv, ++index, arg);
		else if (arg.startsWith("--today="))
			parsed.today = arg.slice("--today=".length);
		else throw new Error(`Unknown argument: ${arg}`);
	}

	return parsed;
}

function readValue(argv, index, flag) {
	const value = argv[index];
	if (!value) throw new Error(`${flag} requires a value`);
	return value;
}

async function readFeed() {
	if (args.feedFile) {
		return fs.readFile(path.resolve(repoRoot, args.feedFile), "utf8");
	}

	const response = await fetch(meetupIcalUrl);
	if (!response.ok) {
		throw new Error(
			`Could not fetch Meetup iCal feed: ${response.status} ${response.statusText}`,
		);
	}

	return response.text();
}

function parseIcal(text) {
	return text
		.split("BEGIN:VEVENT")
		.slice(1)
		.map((block) => block.split("END:VEVENT")[0])
		.map((block) => {
			const dtStartMatch = block.match(
				/^DTSTART(?:;TZID=([^:]+))?:([0-9TZ]+)/m,
			);
			const timeZone = dtStartMatch?.[1] ?? "UTC";
			const dtStart = dtStartMatch?.[2];
			const summary = unescapeIcal(matchLine(block, /^SUMMARY:(.+)$/m) ?? "");
			const url = matchLine(block, /^URL;VALUE=URI:(.+)$/m);

			if (!dtStart || !url) return null;

			return {
				date: `${dtStart.slice(0, 4)}-${dtStart.slice(4, 6)}-${dtStart.slice(6, 8)}`,
				summary,
				name: siteNameFor(summary),
				timeZone,
				url: url.trim(),
			};
		})
		.filter(Boolean);
}

function matchLine(text, regex) {
	return text.match(regex)?.[1]?.trim();
}

function unescapeIcal(value) {
	return value
		.replaceAll("\\,", ",")
		.replaceAll("\\;", ";")
		.replaceAll("\\n", " ")
		.trim();
}

async function readLocalEvents() {
	const entries = await fs.readdir(eventsDir, { withFileTypes: true });
	const events = [];

	for (const entry of entries) {
		if (!entry.isFile() || !entry.name.endsWith(".md")) continue;

		const file = path.join(eventsDir, entry.name);
		const text = await fs.readFile(file, "utf8");
		const frontmatter = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
		const date =
			entry.name.match(/^(\d{4}-\d{2}-\d{2})-/)?.[1] ??
			matchLine(frontmatter, /^date:\s*(.+)$/m);
		const url = matchLine(frontmatter, /^url:\s*"([^"]+)"/m);
		const name = matchLine(frontmatter, /^name:\s*"([^"]+)"/m);
		const timeZone = matchLine(frontmatter, /^timeZone:\s*"([^"]+)"/m);
		const slug = entry.name
			.replace(/\.md$/, "")
			.replace(/^\d{4}-\d{2}-\d{2}-/, "");

		if (!date) continue;

		events.push({
			file,
			date,
			name,
			slug,
			timeZone,
			url,
		});
	}

	return events.sort(
		(a, b) => a.date.localeCompare(b.date) || a.file.localeCompare(b.file),
	);
}

function compareEvents(feedEvents, localEvents) {
	const localByDate = groupBy(localEvents, (event) => event.date);
	const feedByDate = groupBy(feedEvents, (event) => event.date);
	const missing = [];
	const stale = [];
	const ambiguousStale = [];

	for (const feed of feedEvents) {
		const localUrls = new Set(
			(localByDate.get(feed.date) ?? []).map((event) => event.url),
		);
		if (!localUrls.has(feed.url)) missing.push(feed);
	}

	for (const [date, locals] of localByDate) {
		const feeds = feedByDate.get(date) ?? [];
		if (feeds.length === 0) continue;

		const feedUrls = new Set(feeds.map((event) => event.url));
		const staleLocals = locals.filter(
			(event) => event.url && !feedUrls.has(event.url),
		);
		const missingFeeds = feeds.filter(
			(event) => !locals.some((local) => local.url === event.url),
		);

		if (staleLocals.length === 1 && missingFeeds.length === 1) {
			stale.push({ local: staleLocals[0], feed: missingFeeds[0] });
			const missingIndex = missing.findIndex(
				(event) => event.url === missingFeeds[0].url,
			);
			if (missingIndex >= 0) missing.splice(missingIndex, 1);
		} else if (staleLocals.length > 0) {
			ambiguousStale.push({ date, locals: staleLocals, feeds });
		}
	}

	return { missing, stale, ambiguousStale };
}

function findTimeZoneUpdates(feedEvents, localEvents) {
	return localEvents.flatMap((local) => {
		const feed = feedEvents.find(
			(event) => event.date === local.date && event.url === local.url,
		);
		if (!feed || feed.timeZone === local.timeZone) return [];
		return [{ feed, local }];
	});
}

function groupBy(items, getKey) {
	const groups = new Map();
	for (const item of items) {
		const key = getKey(item);
		groups.set(key, [...(groups.get(key) ?? []), item]);
	}
	return groups;
}

function siteNameFor(summary) {
	if (summary === "Friday Morning Code + Commiserate")
		return "Code + Commiserate";
	if (summary === "Coffee with Creators @ The Factory")
		return "Coffee with Creators";
	return summary.trim();
}

function slugFor(event) {
	const name = siteNameFor(event.summary);
	if (name === "Code + Commiserate") return "code-commiserate";
	if (name === "Coffee with Creators") return "coffee-with-creators";
	if (name.startsWith("Django Girls+")) return "django-girls-workshop";
	return slugify(name);
}

function slugify(value) {
	return value
		.toLowerCase()
		.replaceAll("+", " plus ")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.replace(/-{2,}/g, "-");
}

async function removeEvent(event) {
	await fs.rm(event.file, { force: true });

	for (const variant of flyerVariants) {
		await fs.rm(
			path.join(flyersDir, `${event.date}-${event.slug}-${variant}.jpg`),
			{ force: true },
		);
	}

	console.log(`Removed old event ${relative(event.file)}`);
}

async function updateEventUrl(file, url) {
	const text = await fs.readFile(file, "utf8");
	const updated = text.replace(/^url:\s*"[^"]+"/m, `url: "${url}"`);
	await fs.writeFile(file, updated);
	console.log(`Updated URL in ${relative(file)}`);
}

async function updateEventTimeZone(file, timeZone) {
	const text = await fs.readFile(file, "utf8");
	const escapedTimeZone = escapeYamlString(timeZone);
	const updated = /^timeZone:\s*"[^"]+"/m.test(text)
		? text.replace(/^timeZone:\s*"[^"]+"/m, `timeZone: "${escapedTimeZone}"`)
		: text.replace(/^(date:\s*.+)$/m, `$1\ntimeZone: "${escapedTimeZone}"`);
	await fs.writeFile(file, updated);
	console.log(`Updated time zone in ${relative(file)}`);
}

async function writeEventMarkdown({ file, date, name, slug, timeZone, url }) {
	const markdown = `---\nname: "${escapeYamlString(name)}"\nimages: {\n  light: { src: "../../assets/event-flyers/${slug}-light.jpg", alt: "${escapeYamlString(name)}" },\n  dark: { src: "../../assets/event-flyers/${slug}-dark.jpg", alt: "${escapeYamlString(name)}" }\n}\nurl: "${url}"\ndate: ${date}\ntimeZone: "${escapeYamlString(timeZone)}"\n---\n`;

	await fs.writeFile(file, markdown, { flag: "wx" });
	console.log(`Created ${relative(file)}`);
}

function escapeYamlString(value) {
	return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

async function exportFlyers({ eventUrl, outputBase }) {
	const { chromium } = await import("playwright");
	const browser = await chromium.launch({ headless: true });

	try {
		const page = await browser.newPage({
			viewport: { width: 1400, height: 1800 },
		});
		await page.goto(eventUrl, {
			waitUntil: "domcontentloaded",
			timeout: 30000,
		});
		await page.waitForTimeout(5000);
		await page
			.getByRole("button", { name: "Share event flyer" })
			.first()
			.click();
		await page.waitForFunction(
			() => document.querySelectorAll("canvas[data-flyer-canvas]").length >= 2,
			{ timeout: 30000 },
		);
		await page.waitForTimeout(4000);

		const dataUrls = await page
			.locator("canvas[data-flyer-canvas]")
			.evaluateAll((nodes) =>
				nodes.slice(0, 2).map((node) => node.toDataURL("image/jpeg", 0.9)),
			);

		for (const [index, dataUrl] of dataUrls.entries()) {
			const base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, "");
			await fs.writeFile(
				`${outputBase}-${flyerVariants[index]}.jpg`,
				Buffer.from(base64, "base64"),
			);
			console.log(
				`Exported ${relative(`${outputBase}-${flyerVariants[index]}.jpg`)}`,
			);
		}
	} finally {
		await browser.close();
	}
}

function sixMonthsAgo(today) {
	return new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
}

function parseDate(value) {
	const parsed = new Date(`${value}T00:00:00`);
	if (Number.isNaN(parsed.getTime()))
		throw new Error(`Invalid --today date: ${value}`);
	return parsed;
}

function formatDate(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function printSummary({
	feedEvents,
	localEvents,
	missing,
	stale,
	timeZoneUpdates,
	ambiguousStale,
	oldEvents,
	cutoff,
}) {
	console.log(`Feed events: ${feedEvents.length}`);
	console.log(`Local events: ${localEvents.length}`);
	console.log(`Cleanup cutoff: ${formatDate(cutoff)}`);
	console.log(`Missing events: ${missing.length}`);
	console.log(`Stale URLs: ${stale.length}`);
	console.log(`Time zone updates: ${timeZoneUpdates.length}`);
	console.log(`Ambiguous stale dates: ${ambiguousStale.length}`);
	console.log(`Old events: ${args.noCleanup ? "skipped" : oldEvents.length}`);

	printItems(
		"\nMissing events",
		missing,
		(event) => `${event.date} | ${event.name} | ${event.url}`,
	);
	printItems(
		"\nStale URL updates",
		stale,
		(event) => `${relative(event.local.file)} -> ${event.feed.url}`,
	);
	printItems(
		"\nTime zone updates",
		timeZoneUpdates,
		(event) => `${relative(event.local.file)} -> ${event.feed.timeZone}`,
	);
	printItems("\nOld events", args.noCleanup ? [] : oldEvents, (event) =>
		relative(event.file),
	);

	if (ambiguousStale.length > 0) {
		console.log("\nAmbiguous stale dates need manual review:");
		for (const item of ambiguousStale) {
			console.log(`- ${item.date}`);
			for (const local of item.locals)
				console.log(`  local: ${relative(local.file)} ${local.url}`);
			for (const feed of item.feeds) console.log(`  feed: ${feed.url}`);
		}
	}
}

function printItems(title, items, format) {
	if (items.length === 0) return;
	console.log(`${title}:`);
	for (const item of items) console.log(`- ${format(item)}`);
}

function relative(file) {
	return path.relative(repoRoot, file);
}

function printHelp() {
	console.log(`Update GRWebDev event entries from Meetup.

Usage:
  npm run update:events
  npm run update:events -- --dry-run
  npm run update:events -- --skip-flyers
  npm run update:events -- --event https://www.meetup.com/grwebdev/events/...

Options:
  --dry-run       Print planned changes without writing files.
  --skip-flyers   Create/update markdown without exporting flyer images.
  --no-cleanup    Do not remove events older than six months.
  --event <url>   Process one Meetup event URL from the iCal feed.
  --feed-file     Read iCal text from a local file instead of Meetup.
  --today         Override today's date for cleanup checks. YYYY-MM-DD.
  --help          Show this help.
`);
}
