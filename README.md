# SMQ Real Estate · clickable prototype

Front-end-only prototype of the SMQ Real Estate site (إس إم كيو العقارية, Jeddah), built from the 130 design boards in `design/preview` (round 3). Arabic RTL first, English on `/en`, `/en/units` and `/en/units/[code]`. Nothing is sent anywhere: forms validate and land on their designed success screens, admin accepts any login, and every status change lives in memory for the session.

## Run it

```bash
npm install
npm run dev            # http://localhost:3000
```

- `/demo` is the presenter's screen map: every board as a link to its route and state, plus the three guided tours.
- Press `Shift+P` outside a field, or add `?demo=1`, to show the presenter bar (alliance 12 / 0, image tier, unit status, application status, member request, WhatsApp Business mode, skeletons, `[للتأكيد]` chips, About proof, offline banner, empty states). The bar's reset clears the in-memory changes.
- `/demo/components` is the QA sheet of every shared component.

## Build and deploy

```bash
npm run build          # static export to out/ (postbuild strips image working files)
npm run serve          # serve out/ on :3000
```

Deploy `out/` to Vercel or any static host. Every page carries `noindex`; `vercel.json` adds `X-Robots-Tag` and `robots.txt` disallows everything.

## Other scripts

| Script | What it does |
|---|---|
| `npm run typecheck` · `npm run lint` | TypeScript and ESLint |
| `npm run shots` | Page screenshots per registered board, `docs/shots/<Board>.png` (needs the dev server) |
| `npm run shots:boards` | Board renders beside them, `docs/shots/boards/<Board>.png` |
| `npm run coverage` | Boards without a screen entry, and registered routes missing from `out/` |
| `npm run og` | Link-preview images from the `/og/*` routes into `public/og/` |
| `npm run icons` | Favicon and app icons from `design/brand/logo-mark-gold.png` |
| `npm run images` · `images:convert` | Illustrative photos through the Vercel AI Gateway (needs `AI_GATEWAY_API_KEY` in `.env.local`), then AVIF/WebP conversion |

## Where things are

- `docs/PROGRESS.md`: status, decisions and the next action (start here when resuming).
- `docs/route-map.md`: every board mapped to a route and a state; presenter parameters; tour steps.
- `docs/BRIEF.md`: the client's brief and amendments. `CLAUDE.md`: rules that must not drift.
- `data/`: typed fixtures and the selectors that compute every number (only the ten units are real).
- `components/ui`, `components/admin`, `components/alliance`, `components/map`: shared components, each with a README.
- `app/`: routes. `lib/screens/`: the board-to-route registry behind `/demo` and the screenshot scripts.
