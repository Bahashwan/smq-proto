# Client brief (verbatim, 2026-10-09)

The original brief for the prototype, kept here so a fresh Claude Code session has the full spec. Secrets removed: `AI_GATEWAY_API_KEY` lives in `.env.local` (git-ignored), see `docs/PROGRESS.md`.

---

Build a clickable prototype of the new SMQ Real Estate website (إس إم كيو العقارية, Jeddah) to present to the client. It is a front end only: it must look finished and feel alive, but nothing is real behind it. No database, no auth, no API routes, no emails, no file storage. Appearance and flow matter more than anything else here.

AI_GATEWAY_API_KEY: (set in `.env.local`, not committed)

## Source
The design is in ./design (round 3):
- design/README.md: read it first. Rules, the canonical inventory table, the page list by section, build notes
- design/preview/*.html: 130 boards as standalone pages, styles inline. They are the spec for layout, spacing, colour and Arabic copy. Use the copy verbatim. "-M" is 390px and "-D" is 1440px: two points of one responsive layout
- design/preview/Tokens.html, Components.html, Components2.html, Components3.html, HeaderFooter.html, Icons.html, Shots.html: tokens, component states, logo and icon rules, the image shot list
- design/brand/: logo files

Read every board before planning. Rebuild as components driven by tokens. Don't paste the inline-styled markup.

Not screens: A-Hero and A-Card (rejected direction), B-Hero and B-Card, and the Tokens, Components, HeaderFooter, Shots and Icons sheets. They are references. The OG boards become link preview images and Icons becomes the favicon set.

Many boards contain designer annotations: explanations of rules, labels such as "الحالة 1", notes about the design itself, several states stacked on one board. Those are not product UI. Build the product screen and leave the annotation out. When one board stacks several states, they are states of one screen.

## Scope
In: every public, member, marketer and admin screen in the boards, navigable, with believable sample data and working front-end interactions.
Out: anything that needs a server. Forms validate, step forward and land on their designed success screens, and nothing is sent. Admin login accepts anything. Excel import shows the designed mapping and preview with canned data. "Send on WhatsApp" in admin opens the designed state without sending.

Interactions that must work, because they are what the client will try:
- Budget finder, filters, sorting and compare, over the real ten units, with state in the URL
- The empty state working out which filter to loosen, and the alliance request form on it
- Unit gallery, floor plan viewer, and the map view on Google Maps styled to the brand (see Maps)
- All multi-step forms: أضف عقارك (with the income-building variant when the type is a building), alliance application, marketer application
- Admin: sidebar and tabs, drawers and dialogs, status changes held in memory, toasts, the radar's district drawer, selecting an offer and creating a referral record, and the page editor updating its live preview as I type
- Real wa.me links with the designed prefilled messages on public pages

## Stack
Next.js App Router, TypeScript, Tailwind with the --smq-* tokens as CSS variables, deployable to Vercel as static pages. All data in typed fixture files under /data. Arabic RTL is the default. English exists only for the three designed EN boards (home, result card, unit); hide the EN switch on pages that have no English.

## Routes and states
Start by giving me a table mapping every board to a route and a state, and wait for my OK. Use the paths the boards mention (/add, /alliance/apply, /marketers, /units/rz-a, /r/[name]) and keep admin under /admin. Member and marketer pages open from tokenised links with no login; on desktop, show the 390-only boards in a centred phone-width column.

Add a presenter layer, hidden from normal visitors (opens with a key press and with ?demo=1):
- A screen map at /demo: every screen grouped by the README's sections
- State switches for states that can't be reached by clicking: alliance with 12 members or 0 (launch day), unit image tier, unit available, reserved or sold, application status (three states), member request open, answered or expired, WhatsApp Business connected or manual mode, loading skeletons
- A switch to show or hide the [للتأكيد] markers. Render them as a small gold-outlined chip instead of raw brackets. Default: shown
- Three guided tours with next and previous: the buyer (budget, results, unit, compare, WhatsApp), the owner (أضف عقارك for an income building through to the admin approval), and the alliance request: a visitor finds nothing in الفيصلية and sends a request, the member office answers from its link, the admin picks the offer and creates the referral record, the member sees the record and its ledger

## Data
- The inventory table in the README is the only real data. Compute every count, range and price per m² from the fixtures; never hardcode a number from a board
- Everything else (analytics, visitors, leads, alliance members, requests, referrals, marketers) is illustrative. Take it from the boards and make it consistent across screens
- Known inconsistency to fix: REQ-2026-0412 (الفيصلية) is answered by مكتب ط in the admin boards but by مكتب أ on the member pages and on REF-2026-0117. Use مكتب ط for that whole story, since it is the office that covers الفيصلية
- Office names stay as the placeholders in the design (مكتب أ، مكتب ب)

## Looking finished
- Follow the Tokens sheet exactly: zero radius, no gradients, no shadows, 60 degree cuts and hexagons through clip-path, gold carries ink text only, errors in gold, status by shape and word
- Riyal sign as an inline SVG component at 0.75em. Western digits, tabular numerals
- Motion from the Tokens sheet (120ms hover, 200ms sheets, skeleton pulse), plus restrained touches in the same spirit: the honeycomb filling cell by cell on the alliance hero, the result count changing as the budget moves. Respect reduced motion
- Link previews: Satori handles Arabic poorly, so render the three OG boards as routes and screenshot them to PNG with Playwright. Favicon and app icons as specified on the Icons board
- After each section, screenshot your pages at 390 and 1440 next to the matching preview boards and fix the differences before showing me

## Maps (Google Maps, in brand colours)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set. Use @vis.gl/react-google-maps. Load the API with language ar and region SA (en on the English routes). Load a map only when it scrolls into view or its tab is opened.

Where real maps go: the results map view (Results-Map-M and -D), the project location, the office map on Contact and in the Home contact block, the pin pickers in أضف عقارك step 1 and the alliance application step 1, and the pin fields in the admin project editor and site settings. The alliance coverage grid and the admin radar are not maps: they stay the schematic hexagon grids the boards draw.

Style: light and desaturated, built only from the tokens, in one file (map-style.json) so the palette has a single source:
- Land #F8F7F4, built-up areas #F3F1EB, parks and natural areas #E9E5DB, water #D4CFC4
- Local roads #FFFFFF with no outline, arterial roads #FFFFFF with a #D4CFC4 outline, highways #E9E5DB with a #C9C2B3 outline
- Label text #5E5A52 with a white halo. District and city names #141311
- Hide business points of interest, transit, and road icons
- Nothing on the base map is gold. Gold belongs to our pins only

Google offers two styling routes that can't be combined: a JSON style passed in code, or a Map ID with a style published in the Cloud Console (AdvancedMarkerElement needs the Map ID). Check the current docs first. For this prototype use the JSON style in code, and draw the pins as custom HTML overlays (an OverlayView), not the deprecated default Marker. Keep the map in one component so that switching to a Map ID later is a small change. If the docs say the in-code route is gone, switch to a Map ID, give me map-style.json in the format the Cloud Console imports, and list the console steps for me.

Pins and chrome:
- Pins are the point-top hexagon from the Tokens sheet, as on the Results-Map boards: gold with the count of matching available units, white with an ink ring for "من مالك" and "قريباً". The office pin is a gold hexagon with its label chip
- Never show Google's default red pin or its default info window. A tapped pin opens the designed card: a bottom sheet on phone, the side card on desktop
- Turn off the default controls and build the square zoom and locate buttons from the board. Keep Google's logo and attribution visible, which their terms require
- On pages that scroll, use cooperative gestures so the map doesn't trap the page. The full results map view can take gestures directly
- The office map opens at street level, not city level. The results map fits its pins

Locations:
- Office: 21.5604526, 39.1811231 (taken from the directions link on their Linktree; I will verify)
- I don't have the exact location of جاردن الروضة. Put its pin at the centre of حي الروضة and show «الموقع تقريبي [للتأكيد]» beside the map. The sample pins (the owner unit in الصفا, the coming project in أبحر الشمالية) go at their district centres
- Pin pickers: the pin drags and the coordinates update. "ألصق رابطاً" reads coordinates from a full Google Maps link. Short links can't be resolved without a server, so for those show the designed preview with a canned location

If the key is missing or the map fails to load, fall back to the schematic SVG map from the boards, so a demo never shows an empty grey box. Show me a screenshot of the Contact map early so I can judge the palette, especially the grey sea.

## Images (Vercel AI Gateway)
AI_GATEWAY_API_KEY is set. Generate with a script, never at request time, into /public.

Model: bfl/flux-3-image, called with generateImage and aspectRatio. It takes up to 10 reference images and needs AI SDK 7 or later. It is new, so read https://vercel.com/docs/ai-gateway/modalities/image-generation/ai-sdk and https://vercel.com/changelog/flux-3-image-now-available-on-ai-gateway for the exact option names before coding. Fallback if the look is wrong: google/gemini-nano-banana-2.1 through generateText, images in result.files.

- Transcribe design/preview/Shots.html into a manifest: 31 generated slots with id, pages, aspect ratios, subject, mood, exclusions. Prepend the shared look ("ضوء جدة الصباحي"), palette and global exclusions to every prompt, in English
- First render four anchors and show me: IMG-PRJ-ROWDAH-EXT, IMG-UNIT-APT-3BR-LIVING, IMG-ED-BALAD-RAWASHEEN, IMG-ED-CORNICHE-DAWN. After I approve, pass the exterior and the interior as reference images for the rest of their groups so the set reads as one shoot
- Then two candidates per slot at the 2048 class, shown to me on one contact sheet page to pick from. Record model, prompt and seed beside each chosen file
- IMG-HERO-BRAND is the only image that may contain the logo: pass design/brand/logo-mark-gold.png as a reference, and if the mark comes out distorted, generate without it and composite the real file in code
- Reject and retry anything with people, text, signage, number plates, a skyline that isn't Jeddah, or warped architecture
- Skip slots already approved unless I pass --force. Print the running cost and stop at $15
- Convert to AVIF and WebP at responsive widths with blur placeholders. Do the desaturated and sold treatments in CSS

## Things the prototype must not fake
- Every generated image that stands for a unit or the project carries the «صورة تعبيرية» label, as designed
- Never generate the founder, people, logos, maps or floor plans. The founder slot shows the typographic card. The floor plan is the schematic SVG from the Unit-Plan board, marked as illustrative
- Don't present a generated image as a real photo. The "real photo" tier uses files from /public/real if I add any, and a neutral placeholder frame otherwise. In the admin Media screen, list generated images as تعبيرية
- About opens in the About-D state. The financing and testimonials blocks from About-Proof-D appear only through the presenter switch, bank names stay as the placeholders, and each sample quote carries a visible «نص تجريبي» tag
- Keep the designed "الأرقام توضيحية" notes on admin and alliance screens
- Add a noindex header and robots rule to the whole deployment

## How to work
Read the design, give me the route table and a short plan, then build in this order: tokens, shell and shared components; the public explorer (home, results with the map view, guide, project, unit, compare, states); the remaining public pages; تعاون معنا, the alliance and its forms; member and marketer pages; admin; the presenter layer and tours; images; link previews and icons. Once the shared components exist, independent sections can be built in parallel. Show me each section running before moving on.

---

## Amendments after the brief

### 2026-10-10 · Maps (final, replaces the Maps section above)

No Google Maps API, no MapLibre, no map library at all. Remove any you added, and remove NEXT_PUBLIC_GOOGLE_MAPS_API_KEY from the env example and the code.

1. Office map (Contact, Home contact block) and project location (Project page): a keyless Google Maps embed in an iframe, with Arabic interface (hl=ar) and English on the /en routes, zoomed to street level.
- Office: 21.5604526, 39.1811231. I will paste Google's own "Embed a map" code for the SMQ office later; until then build the embed URL from the coordinates
- Project: the centre of حي الروضة, with «الموقع تقريبي [للتأكيد]» shown beside the map
- Frame the iframe in the design's map container: zero radius, 1.5px ink border, the cut corner, the label chip outside the iframe. Don't cover or crop Google's logo and controls
- Load the iframe lazily, with the board's schematic drawing as the placeholder, and keep that placeholder if the iframe fails to load
- "افتح الاتجاهات في الخرائط" stays a normal Google Maps link

2. Results map view (Results-Map-M and -D): build the schematic map exactly as the boards draw it, as an interactive SVG: district labels, hexagon pins with counts, pin tap opens the designed card (bottom sheet on phone, side card on desktop), the zoom buttons scale the SVG. Remove the board's note that says the real map comes from the provider.

3. Pin pickers (أضف عقارك step 1, alliance application step 1, admin project editor and site settings): the same schematic SVG with a draggable hexagon pin. "ألصق رابطاً" accepts a Google Maps link and shows the designed preview state.

The alliance coverage grid and the admin radar stay the hexagon grids, as before.

### 2026-10-10 · Process
- "When you do anything push it": commit and push every change to `prototype` as it lands. PR: https://github.com/Brave-WebServices/smq-realestate/pull/1
- Keep `docs/PROGRESS.md` current so work can continue from a local Claude Code session.
