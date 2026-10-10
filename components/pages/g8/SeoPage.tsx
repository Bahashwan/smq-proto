"use client";
// /admin/content/seo (Admin-SEO-D): title and description per page with the 60 / 155 counters (gold past the limit),
// the unit and project templates filled from RZ-A and جاردن الروضة for the «مثال» line and the ≈ length, and the link
// preview with the OG image (/og/*.png when the file exists; the guide draws its own tile). The home description's
// price is the {from_price} variable, shown filled from the cheapest available unit.
import { useMemo, useState } from "react";
import { MarkedText } from "@/components/ui";
import { seo, SEO_LIMITS } from "@/data/content";
import { districtAr } from "@/data/districts";
import { projectById } from "@/data/projects";
import { availableUnits, fromPrice, listedUnits, priceRange } from "@/data/selectors";
import { settings } from "@/data/settings";
import type { SeoRow } from "@/data/types";
import { UNIT_TYPE_AR, UNIT_TYPE_PLURAL_AR, unitByCode } from "@/data/units";
import { useStore } from "@/lib/store";
import { unsavedFieldsText } from "@/components/admin";
import { cx, fmtArea, fmtNum } from "@/lib/format";
import { ctl } from "./controls";
import { countWord, digitWord, W } from "./model";
import { ContentHead, G8Shell, LangSwitch, NOURA, SaveStrip, type StripState } from "./shell";

/** Template strings as the board writes them (the fixture names some variables differently; both names fill). */
const BOARD_TEMPLATES: Record<string, Partial<SeoRow>> = {
  unit: {
    descriptionAr: "{type} في {district}، جدة. {beds} غرف و{baths} حمامات، {area} م²، بسعر {price} ريال {status_phrase}. تفاصيل كاملة ومخطط وتواصل مباشر على واتساب.",
    descriptionNoteAr: "{status_phrase} = «متاحة الآن» أو «محجوزة» أو «مباعة»",
  },
  project: {
    titleAr: "{project} · {district} · من {min_price} ريال",
    descriptionAr: "{available_count} وحدة متاحة في {project}، {district}. {types_phrase}، أسعار معلنة من {min_price} إلى {max_price} ريال. التسليم {delivery}.",
  },
};
const FIRST_ROWS = 5;
const COLS = "grid grid-cols-[200px_minmax(0,1fr)_minmax(0,1fr)_300px] items-start gap-4";
const STATUS_PHRASE = { available: "متاحة الآن", reserved: "محجوزة", sold: "مباعة" } as const;

type Lang = "ar" | "en";
interface Texts { title: string; description: string }

/** Every {variable} the rows use, filled from the fixtures (RZ-A for the unit template, rwd-01 for the project). */
function useVariables() {
  return useMemo(() => {
    const rz = unitByCode("RZ-A")!;
    const p = projectById(rz.projectId)!;
    const inProject = availableUnits().filter((u) => u.projectId === p.id);
    const pr = priceRange(inProject);
    const types = [...new Set(listedUnits().filter((u) => u.projectId === p.id).map((u) => u.type))].map((t) => UNIT_TYPE_PLURAL_AR[t]).join(" و");
    const from = fromPrice();
    const delivery = `${p.deliveryLabel.value}${p.deliveryLabel.tbc ? " [للتأكيد]" : ""}`;
    return {
      from_price: from ? fmtNum(from) : "",
      unit: { type: UNIT_TYPE_AR[rz.type], beds: rz.beds, baths: rz.baths, area: fmtArea(rz.areaM2), price: fmtNum(rz.priceSar), project: p.nameAr, district: districtAr(p.districtSlug), status_phrase: STATUS_PHRASE[rz.status], status: STATUS_PHRASE[rz.status], code: rz.slug } as Record<string, string | number>,
      project: { project: p.nameAr, district: districtAr(p.districtSlug), min_price: pr ? fmtNum(pr.min) : "", from_price: pr ? fmtNum(pr.min) : "", max_price: pr ? fmtNum(pr.max) : "", to_price: pr ? fmtNum(pr.max) : "", available_count: inProject.length, available: inProject.length, types_phrase: types, types, delivery, slug: p.slug } as Record<string, string | number>,
      unitPath: `/units/${rz.slug}`,
      projectPath: `/projects/${p.slug}`,
      projectName: p.nameAr,
      availableInProject: inProject.length,
      guideRange: priceRange(availableUnits().filter((u) => u.type === "apartment")),
    };
  }, []);
}

function fill(text: string, vars: Record<string, string | number>): string {
  const out = text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
  // «8 وحدة متاحة» → «8 وحدات متاحة»
  return out.replace(/(\d+) وحدة/g, (_m, n: string) => countWord(Number(n), W.unit));
}

export function SeoPage({ ogFiles = [] }: { ogFiles?: string[] }) {
  const toast = useStore((s) => s.toast);
  const vars = useVariables();
  const [lang, setLang] = useState<Lang>("ar");
  const [all, setAll] = useState(false);
  const rows = useMemo(() => seo.map((r) => ({ ...r, ...BOARD_TEMPLATES[r.key] })), []);
  const init = useMemo(() => {
    const out: Record<string, Texts> = {};
    for (const r of rows) {
      out[`ar:${r.key}`] = { title: r.titleAr, description: r.descriptionAr };
      out[`en:${r.key}`] = { title: r.titleEn ?? "", description: r.descriptionEn ?? "" };
    }
    return out;
  }, [rows]);
  const [saved, setSaved] = useState(init);
  const [texts, setTexts] = useState(init);
  const [forced, setForced] = useState<Set<string>>(() => new Set(rows.filter((r) => r.unsaved).map((r) => `ar:${r.key}:description`)));
  const [phase, setPhase] = useState<"edit" | "saving" | "saved">("edit");

  const changedKeys = new Set<string>(forced);
  for (const k of Object.keys(texts)) {
    if (texts[k].title !== saved[k].title) changedKeys.add(`${k}:title`);
    if (texts[k].description !== saved[k].description) changedKeys.add(`${k}:description`);
  }
  const dirty = changedKeys.size;
  const state: StripState = phase === "saving" ? "saving" : phase === "saved" ? "saved" : dirty ? "dirty" : "clean";

  const setText = (key: string, field: keyof Texts, value: string) => {
    setPhase("edit");
    setTexts((prev) => ({ ...prev, [`${lang}:${key}`]: { ...prev[`${lang}:${key}`], [field]: value } }));
  };
  const save = () => {
    setPhase("saving");
    setTimeout(() => {
      setSaved(texts);
      setForced(new Set());
      setPhase("saved");
      toast("نُشرت العناوين والأوصاف · تظهر في قوقل ومعاينة واتساب بعد الزحف التالي", { kind: "ok" });
      setTimeout(() => setPhase("edit"), 6000);
    }, 600);
  };

  const shown = all ? rows : rows.slice(0, FIRST_ROWS);
  const rest = rows.slice(FIRST_ROWS);
  const domain = settings.domain ?? "smq-re.com";

  return (
    <G8Shell user={NOURA} mainClassName="pb-0 md:pb-0">
      <ContentHead
        trail="عناوين البحث والمعاينة"
        title="عناوين البحث والمعاينة"
        subtitle="العنوان والوصف اللذان يظهران في قوقل وفي معاينة الرابط على واتساب. صفحات الوحدات والمشاريع تُولَّد من قالب، والباقي يُكتب يدوياً"
        actions={<LangSwitch value={lang} onChange={setLang} />}
      />

      <div className="overflow-x-auto border-interactive bg-paper">
        <div className="min-w-[1000px]">
          <div className={cx(COLS, "bg-sand px-4 py-3 text-caption font-extrabold text-muted")}>
            <span>الصفحة</span>
            <span>العنوان (حتى {SEO_LIMITS.title} حرفاً)</span>
            <span>الوصف (حتى {SEO_LIMITS.description} حرفاً)</span>
            <span>معاينة الرابط · 1200×630</span>
          </div>
          {shown.map((r) => {
            const t = texts[`${lang}:${r.key}`];
            const v = r.key === "unit" ? vars.unit : r.key === "project" ? vars.project : { from_price: vars.from_price };
            // the home description shows its price filled; editing writes the variable back
            const descValue = r.key === "home" ? t.description.replaceAll("{from_price}", vars.from_price) : t.description;
            const filledTitle = fill(t.title, v);
            const filledDesc = fill(t.description, v);
            const path = r.key === "unit" ? vars.unitPath : r.key === "project" ? vars.projectPath : r.path;
            const unsavedDesc = changedKeys.has(`${lang}:${r.key}:description`) && r.unsaved;
            return (
              <div key={r.key} className={cx(COLS, "border-t border-line px-4 py-4 text-label font-normal")}>
                <div className="flex flex-col items-start gap-1.5">
                  <span className="text-[14px] font-extrabold">{r.pageAr}</span>
                  <span dir="ltr" className="text-caption font-normal text-muted">
                    {r.template ? (r.key === "unit" ? "/units/{code}" : "/projects/{slug}") : r.key === "home" ? `${domain}/` : r.path}
                  </span>
                  {r.template && r.pagesCount !== undefined && <span className="bg-sand px-2 py-0.5 text-caption font-bold">{digitWord(r.pagesCount, W.page)}</span>}
                </div>
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="sr-only">العنوان · {r.pageAr}</span>
                  <input value={t.title} onChange={(e) => setText(r.key, "title", e.target.value)} dir={lang === "en" ? "ltr" : undefined} placeholder={lang === "en" ? r.titleAr : undefined} className={ctl(!r.template && t.title.length > SEO_LIMITS.title ? "error" : "admin", "h-11 font-bold")} />
                  <Counter note={r.template && r.key !== "home" ? (lang === "ar" ? `مثال: ${filledTitle}` : filledTitle) : lang === "ar" ? r.titleNoteAr : undefined} count={r.template ? filledTitle.length : t.title.length} limit={SEO_LIMITS.title} approx={r.template} />
                </label>
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="sr-only">الوصف · {r.pageAr}</span>
                  <textarea
                    value={descValue}
                    onChange={(e) => setText(r.key, "description", r.key === "home" && vars.from_price ? e.target.value.replaceAll(vars.from_price, "{from_price}") : e.target.value)}
                    rows={3}
                    dir={lang === "en" ? "ltr" : undefined}
                    placeholder={lang === "en" ? r.descriptionAr : undefined}
                    className={ctl(!r.template && filledDesc.length > SEO_LIMITS.description ? "error" : "admin", "min-h-[76px] py-2 font-bold leading-relaxed")}
                  />
                  <Counter note={unsavedDesc ? "غير محفوظ" : lang === "ar" ? r.descriptionNoteAr : undefined} noteGold={unsavedDesc} count={filledDesc.length} limit={SEO_LIMITS.description} approx={r.template} />
                </label>
                <LinkPreview row={r} lang={lang} domain={domain} path={path} title={filledTitle} description={filledDesc} ogFiles={ogFiles} vars={vars} />
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-[12px] text-muted">
        {rest.length > 0 && (
          <button type="button" onClick={() => setAll((x) => !x)} aria-expanded={all} className="cursor-pointer font-bold text-gold-text underline-offset-2 hover:underline">
            {all ? `عرض أول ${FIRST_ROWS} فقط` : `و${countWord(rest.length, W.page)} أخرى (${rest.map((r) => r.pageAr).join("، ")}) بنفس الصف`}
          </button>
        )}
        {rest.length > 0 && ". "}
        صفحات الإدارة والخصوصية و404 تحمل noindex ولا تظهر هنا.
      </p>

      <SaveStrip state={state} message={unsavedFieldsText(dirty)} onDiscard={() => { setTexts(saved); setForced(new Set()); }} saveLabel="حفظ ونشر" onSave={save} savedText="نُشرت العناوين الآن ·" />
    </G8Shell>
  );
}

function Counter({ note, noteGold, count, limit, approx }: { note?: string; noteGold?: boolean; count: number; limit: number; approx?: boolean }) {
  const over = !approx && count > limit;
  return (
    <span className="flex items-start justify-between gap-3 text-caption">
      <span className={cx(noteGold ? "font-bold text-gold-text" : "font-normal text-muted")}>{note && <MarkedText text={note} />}</span>
      <span className={cx("shrink-0 tnum", over ? "font-extrabold text-gold-text" : "font-semibold text-muted")}>
        {approx ? `≈ ${count}` : `${count} / ${limit}`}
      </span>
    </span>
  );
}

function LinkPreview({ row, lang, domain, path, title, description, ogFiles, vars }: { row: SeoRow; lang: Lang; domain: string; path: string; title: string; description: string; ogFiles: string[]; vars: ReturnType<typeof useVariables> }) {
  const file = row.og.startsWith("OG-Unit") ? "unit-rz-a.png" : row.og.startsWith("OG-Project") ? "project-garden-rawdah.png" : "home.png";
  const has = ogFiles.includes(file) && row.key !== "guide";
  const range = vars.guideRange;
  return (
    <div className="flex flex-col border-[1.5px] border-ink bg-paper" dir={lang === "en" ? "ltr" : "rtl"}>
      <div className="relative aspect-[1200/630] w-full overflow-hidden bg-ink">
        {has ? (
          // eslint-disable-next-line @next/next/no-img-element -- the OG PNG rendered from the OG routes (public/og)
          <img src={`/og/${file}`} alt={`صورة المعاينة ${row.og}`} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        ) : row.key === "guide" ? (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-sand">
            <span className="text-[14px] font-extrabold text-ink tnum">{range ? `${fmtNum(range.min / 1000)} إلى ${fmtNum(range.max / 1000)} ألف` : ""}</span>
            <span className="text-caption font-extrabold text-gold-text">دليل الأسعار</span>
          </span>
        ) : (
          <span className="absolute inset-0 flex items-center justify-center bg-ink text-caption font-extrabold text-gold">{row.og}</span>
        )}
        {has && row.og.includes("مشترك") && <span className="absolute bottom-1.5 start-1.5 bg-ink px-1.5 py-px text-caption font-extrabold text-gold">{row.og}</span>}
      </div>
      <div className="flex min-w-0 flex-col gap-0.5 border-t-[1.5px] border-ink px-3 py-2.5">
        <span dir="ltr" className="truncate text-start text-caption font-normal text-muted">
          {domain}
          {path === "/" ? "" : path}
        </span>
        <span className="truncate text-[13px] font-extrabold">{title.replace(/\s*\[(للتأكيد|مسودة إجابة)\]/g, "")}</span>
        <span className="truncate text-caption font-normal text-muted">{description.replace(/\s*\[(للتأكيد|مسودة إجابة)\]/g, "")}</span>
      </div>
    </div>
  );
}
