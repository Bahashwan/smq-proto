"use client";
// /admin/content/partners (Admin-Partners-D): the five partner rows (drag order, type, link, visibility), logos as
// local files only (never generated; «مرئي» stays off while a logo is missing), and the «من نحن» block preview that
// the visibility switches drive: zero visible logos → the block is not drawn at all. «حفظ» writes to the store.
import { useMemo, useRef, useState } from "react";
import { Dialog, DragHandle, Switch } from "@/components/admin";
import { MarkedText } from "@/components/ui";
import { PARTNER_KINDS_AR } from "@/data/content";
import { useStore } from "@/lib/store";
import { cx } from "@/lib/format";
import { ctl, useDragSort } from "./controls";
import { countWord, PATCH, usePartners } from "./model";
import { ContentHead, G8Shell, H2, SAUD, SaveStrip, StripLink, type StripState } from "./shell";

interface Row {
  id: string;
  name: string;
  kindAr: string;
  url: string;
  visible: boolean;
  hasLogo: boolean;
  noteAr: string;
  logoSrc?: string;
  kind: "bank" | "developer" | "service";
  created?: boolean;
}

const PARTNERS_W = { one: "شريك واحد", two: "شريكان", few: "شركاء", many: "شريكاً" };
const COLS = "grid grid-cols-[36px_120px_minmax(0,1fr)_140px_minmax(0,1fr)_90px_90px] items-center gap-3.5";
const FINANCING_KINDS = ["بنك", "جهة تنظيمية"];
/** The placeholder logo widths of the «من نحن» preview (110 · 90 · 120, as the board). */
const LOGO_W = ["w-[110px]", "w-[90px]", "w-[120px]"];

export function PartnersPage() {
  const merged = usePartners();
  const patch = useStore((s) => s.patch);
  const toast = useStore((s) => s.toast);
  const initial = useMemo<Row[]>(
    () => merged.map((p) => ({ id: p.id, name: p.name, kindAr: p.kindAr ?? "أخرى", url: p.url ?? "", visible: p.visible, hasLogo: !!p.hasLogo, noteAr: p.noteAr ?? "", kind: p.kind })),
    [merged],
  );
  const [saved, setSaved] = useState<Row[]>(initial);
  const [rows, setRows] = useState<Row[]>(initial);
  const [phase, setPhase] = useState<"edit" | "saved">("edit");
  const [deleting, setDeleting] = useState<Row | null>(null);
  const fileFor = useRef<string | null>(null);
  const file = useRef<HTMLInputElement>(null);

  const dirty = JSON.stringify(rows) !== JSON.stringify(saved);
  const state: StripState = phase === "saved" ? "saved" : dirty ? "dirty" : "clean";
  const visibleRows = rows.filter((r) => r.visible && r.hasLogo);
  const hypothetical = rows.filter((r) => r.hasLogo && FINANCING_KINDS.includes(r.kindAr)).length;

  const ids = rows.map((r) => r.id);
  const { rowRef, handleProps, dragging } = useDragSort(ids, (next) => setRows((prev) => next.map((id) => prev.find((r) => r.id === id)!)));
  const update = (id: string, data: Partial<Row>) => {
    setPhase("edit");
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
  };

  const pickLogo = (id: string) => {
    fileFor.current = id;
    file.current?.click();
  };
  const onFile = (f?: File) => {
    const id = fileFor.current;
    if (!f || !id) return;
    update(id, { hasLogo: true, logoSrc: URL.createObjectURL(f), noteAr: rows.find((r) => r.id === id)?.noteAr === "لا شعار بعد" ? "" : (rows.find((r) => r.id === id)?.noteAr ?? "") });
    toast(`رُفع شعار «${rows.find((r) => r.id === id)?.name}» · معاينة محلية، لم يُرسل شيء`, { kind: "ok" });
  };
  const add = () => {
    const id = `p-new-${Date.now().toString(36)}`;
    setPhase("edit");
    setRows((prev) => [...prev, { id, name: "شريك جديد", kindAr: "أخرى", url: "", visible: false, hasLogo: false, noteAr: "لا شعار بعد", kind: "service", created: true }]);
  };
  const save = () => {
    for (const r of rows) patch(PATCH.partner, r.id, { visible: r.visible && r.hasLogo, kindAr: r.kindAr, url: r.url, hasLogo: r.hasLogo });
    setSaved(rows);
    setPhase("saved");
    toast(visibleRows.length ? "حُفظت الشركاء · الكتلة ظاهرة في «من نحن»" : "حُفظت الشركاء · الكتلة ما زالت مخفية", { kind: "ok", action: { label: "معاينة من نحن", href: "/about" } });
    setTimeout(() => setPhase("edit"), 6000);
  };

  return (
    <G8Shell user={SAUD} mainClassName="pb-0 md:pb-0">
      <ContentHead
        trail="الشركاء والتمويل"
        title="الشركاء والتمويل"
        subtitle="الشعارات تُرفع من ملفات الشركاء الرسمية فقط، لا تُولَّد. كتلة «شركاؤنا وجهات التمويل» في صفحة من نحن تظهر فقط إذا كان شعار واحد على الأقل مرئياً"
        actions={
          <button type="button" onClick={add} className="flex h-10 cursor-pointer items-center bg-ink px-4 text-label font-extrabold text-paper cut-s motion-hover transition-colors hover:bg-ink-2">
            + شريك
          </button>
        }
      />
      <input ref={file} type="file" accept="image/png,image/svg+xml" className="hidden" aria-hidden tabIndex={-1} onChange={(e) => onFile(e.target.files?.[0] ?? undefined)} />

      {visibleRows.length === 0 && (
        <div role="note" className="flex items-start gap-3 border-2 border-gold bg-cream-focus px-4 py-3 text-label font-normal">
          <span aria-hidden className="hex-point mt-1 size-3 shrink-0 bg-gold" />
          <span>
            <strong className="font-extrabold">الكتلة مخفية على الموقع الآن.</strong>{" "}
            <MarkedText text={`${countWord(rows.length, PARTNERS_W)} مُدخلون، كلهم بوضع «مخفي» حتى تصل الموافقات الكتابية على استخدام الشعارات [للتأكيد]. فعّل أي شعار وستظهر الكتلة فوراً.`} />
          </span>
        </div>
      )}

      <div className="overflow-x-auto border-interactive bg-paper">
        <div className="min-w-[900px]">
          <div className={cx(COLS, "border-b-[1.5px] border-ink bg-sand px-4 py-2.5 text-caption font-extrabold text-muted")}>
            <span />
            <span>الشعار</span>
            <span>الاسم</span>
            <span>النوع</span>
            <span>الرابط</span>
            <span>مرئي</span>
            <span />
          </div>
          {rows.map((r) => (
            <div key={r.id} ref={rowRef(r.id)} className={cx(COLS, "relative border-line px-4 py-3 text-label font-normal [&+&]:border-t", dragging === r.id ? "bg-sand outline-2 -outline-offset-2 outline-solid outline-gold" : "bg-paper")}>
              {dragging === r.id && <span aria-hidden className="absolute inset-x-4 -bottom-0.5 z-10 h-[3px] bg-gold" />}
              <DragHandle {...handleProps(r.id, "اسحب")} />
              {r.hasLogo ? (
                <button type="button" onClick={() => pickLogo(r.id)} aria-label={`استبدال شعار ${r.name}`} className="flex h-12 cursor-pointer flex-col items-center justify-center overflow-hidden border border-line bg-paper px-2 text-center text-caption font-extrabold leading-snug text-muted hover:bg-cream">
                  {r.logoSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element -- a local preview of the partner's own file
                    <img src={r.logoSrc} alt="" className="max-h-10 max-w-full object-contain grayscale" />
                  ) : (
                    <>
                      <span>شعار PNG</span>
                      <span className="max-w-full">{shortName(r)}</span>
                    </>
                  )}
                </button>
              ) : (
                <button type="button" onClick={() => pickLogo(r.id)} className="flex h-12 cursor-pointer flex-col items-center justify-center border-[1.5px] border-dashed border-ink px-2 text-center text-caption font-extrabold leading-snug text-ink hover:bg-cream">
                  <span>ارفع PNG أو SVG</span>
                  <span>بخلفية شفافة</span>
                </button>
              )}
              <span className="flex min-w-0 flex-col gap-0.5">
                {r.created ? (
                  <input value={r.name} onChange={(e) => update(r.id, { name: e.target.value })} aria-label="اسم الشريك" className={ctl("admin", "h-9 text-label")} />
                ) : (
                  <span className="font-extrabold">{r.name}</span>
                )}
                {r.noteAr && (
                  <span className="text-caption font-semibold leading-snug text-muted">
                    <MarkedText text={r.noteAr} />
                  </span>
                )}
              </span>
              <select value={r.kindAr} onChange={(e) => update(r.id, { kindAr: e.target.value })} aria-label={`نوع ${r.name}`} className={ctl("admin", "h-9 cursor-pointer px-2.5 text-[12px] font-bold")}>
                {PARTNER_KINDS_AR.map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
              <input value={r.url} onChange={(e) => update(r.id, { url: e.target.value })} placeholder="https://" dir="ltr" aria-label={`رابط ${r.name}`} className={ctl("admin", "h-9 px-2.5 text-[12px] font-normal")} />
              <span>
                <Switch checked={r.visible && r.hasLogo} disabled={!r.hasLogo} onChange={(v) => update(r.id, { visible: v })} aria-label={r.hasLogo ? "مرئي" : "مرئي، معطّل بلا شعار"} />
              </span>
              <span className="flex justify-end">
                {r.hasLogo ? (
                  <button type="button" onClick={() => pickLogo(r.id)} className="flex h-[34px] w-full cursor-pointer items-center justify-center border-[1.5px] border-ink bg-paper px-3 text-[12px] font-extrabold hover:bg-sand">
                    استبدال
                  </button>
                ) : (
                  <button type="button" onClick={() => setDeleting(r)} className="flex h-[34px] w-full cursor-pointer items-center justify-center border-[1.5px] border-ink bg-paper px-3 text-[12px] font-extrabold hover:bg-sand">
                    حذف
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[12px] text-muted">قواعد: الشعار ملف حقيقي من الشريك، ارتفاعه 40px على الموقع، تدرّج رمادي بلا ألوان، لا يُظهر «مرئي» ما دام الشعار فارغاً. ترتيب الصفوف هو ترتيب الظهور.</p>

      <section className="flex flex-col gap-3" aria-label="معاينة كتلة «من نحن»">
        <H2 aside={`كما ستظهر لو فُعّلت ${countWord(hypothetical, { one: "شعار واحد", two: "شعاران", few: "شعارات", many: "شعاراً" })}`}>معاينة كتلة «من نحن»</H2>
        <div className="grid gap-4 md:grid-cols-2">
          <AboutBlock status={`الحالة: ${hypothetical} مرئية`} logos={Array.from({ length: hypothetical }, (_, i) => ({ key: `h${i}`, label: `شعار ${i + 1}` }))} />
          {visibleRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3.5 border-[1.5px] border-dashed border-ink bg-paper px-6 py-5.5 text-center">
              <span className="text-caption font-extrabold text-gold-text">الحالة الحالية: 0 مرئية</span>
              <span className="text-[14px] font-extrabold">الكتلة لا تُرسم أصلاً</span>
              <span className="max-w-[320px] text-[12px] leading-[1.6] text-muted">لا عنوان، لا مكان فارغ. قسم «آراء العملاء» يرتفع ليأخذ مكانها، وتختفي هذه الملاحظة من لوحة الإدارة أيضاً حين يصبح شعار واحد مرئياً.</span>
            </div>
          ) : (
            <AboutBlock status={`الحالة الحالية: ${visibleRows.length} مرئية`} logos={visibleRows.map((r) => ({ key: r.id, label: r.name, src: r.logoSrc }))} />
          )}
        </div>
      </section>

      <SaveStrip
        state={state}
        message={dirty ? "تغييرات غير محفوظة في الشركاء" : undefined}
        onDiscard={() => setRows(saved)}
        links={<StripLink href="/about">معاينة من نحن</StripLink>}
        onSave={save}
        savedText="حُفظت الشركاء ·"
        openHref="/about"
        openLabel="معاينة من نحن"
      />

      <Dialog open={!!deleting} onClose={() => setDeleting(null)} title={deleting ? `حذف «${deleting.name}»؟` : ""} confirmLabel="احذف" destructive onConfirm={() => {
        if (!deleting) return;
        setRows((prev) => prev.filter((r) => r.id !== deleting.id));
        toast(`حُذف «${deleting.name}» · احفظ لتثبيت الحذف`, { kind: "info" });
        setDeleting(null);
      }}>
        يُزال الصف من القائمة. لا يظهر على الموقع لأنه بلا شعار.
      </Dialog>
    </G8Shell>
  );
}

function AboutBlock({ status, logos }: { status: string; logos: { key: string; label: string; src?: string }[] }) {
  return (
    <div className="flex flex-col gap-3.5 border-interactive bg-paper px-6 py-5.5">
      <span className="text-caption font-extrabold text-gold-text">{status}</span>
      <span className="text-[18px] font-extrabold">شركاؤنا وجهات التمويل</span>
      <span className="text-[12px] leading-[1.6] text-ink-2">نعمل مع بنوك مرخّصة وجهات تنظيمية. الموافقة على التمويل بيد البنك، ونحن نجهّز الملف.</span>
      <div className="flex flex-wrap items-center gap-5 pt-1">
        {logos.map((l, i) => (
          <span key={l.key} className={cx("flex h-10 items-center justify-center overflow-hidden bg-slot px-3 text-[10px] font-extrabold text-muted", LOGO_W[i % LOGO_W.length])}>
            {l.src ? (
              // eslint-disable-next-line @next/next/no-img-element -- local preview of an uploaded partner logo
              <img src={l.src} alt={l.label} className="max-h-8 max-w-full object-contain grayscale" />
            ) : (
              <span className="truncate">{l.label}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

/** The short name under «شعار PNG» on the logo tile («بنك 1», «المطوّر»). */
function shortName(r: Row): string {
  if (r.kind === "developer") return "المطوّر";
  return r.name.replace(/^بنك شريك (\d+)$/, "بنك $1");
}
