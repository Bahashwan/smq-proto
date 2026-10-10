"use client";
// /admin/content/faq (Admin-FAQ-D): the questions in site order with drag reordering (pointer + arrow keys on the
// handle), publish switches that stay disabled while an answer carries [مسودة إجابة], and the editor under the list
// for ?edit=<id> (faq-05 on the board). Edits, order, deletions and new questions live in the store (g8.faq).
import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DragHandle, Switch } from "@/components/admin";
import { Mark, MarkedText } from "@/components/ui";
import { FAQ_PAGES } from "@/data/content";
import type { FaqItem } from "@/data/types";
import { setQuery, useQuery } from "@/lib/location";
import { useStore } from "@/lib/store";
import { cx } from "@/lib/format";
import { ctl, Field, INPUT_H, useDragSort } from "./controls";
import { countWord, faqSummary, PATCH, useFaq, W } from "./model";
import { ContentHead, G8Shell, LangSwitch, NOURA } from "./shell";

const DRAFT_RE = /\[مسودة إجابة\]/;
const FIRST = 8;
const COLS = "grid grid-cols-[36px_minmax(0,1fr)_150px_110px_90px] items-center gap-3.5";

export function FaqPage() {
  const list = useFaq();
  const s = faqSummary(list);
  const q = useQuery();
  const editId = q.get("edit");
  const undoId = q.get("undo");
  const patch = useStore((st) => st.patch);
  const toast = useStore((st) => st.toast);
  const [all, setAll] = useState(false);
  const [deleting, setDeleting] = useState<FaqItem | null>(null);

  // «تراجع» from the deletion toast: restore the question and clean the URL
  useEffect(() => {
    if (!undoId) return;
    patch(PATCH.faq, undoId, { deleted: false });
    setQuery({ undo: null }, "replace");
    toast("أُعيد السؤال إلى القائمة", { kind: "info" });
  }, [undoId, patch, toast]);

  const ids = useMemo(() => list.map((f) => f.id), [list]);
  const setOrder = (next: string[]) => patch(PATCH.faqOrder, "list", { ids: next });
  const { rowRef, handleProps, dragging } = useDragSort(ids, setOrder);
  const dragStart = useRef<string>("");
  useEffect(() => {
    if (dragging) dragStart.current = ids.join();
    else if (dragStart.current && dragStart.current !== ids.join()) {
      dragStart.current = "";
      toast("حُفظ الترتيب الجديد · هو ترتيب الموقع", { kind: "ok" });
    } else dragStart.current = "";
    // ids are read at the moment the drag ends
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  const shown = all ? list : list.slice(0, FIRST);
  const rest = list.slice(FIRST);
  const restAllPublished = rest.every((f) => f.published && !f.draft);
  const editing = editId === "new" ? null : list.find((f) => f.id === editId) ?? null;

  const togglePublish = (f: FaqItem, v: boolean) => {
    patch(PATCH.faq, f.id, { published: v });
    toast(v ? `نُشر السؤال «${f.q}»` : `أُخفي السؤال «${f.q}» من الموقع`, { kind: "ok" });
  };
  const remove = (f: FaqItem) => {
    patch(PATCH.faq, f.id, { deleted: true });
    setQuery({ edit: null }, "replace");
    setDeleting(null);
    toast("حُذف السؤال", { kind: "info", action: { label: "تراجع", href: `/admin/content/faq?undo=${f.id}` } });
  };

  return (
    <G8Shell user={NOURA}>
      <ContentHead
        trail="الأسئلة الشائعة"
        title="الأسئلة الشائعة"
        subtitle={<MarkedText text={`${countWord(s.total, W.question)} · ${s.published} منشورة · ${s.drafts} بإجابة [مسودة إجابة] لا تُنشر حتى يؤكدها مدير. الترتيب هنا هو ترتيب الموقع، اسحب للتغيير`} />}
        actions={
          <button type="button" onClick={() => setQuery({ edit: "new" }, "replace")} className="flex h-10 cursor-pointer items-center bg-ink px-4 text-label font-extrabold text-paper cut-s motion-hover transition-colors hover:bg-ink-2">
            + سؤال جديد
          </button>
        }
      />

      <div className="overflow-x-auto border-interactive bg-paper">
        <div className="min-w-[820px]">
          <div className={cx(COLS, "border-b-[1.5px] border-ink bg-sand px-4 py-2.5 text-caption font-extrabold text-muted")}>
            <span />
            <span>السؤال والإجابة</span>
            <span>يظهر في</span>
            <span>منشور</span>
            <span />
          </div>
          {shown.map((f) => {
            const draft = f.draft || DRAFT_RE.test(f.a);
            const isDragging = dragging === f.id;
            return (
              <div key={f.id} ref={rowRef(f.id)} className={cx(COLS, "relative border-line px-4 py-3.5 text-label font-normal [&+&]:border-t", isDragging ? "bg-sand outline-2 -outline-offset-2 outline-solid outline-gold" : draft ? "bg-cream-focus" : editId === f.id ? "bg-cream" : "bg-paper")}>
                {/* the row being dragged: gold frame and the drop line under it (Admin-FAQ-D) */}
                {isDragging && <span aria-hidden className="absolute inset-x-4 -bottom-0.5 z-10 h-[3px] bg-gold" />}
                <DragHandle {...handleProps(f.id)} />
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-[14px] font-extrabold">
                    {f.q}
                    {draft && <Mark>[مسودة إجابة]</Mark>}
                  </span>
                  <span className="line-clamp-3 text-[12px] leading-[1.6] text-muted">
                    <MarkedText text={draft && !DRAFT_RE.test(f.a) ? `[مسودة إجابة] ${f.a}` : f.a} />
                  </span>
                </div>
                <span className="text-[12px]">{(f.pages ?? []).join(" · ")}</span>
                <span>
                  <Switch checked={f.published && !draft} disabled={draft} onChange={(v) => togglePublish(f, v)} aria-label={f.published && !draft ? "منشور" : "غير منشور"} />
                </span>
                <span className="flex justify-end">
                  <button type="button" onClick={() => setQuery({ edit: f.id }, "replace")} aria-label={`تحرير «${f.q}»`} className="flex h-[34px] w-full cursor-pointer items-center justify-center border-[1.5px] border-ink bg-paper px-3 text-[12px] font-extrabold motion-hover transition-colors hover:bg-sand">
                    تحرير
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-[12px] text-muted">
        {rest.length > 0 && (
          <>
            <button type="button" onClick={() => setAll((v) => !v)} aria-expanded={all} className="cursor-pointer text-muted underline-offset-2 hover:text-ink hover:underline">
              {all ? `عرض أول ${FIRST} فقط` : `و${countWord(rest.length, W.question)}${restAllPublished ? " منشورة" : ""} أخرى`}
            </button>{" "}
            ·{" "}
          </>
        )}
        <MarkedText text="مفتاح النشر معطّل ما دامت الإجابة تحمل [مسودة إجابة]؛ إزالة الوسم تحتاج صلاحية مدير" />
      </p>

      {(editing || editId === "new") && <FaqEditor key={editId ?? ""} item={editing} onClose={() => setQuery({ edit: null }, "replace")} onDelete={(f) => setDeleting(f)} />}

      <Dialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={deleting ? `حذف السؤال «${deleting.q}» نهائياً؟` : ""}
        confirmLabel="احذف السؤال"
        destructive
        onConfirm={() => deleting && remove(deleting)}
      >
        يختفي من الموقع ومن كل صفحة يظهر فيها. يمكنك التراجع خلال ثوانٍ من التنبيه.
      </Dialog>
    </G8Shell>
  );
}

function FaqEditor({ item, onClose, onDelete }: { item: FaqItem | null; onClose: () => void; onDelete: (f: FaqItem) => void }) {
  const patch = useStore((s) => s.patch);
  const toast = useStore((s) => s.toast);
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [qAr, setQAr] = useState(item?.q ?? "");
  const [aAr, setAAr] = useState(item?.a ?? "");
  const [qEn, setQEn] = useState(item?.qEn ?? "");
  const [aEn, setAEn] = useState(item?.aEn ?? "");
  const [pages, setPages] = useState<string[]>(item?.pages ?? []);
  const draft = DRAFT_RE.test(aAr);
  const [error, setError] = useState("");

  const save = (mode: "draft" | "confirm" | "publish") => {
    if (!qAr.trim() || !aAr.trim()) {
      setError("اكتب السؤال والإجابة قبل الحفظ");
      return;
    }
    const id = item?.id ?? `faq-new-${Date.now().toString(36)}`;
    const data = { q: qAr.trim(), a: aAr.trim(), qEn, aEn, pages, draft, ...(item ? {} : { created: true, order: 100 }), ...(mode === "publish" && !draft ? { published: true } : {}), ...(draft ? { published: false } : {}) };
    patch(PATCH.faq, id, data);
    toast(mode === "confirm" ? "حُفظت المسودة وأُرسل طلب التأكيد إلى سعود" : mode === "publish" ? `نُشر السؤال «${data.q}»` : "حُفظت مسودة السؤال", { kind: "ok" });
    onClose();
  };

  const q = lang === "ar" ? qAr : qEn;
  const a = lang === "ar" ? aAr : aEn;
  return (
    <section aria-label="تحرير سؤال" className="border-[1.5px] border-s-[6px] border-ink border-s-gold bg-paper">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-[1.5px] border-ink bg-sand px-4 py-3">
        <span className="text-[14px] font-extrabold">{item ? `تحرير · «${item.q}»` : "سؤال جديد"}</span>
        <LangSwitch value={lang} onChange={setLang} size="s" />
      </header>
      <div className="grid gap-4 p-4 md:grid-cols-2">
        <Field label="السؤال">
          <input value={q} dir={lang === "en" ? "ltr" : undefined} placeholder={lang === "en" ? qAr : undefined} onChange={(e) => (lang === "ar" ? setQAr : setQEn)(e.target.value)} className={ctl("admin", INPUT_H)} />
        </Field>
        <Field label="يظهر في" as="div">
          <span className="flex flex-wrap gap-2">
            {FAQ_PAGES.map((p) => {
              const on = pages.includes(p);
              return (
                <label key={p} className={cx("flex h-11 cursor-pointer items-center gap-2 border-[1.5px] border-ink px-3 text-label font-bold text-ink motion-hover transition-colors", on ? "bg-sand" : "bg-paper hover:bg-cream")}>
                  <input type="checkbox" checked={on} onChange={(e) => setPages((prev) => (e.target.checked ? [...prev, p] : prev.filter((x) => x !== p)))} className="size-4 accent-ink" />
                  {p}
                </label>
              );
            })}
          </span>
        </Field>
        <Field label="الإجابة" className="md:col-span-2" note={lang === "ar" && draft ? "الوسم [مسودة إجابة] في أول الإجابة يمنع النشر. محررة لا تستطيع حذفه؛ اطلبي التأكيد من سعود." : error || undefined} noteTone="gold">
          <textarea value={a} rows={4} dir={lang === "en" ? "ltr" : undefined} placeholder={lang === "en" ? aAr : undefined} onChange={(e) => (lang === "ar" ? setAAr : setAEn)(e.target.value)} className={ctl(lang === "ar" && draft ? "error" : "admin", "min-h-[120px] py-2.5 leading-relaxed")} />
        </Field>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t-[1.5px] border-ink px-4 py-3">
        {item ? (
          <button type="button" onClick={() => onDelete(item)} className="flex h-10 cursor-pointer items-center border-[1.5px] border-ink bg-paper px-4 text-label font-bold motion-hover transition-colors hover:bg-sand">
            حذف السؤال
          </button>
        ) : (
          <span />
        )}
        <span className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={onClose} className="flex h-10 cursor-pointer items-center border-[1.5px] border-ink bg-paper px-4 text-label font-bold motion-hover transition-colors hover:bg-sand">
            إلغاء
          </button>
          <button type="button" onClick={() => save("draft")} className="flex h-10 cursor-pointer items-center bg-ink px-4 text-label font-extrabold text-paper cut-s motion-hover transition-colors hover:bg-ink-2">
            حفظ المسودة
          </button>
          {draft ? (
            <button type="button" onClick={() => save("confirm")} className="flex h-10 cursor-pointer items-center bg-gold px-4 text-label font-extrabold text-ink cut-s motion-hover transition-colors hover:bg-gold-hover">
              اطلب التأكيد من سعود
            </button>
          ) : (
            <button type="button" onClick={() => save("publish")} className="flex h-10 cursor-pointer items-center bg-gold px-4 text-label font-extrabold text-ink cut-s motion-hover transition-colors hover:bg-gold-hover">
              نشر
            </button>
          )}
        </span>
      </footer>
    </section>
  );
}
