"use client";
// /admin/content/pages/[page] (Admin-PageEditor-D). «الرئيسية» opens Noura's saved draft with one unsaved field (the
// hero title); the fields follow the board's sections, the AR / EN tab swaps the values (with the count of empty
// English fields), and the PreviewFrame at 390 / 1440 renders the Home hero and finder copy from the fields as you type,
// with the gold frame on the field being edited. Save strip: unsaved → «نشر» → «نُشرت الرئيسية الآن · …» for 6 s → clean.
// The other pages of the hub open the same editor with their sections and the published page in the preview.
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { PreviewFrame, Switch, unsavedFieldsText, type PreviewWidth } from "@/components/admin";
import { ImageSlot, Lockup, Mark, MarkedText } from "@/components/ui";
import { contentHub, homePage } from "@/data/content";
import { mediaById } from "@/data/media";
import type { CopyField } from "@/data/types";
import { slotSrc } from "@/lib/images";
import { useStore } from "@/lib/store";
import { cx } from "@/lib/format";
import { ctl, Field, INPUT_H } from "./controls";
import { countWord, faqSummary, useFaq, W } from "./model";
import { ContentHead, G8Shell, LangSwitch, NOURA, SaveStrip, StripLink, type StripState } from "./shell";

type Lang = "ar" | "en";
type Values = Record<string, string>; // "section.field" → value

/** The fields the board shows per section, in rows (two or three in a row where the board groups them). */
const LAYOUT: Record<string, string[][]> = {
  hero: [["topline"], ["title"], ["paragraph"], ["primaryText", "primaryTarget"], ["heroImage"]],
  finder: [["title"], ["help"], ["sliderMin", "sliderMax"]],
  guide: [["title"], ["paragraph"]],
  why: [["p1", "p2", "p3"]],
  faq: [],
};
const SECTIONS = homePage.sections.filter((s) => s.key in LAYOUT);
const fieldOf = (sec: string, key: string) => SECTIONS.find((s) => s.key === sec)?.fields.find((f) => f.key === key);
const ALL_KEYS = SECTIONS.flatMap((s) => LAYOUT[s.key].flat().map((k) => `${s.key}.${k}`));
/** Textarea fields the board draws as one-line inputs. */
const SINGLE_LINE = new Set(["finder.help"]);
const isText = (f?: CopyField) => !!f && (f.kind === "text" || f.kind === "textarea" || f.kind === undefined);

function initial(lang: Lang, version: "current" | "saved"): Values {
  const out: Values = {};
  for (const k of ALL_KEYS) {
    const [sec, key] = k.split(".");
    const f = fieldOf(sec, key);
    if (!f) continue;
    if (lang === "en") out[k] = f.kind === "number" || f.kind === "select" || f.kind === "image" ? (f.arDraft ?? f.ar) : (f.en ?? "");
    else out[k] = version === "saved" && f.arPrevious ? f.arPrevious : (f.arDraft ?? f.ar);
  }
  return out;
}
const initialVisible = () => Object.fromEntries(SECTIONS.map((s) => [s.key, s.visibleDraft ?? s.visible]));

function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function PageEditorPage({ pageKey }: { pageKey: string }) {
  if (pageKey !== "home") return <OtherPageEditor pageKey={pageKey} />;
  return <HomeEditor />;
}

function HomeEditor() {
  const toast = useStore((s) => s.toast);
  const faq = faqSummary(useFaq());
  const [lang, setLang] = useState<Lang>("ar");
  const [saved, setSaved] = useState<{ ar: Values; en: Values; visible: Record<string, boolean> }>(() => ({ ar: initial("ar", "saved"), en: initial("en", "saved"), visible: initialVisible() }));
  const [ar, setAr] = useState<Values>(() => initial("ar", "current"));
  const [en, setEn] = useState<Values>(() => initial("en", "current"));
  const [visible, setVisible] = useState<Record<string, boolean>>(initialVisible);
  const [active, setActive] = useState<string>("hero.title");
  const [width, setWidth] = useState<PreviewWidth>(390);
  const [phase, setPhase] = useState<"edit" | "saving" | "saved">("edit");
  const [publishedAt, setPublishedAt] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const values = lang === "ar" ? ar : en;
  const setValue = (k: string, v: string) => (lang === "ar" ? setAr : setEn)((prev) => ({ ...prev, [k]: v }));

  const dirtyKeys = useMemo(() => {
    const d = new Set<string>();
    for (const k of ALL_KEYS) {
      if (ar[k] !== saved.ar[k] || en[k] !== saved.en[k]) d.add(k);
    }
    for (const s of SECTIONS) if (visible[s.key] !== saved.visible[s.key]) d.add(`${s.key}.__visible`);
    return d;
  }, [ar, en, visible, saved]);
  const dirty = dirtyKeys.size;
  const enEmpty = ALL_KEYS.filter((k) => {
    const [sec, key] = k.split(".");
    return isText(fieldOf(sec, key)) && !en[k]?.trim();
  }).length;

  const state: StripState = phase === "saving" ? "saving" : phase === "saved" ? "saved" : dirty ? "dirty" : "clean";

  const discard = () => {
    setAr(saved.ar);
    setEn(saved.en);
    setVisible(saved.visible);
  };
  const saveDraft = () => {
    setSaved({ ar, en, visible });
    toast("حُفظت مسودة الرئيسية · لم تُنشر بعد", { kind: "ok" });
  };
  const publish = () => {
    setPhase("saving");
    timer.current = setTimeout(() => {
      setSaved({ ar, en, visible });
      setPublishedAt(nowHHMM());
      setPhase("saved");
      toast("نُشرت الرئيسية", { kind: "ok", action: { label: "افتح الصفحة", href: "/" } });
      timer.current = setTimeout(() => setPhase("edit"), 6000);
    }, 700);
  };
  const undo = () => {
    if (timer.current) clearTimeout(timer.current);
    setPhase("edit");
    toast("أُلغي النشر · الصفحة المنشورة كما كانت", { kind: "info" });
  };

  const tag = (k: string) => (k === active ? "active" : undefined);

  return (
    <G8Shell user={NOURA} mainClassName="pb-0 md:pb-0">
      <ContentHead
        trail="الصفحات › الرئيسية"
        title={homePage.pathAr}
        path={homePage.path}
        subtitle="حقول مرتّبة حسب أقسام الصفحة. الأرقام (الأسعار، عدد الوحدات) تُحسب من الوحدات ولا تُكتب هنا"
        actions={<LangSwitch value={lang} onChange={setLang} enEmpty={enEmpty} />}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_393px]">
        <div className="flex min-w-0 flex-col gap-4">
          {SECTIONS.map((s) => {
            const sectionDirty = [...dirtyKeys].some((k) => k.startsWith(`${s.key}.`));
            return (
              <section key={s.key} aria-label={s.titleAr} className="border-interactive bg-paper">
                <header className="flex items-center justify-between gap-3 border-b-[1.5px] border-ink bg-sand px-4 py-3">
                  <span className="flex items-center gap-2 text-[14px] font-extrabold">
                    {sectionDirty && <span aria-hidden className="hex-point size-2.5 shrink-0 bg-gold" />}
                    {s.titleAr}
                  </span>
                  <span className="flex items-center gap-2 text-[12px] font-bold">
                    <span id={`vis-${s.key}`}>{visible[s.key] ? "ظاهر" : "مخفي"}</span>
                    <Switch checked={!!visible[s.key]} onChange={(v) => setVisible((p) => ({ ...p, [s.key]: v }))} aria-label="إظهار القسم" />
                  </span>
                </header>
                <div className="flex flex-col gap-4 p-4">
                  {LAYOUT[s.key].map((row, i) => (
                    <div key={i} className={cx("grid gap-4", row.length === 2 && "md:grid-cols-2", row.length === 3 && "md:grid-cols-3")}>
                      {row.map((key) => {
                        const k = `${s.key}.${key}`;
                        const f = fieldOf(s.key, key);
                        if (!f) return null;
                        return <CopyInput key={k} k={k} field={f} lang={lang} value={values[k] ?? ""} savedAr={saved.ar[k]} onChange={(v) => setValue(k, v)} onFocus={() => setActive(k)} tone={tag(k)} />;
                      })}
                    </div>
                  ))}
                  {s.key === "finder" && (
                    <p className="text-[12px] text-muted">
                      القيم الافتراضية للميزانية تُدار من{" "}
                      <Link href="/admin/content/lists" className="font-bold text-gold-text no-underline hover:underline">
                        القوائم › الميزانيات
                      </Link>
                      .
                    </p>
                  )}
                  {s.key === "why" && s.noteAr && (
                    <p className="text-[12px] font-bold text-gold-text">
                      <MarkedText text={s.noteAr} />
                    </p>
                  )}
                  {s.key === "faq" && (
                    <p className="text-label font-normal text-muted">
                      تظهر أول 4 أسئلة منشورة من{" "}
                      <Link href="/admin/content/faq" className="font-bold text-gold-text no-underline hover:underline">
                        الأسئلة الشائعة
                      </Link>
                      .{faq.drafts > 0 && !visible.faq ? (
                        <>
                          {" "}
                          القسم مخفي الآن لأن {countWord(faq.drafts, W.question)} فيها <Mark>[مسودة إجابة]</Mark>.
                        </>
                      ) : null}
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        <PreviewFrame sticky width={width} onWidthChange={setWidth} note="الإطار الذهبي يحدّد الحقل الذي تحرّره الآن. المعاينة تعرض المسودة لا النسخة المنشورة." className="lg:top-20">
          <HomePreview width={width} lang={lang} v={values} ar={ar} active={active} visible={visible} />
        </PreviewFrame>
      </div>

      <SaveStrip
        state={state}
        message={`${unsavedFieldsText(dirty)} · ${homePage.lastPublishedAr}`}
        onDiscard={discard}
        links={<StripLink href="/">معاينة في الموقع</StripLink>}
        draftLabel="حفظ كمسودة"
        onDraft={saveDraft}
        saveLabel="نشر"
        onSave={publish}
        savedText={`نُشرت الرئيسية الآن · ${NOURA.name} · ${publishedAt} ·`}
        openHref="/"
        openLabel="افتح الصفحة"
        onUndo={undo}
        undoLabel="تراجع عن النشر"
        publishedLabel="منشور"
      />
    </G8Shell>
  );
}

function CopyInput({ k, field, lang, value, savedAr, onChange, onFocus, tone }: { k: string; field: CopyField; lang: Lang; value: string; savedAr?: string; onChange: (v: string) => void; onFocus: () => void; tone?: "active" }) {
  const tbc = /\[(للتأكيد|مسودة إجابة)\]/.test(value);
  const t = tone ?? (tbc ? "tbc" : "admin");
  const id = `f-${k.replace(".", "-")}`;
  if (field.kind === "image") {
    const slot = mediaById(value || field.ar);
    const src = slot ? slotSrc(slot.id, 640) : null;
    return (
      <Field label={field.labelAr} as="div">
        <span className="flex items-center gap-3 border-[1.5px] border-dashed border-ink bg-cream p-2.5">
          <span className="block w-[72px] shrink-0">
            <ImageSlot slotId={field.ar} tier="generated" ratio="16:9" src={src ?? undefined} compact showId={false} label={false} cut="img" />
          </span>
          <span className="min-w-0 flex-1 text-[12px] font-normal text-ink-2">{field.noteAr}</span>
          <Link href="/admin/content/media" className="shrink-0 text-[12px] font-extrabold text-gold-text no-underline hover:underline">
            استبدال
          </Link>
        </span>
      </Field>
    );
  }
  const changedNote = lang === "ar" && field.noteAr && field.arPrevious && value !== savedAr ? field.noteAr : undefined;
  return (
    <Field label={field.labelAr} note={changedNote} noteTone="gold">
      {field.kind === "select" ? (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} onFocus={onFocus} className={ctl(t, cx(INPUT_H, "cursor-pointer"))}>
          {(field.options ?? []).map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : field.kind === "textarea" && !SINGLE_LINE.has(k) ? (
        <textarea id={id} value={value} rows={2} dir={lang === "en" ? "ltr" : undefined} onChange={(e) => onChange(e.target.value)} onFocus={onFocus} placeholder={lang === "en" ? field.ar : undefined} className={ctl(t, "min-h-[68px] py-2.5 leading-relaxed")} />
      ) : (
        <input id={id} value={value} onChange={(e) => onChange(e.target.value)} onFocus={onFocus} placeholder={lang === "en" ? field.ar : undefined} inputMode={field.kind === "number" ? "numeric" : undefined} dir={field.kind === "number" || lang === "en" ? "ltr" : undefined} className={ctl(t, cx(INPUT_H, field.kind === "number" && "text-right tnum"))} />
      )}
    </Field>
  );
}

// ------------------------------------------------------------------ preview

function Frame({ on, children, className }: { on: boolean; children: ReactNode; className?: string }) {
  return <span className={cx("block outline-offset-2", on ? "outline-2 outline-solid outline-gold" : "", className)}>{children}</span>;
}

/** The Home hero and finder as the draft fields write them (390: stacked; 1440: side by side). */
function HomePreview({ width, lang, v, ar, active, visible }: { width: PreviewWidth; lang: Lang; v: Values; ar: Values; active: string; visible: Record<string, boolean> }) {
  // empty English fields inherit the Arabic on the site
  const val = (k: string) => (lang === "en" ? v[k]?.trim() || ar[k] : v[k]) ?? "";
  const heroSrc = slotSrc("IMG-HERO-BRAND", width === 390 ? 640 : 1280) ?? undefined;
  const desk = width === 1440;
  const hero = visible.hero;
  return (
    <div dir={lang === "en" ? "ltr" : "rtl"} lang={lang} className={cx("bg-paper text-ink", lang === "en" && "font-latin")}>
      <div className={cx("flex items-center justify-between bg-ink", desk ? "h-[72px] px-10" : "h-14 px-4")}>
        <Lockup tone="goldmark-white" height={desk ? 32 : 24} decorative lang={lang} />
        <span aria-hidden className="block size-6 border-[1.5px] border-paper" />
      </div>
      {hero && (
        <div className={cx(desk ? "grid grid-cols-[1fr_1.1fr] items-stretch" : "flex flex-col")}>
          <div className={cx(desk ? "order-2 h-[460px]" : "h-[190px]")}>
            <ImageSlot slotId="IMG-HERO-BRAND" tier="generated" src={heroSrc} showId={false} cut="img-l" className="h-full" lang={lang} />
          </div>
          <div className={cx("flex flex-col justify-center", desk ? "gap-4 px-10 py-12" : "gap-2.5 px-4 py-5")}>
            <Frame on={active === "hero.topline"}>
              <span className={cx("font-bold text-gold-text", desk ? "text-[14px]" : "text-[10px]")}>{val("hero.topline")}</span>
            </Frame>
            <Frame on={active === "hero.title"}>
              <span className={cx("block font-extrabold leading-tight", desk ? "text-[44px]" : "text-[22px]")}>
                <MarkedText text={val("hero.title")} />
              </span>
            </Frame>
            <Frame on={active === "hero.paragraph"}>
              <span className={cx("block text-ink-2", desk ? "text-[16px] leading-relaxed" : "text-[12px] leading-relaxed")}>{val("hero.paragraph")}</span>
            </Frame>
            <Frame on={active === "hero.primaryText" || active === "hero.primaryTarget"}>
              <span className={cx("flex items-center justify-center bg-gold font-extrabold text-ink cut-s", desk ? "h-14 w-fit px-8 text-[16px]" : "h-11 text-[13px]")}>{val("hero.primaryText")}</span>
            </Frame>
          </div>
        </div>
      )}
      {visible.finder && (
        <div className={cx("flex flex-col bg-sand", desk ? "gap-3 px-10 py-8" : "gap-2.5 px-4 py-5")}>
          <Frame on={active === "finder.title"}>
            <span className={cx("font-extrabold", desk ? "text-[28px]" : "text-[16px]")}>{val("finder.title")}</span>
          </Frame>
          <Frame on={active === "finder.sliderMin" || active === "finder.sliderMax"}>
            {/* no min / max words on the board: the two fields move the knob of the 700,000 start instead */}
            <span className="relative my-2 block h-[3px] bg-ink">
              <span aria-hidden className="hex-flat absolute top-1/2 size-4 translate-x-1/2 -translate-y-1/2 bg-gold" style={{ right: `${knobAt(val("finder.sliderMin"), val("finder.sliderMax"))}%` }} />
            </span>
          </Frame>
          <Frame on={active === "finder.help"}>
            <span className={cx("block text-muted", desk ? "text-[13px]" : "text-[10px]")}>{val("finder.help")}</span>
          </Frame>
        </div>
      )}
    </div>
  );
}

/** Where the finder's 700,000 start sits on the min … max track, in % from the right (the track runs RTL). */
function knobAt(min: string, max: string): number {
  const lo = Number(min.replace(/[^\d]/g, ""));
  const hi = Number(max.replace(/[^\d]/g, ""));
  if (!(hi > lo)) return 50;
  return Math.min(100, Math.max(0, ((700_000 - lo) / (hi - lo)) * 100));
}

// ------------------------------------------------------------------ the other pages of the hub

function OtherPageEditor({ pageKey }: { pageKey: string }) {
  const toast = useStore((s) => s.toast);
  const page = contentHub.pages.find((p) => p.key === pageKey) ?? contentHub.pages[0];
  const sections = page.sectionsAr.split(" · ");
  const [saved, setSaved] = useState<boolean[]>(() => sections.map(() => true));
  const [visible, setVisible] = useState<boolean[]>(() => sections.map(() => true));
  const [width, setWidth] = useState<PreviewWidth>(390);
  const [phase, setPhase] = useState<"edit" | "saved">("edit");
  const dirty = visible.filter((v, i) => v !== saved[i]).length;
  const state: StripState = phase === "saved" ? "saved" : dirty ? "dirty" : "clean";
  const publish = () => {
    setSaved(visible);
    setPhase("saved");
    toast(`نُشرت ${page.pageAr}`, { kind: "ok", action: { label: "افتح الصفحة", href: page.path } });
    setTimeout(() => setPhase("edit"), 6000);
  };
  return (
    <G8Shell user={NOURA} mainClassName="pb-0 md:pb-0">
      <ContentHead trail={`الصفحات › ${page.pageAr}`} title={page.pageAr} path={page.path} subtitle="حقول مرتّبة حسب أقسام الصفحة. الأرقام (الأسعار، عدد الوحدات) تُحسب من الوحدات ولا تُكتب هنا" />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_393px]">
        <div className="flex min-w-0 flex-col gap-4">
          {sections.map((title, i) => (
            <section key={title} aria-label={title} className="border-interactive bg-paper">
              <header className="flex items-center justify-between gap-3 bg-sand px-4 py-3">
                <span className="text-[14px] font-extrabold">
                  {i + 1} · {title}
                </span>
                <span className="flex items-center gap-2 text-[12px] font-bold">
                  {visible[i] ? "ظاهر" : "مخفي"}
                  <Switch checked={visible[i]} onChange={(v) => setVisible((p) => p.map((x, j) => (j === i ? v : x)))} aria-label="إظهار القسم" />
                </span>
              </header>
            </section>
          ))}
        </div>
        <PreviewFrame sticky width={width} onWidthChange={setWidth} height={640} title="معاينة حية" className="lg:top-20">
          <iframe title={`معاينة ${page.pageAr}`} src={page.path} loading="lazy" className="block border-0" style={{ width, height: Math.round(640 / (width === 390 ? 1 : 420 / 1440)) }} />
        </PreviewFrame>
      </div>
      <SaveStrip state={state} message={unsavedFieldsText(dirty)} onDiscard={() => setVisible(saved)} links={<StripLink href={page.path}>معاينة في الموقع</StripLink>} saveLabel="نشر" onSave={publish} savedText={`نُشرت ${page.pageAr} الآن ·`} openHref={page.path} openLabel="افتح الصفحة" />
    </G8Shell>
  );
}

export const EDITOR_PAGES = contentHub.pages.map((p) => p.key);
