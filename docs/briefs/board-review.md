# Board review brief (one agent per page group)

Used in round 10 to review and fix each page group against its boards. Fill the three placeholders (name and routes, the group's files, the group key as in `lib/screens/<key>.ts`) and hand it to one agent per group; run two at a time. The orchestrator commits each group when its agent reports, then fixes the reported shared needs.

Groups: g1-shell, g2-results, g3-unit, g4-places, g5-forms, g6-alliance, g7-admin, g8-content, g9-room (files per group: `docs/BUILD-CONTRACTS.md` ownership table and `docs/route-map.md`).

---

You review and fix one page group of the SMQ Real Estate clickable prototype (Next.js 16 static export, Arabic RTL, Tailwind v4 tokens) against its design boards: <group name and routes>.

Read docs/BUILD-CONTRACTS.md first (ownership, stack facts, verification steps).

YOUR FILES (edit only these): <the group's app routes and components/pages/gN>, and lib/screens/<group key, e.g. g7-admin>.ts. Everything else belongs to the orchestrator: components/ui, components/admin, components/alliance, components/map, components/presenter, data/, lib/, styles/, app/layout.tsx, app/globals.css, scripts/, docs/ (except your scratch folder), and other groups' files. Never edit them. When a fix needs one of them, do not build a local duplicate: report the exact change under "shared needs". Another agent works on another group in the same tree at the same time: never run git commands that change state, never format or touch files outside your list. A shared dev server runs at http://localhost:3000 (watchdog-managed): never start another one and never run `next build`.

SHARED OPTIONS THAT ALREADY EXIST (use them; never rebuild them locally):
- components/ui Header: waText (prefilled WhatsApp text on every WhatsApp link of the bar and menu), menu={false} (no phone menu button), showEn, active, switchHref. Menu sheet rows are the board's 67px.
- components/ui Skeleton.Card grid (Results-Loading-D card with the hexagon badge placeholder); CompareToggle label; Breadcrumb links are gold text with muted slashes and the current page in bold ink.
- components/alliance DoorCard size="l" (hub door with the CTA arrow, fills its grid row); DistrictMultiSelect phone="inline" and initialQuery.
- components/admin AdminShell / PageHeader inlineActions; AdminShell defaults to the shared bell and live nav counters (components/admin/live.ts).
- data: settings.reservationDays, marketer.lastVisitAt, allianceSettings.options.districtsCount = districts.length; SEO templates use the board's variable names.

KNOWN, INTENTIONAL DIFFERENCES (never "fix" these):
- Numbers are computed from the fixtures in /data (counts, ranges, per-m², ranking words like «أقل» vs «ثاني أقل», «N وحدات» words); never type a board number into JSX. The ten real units in design/README.md must match exactly (code, price, area, beds, baths, floor, building, project).
- «[للتأكيد]» / «[مسودة إجابة]» render through <Mark /> as a gold-outlined chip without brackets.
- Type sizes and 60° cuts snap to the tokens; hexagon outlines are real rings.
- Image slots show the neutral placeholder drawing with «صورة تعبيرية» and the slot-id line until images are generated; never report or fix missing photos.
- Designer annotations on boards are not product UI (grey notes, «ملاحظات», state captions like «(hover)», logo-usage rules, «قواعد …» notes, provider notes, text describing the board itself).
- The EN language switch shows only on /, /units and /units/[code].
- Office and project maps are keyless Google embeds with the schematic drawing as placeholder; the results map and pin pickers are schematic SVGs.
- StageBoard has no drag between columns; there are no owner listings in the fixtures.

STEPS
1. Fresh shots of your group (shared fixes landed after the stored shots): `npx tsx scripts/shots/shots.ts --group=<group key, e.g. g7-admin>`. Comparison sheets (board on the right, page on the left, sliced; desktop at half size): `npx tsx scripts/shots/pair.ts --group=<group key, e.g. g7-admin> --out=docs/shots/tmp/<group key, e.g. g7-admin>/before`. When a board is registered with several states (same board name, different routes), the stored page shot is the last state; shoot the others with `npx tsx scripts/shots/shot.ts "http://localhost:3000<route>" <width> docs/shots/tmp/<group key, e.g. g7-admin>/<name>.png` and crop the board with `npx tsx scripts/shots/pair.ts --crop=docs/shots/boards/<Board>.png --y=<top> --h=<height> --to=docs/shots/tmp/<group key, e.g. g7-admin>/<name>.png` to compare. Zoom any detail the same way.
2. Copy report: `npx tsx scripts/qa/copy.ts --group=<group key, e.g. g7-admin> --out=docs/shots/tmp/<group key, e.g. g7-admin>/copy-before.json`. Triage every «missing» string (real copy gap, annotation, or intentional) and every «numeric» one (a dropped word inside a computed line, e.g. a spec line that loses «· واجهة شمالية», is a real gap).
3. Compare every screen top to bottom: copy (verbatim: punctuation, «·», arrows «←», word order), presence and order of sections and elements, layout (columns, widths, alignment, what sits beside what, sticky bars), shapes (which corner carries the cut, hexagon vs square, borders), colours (ink / gold / sand / cream / white fills; gold carries ink text only), type (weight and size beyond token snapping), spacing that is clearly off, icons, states (active tab/chip/nav item, selected rows, disabled, errors), interactive affordances. Use docs/boards/<Board>.txt for exact copy and key styles and design/preview/<Board>.html for exact values and SVG paths.
4. Fix every confirmed page-local difference, most visible first. Tokens and Tailwind theme classes only (no hex, no shadows, no radius; cuts via cut-*; hexagons via hex-flat / hex-point). Keep numbers computed from /data.
5. Verify: `npx tsc --noEmit` (clean for your files; report others' errors without fixing them); `npx tsx scripts/qa/smoke.ts --group=<group key, e.g. g7-admin>` clean; `npx tsx scripts/qa/copy.ts --group=<group key, e.g. g7-admin> --out=docs/shots/tmp/<group key, e.g. g7-admin>/copy-after.json` (what you fixed is no longer missing, nothing new is missing); re-shoot `npx tsx scripts/shots/shots.ts --group=<group key, e.g. g7-admin>` and read `npx tsx scripts/shots/pair.ts --group=<group key, e.g. g7-admin> --out=docs/shots/tmp/<group key, e.g. g7-admin>/after` to confirm each fix at both widths and catch regressions. A second round on what still differs, then stop.

WORK ECONOMICALLY: read each comparison sheet once and take notes as you go, crop only to settle a specific detail, batch your edits per file, and do not re-read files you just edited. Two rounds is the budget.

FINAL REPORT (your last message, plain text, under 60 lines): files changed; differences fixed (board · area · what changed); differences left with the reason (intentional, needs a shared change, too costly); shared needs, each with file and the exact change; check results (tsc, smoke, copy before → after missing counts).
