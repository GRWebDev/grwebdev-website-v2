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
	new URL("../scripts/update-events.mjs", import.meta.url),
);

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
url: "https://www.meetup.com/grwebdev/events/313908053/"
date: 2026-07-24
timeZone: "UTC"
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
});
