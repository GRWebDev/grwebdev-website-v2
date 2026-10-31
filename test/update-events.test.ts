import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
	mkdir,
	mkdtemp,
	readdir,
	readFile,
	rm,
	writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const importerPath = fileURLToPath(
	new URL("../scripts/update-events.ts", import.meta.url),
);

for (const [name, start, expectedTime] of [
	["UTC", "DTSTART:20260724T120000Z", "12:00"],
	["date-only", "DTSTART;VALUE=DATE:20260724", undefined],
] as const) {
	test(`Meetup imports ${name} dates without inventing logistics`, async (t) => {
		const fixtureRoot = await mkdtemp(path.join(tmpdir(), "grwebdev-events-"));
		t.after(() => rm(fixtureRoot, { force: true, recursive: true }));
		const eventsDir = path.join(fixtureRoot, "src/content/Events");
		await mkdir(eventsDir, { recursive: true });
		const feedPath = path.join(fixtureRoot, "meetup.ics");
		await writeFile(
			feedPath,
			[
				"BEGIN:VCALENDAR",
				"BEGIN:VEVENT",
				start,
				"SUMMARY:Example event",
				"URL;VALUE=URI:https://www.meetup.com/grwebdev/events/123/",
				"END:VEVENT",
				"END:VCALENDAR",
				"",
			].join("\r\n"),
		);
		const result = spawnSync(
			process.execPath,
			[importerPath, "--feed-file", feedPath, "--skip-flyers", "--no-cleanup"],
			{ cwd: fixtureRoot, encoding: "utf8" },
		);
		assert.equal(result.status, 0, result.stderr || result.stdout);
		const [eventFile] = await readdir(eventsDir);
		const markdown = await readFile(path.join(eventsDir, eventFile), "utf8");
		assert.match(markdown, /^timeZone: "UTC"$/m);
		if (expectedTime)
			assert.match(markdown, new RegExp(`^startTime: "${expectedTime}"$`, "m"));
		else assert.doesNotMatch(markdown, /^startTime:/m);
		assert.doesNotMatch(markdown, /^location:/m);
		assert.doesNotMatch(markdown, /undefined/);
	});
}
test("Meetup imports preserve the event time zone in Markdown", async (t) => {
	const fixtureRoot = await mkdtemp(path.join(tmpdir(), "grwebdev-events-"));
	t.after(() => rm(fixtureRoot, { force: true, recursive: true }));

	const eventsDir = path.join(fixtureRoot, "src/content/Events");
	const flyersDir = path.join(fixtureRoot, "src/assets/event-flyers");
	await mkdir(eventsDir, { recursive: true });
	await mkdir(flyersDir, { recursive: true });

	const feedPath = path.join(fixtureRoot, "meetup.ics");
	await writeFile(
		feedPath,
		`BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART;TZID=America/New_York:20260724T080000
SUMMARY:Friday Morning Code + Commiserate
LOCATION:The Factory\\, 77 Monroe Center St NW\\,
  Suite 600
URL;VALUE=URI:https://www.meetup.com/grwebdev/events/313908053/
END:VEVENT
END:VCALENDAR
`,
	);

	const result = spawnSync(
		process.execPath,
		[
			importerPath,
			"--feed-file",
			feedPath,
			"--skip-flyers",
			"--no-cleanup",
			"--today",
			"2026-07-22",
		],
		{ cwd: fixtureRoot, encoding: "utf8" },
	);
	if (result.status !== 0) {
		throw new Error(result.stderr || result.stdout);
	}

	const [eventFile] = await readdir(eventsDir);
	const markdown = await readFile(path.join(eventsDir, eventFile), "utf8");
	assert.match(markdown, /^timeZone: "America\/New_York"$/m);
	assert.match(markdown, /^startTime: "08:00"$/m);
	assert.match(
		markdown,
		/^location: "The Factory, 77 Monroe Center St NW, Suite 600"$/m,
	);
});

test("Meetup imports refresh the time zone for existing events", async (t) => {
	const fixtureRoot = await mkdtemp(path.join(tmpdir(), "grwebdev-events-"));
	t.after(() => rm(fixtureRoot, { force: true, recursive: true }));

	const eventsDir = path.join(fixtureRoot, "src/content/Events");
	const flyersDir = path.join(fixtureRoot, "src/assets/event-flyers");
	await mkdir(eventsDir, { recursive: true });
	await mkdir(flyersDir, { recursive: true });

	const eventFile = path.join(eventsDir, "2026-07-24-code-commiserate.md");
	await writeFile(
		eventFile,
		`---
name: "Code + Commiserate"
url: "https://www.meetup.com/grwebdev/events/313908052/"
date: 2026-07-24
timeZone: "UTC"
startTime: "07:30"
location: "Verified venue"
---
`,
	);

	const feedPath = path.join(fixtureRoot, "meetup.ics");
	await writeFile(
		feedPath,
		`BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART;TZID=America/New_York:20260724T080000
SUMMARY:Friday Morning Code + Commiserate
URL;VALUE=URI:https://www.meetup.com/grwebdev/events/313908053/
END:VEVENT
END:VCALENDAR
`,
	);

	const result = spawnSync(
		process.execPath,
		[
			importerPath,
			"--feed-file",
			feedPath,
			"--skip-flyers",
			"--no-cleanup",
			"--today",
			"2026-07-22",
		],
		{ cwd: fixtureRoot, encoding: "utf8" },
	);
	if (result.status !== 0) {
		throw new Error(result.stderr || result.stdout);
	}

	const markdown = await readFile(eventFile, "utf8");
	assert.match(markdown, /^timeZone: "America\/New_York"$/m);
	assert.match(markdown, /^startTime: "08:00"$/m);
	assert.match(markdown, /^location: "Verified venue"$/m);
	assert.match(
		markdown,
		/^url: "https:\/\/www.meetup.com\/grwebdev\/events\/313908053\/"$/m,
	);
});
