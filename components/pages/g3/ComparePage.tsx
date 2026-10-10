"use client";
// /compare · Compare-M / Compare-D (?u=rz-d,ys-d,rz-c: the table with the best-in-row gold marker computed per
// row), Compare-One-M (?u=rz-a: one unit, «يُقارَن عادةً مع» suggestions, the numbers box) and Compare-Empty-M
// (nothing selected). The selection lives in the URL and in the store (mirrored to the device for 7 days).
import { useEffect, useMemo, type ReactNode } from "react";
import Link from "next/link";
import type { Unit } from "@/data/types";
import { unitBySlug, units as allUnits } from "@/data/units";
import { availableUnits, countsByStatus, effectiveUnitStatus, unitPpm } from "@/data/selectors";
import { projectById } from "@/data/projects";
import { districtBySlug } from "@/data/districts";
import { unitDistrictSlug } from "@/data/selectors";
import { useQuery, setQuery, useHasHydrated } from "@/lib/location";
import { bedsLabel, cx, fmtArea, fmtDate, fmtNum, waLink } from "@/lib/format";
import { Container, Footer, Header, ImageSlot, Mark, StatusBadge, useCompare, setCompare, useVisitorCode, COMPARE_MAX, COMPARE_TTL_MS, WhatsAppIcon } from "@/components/ui";
import { usePresenter } from "@/lib/presenter";
import { compareUrl } from "@/lib/url";
import { askObject, deliveryShort, TIER_OF, useUnitOverrides, yesNo } from "./view";
import { HexDot } from "./parts";

const FEMININE_DEF: Record<number, string> = { 2: "الاثنتين", 3: "الثلاث", 4: "الأربع", 5: "الخمس", 6: "الست", 7: "السبع", 8: "الثماني", 9: "التسع", 10: "العشر" };
const VALID = new Set(allUnits.map((u) => u.slug));

function parseSlugs(raw: string | null): string[] {
  if (!raw) return [];
  return Array.from(new Set(raw.split(",").map((s) => s.trim().toLowerCase()))).filter((s) => VALID.has(s)).slice(0, COMPARE_MAX);
}
const same = (a: string[], b: string[]) => a.length === b.length && a.every((s, i) => s === b[i]);
const nameOf = (u: Unit) => (u.type === "roof-villa" ? "فيلا روف" : `نموذج ${u.model}`);
const floorShort = (u: Unit) => (u.floor?.value === "4+roof" ? "4 والسطح" : (u.floor?.value ?? "·"));

export function ComparePage() {
  const q = useQuery();
  const hydrated = useHasHydrated();
  const compare = useCompare();
  const overrides = useUnitOverrides();
  const { state } = usePresenter();
  const tier = TIER_OF[state.tier];
  const raw = q.get("u");
  const fromUrl = useMemo(() => parseSlugs(raw), [raw]);
  const slugs = raw !== null ? fromUrl : compare.slugs;

  // The URL wins: a shared link sets the device's selection; a bare /compare shows (and links) the stored one.
  useEffect(() => {
    if (raw !== null) {
      if (!same(fromUrl, compare.slugs)) setCompare(fromUrl);
    } else if (hydrated && compare.slugs.length) {
      setQuery({ u: compare.slugs.join(",") }, "replace");
    }
  }, [raw, fromUrl, compare.slugs, hydrated]);

  const update = (next: string[]) => {
    setCompare(next);
    setQuery({ u: next.length ? next.join(",") : null }, "replace");
  };
  const remove = (slug: string) => update(slugs.filter((s) => s !== slug));
  const add = (slug: string) => update([...slugs.filter((s) => s !== slug), slug].slice(0, COMPARE_MAX));

  const list = slugs.map((s) => unitBySlug(s)).filter((u): u is Unit => !!u);
  const withStatus = list.map((u) => ({ ...u, status: effectiveUnitStatus(u, overrides) }));

  return (
    <>
      <Header />
      <main className="pb-12 md:pb-20">
        {withStatus.length >= 2 ? (
          <CompareTable list={withStatus} onRemove={remove} tier={tier} />
        ) : withStatus.length === 1 ? (
          <CompareOne unit={withStatus[0]} onRemove={remove} onAdd={add} tier={tier} />
        ) : (
          <CompareEmpty />
        )}
      </main>
      <Footer compact />
    </>
  );
}

/* ------------------------------------------------------------------ three (or two) */

interface RowDef {
  key: string;
  label: ReactNode;
  only?: "phone" | "md";
  best?: Set<string>;
  big?: boolean;
  small?: boolean;
  cell: (u: Unit) => ReactNode;
  /** «نعم» strong, «لا» muted */
  yes?: (u: Unit) => boolean;
}

function bestOf(list: Unit[], value: (u: Unit) => number, dir: "min" | "max"): Set<string> {
  const vals = list.map(value);
  const target = dir === "min" ? Math.min(...vals) : Math.max(...vals);
  return new Set(list.filter((u) => value(u) === target).map((u) => u.code));
}

function CompareTable({ list, onRemove, tier }: { list: Unit[]; onRemove: (slug: string) => void; tier: ReturnType<typeof TIER_OF extends Record<string, infer T> ? () => T : never> }) {
  const code = useVisitorCode();
  const n = list.length;
  const codes = list.map((u) => u.code);
  const waAll = `أقارن بين ${codes.join(" و")}${code ? ` · ${code}` : ""}`;
  const bestPrice = bestOf(list, (u) => u.priceSar, "min");
  const bestPpm = bestOf(list, unitPpm, "min");
  const bestArea = bestOf(list, (u) => u.areaM2, "max");
  const delivery = (u: Unit) => deliveryShort(projectById(u.projectId));
  const rows: RowDef[] = [
    { key: "price", label: "السعر", best: bestPrice, big: true, cell: (u) => fmtNum(u.priceSar) },
    {
      key: "ppm",
      label: (
        <>
          <span className="md:hidden">للمتر</span>
          <span className="hidden md:inline">سعر المتر</span>
        </>
      ),
      best: bestPpm,
      cell: (u) => fmtNum(unitPpm(u)),
    },
    { key: "area", label: "المساحة", best: bestArea, cell: (u) => `${fmtArea(u.areaM2)} م²` },
    { key: "rooms", label: "الغرف · الحمامات", cell: (u) => `${u.beds} · ${u.baths}` },
    { key: "bf", label: "العمارة · الطابق", only: "phone", cell: (u) => `${u.buildingNameAr} · ${floorShort(u)}` },
    { key: "facing", label: "الاتجاه", only: "phone", cell: (u) => u.orientation?.value ?? "·" },
    { key: "bff", label: "العمارة · الطابق · الاتجاه", only: "md", cell: (u) => `${u.buildingNameAr} · ${floorShort(u)} · ${u.orientation?.value ?? "·"}` },
    { key: "balcony", label: "بلكونة", yes: (u) => u.features.balcony, cell: (u) => yesNo(u.features.balcony) },
    { key: "maid", label: "غرفة خادمة", only: "phone", yes: (u) => u.features.maid, cell: (u) => yesNo(u.features.maid) },
    { key: "maid2", label: "غرفة خادمة · غرفة سائق", only: "md", yes: (u) => u.features.maid || u.features.driver, cell: (u) => `${yesNo(u.features.maid)} · ${yesNo(u.features.driver)}` },
    { key: "smart", label: "سمارت هوم", only: "phone", yes: (u) => u.features.smartHome, cell: (u) => yesNo(u.features.smartHome) },
    { key: "smart2", label: "سمارت هوم · موقف", only: "md", yes: (u) => u.features.smartHome || u.features.parking > 0, cell: (u) => `${yesNo(u.features.smartHome)} · ${yesNo(u.features.parking > 0)}` },
    { key: "delivery", label: "التسليم", only: "phone", cell: delivery },
    { key: "delivery2", label: "التسليم · شهادة الإشغال", only: "md", cell: (u) => `${delivery(u)} · ${projectById(u.projectId)?.occupancy ?? ""}` },
    { key: "updated", label: "آخر تحديث", small: true, cell: (u) => fmtDate(u.updatedAt) },
  ];
  const onlyCls = (o?: "phone" | "md") => (o === "phone" ? "md:hidden" : o === "md" ? "hidden md:table-row" : "");
  const th = "sticky start-0 z-[1] w-24 md:w-50 px-3 md:px-4 py-3 text-start align-middle text-caption md:text-label md:font-bold font-bold text-muted bg-paper md:bg-cream md:static";

  return (
    <Container className="pt-5 md:pt-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-8">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-4">
            <h1 className="m-0 text-h1 leading-tight">قارن {n === 2 ? "وحدتين" : `${n} وحدات`}</h1>
            <Link href="/units" className="md:hidden shrink-0 text-caption font-bold text-gold-text no-underline hover:underline">
              عودة للنتائج
            </Link>
          </div>
          <p className="m-0 text-label font-normal leading-relaxed text-muted">
            المعيّن الذهبي يشير إلى الأفضل في الصف: أقل سعر، أقل سعر للمتر، أكبر مساحة.<span className="md:hidden"> اسحب الجدول أفقياً.</span>
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link href="/units" className="inline-flex items-center min-h-11 px-4 border-interactive text-label font-bold text-ink no-underline hover:bg-sand motion-hover transition-colors">
            عودة للنتائج
          </Link>
          <a href={waLink(waAll)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center min-h-11 px-4 bg-ink text-paper text-label font-extrabold no-underline cut-s hover:bg-ink-2 motion-hover transition-colors">
            أرسل المقارنة على واتساب
          </a>
        </div>
      </div>

      <div className="mt-5 md:mt-6 -mx-4 md:mx-0 overflow-x-auto md:overflow-visible md:border-interactive">
        <table className="w-max min-w-full md:w-full border-collapse text-label">
          <thead>
            <tr className="border-b-[1.5px] border-ink">
              <th scope="col" className={cx(th, "align-top pt-4")}>
                الوحدة
              </th>
              {list.map((u) => (
                <th key={u.code} scope="col" className="w-38 md:w-auto p-0 md:px-3 md:py-3 align-top font-normal text-start md:border-s md:border-line">
                  <UnitHead unit={u} tier={tier} onRemove={() => onRemove(u.slug)} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className={cx("border-b border-line", onlyCls(r.only))}>
                <th scope="row" className={th}>
                  {r.label}
                </th>
                {list.map((u) => {
                  const best = r.best?.has(u.code) && list.length > 1;
                  const yes = r.yes ? r.yes(u) : undefined;
                  return (
                    <td key={u.code} className={cx("px-3 md:px-4 py-3 align-middle tnum md:border-s md:border-line", r.big ? "text-body md:text-h3 font-extrabold" : r.small ? "text-caption md:text-label font-normal text-muted" : "font-bold", yes === false && "text-muted font-bold", yes === true && "font-extrabold")}>
                      <span className="inline-flex items-center gap-1.5">
                        {best && <HexDot tone="gold" className="size-2.5" />}
                        {r.cell(u)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <th scope="row" className={th}>
                <span className="sr-only">واتساب</span>
              </th>
              {list.map((u) => (
                <td key={u.code} className="px-3 md:px-4 py-3 md:py-4 md:border-s md:border-line">
                  <a href={waLink(`${u.code}${code ? ` · ${code}` : ""}`)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center min-h-11 px-3 bg-gold text-ink text-label font-extrabold no-underline cut-s hover:bg-gold-hover motion-hover transition-colors whitespace-nowrap">
                    <span className="md:hidden">واتساب</span>
                    <span className="hidden md:inline">اسأل عن هذه الوحدة</span>
                  </a>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <section className="md:hidden mt-6 flex flex-col gap-2 px-4 py-5 bg-sand" aria-label="أرسل المقارنة">
        <span className="text-body font-extrabold">محتار بين {FEMININE_DEF[n] ?? n}؟</span>
        <span className="text-label font-normal leading-relaxed text-muted">أرسل المقارنة كما هي، ونرد عليك برأينا المهني في أيها يناسب ميزانيتك وطريقة سكنك.</span>
        <a href={waLink(waAll)} target="_blank" rel="noopener noreferrer" className="mt-1.5 flex items-center justify-center min-h-12 px-4 bg-ink text-paper text-body font-extrabold no-underline cut-m hover:bg-ink-2 motion-hover transition-colors">
          أرسل المقارنة على واتساب
        </a>
      </section>
    </Container>
  );
}

function UnitHead({ unit, tier, onRemove }: { unit: Unit; tier: "generated" | "real" | "typographic"; onRemove: () => void }) {
  const project = projectById(unit.projectId);
  const district = districtBySlug(unitDistrictSlug(unit));
  return (
    <div className="flex flex-col">
      <div className="relative">
        <ImageSlot slotId={unit.images[0] ?? `IMG-UNIT-${unit.code}`} tier={tier} compact cut="img" showId={false} sold={unit.status === "sold"} className="h-24 md:h-37" unit={{ model: unit.type === "roof-villa" ? "روف" : unit.model, buildingNameAr: unit.buildingNameAr, areaM2: unit.areaM2, beds: unit.beds, baths: unit.baths }} />
        <span className="absolute top-2 start-2 z-[2] flex">
          <StatusBadge status={unit.status} size={40} />
        </span>
      </div>
      <div className="flex items-start justify-between gap-2 px-3 md:px-0 pt-2.5 pb-3">
        <Link href={`/units/${unit.slug}`} className="flex flex-col min-w-0 text-ink no-underline hover:underline">
          <span className="text-label md:text-h3 font-extrabold leading-snug">
            {nameOf(unit)}
            <span className="hidden md:inline"> · {unit.buildingNameAr}</span>
          </span>
          <span className="text-caption font-normal text-muted leading-snug">
            <span className="md:hidden">
              {unit.buildingNameAr} · {project?.nameAr}
            </span>
            <span className="hidden md:inline">
              {project?.nameAr} · حي {district?.ar}
            </span>
          </span>
        </Link>
        <button type="button" aria-label="إزالة من المقارنة" onClick={onRemove} className="inline-flex items-center justify-center size-8 md:size-9 shrink-0 border border-line bg-paper text-body leading-none hover:border-ink motion-hover transition-colors">
          ×
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ one */

function suggestionsFor(unit: Unit, overrides: ReturnType<typeof useUnitOverrides>): Unit[] {
  return availableUnits(overrides)
    .filter((u) => u.code !== unit.code && u.type === unit.type)
    .sort((a, b) => Math.abs(a.areaM2 - unit.areaM2) - Math.abs(b.areaM2 - unit.areaM2) || a.priceSar - b.priceSar)
    .slice(0, 2);
}

function CompareOne({ unit, onRemove, onAdd, tier }: { unit: Unit; onRemove: (slug: string) => void; onAdd: (slug: string) => void; tier: "generated" | "real" | "typographic" }) {
  const overrides = useUnitOverrides();
  const code = useVisitorCode();
  const project = projectById(unit.projectId);
  const sugg = suggestionsFor(unit, overrides);
  const wa = `${unit.code}${code ? ` · ${code}` : ""}`;
  const floorWord = unit.floor ? (unit.floor.value === "4+roof" ? "الرابع والسطح" : undefined) : undefined;
  return (
    <Container className="pt-5 md:pt-10 max-w-2xl">
      <h1 className="m-0 text-h1 leading-tight">المقارنة</h1>
      <p className="m-0 mt-1.5 text-label font-normal leading-relaxed text-muted">وحدة واحدة في المقارنة. أضف ثانية أو ثالثة لترى الفروق جنباً إلى جنب.</p>

      <section className="mt-5 grid grid-cols-2 gap-3" aria-label="الوحدات في المقارنة">
        <article className="flex flex-col border-interactive">
          <div className="relative">
            <ImageSlot slotId={unit.images[0] ?? `IMG-UNIT-${unit.code}`} tier={tier} compact cut="img" showId={false} className="h-24 md:h-32" unit={{ model: unit.type === "roof-villa" ? "روف" : unit.model, buildingNameAr: unit.buildingNameAr, areaM2: unit.areaM2, beds: unit.beds, baths: unit.baths }} />
            <span className="absolute top-2 start-2 z-[2] flex">
              <StatusBadge status={unit.status} size={40} />
            </span>
            <button type="button" aria-label="إزالة من المقارنة" onClick={() => onRemove(unit.slug)} className="absolute top-2 end-2 z-[2] inline-flex items-center justify-center size-8 bg-ink text-paper text-body leading-none hover:bg-ink-2">
              ×
            </button>
          </div>
          <div className="flex flex-col gap-0.5 px-3 pt-2.5 pb-3">
            <Link href={`/units/${unit.slug}`} className="text-label md:text-body font-extrabold text-ink no-underline hover:underline">
              {nameOf(unit)} · {unit.buildingNameAr}
            </Link>
            <span className="text-caption font-normal text-muted tnum">
              {unit.code} · {bedsLabel(unit.beds)} · {fmtArea(unit.areaM2)} م²
            </span>
          </div>
          <div className="mt-auto px-3 py-2.5 bg-ink text-paper text-body font-extrabold tnum">{fmtNum(unit.priceSar)}</div>
        </article>
        <Link href="/units" className="flex flex-col items-center justify-center gap-1.5 px-3 py-5 border-[1.5px] border-dashed border-ink text-center text-ink no-underline hover:bg-sand motion-hover transition-colors">
          <span aria-hidden className="inline-flex items-center justify-center size-10 hex-flat bg-sand text-h2 font-extrabold leading-none">
            +
          </span>
          <span className="text-label font-extrabold">أضف وحدة ثانية</span>
          <span className="text-caption font-normal leading-snug text-muted">من النتائج، اضغط «قارن» على أي بطاقة</span>
        </Link>
      </section>

      {sugg.length > 0 && (
        <section className="mt-7 flex flex-col gap-2.5" aria-labelledby="cmp-sugg">
          <h2 id="cmp-sugg" className="m-0 text-body md:text-h3 font-extrabold">
            يُقارَن عادةً مع
          </h2>
          {sugg.map((s, i) => {
            const diff = s.priceSar - unit.priceSar;
            return (
              <div key={s.code} className="flex items-center gap-3 p-3 border-interactive">
                <ImageSlot slotId={s.images[0] ?? `IMG-UNIT-${s.code}`} tier={tier} compact cut="img" showId={false} label={false} className="w-14 h-11 shrink-0" />
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <Link href={`/units/${s.slug}`} className="text-label font-extrabold text-ink no-underline hover:underline leading-snug">
                    {nameOf(s)} · {s.buildingNameAr} · {bedsLabel(s.beds)} · {fmtArea(s.areaM2)} م²
                  </Link>
                  <span className="text-caption font-normal text-muted tnum">
                    {fmtNum(s.priceSar)} · {fmtNum(unitPpm(s))} للمتر
                    {i === 0 && diff !== 0 ? ` · ${diff < 0 ? "أقل" : "أعلى"} بـ ${fmtNum(Math.abs(diff))}` : ""}
                  </span>
                </div>
                <button type="button" onClick={() => onAdd(s.slug)} className="inline-flex items-center justify-center min-h-11 px-4 shrink-0 border-interactive bg-paper text-label font-extrabold hover:bg-sand motion-hover transition-colors">
                  قارن
                </button>
              </div>
            );
          })}
        </section>
      )}

      <section className="mt-7 border-interactive" aria-labelledby="cmp-numbers">
        <h2 id="cmp-numbers" className="m-0 px-3.5 py-3 bg-ink text-paper text-label font-extrabold">
          {nameOf(unit)} بالأرقام
        </h2>
        <dl className="m-0 grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] text-label">
          {[
            ["السعر", fmtNum(unit.priceSar)],
            ["سعر المتر", fmtNum(unitPpm(unit))],
            ["المساحة", `${fmtArea(unit.areaM2)} م²`],
            ["الغرف · الحمامات", `${unit.beds} · ${unit.baths}`],
            [
              "الطابق",
              <>
                {floorWord ?? FLOOR_WORD(unit)}
                {unit.floor?.tbc && <Mark>للتأكيد</Mark>}
              </>,
            ],
            ["ضريبة التصرفات", <Mark key="m" className="ms-0">للتأكيد</Mark>],
            ["التسليم", deliveryShort(project)],
          ].map(([k, val], i) => (
            <div key={i} className="contents">
              <dt className="px-3.5 py-3 bg-sand font-normal text-muted border-b border-line">{k}</dt>
              <dd className="m-0 px-3.5 py-3 font-extrabold tnum border-b border-line">{val}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-4 flex gap-2.5">
        <a href={waLink(wa)} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-2 min-h-12 px-4 bg-gold text-ink text-body font-extrabold no-underline cut-m hover:bg-gold-hover motion-hover transition-colors">
          <WhatsAppIcon size={18} />
          اسأل عن {askObject(unit)}
        </a>
        <Link href={`/units/${unit.slug}`} className="inline-flex items-center justify-center min-h-12 px-4 border-interactive text-label font-bold text-ink no-underline hover:bg-sand motion-hover transition-colors">
          صفحة الوحدة
        </Link>
      </div>
    </Container>
  );
}

function FLOOR_WORD(u: Unit): string {
  const map: Record<string, string> = { "0": "الأرضي", "1": "الأول", "2": "الثاني", "3": "الثالث", "4": "الرابع" };
  return u.floor ? (map[u.floor.value] ?? u.floor.value) : "·";
}

/* ------------------------------------------------------------------ empty */

function CompareEmpty() {
  const overrides = useUnitOverrides();
  const available = countsByStatus(overrides).available;
  const days = Math.round(COMPARE_TTL_MS / 86_400_000);
  const avail = availableUnits(overrides);
  const twoBed = avail.filter((u) => u.type === "apartment" && u.beds === 2).sort((a, b) => a.priceSar - b.priceSar);
  const roofs = avail.filter((u) => u.type === "roof-villa");
  return (
    <Container className="pt-5 md:pt-10 max-w-2xl">
      <h1 className="m-0 text-h1 leading-tight">المقارنة</h1>
      <p className="m-0 mt-1.5 text-label font-normal leading-relaxed text-muted">
        لا وحدات بعد. تُحفظ المقارنة على هذا الجوال {days} أيام، بلا حساب.
      </p>

      <div className="mt-24 md:mt-16 flex flex-col items-center gap-4 text-center">
        <div aria-hidden className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className={cx("relative inline-block w-11 h-10 hex-flat", i === 2 ? "bg-ink" : "bg-line")}>
              <span className="absolute inset-[1.5px] hex-flat bg-paper" />
            </span>
          ))}
        </div>
        <h2 className="m-0 text-h2 leading-snug">قارن حتى {COMPARE_MAX} وحدات جنباً إلى جنب</h2>
        <p className="m-0 max-w-sm text-label font-normal leading-relaxed text-muted">السعر، سعر المتر، المساحة، الغرف، الطابق، التسليم، وضريبة التصرفات. اضغط «قارن» على أي بطاقة في النتائج.</p>
        <div className="mt-1 w-full max-w-sm flex flex-col gap-2.5">
          <Link href="/units" className="flex items-center justify-center min-h-13 px-4 bg-ink text-paper text-body font-extrabold no-underline cut-m hover:bg-ink-2 motion-hover transition-colors tnum">
            اعرض الوحدات المتاحة · {available}
          </Link>
          <Link href="/guide" className="flex items-center justify-center min-h-12 px-4 border-interactive text-body font-bold text-ink no-underline hover:bg-sand motion-hover transition-colors">
            أو ابدأ من دليل الأسعار
          </Link>
          {(twoBed.length >= 2 || roofs.length >= 2) && (
            <div className="mt-2 flex flex-col items-start gap-1.5 px-4 py-3.5 bg-sand text-start text-label">
              <span className="font-extrabold">مقارنة سريعة جاهزة</span>
              {twoBed.length >= 2 && (
                <Link href={compareUrl(twoBed.slice(0, COMPARE_MAX).map((u) => u.slug))} className="font-bold text-gold-text no-underline hover:underline">
                  شقق الغرفتين {FEMININE_DEF[twoBed.length] ?? twoBed.length} المتاحة ←
                </Link>
              )}
              {roofs.length >= 2 && (
                <Link href={compareUrl(roofs.slice(0, 2).map((u) => u.slug))} className="font-bold text-gold-text no-underline hover:underline">
                  فيلتا الروف: {roofs[0].buildingNameAr} و{roofs[1].buildingNameAr} ←
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
