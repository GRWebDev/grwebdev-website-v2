# Throwaway text sizing prototype

Three layout variants on the existing routes, switchable with `?variant=A`,
`?variant=B`, and `?variant=C`. This is exploratory code, not a production fix.

## Question

Which header and profile layout preserves access to navigation and readable names
at enlarged text sizes without shrinking the visitor's chosen font size?

Source: `output/impeccable-audit-2026-10-30.md`, the P1 enlarged-text navigation
finding and its related profile overflow. Event discovery, flyer text, link styling,
and the other audit findings are outside this prototype.

## Run

Use Node 26.7 or newer, as required by the project, then run:

```sh
npm run prototype:text
```

The command opens `/?variant=A&text=200` on Astro's development server. Use the
floating bar or the left/right arrow keys to switch variants. Open the bar's
settings for 100% or 200% root text, donation mode, example pages, and measurements.
Arrow shortcuts leave form fields and editable elements alone. Settings stay in
the URL and follow internal navigation. Remove `variant` or select Exit prototype
to return to the unchanged page.

Start with `/board/anwesha-pradhananga/?variant=B&text=200` at a 320px viewport.
Compare the homepage and sponsor details at 390px, 768px, and 1440px too.

| Variant | Header | Profile | Tradeoff |
| --- | --- | --- | --- |
| A, Fit before folding | Text links and donation, then menu mark and donation, then donation inside the menu | Portrait first, side-by-side only with enough text-relative space | Keeps the header on one row, but donation becomes less discoverable at the narrowest sizes |
| B, Separate support row | Brand and menu above a full-width donation row | Full-width name above portrait and biography | Predictable menu position and visible donation, but a permanently taller header and collapsed desktop navigation |
| C, Menu-first reading | Non-sticky header, donation revealed with the native menu | Name, portrait, biography in one reading column | More room for reading, but donation is less discoverable and desktop visitors must open navigation |

All variants keep Open Sans, the brand palette, real content, and the existing
native menu. Shared changes remove intrinsic grid minimums, explicitly define the
single-column detail layout, allow long names to wrap, and let menu rows grow.
No text is reduced to conceal overflow. The prototype toolbar uses fixed 14px
text to avoid making the comparison tool dominate the enlarged page.

Live Givebutter is the default donation mode. Select Anchor fallback to reload
without the external widget for a deterministic comparison. An explicit
`donation=fallback` URL parameter also selects that mode. Live mode requires
external network access and does not mock the widget's upgraded appearance.
The fallback links to the campaign used by the live widget. The former fallback
used the widget ID as a campaign URL, which returned HTTP 404.

## Findings and decision

All three alternatives remove the measured fallback overflow in the scoped checks.
The mechanism worth retaining is intrinsic shrink/reflow, not smaller type or
clipping. At 320px and 200% text, long names still need to break inside a word.
That is preferable to truncation, but the exact name layout needs human review.

C's native `::details-content` wrapper spans both header columns so the page-link
list uses the full header width. Setting the list's grid span alone does not span
the wrapper, which had left only 196px for links in a 300px header at a 375px
viewport. Heading sizes and page gutters remain unchanged.

A now measures the rendered brand, text links, donation button, menu mark, and
gaps to set two content-fit breakpoints. Text links stay visible while all three
items fit. The first breakpoint replaces links with the menu mark. The second
moves the existing donation element into a list item inside `details > ul`.
Widening the header moves that same element back out. No second widget is created.
The thresholds recalculate on resize, text-size changes, font loading, and widget
upgrades, so the short live button and longer fallback do not share an unnecessarily
conservative breakpoint. The settings panel reports both thresholds in header-space
pixels and the current navigation stage.
Measurements do not relocate the widget. It moves only when its target location
changes, avoiding repeated custom-element reconnections while resizing.

Compare A's single-row header with B's always-visible donation row and C's
reading-first layout. No winning variant has been selected or promoted into
production.

## Validation

- `npm run typecheck` passed, 29 files, zero errors, warnings, or hints.
- `npm run build` passed, 16 static pages.
- Installed Google Chrome through Playwright checked 72 combinations: A/B/C,
  320/390/768/1440px, 100%/200% root text, and home/long-name profile/long-name
  sponsor details. No document overflow, offscreen visible menu toggles, or
  overflowing primary headings. Open menus were checked wherever available.
- Checked variant wraparound, reload-stable settings, arrow-key exclusion in
  selects, changing text size, internal-link query propagation, and inactive mode.
- Inspected a rendered comparison of the three long-name profiles at 320px and
  200% text. The header-height tradeoff is visible, particularly in A.
- Production output contains neither the switcher markup nor the activation
  script. Shared prototype CSS is inert without the development-only attribute.
- These checks block external requests and cover the fallback only. They do not
  establish live-widget behavior, actual browser zoom, screen-reader behavior,
  Safari/Firefox support, or WCAG conformance. Full-repository lint remains subject
  to the audit's existing Biome version/configuration mismatch.

Follow-up checks after the navigation and donation corrections:

- C's open link list fills its header at 320, 375, 390, 768, and 1440px, at both
  100% and 200% root text. Each page-link label remains on one line without
  document overflow, and closing the native menu hides the links.
- With external requests enabled, clicking the real Donate button opens the
  embedded campaign dialog in A, B, and C at 375px and 200% text.
- The corrected fallback campaign URL returns HTTP 200. No donation was submitted.
- A's content-fit navigation passed 88 resize combinations from 280px to 1920px,
  shrinking and expanding with both donation modes and both text sizes. The header
  stayed on one row without document overflow. All three stages were exercised,
  the same widget element was retained, and live donation opened after relocation.
  Switching to B/C restored their original donation placement and removed A's
  navigation state.

## Capture and cleanup

Working branch: `prototype/text-sizing-reflow`, based on
`codex/monthly-events-november-2026` at the start of this task. Existing audit
artifacts and hook edits were left alone. No implementation issue was supplied.

Once a choice is approved, record the chosen combination and reasons on the
implementation issue, commit these alternatives on this throwaway branch, and
link that branch from the issue. Rewrite only the approved behavior as a
production change. Remove the prototype component, stylesheet, layout hooks,
donation-loader guard, and runner command from the production implementation.
