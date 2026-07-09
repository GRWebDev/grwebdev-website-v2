# GrWebDev Website

## 🚀 Project Structure

This project is using [Astro](https:/astro.build)

Inside this project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── images referenced in the code
│   ├── components
│   │   └── reusable components
│   ├── content
│   │   └── Board
│   │   │   └── One file per board member 
│   │   └── Presentations
│   │   │   └── One file per presentation 
│   │   └── Sponsors
│   │   │   └── One file per sponsor  
│   ├── layouts
│   │   └── Layout.astro -- Items that are on ever page go here
│   └── pages
│   └── content.config.ts -- This file configures the types for the content and helps with IDE typeahead
│       └── index.astro
└── package.json
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                                    |
|:--------------------------|:----------------------------------------------------------|
| `npm install`             | Installs dependencies                                     |
| `npm run dev`             | Starts local dev server at `localhost:4321`               |
| `npm run build`           | Build your production site to `./dist/`                   |
| `npm run preview`         | Preview your build locally, before deploying              |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check`          |
| `npm run astro -- --help` | Get help using the Astro CLI                              |
| `npm run lint`            | List out linting issues                                   |
| `npm run lint:fix`        | Correct automatically fixable lint issues and list others |
| `npm run update:events`   | Update event content and flyer images from Meetup         |

## Updating Events

The site can update event entries from the GRWebDev Meetup iCal feed:

```sh
npm run update:events
```

The updater compares Meetup events against local files in `src/content/Events/` by event date and Meetup URL. It creates missing event markdown files, updates stale Meetup URLs when the match is unambiguous, exports light and dark flyer images into `src/assets/event-flyers/`, and removes events and matching flyers that are six months old or older.

Start with a dry run when checking what will change:

```sh
npm run update:events -- --dry-run
```

### Event Updater Flags

| Flag            | Action                                                               |
|:----------------|:---------------------------------------------------------------------|
| `--dry-run`     | Print planned changes without writing files                          |
| `--skip-flyers` | Create or update markdown without exporting flyer images             |
| `--no-cleanup`  | Do not remove events older than six months                           |
| `--event <url>` | Process one Meetup event URL from the iCal feed                      |
| `--feed-file`   | Read iCal text from a local file instead of Meetup                   |
| `--today`       | Override today's date for cleanup checks, using `YYYY-MM-DD` format  |
| `--help`        | Show the updater help text                                           |

Examples:

```sh
npm run update:events -- --dry-run --skip-flyers
npm run update:events -- --event https://www.meetup.com/grwebdev/events/315330656/
npm run update:events -- --feed-file ./events.ics --today 2026-07-09
```
