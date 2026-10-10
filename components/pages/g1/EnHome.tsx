// /en · EN-Home-M: the English home. app/en/layout.tsx sets LTR, lang=en and the Latin face; every cut token mirrors
// through the [dir=ltr] variables. Copy comes from the EN fields of the Home page content (the page editor's EN tab,
// verbatim EN-Home-M); every number comes from data/selectors.ts.
import Link from "next/link";
import { Button, Footer, Header, HexNumber, IllustrativeLabel, ImageSlot, Mark, MarkedText, Price, PHONE_EN, PHONE_TEL, WA_URL } from "@/components/ui";
import { EnFinder } from "@/components/pages/g1/EnFinder";
import { homePage } from "@/data/content";
import { districtBySlug } from "@/data/districts";
import { projectById } from "@/data/projects";
import { BUILDINGS } from "@/data/units";
import { availableUnits, fromPrice, guideTables, listedUnits, projectStats } from "@/data/selectors";
import { fmtNum } from "@/lib/format";

/** The EN text of a Home page content field (EN-Home-M copy). */
function en(section: string, key: string): string {
  return homePage.sections.find((s) => s.key === section)?.fields.find((f) => f.key === key)?.en ?? "";
}

/** «Buying · We filter …» → title and line */
function splitService(text: string): [string, string] {
  const i = text.indexOf(" · ");
  return i < 0 ? [text, ""] : [text.slice(0, i), text.slice(i + 3)];
}

/** 459,000 → «459», 1,650,000 → «1.65» */
const thousands = (n: number) => fmtNum(Math.round(n / 1000));
const millions = (n: number) => String(Number((n / 1_000_000).toFixed(2)));
function rangeEn(from: number, to: number): string {
  return to >= 1_000_000 ? `${millions(from)} to ${millions(to)}M` : `${thousands(from)} to ${thousands(to)}k`;
}

/** «a», «a and b», «a, b and c» */
function listEn(items: string[]): string {
  return items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}` : (items[0] ?? "");
}

const SERVICE_HREFS = ["/services#buy", "/services#sell", "/services#invest", "/services", "/add"];

export function EnHome() {
  const project = projectById("rwd-01")!;
  const stats = projectStats(project.id);
  const district = districtBySlug(project.districtSlug);
  const listed = listedUnits().filter((u) => u.projectId === project.id);
  const aptBeds = [...new Set(listed.filter((u) => u.type === "apartment").map((u) => u.beds))].sort((a, b) => a - b);
  const kinds = [...aptBeds.map((b) => `${b}BR`), ...(listed.some((u) => u.type === "roof-villa") ? ["roof villas"] : [])];
  const delivery = project.milestones.find((m) => m.label === "التسليم")?.date.match(/(\d{4})\/Q([1-4])/);
  const buildings = listEn(project.buildings.map((b) => BUILDINGS[b.code].nameEn));
  const topBeds = aptBeds[aptBeds.length - 1];
  const topBedsFrom = fromPrice(availableUnits().filter((u) => u.projectId === project.id && u.type === "apartment" && u.beds === topBeds));
  const summary = [
    `${stats.listed} models`,
    [`${stats.available} available`, stats.reserved ? `${stats.reserved} reserved` : "", `${stats.sold} sold`].filter(Boolean).join(", "),
    listEn(kinds),
  ].join(" · ");

  const guide = guideTables(project.districtSlug);
  const guideRows = [
    ...guide.byBeds
      .filter((r) => r.units.some((u) => u.type === "apartment"))
      .map((r) => ({
        label: `${r.beds}-bedroom apartment${r.availableCount === 1 ? "" : "s"}`,
        value: r.from == null ? "—" : r.single || r.from === r.to ? `${fmtNum(r.from)} · one model` : `${rangeEn(r.from, r.to ?? r.from)} · ${r.availableCount} of ${r.listedCount}`,
      })),
    ...guide.byType
      .filter((r) => r.type === "roof-villa")
      .map((r) => ({
        label: r.availableCount === 1 ? "Roof villa" : "Roof villas",
        value: r.from == null ? "—" : r.from === r.to ? `${fmtNum(r.from)} · one model` : `${rangeEn(r.from, r.to ?? r.from)} · ${r.availableCount} of ${r.listedCount}`,
      })),
  ];

  const services = ["s1", "s2", "s3", "s4", "s5"].map((k, i) => {
    const [title, line] = splitService(en("services", k));
    return { n: `0${i + 1}`, title, line, href: SERVICE_HREFS[i], owner: i === 4 };
  });

  return (
    <>
      <Header variant="en" showEn />
      <main>
        {/* hero */}
        <section className="relative bg-ink text-paper cut-xl">
          <div aria-hidden className="absolute inset-0 opacity-25">
            <ImageSlot slotId="IMG-HERO-BRAND" tier="generated" label={false} showId={false} lang="en" as="div" className="h-full" />
          </div>
          <IllustrativeLabel lang="en" className="absolute top-3 end-3 z-[1]" />
          <div className="container-smq relative pt-8 pb-10 md:py-16 flex flex-col">
            <span className="text-[12px] font-bold text-gold">{en("hero", "topline")}</span>
            <h1 className="m-0 mt-2.5 text-[30px] md:text-h1 font-extrabold leading-[1.15]">{en("hero", "title")}</h1>
            <p className="m-0 mt-3 text-body text-on-ink-muted leading-relaxed">{en("hero", "paragraph")}</p>
            <Button href="#budget" size="m" full className="mt-5 md:w-auto md:self-start">
              {en("hero", "primaryText")}
            </Button>
          </div>
        </section>

        <EnFinder />

        {/* current project */}
        <section className="container-smq pt-3 pb-8 flex flex-col gap-3.5">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="m-0 text-h2 font-extrabold">{en("project", "title")}</h2>
            <Link href="/projects" className="text-[12px] font-bold text-gold-text no-underline hover:underline">
              {en("project", "link")}
            </Link>
          </div>
          <article className="border-interactive">
            <Link href={`/projects/${project.slug}`} className="block" aria-label={project.nameEn}>
              <ImageSlot slotId="IMG-PRJ-ROWDAH-EXT" tier="generated" cut="xl" showId={false} lang="en" as="div" className="h-[170px]">
                <span className="absolute top-3 start-3 z-[1] inline-flex flex-col items-center justify-center size-13 hex-flat bg-gold text-ink text-caption font-extrabold leading-tight text-center">
                  <span className="tnum">{stats.available}</span>
                  <span>left</span>
                </span>
              </ImageSlot>
            </Link>
            <div className="p-4 flex flex-col gap-1">
              <span className="text-caption font-bold text-gold-text">
                {district?.en ?? ""} · {buildings} buildings
              </span>
              <h3 className="m-0 text-h2 font-extrabold leading-tight">
                <Link href={`/projects/${project.slug}`} className="text-ink no-underline hover:underline">
                  {project.nameEn}
                </Link>
              </h3>
              <p className="m-0 text-[12px] text-muted leading-relaxed">
                {summary}
                {delivery && (
                  <>
                    {" · "}delivery Q{delivery[2]} {delivery[1]}
                    {project.deliveryLabel.tbc && (
                      <>
                        {" "}
                        <Mark>[TBC]</Mark>
                      </>
                    )}
                  </>
                )}
              </p>
            </div>
            <dl className="m-0 grid grid-cols-3 border-t border-line divide-x divide-line">
              {[
                { label: "From", value: stats.fromPrice },
                { label: `${topBeds}BR`, value: topBedsFrom },
                { label: "Per m² from", value: stats.ppm?.min ?? null },
              ].map((c) => (
                <div key={c.label} className="flex flex-col gap-0.5 px-3.5 py-3">
                  <dt className="text-[10px] text-muted">{c.label}</dt>
                  <dd className="m-0 text-[15px] font-extrabold">{c.value == null ? "—" : <Price value={c.value} sign={false} />}</dd>
                </div>
              ))}
            </dl>
          </article>
        </section>

        {/* price guide */}
        <section className="container-smq">
          <div className="bg-ink text-paper cut-l px-4.5 pt-5 pb-6">
            <span className="text-[12px] font-bold text-gold">{en("guide", "eyebrow")}</span>
            <dl className="m-0 mt-1.5 flex flex-col divide-y divide-ink-2">
              {guideRows.map((r) => (
                <div key={r.label} className="flex items-center justify-between gap-3 py-3.5 text-label font-normal">
                  <dt>{r.label}</dt>
                  <dd className="m-0 font-extrabold tnum text-end">{r.value}</dd>
                </div>
              ))}
            </dl>
            <p className="m-0 mt-2 text-caption font-normal text-on-ink-muted leading-relaxed">{en("guide", "paragraph")}</p>
            <Link href="/guide" className="inline-block mt-3 text-label font-extrabold text-gold no-underline hover:underline">
              {en("guide", "link")}
            </Link>
          </div>
        </section>

        {/* services */}
        <section className="container-smq pt-9">
          <h2 className="m-0 pb-3.5 text-h2 font-extrabold border-b-[1.5px] border-ink">{en("services", "title")}</h2>
          <div className="flex flex-col">
            {services.map((s) => (
              <Link key={s.n} href={s.href} className="flex items-center gap-4 py-3.5 border-b border-line no-underline text-ink hover:bg-sand motion-hover transition-colors">
                <HexNumber size={40} tone={s.owner ? "ink" : "gold"}>
                  {s.n}
                </HexNumber>
                <span className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[15px] font-bold">{s.title}</span>
                  <span className="text-[12px] text-muted leading-snug">
                    <MarkedText text={s.line} />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* talk to us */}
        <section className="container-smq py-8">
          <div className="border-interactive px-4.5 py-5 flex flex-col gap-3">
            <h2 className="m-0 text-h3 font-extrabold">{en("contact", "title")}</h2>
            <p className="m-0 text-label font-normal text-ink-2 leading-relaxed">{en("contact", "help")}</p>
            <Button href={WA_URL} variant="whatsapp" size="m" full className="mt-1">
              {en("hero", "secondaryText")}
            </Button>
            <a href={`tel:${PHONE_TEL}`} dir="ltr" className="self-center inline-flex items-center min-h-11 px-2 text-[14px] font-bold text-gold-text no-underline tnum hover:underline">
              {PHONE_EN}
            </a>
          </div>
        </section>
      </main>
      <Footer variant="en" />
    </>
  );
}
