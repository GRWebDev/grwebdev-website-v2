# Update Events (GRWebDev)

Use this guide to add new event entries to the site from Meetup without extra searching.

## Source of truth
- Meetup iCal feed (all upcoming events):
  - https://www.meetup.com/grwebdev/events/ical/

## Quick workflow
1. Fetch the iCal feed and extract event dates + URLs.
2. Compare dates to filenames in `src/content/Events/` to find missing events.
3. For each missing event:
   - Create a new markdown entry in `src/content/Events/`.
   - Add a matching flyer image in `public/event-flyers/`.

## How to identify missing events
- Event files are named like: `YYYY-MM-DD-<slug>.md`.
- The date in the filename is the event date.
- If a date exists in the iCal feed but not in `src/content/Events/`, it is missing.

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
- Use the existing entries in `src/content/Events/` to match naming conventions.

## Entry format (copy/paste)
Create a new file in `src/content/Events/`:

```
---
name: "Code + Commiserate"
image: {
  src: "/event-flyers/2026-04-24-code-commiserate.jpg",
  alt: "Code + Commiserate"
}
url: "https://www.meetup.com/grwebdev/events/sqcjvtyjcgbgc/"
date: 2026-04-24
---
```

## Flyer images
- Place images in `public/event-flyers/`.
- Filename should match the event date + slug used in the markdown.
- If Meetup has a new event image:
  - Open the event page URL from iCal and find `highres_*.jpeg` in the HTML.
  - Download it and rename to match the event date/slug.
  - Example download:
    - `curl -L -s -o public/event-flyers/2026-04-24-code-commiserate.jpg https://secure.meetupstatic.com/photos/event/7/8/5/8/highres_518310808.jpeg`
- If you use a standard flyer template instead of Meetup’s image, keep the same naming convention.

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
existing_dates = set()
for p in (root/'src/content/Events').glob('*.md'):
    parts = p.name.split('-')
    if len(parts) >= 3:
        existing_dates.add('-'.join(parts[0:3]))

missing = [e for e in events if e['date'] not in existing_dates]
print('Missing events:')
for e in missing:
    print(e)
PY
```

## Checklist before committing
- New markdown entry added in `src/content/Events/`.
- New flyer image added in `public/event-flyers/`.
- The `url` points to the event URL from the iCal feed.
- The `date` matches the filename.
