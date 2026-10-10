"use client";
// /admin/content/needs-confirmation (Admin-Pieces-D · 2): every [للتأكيد] and [مسودة إجابة] of the site in one list.
// «أكّد وأزل الوسم» removes the row in memory (store patch), so the hub button and this count drop together; the tax
// number cannot be confirmed while it is empty; the FAQ drafts open the FAQ editor.
import Link from "next/link";
import { EmptyState } from "@/components/admin";
import { MarkedText } from "@/components/ui";
import { useStore } from "@/lib/store";
import { cx } from "@/lib/format";
import { countWord, PATCH, useNeedsConfirmation, W } from "./model";
import { ContentHead, G8Shell, SAUD } from "./shell";
import { waitingLine } from "./ContentHubPage";

const COLS = "grid grid-cols-[1fr_1.6fr_150px_200px] items-center gap-3";
const SMALL_BTN = "inline-flex h-8 items-center px-3.5 text-[12px] font-bold no-underline motion-hover transition-colors";

export function NeedsConfirmationPage() {
  const { rows, count } = useNeedsConfirmation();
  const patch = useStore((s) => s.patch);
  const toast = useStore((s) => s.toast);

  const confirm = (id: string, field: string) => {
    patch(PATCH.nc, id, { confirmed: true });
    toast(`أُكِّد «${field}» وأُزيل الوسم من كل مكان يظهر فيه`, { kind: "ok" });
  };

  return (
    <G8Shell user={SAUD}>
      <ContentHead trail="يحتاج تأكيداً" title="قائمة «يحتاج تأكيداً»" subtitle={<MarkedText text="تجمع كل [للتأكيد] و[مسودة إجابة] من كل الصفحات · للمدير فقط" />} />

      {rows.length === 0 ? (
        <EmptyState icon="gold" title="لا عناصر بانتظار التأكيد" text={<MarkedText text="كل الوسوم أُكِّدت. تظهر هنا أي قيمة جديدة تحمل [للتأكيد] أو [مسودة إجابة]." />} action={<Link href="/admin/content" className="font-extrabold text-gold-text no-underline hover:underline">المحتوى والأسئلة</Link>} />
      ) : (
        <div className="overflow-x-auto border-interactive bg-paper">
          <div className="min-w-[860px]">
            <div className={cx(COLS, "border-b-[1.5px] border-ink bg-sand px-4 py-2.5 text-caption font-extrabold text-muted")}>
              <span>الحقل</span>
              <span>القيمة الحالية</span>
              <span>أين يظهر</span>
              <span />
            </div>
            {rows.map((r) => (
              <div key={r.id} className={cx(COLS, "border-line px-4 py-2.5 text-label font-normal [&+&]:border-t")}>
                <span className="font-extrabold">{r.kind === "draft" ? faqRowLabel(r.count ?? 0) : r.fieldAr}</span>
                <span className="font-bold text-gold-text">
                  {r.kind === "draft" ? (
                    <>
                      <MarkedText text="[مسودة إجابة]" /> × {r.count}
                    </>
                  ) : (
                    <MarkedText text={r.valueAr} />
                  )}
                </span>
                <span className="text-[12px]">{r.whereAr}</span>
                <span className="flex flex-wrap items-center justify-end gap-2">
                  {r.kind === "draft" ? (
                    <Link href={r.href ?? "/admin/content/faq"} className={cx(SMALL_BTN, "border-[1.5px] border-ink text-ink hover:bg-sand")}>
                      افتح الأسئلة
                    </Link>
                  ) : (
                    <>
                      <Link href={r.href ?? "/admin/content"} className={cx(SMALL_BTN, "border-[1.5px] border-ink text-ink hover:bg-sand")}>
                        تعديل
                      </Link>
                      {r.disabledReasonAr ? (
                        <button type="button" disabled className={cx(SMALL_BTN, "cursor-default border-[1.5px] border-ink bg-ink font-extrabold text-paper opacity-40")}>
                          {r.disabledReasonAr}
                        </button>
                      ) : (
                        <button type="button" onClick={() => confirm(r.id, r.fieldAr)} className={cx(SMALL_BTN, "cursor-pointer border-[1.5px] border-ink bg-ink font-extrabold text-paper hover:bg-ink-2")}>
                          أكّد وأزل الوسم
                        </button>
                      )}
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="text-caption font-normal leading-relaxed text-muted">
        {`${waitingLine(count).replace(" بانتظار التأكيد", "")}. «أكّد وأزل الوسم» يحذف الوسم من كل مكان يظهر فيه الحقل في خطوة واحدة ويسجّل في سجل الإجراءات. محرر يرى القائمة للقراءة فقط مع زر «اطلب التأكيد».`}
      </p>
    </G8Shell>
  );
}

/** «3 أسئلة شائعة» */
function faqRowLabel(n: number): string {
  if (n === 1) return "سؤال شائع واحد";
  if (n === 2) return "سؤالان شائعان";
  return `${countWord(n, W.question)} شائعة`;
}
