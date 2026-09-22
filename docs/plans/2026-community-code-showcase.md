# Community Code Showcase invitation

Status: Design confirmed. The homepage invitation and build-time cutoff are implemented; the dialog is the next PR in the stack.

## Agreed test boundaries

The user approved testing the built homepage with a controlled build clock, and the browser UI for dialog interactions, cookies, navigation, keyboard focus, and no-JavaScript or blocked-cookie fallbacks. Tests observe rendered behavior rather than private helpers.

## GitHub issues

- [#101: Homepage invitation section and build-time cutoff](https://github.com/GRWebDev/grwebdev-website-v2/issues/101)
- [#102: Session-based dialog with persistent dismissal](https://github.com/GRWebDev/grwebdev-website-v2/issues/102), depends on #101.

## Purpose

Invite prospective presenters to submit an idea for the November 23, 2026 Community Code Showcase using https://forms.gle/2GJXyVBTEgTXV2uy5.

## Accepted decisions

- Show the dialog only on the root homepage.
- Use a session cookie to prevent the dialog from reopening during that browser session. This replaces the initial daily reset proposal.
- Provide an "I've already submitted" control backed by a persistent cookie to suppress future automatic openings in that browser.
- Opening Google Forms alone does not establish that a submission was completed.
- Keep a section containing the form link above the homepage event grid, available after dialog dismissal.
- Include the invitation from deployment until the first build after November 13, 2026. Removal is a build-time decision, not a runtime timer.
- Use the copy below.
- The first build on or after November 14, 2026, in America/New_York removes both the dialog and the homepage invitation section when deployed.
- The persistent suppression cookie expires January 1, 2027 at midnight Eastern time (2027-01-01T05:00:00Z).
- The form opens immediately in a new tab. The dialog closes after 500 ms.
- If cookies cannot be saved, skip automatic opening and leave the homepage section available.
- Put a visible close X in the dialog's top-right corner.
- "Maybe later," Escape, and the close X dismiss the dialog.
- Record the session cookie when the dialog first opens, so refreshing or returning home does not reopen it.

## Dialog copy

### Show us what you've been building

Have a project, tool, or development discovery to share? Present at GRWebDev's Community Code Showcase on Monday, November 23 at 6 p.m. Demos and talks can be up to 10 minutes. No slide deck required.

Submit your idea by Friday, November 13.

Primary link: **Submit your idea**

Dismissal: **Maybe later**

Persistent suppression: **I've already submitted**

## Browser session semantics

A session cookie has no explicit expiration date. Some browsers retain session cookies when restoring a previous browsing session, so closing the browser does not guarantee that the invitation will reappear.
