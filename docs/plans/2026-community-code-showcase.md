# Community Code Showcase invitation

Status: Implemented with a homepage invitation, build-time cutoff, session-based dialog, and subsequent copy, layout, and accessibility refinements. The decisions below describe the final implementation.

## Agreed test boundaries

The user approved testing the built homepage with a controlled build clock, and the browser UI for dialog interactions, cookies, navigation, keyboard focus, and no-JavaScript or blocked-cookie fallbacks. Tests observe rendered behavior rather than private helpers.

Run `npm run test:browser` for the browser checks, or `npm test` for the complete suite. The showcase tests build immediately before and at the cutoff in non-Eastern timezones. They cover session suppression across reloads, navigation, and tabs; persistent suppression in a new browser session; form opening and delayed dismissal; close X and Escape; focus containment and return; mobile and desktop layouts; and static fallbacks. Core behaviors were implemented through failing-test-first cycles.

## GitHub issues

- [#101: Homepage invitation section and build-time cutoff](https://github.com/GRWebDev/grwebdev-website-v2/issues/101)
- [#102: Session-based dialog with persistent dismissal](https://github.com/GRWebDev/grwebdev-website-v2/issues/102), depends on #101.

## Purpose

Invite prospective presenters to submit an idea for the November 23, 2026 Community Code Showcase using https://forms.gle/2GJXyVBTEgTXV2uy5.

## Accepted decisions

- Show the dialog only on the root homepage.
- Use a session cookie to prevent the dialog from reopening during that browser session, including reloads, return visits, and other tabs.
- Record the session cookie before opening the dialog. Open it only after confirming the cookie was saved.
- Provide an "I've already submitted" control only in the dialog, backed by a persistent cookie to suppress future automatic openings in that browser. Activating it also closes the dialog.
- Opening Google Forms alone does not establish that a submission was completed.
- Keep a section containing the form link above the homepage event grid, available after dialog dismissal.
- Use the shared invitation component for the homepage section and dialog, with the copy below.
- Build the invitation only before midnight on November 14, 2026, in America/New_York (`2026-11-14T05:00:00Z`). A build at or after that instant omits both the dialog and the homepage invitation section.
- Removal reaches the live site when that build is deployed. See the [deployment workflow](../../.github/workflows/deploy.yml) for its triggers and rebuild cadence; a successful deployment after the cutoff is required to remove the invitation from the live site.
- The persistent suppression cookie expires January 1, 2027 at midnight Eastern time (2027-01-01T05:00:00Z).
- The form opens immediately in a new tab. The dialog closes after 500 ms. The link includes an external-link icon and an accessible name announcing the new tab.
- If cookies cannot be saved or read, skip automatic opening and leave the homepage section available. The section also works without JavaScript or native modal-dialog support.
- Use a native modal dialog with a visible Lucide X in its top-right corner, labeled "Close invitation". Close X and Escape dismiss it; there is no separate "Maybe later" control.
- Focus the close control on opening, keep Tab and Shift+Tab within the dialog, and return focus to the homepage form link on dismissal.
- Use a borderless dialog with a dark backdrop. Its actions sit alongside each other when space permits and wrap on narrow screens. The homepage invitation uses a split layout on desktop and stacks on smaller screens.

## Shared invitation copy

### Community Code Showcase on Monday, November 23

Have a project, tool, or development discovery to share? Share at GRWebDev's Community Code Showcase. Demos and talks can be up to 10 minutes. No slide deck required.

Submit your idea by Friday, November 13.

Primary link: **Submit your idea**

Dismissal in the dialog: close X or Escape.

Persistent suppression in the dialog: **I've already submitted**

## Implementation pointers

- [ShowcaseCampaign.astro](../../src/components/ShowcaseCampaign.astro) controls the build-time cutoff and renders both surfaces. [index.astro](../../src/pages/index.astro) places the campaign above Events on the homepage.
- [ShowcaseInvitation.astro](../../src/components/ShowcaseInvitation.astro) owns the shared copy, form link, and action styling.
- [ShowcaseDialog.astro](../../src/components/ShowcaseDialog.astro) owns the modal, cookie handling, dismissal, and focus behavior.
- [showcase.spec.ts](../../test/browser/showcase.spec.ts) checks the static invitation and cutoff; [showcase-dialog.spec.ts](../../test/browser/showcase-dialog.spec.ts) checks dialog behavior. [serve-build.ts](../../test/browser/serve-build.ts) controls the build clocks and timezones.

## Browser session semantics

A session cookie has no explicit expiration date. Some browsers retain session cookies when restoring a previous browsing session, so closing the browser does not guarantee that the invitation will reappear.
