# Certificate Achievement System — Notes

This replaces the earlier `highlight` / free-form achievement version with the
simpler two-control system you asked for. If you're picking this up later,
read this before touching `certificates.json`.

## The mental model

Every certificate has two **independent** booleans:

```js
featured: true | false,       // shows up in the Featured Certificates section on the homepage
viewAchievement: true | false // clicking the card opens the rich Achievement panel
```

All four combinations work:

| featured | viewAchievement | Result |
|---|---|---|
| true | true | In Featured section, click opens Achievement panel |
| true | false | In Featured section, click opens the plain certificate viewer |
| false | true | Only in All Certificates, click opens Achievement panel |
| false | false | Only in All Certificates, click opens the plain certificate viewer |

## Data model

Existing fields (`title`, `issuer`, `year`, `category`, `driveLink`) are
unchanged. Add the two booleans, and — only if `viewAchievement: true` — an
optional `achievement` object:

```js
{
  "title": "HACKTECH FUSION 3.0",
  "issuer": "Bapuji Institute",
  "year": "2025",
  "category": "Hackathon",
  "driveLink": "https://drive.google.com/...",

  "featured": true,
  "viewAchievement": true,

  "achievement": {
    "experience": "A short story about the event — what happened, what you built, what you learned.",
    "offerLetter": "https://drive.google.com/... (optional)",
    "eventPhotos": ["https://drive.google.com/...", "..."],
    "github": "https://github.com/... (optional)",
    "demoVideo": "https://youtube.com/... or a direct .mp4 link (optional)"
  }
}
```

Every field inside `achievement` is optional and independent. A section in
the Achievement panel (My Experience / Proof / Event Moments) only renders
when its data is present — nothing invented, nothing shown empty.

**As of this update, 3 of the 46 certificates have `viewAchievement: true`
with real `achievement` data you filled in** (HACK FOR HIRE 2026, ASTRIX
2026-THE BUILDVERSE, and Two-Day Lean Start-up & MVP Boot Camp). Everything
else still has `viewAchievement: false` and no invented achievement data —
add it yourself to whichever certificates you want the rich view on,
following the shape above.

## What changed in the code

- **`certificate-shared.js`**: added a shared badge-label helper (used by
  all three pages instead of three copies of the same logic), a **quick
  image overlay** component, and a **demo video modal** component. Both are
  built once via JS and reused everywhere — no new markup was added to
  `index.html` or `certificates.html`.
- **`certificate-detail.js`**: rebuilt around the new `achievement` schema.
  Also fixes the old nested-modal bug — the certificate image inside the
  Achievement panel no longer opens a second persistent viewer. It now
  supports **press-and-hold to enlarge** (mouse and touch): hold to see it
  large, release (or hit Escape) and it's gone immediately, back to the
  Achievement panel underneath. Gallery photos use the same overlay but in
  click-to-open / explicit-close mode, since a person browsing a gallery
  needs to look for longer than a hold gesture allows.
- **`script.js`** / **`certificates.js`**: `cert.highlight` → `cert.featured`
  throughout. Card click now branches on `viewAchievement`: opens the
  Achievement panel when true, otherwise opens the plain zoom viewer
  directly (`openModal`) — no achievement UI involved at all in that path.
  The "View Achievement →" hint on cards now only shows when
  `viewAchievement: true`, independent of the Featured badge.
- **`styles.css`**: appended new rules for the quick image overlay and demo
  video modal (search `QUICK IMAGE OVERLAY` / `DEMO VIDEO MODAL`). One
  existing rule (`.achievement-cert-frame`) was adjusted from a fixed
  `height: 100%` to `flex: 1 1 auto` so the new "Press & hold to enlarge"
  hint has room underneath it. No other existing rules were touched — dark
  background, yellow glow, cyan buttons, cards, search/filters/pagination,
  and everything outside the certificate system is untouched.
- **`certificates.json`**: `highlight` → `featured`, added
  `viewAchievement: false` to every entry, removed the old flat
  `description` / `activities` / `skills` / `links` / `gallery` /
  `learnings` / `relatedProject` shape in favor of the `achievement` object
  above (none of the 45 certificates had that data filled in, so nothing
  was lost).

## Demo video embedding

`Watch Demo` never navigates away from the page — it opens a centered modal.
The URL you provide is auto-detected: YouTube and Vimeo links become an
embedded player, a Google Drive file link becomes a Drive preview embed,
and a direct file link (`.mp4`/`.webm`/`.ogg`/`.mov`) plays in a native
`<video>` element.

## Verified

Tested with Playwright/jsdom against the real `certificates.html` and
`index.html` shells (no visual layout tool was available in this
environment, so this was DOM/behavior-level, not pixel-level):

- All four `featured` × `viewAchievement` combinations
- Featured Certificates section filtering (`featured: true` only)
- Search, year filter, category filter, Clear Filters, pagination on All
  Certificates
- Press-and-hold enlarge: opens on press, closes immediately on release,
  achievement panel stays open underneath (no leftover modal)
- Gallery photo click-to-enlarge with explicit close
- Demo video modal open/close, correct embed type for a YouTube URL
- Escape key: closes the quick image overlay first if open, otherwise
  closes the Achievement panel; never closes both at once
- Missing optional achievement fields correctly hide their section (no
  empty "My Experience" / "Proof" / "Event Moments" blocks)

**Not verified:** actual pixel-level appearance on a real phone or desktop
browser, real Google Drive image loading (no network access to Drive in
this environment), and real YouTube/Vimeo embeds actually playing (URL
detection and iframe construction were verified, not live playback).
Recommend a quick manual pass on your phone before considering this done.

---

## Round 2 changes (this update)

You asked for four corrections on top of the above. Summary of what changed
and why — read this if something here doesn't match what you remember.

### 1. Certificate image: hold → click, with a real Close button

The press-and-hold on the certificate itself is gone. Clicking the
certificate now opens the same enlarged overlay as before, but in
**persistent mode**: it has a visible **×** button, stays open until you
close it, and closing it always returns to the Achievement panel — never a
second nested viewer. This reuses the overlay component built last round
(it already supported a "click, stays open, has a close button" mode for
gallery photos — the certificate just switched to using that mode).

### 2. Event photos: slow auto-scrolling strip

`eventPhotos` now render as a continuously, slowly scrolling strip
(CSS animation, not JS-driven) instead of a static grid. The photo set is
duplicated once behind the scenes so the loop is seamless — you won't see
a jump or reset. Speed scales gently with photo count (roughly 6s per
photo, minimum 18s) so 3 photos and 6 photos both feel equally unhurried.

### 3. Photo gallery: press-and-hold to enlarge (separate from the certificate)

Press-and-hold now lives on the **gallery**, not the certificate. Holding
the gallery opens a larger version of the same scrolling strip above the
Achievement panel; the photos keep moving while enlarged. Releasing (or
Escape) closes it immediately, same contract as the old certificate-hold
behavior had. Keyboard users get an Enter/Space equivalent (press down to
open, release to close), since "hold" has no native keyboard action.

### 4. `viewAchievement: true` certificates sort first

- **Featured Certificates** (homepage): among the certificates that are
  `featured: true`, the ones that are also `viewAchievement: true` are
  shown first. `featured` itself is untouched — this only reorders within
  it.
- **All Certificates**: certificates with `viewAchievement: true` sort
  first across the whole page, ahead of `featured` (which is now a
  secondary tiebreaker, same as it was the primary one before). This
  sorting is applied to whatever search/filter has already narrowed the
  list down to, so a search result still puts its own `viewAchievement`
  matches first — and it happens before pagination slices the list, so
  page counts, totals, and "no duplicates/no missing" all still hold.

### 7b. Bold opening line in the experience text

`achievement.experience` now supports **one** lightweight convention:
wrap a phrase in `**double asterisks**` and it renders bold, in the
portfolio's yellow accent color, everything else stays normal weight. No
new JSON field was added — the highlight is still just part of the
`experience` string, written the way you'd write it in Markdown. Applied
this to `HACK FOR HIRE 2026`'s experience text as
`**1st Prize — Hack for Hire 2026**` followed by your existing story,
unchanged. The whole paragraph is now justified (`text-align: justify`)
with `hyphens: auto` for cleaner wrapping, and slightly taller line-height
for readability — same on desktop and mobile.

### Verified (round 2)

Re-ran the jsdom test harness against the updated code (40 checks, DOM/
behavior-level, same caveats as round 1 about no real browser being
available):

- Clicking the certificate opens a closable overlay with a visible × button;
  pressing/holding it alone does nothing now
- Closing the certificate overlay always leaves the Achievement panel open,
  never a stray second viewer
- Gallery renders a doubled, aria-hidden-duplicated photo set with an
  animation-duration CSS variable set from photo count
- Press-and-hold (pointer and keyboard) opens/closes the gallery overlay;
  Escape closes only the gallery overlay, not the Achievement panel behind it
- `viewAchievement: true` certificates sort first on both the homepage
  Featured section and the All Certificates page, including within active
  search results
- Paginating through every page of All Certificates hits every certificate
  exactly once — no duplicates, none missing, page count unchanged by the
  new sort
- The `**bold**` phrase renders as `<strong>`, the rest of the experience
  text renders normally

**Still not verified:** live rendering of the scroll animation's speed and
smoothness, and real Google Drive images in the gallery/overlay — a
manual check on your phone and desktop is still worth doing before calling
this done.

