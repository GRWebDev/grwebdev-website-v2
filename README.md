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
| :------------------------ | :-------------------------------------------------------- |
| `npm ci`                  | Installs dependencies                                     |
| `npm run dev`             | Starts local dev server at `localhost:4321`               |
| `npm run build`           | Build your production site to `./dist/`                   |
| `npm run preview`         | Preview your build locally, before deploying              |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check`          |
| `npm run astro -- --help` | Get help using the Astro CLI                              |
| `npm run lint`            | List out linting issues                                   |
| `npm run lint:fix`        | Correct automatically fixable lint issues and list others |
| `npm run typecheck`       | Check Astro and TypeScript types                          |
| `npm test`               | Run unit tests, typecheck, lint, build, and browser tests |
| `npm run test:e2e`       | Run Playwright routing regression tests                  |
| `npm run update:events`   | Update event content and flyer images from Meetup         |

Install the browser before running tests for the first time, or after updating Playwright:

```sh
npx playwright install chromium --only-shell
```

The browser tests start an isolated copy of the site and clean it up afterward. Fixture content uses entry IDs that differ from the generated route slugs, so the tests exercise the board and sponsor missing-entry guards. They verify HTTP 404, the original URL, no redirect, and the custom error page. GitHub Actions runs the full suite on all pull requests.

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

## Deployment

[Deploy to GitHub Pages](.github/workflows/deploy.yml) builds and publishes the site on pushes to `main`, on manual runs, and weekly on Tuesday at 12:17 a.m. Eastern time using `America/New_York`, including daylight saving time.

The 2026 Community Code Showcase invitation also has a dedicated deployment scheduled for November 14, 2026 at 12:17 a.m. Eastern, shortly after its midnight cutoff. This cron repeats annually, so remove the temporary November 14 schedule and this paragraph by November 13, 2027. [Cleanup issue](https://github.com/GRWebDev/grwebdev-website-v2/issues/115) tracks that work. The weekly Tuesday schedule continues after cleanup.

Astro evaluates date-dependent content during the build. The weekly deployment refreshes upcoming and past event selection, and any date-gated campaign content, without requiring a commit. It rebuilds the content already in the repository. Import new Meetup data separately with `npm run update:events`, then commit the resulting event files and flyers.

GitHub runs scheduled workflows from the latest commit on the default branch, currently `main`. The schedule starts after this workflow reaches that branch. GitHub can delay or drop scheduled runs, so the weekly refresh and dedicated showcase run are best-effort targets, not exact expiry guarantees. In public repositories, GitHub disables schedules after 60 days without repository activity. See [GitHub's schedule limitations](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).

Maintainers must trigger a manual deployment after a cutoff without a dedicated schedule, or after a missed weekly or showcase run. Open **Actions → Deploy to GitHub Pages → Run workflow**, select `main`, and run it. If GitHub disabled the workflow, enable it on that workflow's Actions page first. Confirm that both the build and deployment jobs succeed before treating the published site as refreshed.

## FAQ

**Why use `npm ci`?**

`npm ci` is more predictable across a team. [Read more](https://support.deploybot.com/build-tools/why-developers-should-use-npm-ci-instead-of-npm-install-and-its-benefits#why-use-npm-ci).
