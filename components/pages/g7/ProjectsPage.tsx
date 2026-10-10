"use client";
// /admin/projects (Admin-Projects-D): published project, the automatic «وحدات المُلّاك» group, the draft; display
// order with drag handles (drag or arrow keys, in memory). Counts come from the selectors and the store.
import { useState, type DragEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { AdminLinkButton, Dialog, DragHandle } from "@/components/admin";
import { ImageSlot } from "@/components/ui";
import { approvals } from "@/data/approvals";
import { districtAr } from "@/data/districts";
import { projects } from "@/data/projects";
import { effectiveApprovalStatus, projectStats } from "@/data/selectors";
import type { Project } from "@/data/types";
import { usePatch, useStore, useUnitOverrides } from "@/lib/store";
import { cx, plural } from "@/lib/format";
import { G7Shell } from "./shell";
import { deliveryShort } from "./util";

const CUT = "[clip-path:polygon(0_0,100%_0,100%_100%,30px_100%,0_calc(100%-52px))]";
const buildingsWord = (n: number) => plural(n, { one: "عمارة واحدة", two: "عمارتان", few: "عمارات", many: "عمارة" });
const modelsWord = (n: number) => (n === 0 ? "0 نماذج" : plural(n, { one: "نموذج واحد", two: "نموذجان", few: "نماذج", many: "نموذجاً" }));
const photosWord = (n: number) => plural(n, { one: "صورة واحدة", two: "صورتان", few: "صور", many: "صورة" });

export function ProjectsPage() {
  const overrides = useUnitOverrides();
  const approvalsOv = useStore((s) => s.approvals);
  const createdFromApprovals = useStore((s) => s.patches.approvalUnit);
  const deleted = useStore((s) => s.patches.projectDeleted);
  const patch = useStore((s) => s.patch);
  const toast = useStore((s) => s.toast);
  const orderPatch = usePatch<{ ids: string[] }>("projectOrder", "list");
  const [del, setDel] = useState<Project | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  const live = projects.filter((p) => !deleted?.[p.id]);
  const cards = [...live.filter((p) => p.published && !p.autoGroup), ...live.filter((p) => p.autoGroup), ...live.filter((p) => !p.published && !p.autoGroup)];
  const listed = live.filter((p) => !p.autoGroup);
  const base = [...listed].sort((a, b) => (a.order ?? 99) - (b.order ?? 99)).map((p) => p.id);
  const saved = orderPatch?.ids?.filter((id) => base.includes(id)) ?? [];
  const order = [...saved, ...base.filter((id) => !saved.includes(id))];
  const openCount = approvals.filter((a) => ["new", "awaiting-photos"].includes(effectiveApprovalStatus(a, approvalsOv))).length;
  const ownerUnits = Object.entries(createdFromApprovals ?? {}).filter(([id, v]) => approvalsOv[id] === "approved" && (v as { projectId?: string }).projectId === "ind").length;

  const published = live.filter((p) => p.published).length;
  const drafts = live.filter((p) => !p.published).length;
  const subtitle = `${plural(published, { one: "مشروع منشور", two: "مشروعان منشوران", few: "مشاريع منشورة", many: "مشروعاً منشوراً" })}، ${plural(drafts, { one: "مشروع في المسودة", two: "مشروعان في المسودة", few: "مشاريع في المسودة", many: "مشروعاً في المسودة" })} · المشاريع تجمع العمارات والنماذج وتظهر في صفحة «المشاريع» وفلتر النتائج`;

  function move(id: string, to: number) {
    const ids = order.filter((x) => x !== id);
    ids.splice(Math.max(0, Math.min(ids.length, to)), 0, id);
    patch("projectOrder", "list", { ids });
    toast("حُفظ ترتيب الظهور");
  }

  return (
    <G7Shell
      active="projects"
      title="المشاريع"
      subtitle={drafts || published ? subtitle : undefined}
      actions={
        <AdminLinkButton href="/admin/projects/new" variant="ink" size="md">
          + مشروع جديد
        </AdminLinkButton>
      }
    >
      <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(380px,100%),1fr))]">
        {cards.map((p) => {
          const draft = !p.published;
          const st = projectStats(p.id, overrides);
          return (
            <article key={p.id} className={cx("flex flex-col bg-paper", draft ? "border-[1.5px] border-dashed border-ink" : "border-interactive")}>
              <div className={cx("relative h-[150px] overflow-hidden", CUT, draft || !p.images.length ? "bg-sand" : "bg-slot")}>
                {p.images[0] ? (
                  <ImageSlot slotId={p.images[0]} tier="generated" showId={false} className="absolute inset-0 h-full" />
                ) : draft ? (
                  <span className="flex h-full items-center justify-center text-[12px] text-muted">لا صور بعد</span>
                ) : null}
                {!draft && <span className="absolute start-2.5 top-2.5 bg-ink px-2 py-1 text-caption font-bold text-paper">منشور</span>}
                {p.images.length > 0 && <span className="absolute bottom-2 end-10 bg-paper px-1.5 py-0.5 text-caption font-bold">{`تعبيرية · ${photosWord(p.images.length)}`}</span>}
              </div>
              <div className="flex flex-1 flex-col gap-2 px-5 py-4">
                <span className="text-[12px] font-bold text-gold-text">
                  <span dir="ltr">{p.code}</span> · {p.autoGroup ? "وحدات فردية" : `${p.id === "rwd-01" ? "حي " : ""}${districtAr(p.districtSlug)}، جدة`}
                </span>
                <span className="flex items-center gap-2 text-[20px] font-extrabold">
                  {p.nameAr}
                  {draft && <span className="border-interactive px-1.5 py-0.5 text-[12px] font-bold">مسودة</span>}
                </span>
                <span className="text-[12px] leading-relaxed text-muted">
                  {p.autoGroup ? (
                    (p.adminNoteAr ?? "").replace(/\d+ حالياً/, `${ownerUnits} حالياً`)
                  ) : draft ? (
                    p.adminNoteAr
                  ) : (
                    <>
                      {buildingsWord(p.buildings.length)} · {modelsWord(st.listed)} · {st.available} متاحة · {st.sold} مباعة · {p.statusAr} · تسليم {deliveryShort(p.deliveryLabel.value)}
                    </>
                  )}
                </span>
                {!draft && !p.autoGroup && (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {p.features.map((f) => (
                      <span key={f} className="border-hairline px-2 py-1 text-caption font-semibold">
                        {f}
                      </span>
                    ))}
                    {p.tbcFields?.length ? <span className="border border-gold bg-cream-focus px-2 py-1 text-caption font-bold text-gold-text">{`${p.tbcFields.length} حقول للتأكيد`}</span> : null}
                  </div>
                )}
              </div>
              <div className={cx("grid border-t border-line text-[12px] font-bold", p.autoGroup || draft ? "grid-cols-2" : "grid-cols-3")}>
                {p.autoGroup ? (
                  <>
                    <CardLink href="/admin/approvals" first>{`طلبات الموافقة ${openCount}`}</CardLink>
                    <CardLink href="/admin/units">الوحدات</CardLink>
                  </>
                ) : draft ? (
                  <>
                    <CardLink href={`/admin/projects/${p.id}`} first>
                      أكمل المسودة
                    </CardLink>
                    <button type="button" onClick={() => setDel(p)} className="min-h-11 bg-paper text-muted hover:bg-sand hover:text-ink">
                      حذف
                    </button>
                  </>
                ) : (
                  <>
                    <CardLink href={`/admin/projects/${p.id}`} first>
                      تحرير
                    </CardLink>
                    <CardLink href="/admin/units">{`الوحدات ${st.listed}`}</CardLink>
                    <CardLink href={`/projects/${p.slug}`}>معاينة الصفحة</CardLink>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <section className="flex flex-col border-interactive bg-paper" aria-labelledby="order-h">
        <h2 id="order-h" className="border-b border-line px-5 py-4 text-[14px] font-extrabold">
          ترتيب الظهور في صفحة «المشاريع» والفلاتر
        </h2>
        <ol>
          {order.map((id, i) => {
            const p = live.find((x) => x.id === id)!;
            return (
              <li
                key={id}
                draggable
                onDragStart={(e: DragEvent) => {
                  setDragging(id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => setDragging(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => dragging && dragging !== id && move(dragging, i)}
                className={cx("flex items-center gap-3 border-b border-line px-5 py-3 text-label last:border-b-0", !p.published && "text-muted", dragging === id && "bg-sand")}
              >
                <DragHandle
                  dragging={dragging === id}
                  aria-label={`مقبض السحب · ${p.nameAr}`}
                  onKeyDown={(e: KeyboardEvent) => {
                    if (e.key === "ArrowUp" && i > 0) move(id, i - 1);
                    if (e.key === "ArrowDown" && i < order.length - 1) move(id, i + 1);
                  }}
                />
                <span className="font-bold">
                  {i + 1} · {p.nameAr}
                </span>
                <span className="ms-auto text-caption text-muted">{p.published ? `منشور${p.featured ? " · يظهر كمشروع مميز في الرئيسية" : ""}` : "مسودة · لا يُعرض"}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <Dialog
        open={!!del}
        onClose={() => setDel(null)}
        title={`حذف ${del?.nameAr ?? ""} نهائياً؟`}
        confirmLabel={`احذف ${del?.code ?? ""}`}
        destructive
        confirmCode={del?.code}
        onConfirm={() => {
          if (!del) return;
          patch("projectDeleted", del.id, { at: "2026-10-10" });
          toast(`حُذف ${del.nameAr}`);
          setDel(null);
        }}
      >
        <p className="text-label font-normal leading-relaxed text-ink-2">لا يمكن التراجع.</p>
      </Dialog>
    </G7Shell>
  );
}

function CardLink({ href, first, children }: { href: string; first?: boolean; children: string }) {
  return (
    <Link href={href} className={cx("flex min-h-11 items-center justify-center border-e border-line px-2 text-ink last:border-e-0 hover:bg-sand", first && "bg-sand")}>
      {children}
    </Link>
  );
}
