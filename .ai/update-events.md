# Update Events (GRWebDev)

Use this guide to add new event entries to the site from Meetup without extra searching.

## Source of truth
- Meetup iCal feed (all upcoming events):
  - https://www.meetup.com/grwebdev/events/ical/

## Quick workflow
1. Fetch the iCal feed and extract event dates + URLs.
2. Compare feed events to existing event frontmatter by `date + url` to find:
   - missing events
   - stale Meetup URLs on existing entries
3. For each missing event:
   - Create a new markdown entry in `src/content/Events/`.
   - Add a matching flyer image in `public/event-flyers/`.
4. Update any existing event entry whose `url` does not match the current iCal URL for that date.
5. Remove any events (and their flyers) that are 6 months old or older.

## How to identify missing events
- Event files are named like: `YYYY-MM-DD-<slug>.md`.
- The date in the filename is the event date.
- Do **not** compare by date alone.
- Compare the iCal feed against the `url` field inside each markdown file.
- A feed event is missing if there is no markdown entry with the same `date` **and** the same Meetup `url`.
- A markdown entry is stale if its `date` exists in the feed but its `url` does not match any feed URL for that date.
- Multiple events can exist on the same date. In that case, there should be multiple files for that date with different slugs.

## Important edge cases
- Recurring Meetup event URLs sometimes change from an older recurring token to a new numeric event URL. Always trust the current iCal feed URL.
- The same date can have more than one event. Example: one morning event and one evening event on `2026-03-27`.
- The slug is just the local filename slug; it does **not** need to match the Meetup URL token.

## Remove events 6 months old or older
- Determine the cutoff date: today minus 6 months.
- Remove any event entries with a date on or before the cutoff.
- Also remove their flyer images in `public/event-flyers/` that match the same date/slug.
- Keep this repo focused on recent and upcoming events only.

Example (macOS): list old entries
```
python3 - <<'PY'
from datetime import date
from dateutil.relativedelta import relativedelta
from pathlib import Path

cutoff = date.today() - relativedelta(months=6)
root = Path('.')

for p in sorted((root/'src/content/Events').glob('*.md')):
    parts = p.name.split('-')
    if len(parts) < 3:
        continue
    d = date(int(parts[0]), int(parts[1]), int(parts[2]))
    if d <= cutoff:
        print(p)
PY
```

## Extracting data (repeatable commands)
- Download iCal and show relevant fields:
  - `curl -L -s https://www.meetup.com/grwebdev/events/ical/ | grep -E "^BEGIN:VEVENT|^DTSTART|^SUMMARY|^URL"`
- The fields you need:
  - `DTSTART` -> event date (YYYYMMDD). Convert to `YYYY-MM-DD`.
  - `SUMMARY` -> event title (map to site name).
  - `URL;VALUE=URI` -> Meetup event URL to use in the entry.

## Mapping titles to site names
- Meetup `SUMMARY` examples:
  - `Friday Morning Code + Commiserate` -> `Code + Commiserate`
  - `Coffee with Creators @ The Factory` -> `Coffee with Creators`
- Additional examples:
  - `GRWebDev Powered by LaFleur presents Emily Lynn: What is User Experience (UX)?` -> `GRWebDev Powered by LaFleur presents Emily Lynn: What is User Experience (UX)?`
  - `Django Girls+ Free Programming Workshop` -> `Django Girls+ Free Programming Workshop`
- Use the existing entries in `src/content/Events/` to match naming conventions.

## Entry format (copy/paste)
Create a new file in `src/content/Events/`:

```
---
name: "Code + Commiserate"
images: {
  light: { src: "/event-flyers/2026-04-24-code-commiserate-light.jpg", alt: "Code + Commiserate" },
  dark: { src: "/event-flyers/2026-04-24-code-commiserate-dark.jpg", alt: "Code + Commiserate" },
  colorfull: { src: "/event-flyers/2026-04-24-code-commiserate-colorfull.jpg", alt: "Code + Commiserate" }
}
url: "https://www.meetup.com/grwebdev/events/sqcjvtyjcgbgc/"
date: 2026-04-24
---
```

## Flyer images
- Place images in `public/event-flyers/`.
- Filename should match the event date + slug used in the markdown.
- Do **not** use the image URL found in the iCal feed or event-page HTML as the final flyer asset.
- Use Meetup's generated flyer canvases from the event page. The share modal renders three variants:
  - canvas index `0` -> `-light`
  - canvas index `1` -> `-dark`
  - canvas index `2` -> `-colorfull`
- Preferred repeatable method: export the three canvases with Playwright instead of clicking around manually.
- Example names:
  - `2026-05-21-coffee-with-creators-light.jpg`
  - `2026-05-21-coffee-with-creators-dark.jpg`
  - `2026-05-21-coffee-with-creators-colorfull.jpg`
- In the event markdown entry:
  - Set `images.light.src`, `images.dark.src`, and `images.colorfull.src` to those three files.

## Repeatable comparison script
Use this instead of comparing dates only:

```bash
python3 - <<'PY'
import re
from pathlib import Path
from urllib.request import urlopen

ical = urlopen('https://www.meetup.com/grwebdev/events/ical/').read().decode('utf-8', errors='replace')

feed = {}
for block in ical.split('BEGIN:VEVENT')[1:]:
    block = block.split('END:VEVENT')[0]
    m_dt = re.search(r'DTSTART(?:;TZID=[^:]+)?:([0-9T]+)', block)
    m_summary = re.search(r'SUMMARY:(.+)', block)
    m_url = re.search(r'URL;VALUE=URI:(.+)', block)
    if not (m_dt and m_url):
        continue
    dt = m_dt.group(1)
    date = f"{dt[:4]}-{dt[4:6]}-{dt[6:8]}"
    feed.setdefault(date, []).append({
        "date": date,
        "summary": m_summary.group(1).strip() if m_summary else "",
        "url": m_url.group(1).strip(),
    })

local = {}
for p in Path('src/content/Events').glob('*.md'):
    text = p.read_text()
    m_url = re.search(r'^url:\s*"([^"]+)"', text, re.M)
    date = '-'.join(p.name.split('-')[:3])
    local.setdefault(date, []).append({
        "file": str(p),
        "url": m_url.group(1) if m_url else None,
    })

missing = []
stale = []
for date, feed_events in sorted(feed.items()):
    local_urls = {item["url"] for item in local.get(date, [])}
    feed_urls = {item["url"] for item in feed_events}
    for event in feed_events:
        if event["url"] not in local_urls:
            missing.append(event)
    for item in local.get(date, []):
        if item["url"] not in feed_urls:
            stale.append({"date": date, **item, "feed_urls": sorted(feed_urls)})

print("Missing events:")
for item in missing:
    print(item)

print("\\nStale local URLs:")
for item in stale:
    print(item)
PY
```

## Repeatable flyer export script
This exports the exact three flyer variants from the Meetup event page into `public/event-flyers/`.

```bash
TMPDIR="$(mktemp -d)"
cd "$TMPDIR"
npm init -y >/dev/null
npm install playwright >/dev/null
npx playwright install chromium >/dev/null

node - <<'JS'
const fs = require('fs');
const { chromium } = require('playwright');

const eventUrl = 'https://www.meetup.com/grwebdev/events/313704098/';
const outputBase = '/ABS/PATH/TO/REPO/public/event-flyers/2026-03-23-what-is-user-experience';
const variantNames = ['light', 'dark', 'colorfull'];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1800 } });

  await page.goto(eventUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  await page.getByRole('button', { name: 'Share event flyer' }).first().click();
  await page.waitForFunction(
    () => document.querySelectorAll('canvas[data-flyer-canvas]').length === 3,
    { timeout: 30000 }
  );
  await page.waitForTimeout(4000);

  const dataUrls = await page
    .locator('canvas[data-flyer-canvas]')
    .evaluateAll(nodes => nodes.map((n) => n.toDataURL('image/jpeg', 0.9)));

  dataUrls.forEach((url, index) => {
    const base64 = url.replace(/^data:image\/jpeg;base64,/, '');
    fs.writeFileSync(`${outputBase}-${variantNames[index]}.jpg`, Buffer.from(base64, 'base64'));
  });

  await browser.close();
})();
JS
```

## Optional: quick comparison script (python3)
```
python3 - <<'PY'
import re
from pathlib import Path
from urllib.request import urlopen

ical = urlopen('https://www.meetup.com/grwebdev/events/ical/').read().decode('utf-8', errors='replace')

blocks = ical.split('BEGIN:VEVENT')

events = []
for b in blocks[1:]:
    b = b.split('END:VEVENT')[0]
    m_dt = re.search(r'DTSTART(?:;TZID=[^:]+)?:([0-9T]+)', b)
    m_url = re.search(r'URL;VALUE=URI:(.+)', b)
    if not (m_dt and m_url):
        continue
    dt = m_dt.group(1)
    date = f"{dt[:4]}-{dt[4:6]}-{dt[6:8]}"
    events.append({"date": date, "url": m_url.group(1).strip()})

events.sort(key=lambda e: e['date'])

root = Path('.')
existing = []
for p in (root/'src/content/Events').glob('*.md'):
    text = p.read_text()
    m_url = re.search(r'^url:\s*"([^"]+)"', text, re.M)
    if m_url:
        existing.append({"date": '-'.join(p.name.split('-')[0:3]), "url": m_url.group(1)})

existing_pairs = {(e["date"], e["url"]) for e in existing}
missing = [e for e in events if (e['date'], e['url']) not in existing_pairs]
print('Missing events:')
for e in missing:
    print(e)
PY
```

## Checklist before committing
- New markdown entry added in `src/content/Events/`.
- New flyer image added in `public/event-flyers/`.
- Event `images.light`, `images.dark`, and `images.colorfull` paths are set.
- The `url` points to the event URL from the iCal feed.
- Existing event URLs for matching dates were checked and updated if stale.
- Same-date events were checked for duplicates by URL, not collapsed into one entry.
- The `date` matches the filename.
