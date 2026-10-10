# SMQ Real Estate prototype

Front-end-only clickable prototype of the SMQ Real Estate site (Jeddah), Arabic RTL first. No server, no database, no auth, no API routes; nothing is sent anywhere.

Read first, in order: `docs/BRIEF.md` (the client's spec + amendments) → `docs/route-map.md` (board → route + state, plan) → `docs/PROGRESS.md` (status, decisions, next action) → `design/README.md` (design rules, the only real data).

Rules that must not drift
- Design tokens from `design/preview/Tokens.html` only: zero radius, no gradients, no shadows, 60° cuts and hexagons via clip-path, gold carries ink text only, errors in gold, status by shape and word.
- Copy comes verbatim from the boards (`design/preview/*.html`); designer annotations are not product UI. Rebuild as token-driven components; never paste the inline-styled markup.
- The ten units in `design/README.md` are the only real numbers; compute everything else from `/data` fixtures. Illustrative data stays consistent across screens and keeps the «الأرقام توضيحية» notes.
- Riyal sign is an inline SVG at 0.75em; Western digits; tabular numerals.
- Generated images always carry «صورة تعبيرية»; never generate people, the founder, logos, maps or floor plans.
- Maps: no map library, no Maps API key. Keyless Google Maps embed iframes for the office and the project; interactive schematic SVGs for the results map and pin pickers.
- `noindex` on everything.

Process
- Commit and push every change to the `prototype` branch as it lands (PR #1). Update `docs/PROGRESS.md` in the same commit.
- After each section: screenshot at 390 and 1440 next to the matching boards, fix differences, then show the client.
- Secrets live in `.env.local` only (`AI_GATEWAY_API_KEY`); never commit them.
