---
name: GRWebDev
description: A learner-first community site for Grand Rapids web people.
colors:
  stage-black: "oklch(from var(--gray-100) l c h)"
  signal-red: "oklch(from var(--red-500) l c h)"
  room-light: "oklch(from var(--gray-1000) l c h)"
  charcoal-shadow: "oklch(from var(--gray-700) l c h)"
  footer-red-wash: "oklch(from var(--red-950) l c h / 0.075)"
typography:
  display:
    fontFamily: "\"Open Sans Variable\", sans-serif"
    fontSize: "clamp(0.875em, 2.625cqi + 0.25em, 2.375em)"
    fontWeight: 300
    lineHeight: "2cap"
    fontVariation: "\"wght\" 300, \"wdth\" 75"
  body:
    fontFamily: "\"Open Sans Variable\", sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: "normal"
  small:
    fontFamily: "\"Open Sans Variable\", sans-serif"
    fontSize: "0.875em"
    fontWeight: 400
  nav:
    fontFamily: "\"Open Sans Variable\", sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
rounded:
  none: "0"
spacing:
  hairline: "1px"
  xs: "0.5rem"
  sm: "0.75em"
  md: "1em"
  lg: "2ch"
  xl: "3em"
components:
  nav-link:
    textColor: "{colors.stage-black}"
    typography: "{typography.nav}"
    padding: "0"
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

## 1. Overview

**Creative North Star: "Community Bulletin Board"**

The GRWebDev system should feel like a real local notice board outside a well-used event room: practical, public, friendly, and a little handmade. It is not a corporate conference brand. It should help newcomers understand what is happening, who is involved, and where they can show up without needing insider status.

The current visual language is bold and direct: large Open Sans, a Stage Black field, a Signal Red geometric accent, Room Light surfaces and text, event-flyer imagery, board photos, sponsor marks, and a structured grid that lets content outdent instead of sitting in polite centered cards. The system is mostly flat and poster-like, with structural layering reserved for the sticky header and footer.

It rejects polished enterprise sameness, stock-photo professionalism, investor-deck language, generic SaaS sections, sterile tech conference aesthetics, and anything that makes newcomers feel like they need credentials before they belong.

**Key Characteristics:**

- Public, local, and easy to scan.
- Poster-like blocks instead of decorative cards.
- Real community artifacts: event flyers, board photos, sponsor logos, venue maps.
- Strong black/red contrast, softened by accessible Room Light usage.
- Plain language and visible next steps.

## 2. Colors

The palette is a committed black/red community identity: Stage Black carries structure, Signal Red creates attention, and Room Light keeps the experience open and readable.

### Primary

- **Stage Black**: The main text, dark section, header, and footer color. Use it as the strong civic backbone of the site.

### Secondary

- **Signal Red**: The geometric accent used in the black/red section. Use it for directional energy, not decoration everywhere.

### Neutral

- **Room Light**: The page background and light-on-dark text color. Use it to keep the site welcoming and readable.
- **Charcoal Shadow**: The header shadow color. Use it only for structural separation.
- **Footer Red Wash**: A low-opacity footer surface tint. Use it when a surface needs warmth without becoming a red block.

### Named Rules

**The Signal, Not Wallpaper Rule.** Signal Red should point at important structure or energy. Do not scatter it as a generic accent.

**The Room Stays Open Rule.** Dark sections must preserve enough Room Light contrast for newcomers scanning logistics, names, dates, and links.

## 3. Typography

**Display Font:** Open Sans Variable, with sans-serif fallback.
**Body Font:** Open Sans Variable, with sans-serif fallback.
**Label/Mono Font:** None.

**Character:** The type is approachable and practical, with enough variable width control to feel like community signage rather than default browser text. Condensed light Open Sans gives mission copy and dark-section text a poster voice without becoming corporate.

### Hierarchy

- **Display** (300 weight, 75 width, `clamp(0.875em, 2.625cqi + 0.25em, 2.375em)`, `2cap` line-height): Use for statement text inside dark community sections.
- **Headline** (default inherited heading weight and size): Use for page titles such as "Grand Rapids Web Development Group", "Board of Directors", and "Sponsors".
- **Title** (default h2 sizing, `1cap` line-height in compact address contexts): Use for list item names, sponsor names, board titles, and location headings.
- **Body** (400 weight, `1.125rem`): Use for descriptions, logistics, addresses, and explanatory copy. Keep prose direct and balanced.
- **Label** (400 weight, `0.875em`): Use for footer legal text, organization details, and quiet supporting information.

### Named Rules

**The One Family Rule.** Stay with Open Sans Variable unless there is a deliberate brand reason to add another family. The current system gets its range from weight, width, scale, and layout.

**The Plain Invitation Rule.** Typography should sound and look like people inviting people. Avoid all-caps institutional labels and over-styled conference language.

## 4. Elevation

The system is flat and poster-like by default. Depth comes from grid placement, black/red field changes, clipped geometry, imagery, and sticky structural chrome. Shadows are rare and functional, not decorative.

### Shadow Vocabulary

- **Header Lift** (`box-shadow: 0 -0.5em 0.5em 0.5em var(--gray-700)`): Use only to separate the sticky header from scrolling content.

### Named Rules

**The Flat Bulletin Rule.** Do not add card shadows to make lists feel designed. Use spacing, imagery, typography, and grid position first.

## 5. Components

### Buttons

There is no native button system in the current code. Future buttons should borrow the navigation/link vocabulary: plain, high-contrast, text-first, and obvious on hover/focus.

- **Shape:** Square corners (`0` radius).
- **Primary:** Stage Black background with Room Light text, or Signal Red only when the action truly needs prominence.
- **Hover / Focus:** Underline or visible focus outline. Do not rely on color alone.
- **Secondary / Ghost / Tertiary:** Plain text links are acceptable when the action is navigational.

### Cards / Containers

The site does not use decorative cards as a default pattern. Repeated content appears as outdented image/text rows or flyer grids.

- **Corner Style:** Square (`0` radius).
- **Background:** Room Light page field, Stage Black dark sections, Signal Red clipped geometry.
- **Shadow Strategy:** Flat by default. Header shadow only.
- **Border:** One-pixel dividers and iframe borders are acceptable for utility.
- **Internal Padding:** Use block rhythm around sections (`1em`, `1cap`, `3em`) rather than identical card padding.

### Inputs / Fields

No form field system exists in the current code. If fields are added, they should be square, high-contrast, keyboard-visible, and plain enough to feel like a community utility rather than a SaaS control.

### Navigation

Navigation is a sticky top bar on Room Light with the GRWebDev logo and plain text links. Links are separated by pipe characters, remain inherited color, and underline on hover.

- **Desktop/Mobile Style:** Flex row with `2ch` gaps in the outdent grid column.
- **Logo:** About `6em` wide.
- **Hover:** Underline.
- **Active State:** Not currently defined. Add one only if it helps orientation.

### Event Flyer Grid

Event discovery relies on real flyer imagery, shown in a one-column grid on small screens and three columns above `940px` container width.

- **Style:** Full image tiles, no decorative frame.
- **Spacing:** `2ch` gap.
- **Behavior:** Alternate between light and dark event flyer assets as currently implemented.

### Image/Text Rows

Board and sponsor listings use a compact image/text row.

- **Style:** `100px` square image followed by text.
- **Spacing:** `2ch` column gap.
- **Images:** Board images cover the square; sponsor images contain within the square.
- **Motion:** View-transition names preserve image/title continuity between list and detail pages.

### Black/Red Community Section

The signature section uses Stage Black as the field, Room Light text, and Signal Red clipped blocks.

- **Shape:** Full-width grid band with clipped trapezoid geometry.
- **Type:** Condensed light Open Sans, fluid with container query units.
- **Use:** Mission statements, community statements, or moments where the site needs to feel like a public poster.

## 6. Do's and Don'ts

### Do:

- **Do** use real community artifacts: event flyers, board photos, sponsor logos, venue maps, and organization details.
- **Do** keep layouts public and scannable, especially for dates, names, locations, and next steps.
- **Do** preserve the Stage Black, Signal Red, and Room Light relationship.
- **Do** use the outdent grid to create a confident local-poster layout.
- **Do** support WCAG 2.2 AA, reduced motion preferences, keyboard-friendly navigation, visible focus states, and contrast that does not rely on red and black alone.

### Don't:

- **Don't** make the site feel corporate.
- **Don't** use polished enterprise sameness, stock-photo professionalism, investor-deck language, generic SaaS sections, or sterile tech conference aesthetics.
- **Don't** imply exclusivity, insider status, hustle culture, or a narrow definition of who counts as a developer.
- **Don't** replace real community imagery with decorative abstract panels.
- **Don't** add side-stripe card borders, gradient text, glassmorphism, identical icon-card grids, or hero-metric templates.
- **Don't** use Signal Red as wallpaper. It should carry direction or emphasis.
