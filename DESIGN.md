---
name: GRWebDev
description: A learner-first community site for Grand Rapids web people.
colors:
  stage-black: "oklch(from var(--gray-100) l c h)"
  signal-red: "oklch(from var(--red-500) l c h)"
  room-light: "oklch(from var(--gray-1000) l c h)"
  charcoal-shadow: "oklch(from var(--gray-700) l c h)"
  header-divider: "oklch(from var(--gray-900) l c h)"
  footer-red-wash: "oklch(from var(--red-950) l c h / 0.075)"
typography:
  display:
    fontFamily: "\"Open Sans Variable\", sans-serif"
    fontSize: "clamp(0.875em, 2.625cqi + 0.25em, 2.375em)"
    fontWeight: 300
    lineHeight: "2cap"
    fontVariation: "\"wght\" 300, \"wdth\" 75"
  hero:
    fontFamily: "\"Open Sans Variable\", sans-serif"
    fontSize: "clamp(2.25rem, 4.5vw, 4rem)"
    fontWeight: 700
    lineHeight: 1.15
  headline:
    fontFamily: "\"Open Sans Variable\", sans-serif"
    fontSize: "calc(2 / 3 * 2em + 1 / 3 * 2em * var(--fluid-font-progress))"
    fontWeight: 700
    lineHeight: 1.5
  title:
    fontFamily: "\"Open Sans Variable\", sans-serif"
    fontSize: "calc(2 / 3 * 1.5em + 1 / 3 * 1.5em * var(--fluid-font-progress))"
    fontWeight: 700
    lineHeight: 1.5
  subheading:
    fontFamily: "\"Open Sans Variable\", sans-serif"
    fontSize: "calc(2 / 3 * 1.17em + 1 / 3 * 1.17em * var(--fluid-font-progress))"
    fontWeight: 700
    lineHeight: 1.5
  body:
    fontFamily: "\"Open Sans Variable\", sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.5
  small:
    fontFamily: "\"Open Sans Variable\", sans-serif"
    fontSize: "0.875em"
    fontWeight: 400
  nav:
    fontFamily: "\"Open Sans Variable\", sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.5
  nav-wide:
    fontFamily: "\"Open Sans Variable\", sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  none: "0"
spacing:
  hairline: "1px"
  xs: "0.5rem"
  sm: "0.75em"
  md: "1em"
  lg: "2ch"
  xl: "3em"
  cap: "1cap"
components:
  nav-link:
    textColor: "{colors.stage-black}"
    typography: "{typography.nav}"
    padding: "0 1rem"
  nav-link-wide:
    textColor: "{colors.stage-black}"
    typography: "{typography.nav-wide}"
    padding: "0"
  donate-link:
    backgroundColor: "{colors.signal-red}"
    textColor: "{colors.room-light}"
    rounded: "{rounded.none}"
    padding: "0.35em clamp(0.75rem, 3cqi, 1.15rem)"
  navigation-disclosure:
    backgroundColor: "{colors.room-light}"
    textColor: "{colors.stage-black}"
    rounded: "{rounded.none}"
  event-flyer:
    rounded: "{rounded.none}"
    width: "100%"
  person-list-item:
    typography: "{typography.body}"
    padding: "0"
  black-red-section:
    backgroundColor: "{colors.stage-black}"
    textColor: "{colors.room-light}"
    typography: "{typography.display}"
    rounded: "{rounded.none}"
---

# Design System: GRWebDev

## Overview

**Creative North Star: "Community Bulletin Board"**

The GRWebDev system should feel like a real local notice board outside a well-used event room: practical, public, friendly, and a little handmade. It is not a corporate conference brand. It should help newcomers understand what is happening, who is involved, and where they can show up without needing insider status.

Open Sans, Stage Black, Signal Red, and Room Light frame real community photographs, event flyers, board portraits, sponsor marks, and venue maps. Outdented grid tracks and the clipped black/red statement band provide the poster-like structure. Content lists stay flat; depth is reserved for the sticky header and its disclosure panel.

This guide records the current implementation, not a new visual direction. Token values come from `src/styles/`; component exceptions are documented below. Relative OKLCH values depend on the color variables in `src/styles/color.css`. The sidecar extends this guide with source-derived ramps, motion, breakpoints, and interactive component samples.

**Key Characteristics:**

- Public, local, and easy to scan.
- Poster-like blocks instead of decorative cards.
- Real community artifacts: event flyers, board photos, sponsor logos, venue maps.
- Strong black/red contrast, softened by accessible Room Light usage.
- Plain language and visible next steps.

## Colors

The black/red identity combines dark text and statement bands with light page surfaces. The frontmatter owns the color values; the names below describe their roles.

### Primary

- **Stage Black:** Main text, mission-band field, map outlines, and the focused skip-link background. The header and footer use it for text, not as their background.

### Secondary

- **Signal Red:** Clipped statement-band geometry, the donation fallback, active-navigation underlines, event bottom rules, and keyboard-focus outlines. Pair emphasis with an underline, outline, or text weight rather than color alone.

### Neutral

- **Room Light:** Body, header, footer, and disclosure-panel backgrounds; light text on dark or red fields.
- **Charcoal Shadow:** Structural separation below the sticky header.
- **Header Divider:** The thin boundary below the header.
- **Footer Red Wash:** The translucent tint inside the footer section, over Room Light.

**The Signal, Not Wallpaper Rule.** Signal Red should point at important structure or energy. Do not scatter it as a generic accent.

**The Room Stays Open Rule.** Dark sections must preserve enough Room Light contrast for newcomers scanning logistics, names, dates, and links.

## Typography

Open Sans Variable is the sole authored family, with sans-serif fallback. The self-hosted Latin font loads with `font-display: swap`, supports weights from 300 to 800, and supports widths from 75% to 100%. The condensed-light class gives mission copy its narrow poster voice; ordinary body and navigation text remain at the normal width.

### Hierarchy

- **Display:** The frontmatter display role applies to mission copy in the black/red band. Its size follows container width, with cap-relative leading. Do not substitute the hero heading scale here.
- **Hero:** The homepage has its own viewport-fluid headline and a larger introductory paragraph (`clamp(1.125rem, 1.6vw, 1.5rem)`).
- **Headline, title, subheading:** Global h1, h2, and h3 use the frontmatter formulas. The shared root progress is `progress(100vw, var(--fluid-font-vpmin), var(--fluid-font-vpmax))`, bounded by 320px and 1440px. It scales each default em size from two-thirds to the full value. Browsers without that function use progress 1 and retain the full default sizes. This is viewport sizing, not container sizing.
- **Body:** Use the frontmatter body role for descriptions and logistics. Paragraphs use pretty wrapping; headings use balanced wrapping. Hyphenation is manual. Detail-page prose is capped at 70ch, while hero copy is capped at 55ch.
- **Small:** Secondary organization and legal copy uses the relative small-text role. Do not shrink primary logistics or names to make them fit.
- **Navigation:** Disclosure links use the nav role; the expanded header switches to nav-wide. Active links are bold and underlined.

### Local exceptions

- About address h2 headings use line-height 1.25 and `text-box: cap alphabetic`. Their h3 location labels use `1cap` leading only above 400px of available container width.
- Event names remain h3 semantically but use body-relative size (`1em`) with no top margin. Captions retain dates, time zone, location, and the Meetup destination independently of the flyer.
- Board and sponsor titles use bold stacked names with line-height 1.125. Board roles are smaller (`0.75em`) and red; names retain cap-to-alphabetic trimming. Do not apply their compact title treatment to general body copy.
- Footer h2 headings use `0.925em`. Text-box trimming is a local alignment enhancement, not a replacement for readable line-height.

**The One Family Rule.** Stay with Open Sans Variable unless there is a deliberate brand reason to add another family. The current system gets its range from weight, width, scale, and layout.

**The Plain Invitation Rule.** Typography should sound and look like people inviting people. Avoid all-caps institutional labels and over-styled conference language.

## Layout

### Shared grid and rhythm

The body is an inline-size container. Page sections and navigation use named full, outdent, main, and indent tracks rather than a single centered card. Direct children occupy the outdent span by default. Preserve the narrower named spans and full-bleed statement band when adding sections.

The root track-sizing variable starts at 400px, then becomes 600px above a 480px viewport, 1000px above 768px, 1500px above 1152px, and 1800px above 1600px. These are track inputs, not the final content max-width. The center track uses `min(40cqi, var(--main-max-width))`; each of the four adjacent tracks uses `min(10cqi, calc(var(--main-max-width) / 10))`. Outer tracks reserve at least half a rem.

Keep `scrollbar-gutter: stable` on the root element. Viewport width and container content width can differ when classic scrollbars reserve space. Do not replace container thresholds with similarly numbered viewport media queries.

Text blocks usually start with the medium spacing token. Repeated media rows and event columns use the large token; mission copy uses cap-based rhythm. The body fills at least the small viewport height (`100svh`), and main content reserves the extra-large spacing token below it.

### Component reflow

- **Header:** A named header container controls the native disclosure. At 25em, donation can move alongside the menu mark; at 40em, page links and donation form a single row. These em thresholds follow text size. The layout enhancement requires `details::details-content`; without it, the complete native menu remains available at every width.
- **Events:** A named events container uses one column by default, two above 620px, three above 960px, and four above 1280px. Each threshold is a strict greater-than comparison. The gap uses the large spacing token. The homepage preview reveals 3, 4, 6, or 8 flyers at those same ranges; the Events page does not use preview hiding.
- **Image/text rows:** Compact board rows place the image beside the title above 16.6667em. Detail layouts switch from stacked to two-column above 40em and retain the independent 34.5em role/name spacing adjustment. Tracks can shrink, and long names wrap rather than truncate.
- **Sponsor rows:** Landscape marks stack above the text until their container exceeds 620px. The wide layout reserves a 12rem to 18rem logo rail; the image remains contained within a 4rem maximum height rather than being cropped square.
- **About:** Address/map pairs become two columns above 960px of container space. Maps preserve a 17:14 aspect ratio and a maximum width of 425px.
- **Footer:** Contact information flows in normal document order. Above 520px of available container width, the seal sits beside the social and address content. The footer is not fixed or hover-revealed.

**The Available Space Rule.** Keep component reflow tied to the container that owns the content. Do not shrink names or logistics to imitate a desktop layout at enlarged text sizes.

## Elevation & Depth

The system is flat and poster-like by default. Depth comes from grid placement, contrasting fields, clipped geometry, and real imagery. Event entries and people/sponsor rows do not acquire card shadows.

- **Header lift:** The sticky header separates scrolling content with `0 -0.5em 0.5em 0.5em var(--gray-700)` and a thin lower divider.
- **Disclosure lift:** The open navigation panel uses `0 0.4rem 0.45rem oklch(from var(--gray-100) l c h / 0.2)`. Its floating shadow disappears when links join the wide header row.
- **Footer tint:** The footer uses the frontmatter red wash over its light surface, not an additional elevation layer.

**The Flat Bulletin Rule.** Do not add card shadows to make lists feel designed. Use spacing, imagery, typography, and grid position first.

## Shapes

Authored surfaces, portraits, flyer tiles, and the donation fallback have square corners. Third-party Givebutter UI may have its own treatment; it does not establish a site-wide rounded-button system. No native input or general-purpose button system is currently implemented.

The black/red section uses a clipped trapezoid plus an adjacent red block. Its polygon changes above 767px of container width. Preserve the existing geometry rather than replacing it with a gradient or arbitrary shape. Event links have a four-pixel bottom rule; maps and the header have one-pixel boundaries. Keyboard focus is a two-pixel outline rather than a decorative border.

## Components

### Navigation and donation

Keep one logo, one link list, and one donation instance inside native details/summary markup. The logo width is fluid (`clamp(4.7rem, 15cqi, 6.4rem)`). The compact bar has a minimum height of 4.25rem; the wide bar uses 5rem. The summary is 2.75rem wide and 3.5rem tall; page links and the campaign fallback retain at least 44px target height.

Links underline on hover or visible keyboard focus. The current page also has bold text, a red underline, and `aria-current="page"`. Preserve native disclosure open state when resizing. The menu mark transitions with `transform 160ms ease-out`; reduced-motion rules shorten transitions.

Givebutter loads asynchronously when idle, with a load-event fallback. A real campaign link remains if scripts are disabled, blocked, or unavailable. Its authored treatment uses the donate-link tokens and bold text. Do not document the third-party widget as a reusable native button or move it with JavaScript.

### Skip navigation

The skip link becomes visible on keyboard focus and targets `main` with `tabindex="-1"`. Main has a six-rem scroll margin so the sticky header does not obscure the destination and a visible inset focus outline. Tab then continues to the first interactive element in the main content. Keep this behavior without JavaScript.

### Homepage hero

Use the real community photograph, centered and cover-sized beneath a 55% black overlay with white text. Generate AVIF variants at quality 45 with WebP fallbacks from the original image without introducing different crops. Container ranges select 768px sources through 480px, 1024px through 1024px, 1440px through 1440px, and 1920px beyond that; image-set supplies double-resolution variants where supported. Typed image-set candidates prefer AVIF while downloading only the supported format at the matching density.

Declare the URL variables once on the section. Assign every range inside a container query so initialization does not first download the wrong fallback image. Only browsers without container queries receive the smallest-range fallback outside those queries; browsers without image-set retain a single-resolution background. Do not add client-side image-selection code.

### Event links and captions

Use full-width, uncropped flyers with square corners and no elevated card shell. Alternate the light and dark assets as implemented. Keep readable captions beneath the image: name, semantic date/time, time zone, location, and an underlined Meetup destination. The flyer has empty alt text because the caption supplies the accessible link name. Names and locations support automatic text direction and wrap long content.

The whole entry is one external link with `noopener noreferrer`. Hover and keyboard focus underline the title, not the entire logistics block; the destination remains underlined at rest. A red bottom rule and offset focus outline make boundaries and state visible without relying on color alone.

Loading priority is opt-in. Only the first Upcoming flyer on the Events page is eager and high priority; Recent and homepage flyers remain lazy and auto priority. All decode asynchronously. Lazy images use `sizes="auto, min(80vw, 620px)"` to follow their rendered slot when supported. The eager image uses the conservative `min(80vw, 620px)` hint. This fallback is not an exact multi-column slot calculation; without script-enabled native lazy sizing, a browser may select a larger source.

Source candidates are 320, 480, 640, 960, and 1280 pixels, with Astro capping imported images at their original width. Preserve intrinsic dimensions and the existing low-quality setting. The homepage always offers the trailing View all events link. Empty grids show a plain status paragraph rather than an empty decorative shell.

### Board and sponsor content

Board listings use a 100px square portrait with cover fitting; profiles use a 300 by 375 image. Sponsor marks use contain fitting and preserve their proportions. Stacked role/name titles and a visible text emphasis carry the link treatment. Do not truncate names, force sponsor marks into portrait crops, or make the whole biography look like a link.

Named image/title view transitions preserve list-to-detail continuity. The slider uses the root motion tokens: duration 380ms, easing `cubic-bezier(0.16, 1, 0.3, 1)`, and travel distance 24%. Navigation transitions are opted into only without a reduced-motion preference; the slider also explicitly disables its animations when motion is reduced. Missing bios and empty collections retain readable text fallbacks, and missing entries use the 404 page.

### Black/red community band and footer

The signature full-width band combines Stage Black, Room Light statement text, and Signal Red clipped geometry. Keep the content above the geometry and retain the condensed-light voice. The footer stays a light, red-tinted organization block with social links, contact details, seal, and legal copy. Do not reintroduce a hover-only footer reveal.

## Do's and Don'ts

### Do

- Use real community artifacts: event flyers, board photos, sponsor logos, venue maps, and organization details.
- Keep dates, names, locations, and next steps readable independently of images or third-party scripts.
- Preserve the Stage Black, Signal Red, and Room Light relationship.
- Use the outdent grid and component-owned container queries for responsive composition.
- Preserve keyboard focus, native disclosure behavior, reduced-motion handling, and no-script access. Target WCAG 2.2 AA without claiming that documentation alone verifies conformance.

### Avoid

- Make the site feel corporate, exclusive, or like a generic SaaS or conference template.
- Replace real community imagery with decorative abstract panels.
- Add side-stripe card borders, gradient text, glassmorphism, identical icon-card grids, or hero-metric templates.
- Use Signal Red as wallpaper or color alone to communicate state.
- Hide event logistics inside flyers, crop sponsor logos into squares, truncate names, or shrink text to force a layout.
- Treat third-party widget styling or hypothetical future controls as an implemented native design system.
