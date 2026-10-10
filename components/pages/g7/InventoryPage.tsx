"use client";
// /admin/units (Admin-Inventory-D). The ten units with the inline status select (store), selection with bulk actions
// (status, price, hide), search / project / status filters, the Excel export (a CSV download, nothing is sent),
// `?import=1` = the mapping + preview panel with the canned diff (data/units.ts importPreview; applying it changes the
// admin table in memory only), `?empty=1` = the empty state (presenter «Admin empty states»), `?sel=RZ-A,RZ-B`
// preselects rows (screen-map deep link). Units created by approving an owner submission appear as extra rows.
import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AdminButton,
  AdminLinkButton,
  DataTable,
  Dialog,
  EmptyState,
  IconSearch,
  ImportDiffRow,
  ImportMappingHead,
  ImportMappingRow,
  ImportPanel,
  ImportStat,
  ImportStats,
  PeriodToggle,
  type Column,
} from "@/components/admin";
import { Price } from "@/components/ui";
import { analytics } from "@/data/analytics";
import { projects } from "@/data/projects";
import { importPreview, unitByCode, units, UNIT_TYPE_AR } from "@/data/units";
import { effectiveUnitStatus, importDiffPct, isUnitHidden, TODAY, unitPpm } from "@/data/selectors";
import type { UnitStatus } from "@/data/types";
import { setQuery, useQuery } from "@/lib/location";
import { usePresenter } from "@/lib/presenter";
import { useStore, useUnitOverrides } from "@/lib/store";
import { cx, fmtDate, fmtNum, plural } from "@/lib/format";
import { G7Shell } from "./shell";
import { unitShort, unitsWord } from "./util";

type StatusValue = UnitStatus | "hidden";
type Filter = "all" | UnitStatus;
export interface InvRow {
  code: string;
  slug?: string;
  name: string;
  typeAr: string;
  beds: number | null;
  areaM2: number | null;
  priceSar: number;
  status: UnitStatus;
  hidden: boolean;
  views: number | null;
  whatsapp: number | null;
  note?: string;
  photos: { tier: "generated" | "real" | "typographic"; count: number } | null;
  updatedAt: string;
  projectId: string;
  created?: boolean;
}

const STATUS_OPTIONS: { value: StatusValue; label: string }[] = [
  { value: "available", label: "متاح" },
  { value: "reserved", label: "محجوز" },
  { value: "sold", label: "مباع" },
  { value: "hidden", label: "مخفي" },
];
const STATUS_WORD: Record<StatusValue, string> = { available: "متاح", reserved: "محجوز", sold: "مباع", hidden: "مخفي" };
const TIER_WORD = { generated: "تعبيرية", real: "فعلية", typographic: "طباعي" } as const;

/** Unit prices patched in memory (bulk price update, applied import). */
function usePricePatches(): Record<string, number> {
  const p = useStore((s) => s.patches.unitPrice);
  return useMemo(() => Object.fromEntries(Object.entries(p ?? {}).map(([k, v]) => [k, Number((v as { priceSar: number }).priceSar)])), [p]);
}

export function useInventoryRows(): InvRow[] {
  const overrides = useUnitOverrides();
  const prices = usePricePatches();
  const createdApprovals = useStore((s) => s.patches.approvalUnit);
  const createdUnits = useStore((s) => s.patches.createdUnit);
  const deleted = useStore((s) => s.patches.unitDeleted);
  const approvalsOv = useStore((s) => s.approvals);
  return useMemo(() => {
    const rows: InvRow[] = units.filter((u) => !deleted?.[u.code]).map((u) => {
      const wk = analytics.unitWeek[u.code];
      return {
        code: u.code,
        slug: u.slug,
        name: unitShort(u),
        typeAr: UNIT_TYPE_AR[u.type],
        beds: u.beds,
        areaM2: u.areaM2,
        priceSar: prices[u.code] ?? u.priceSar,
        status: effectiveUnitStatus(u, overrides),
        hidden: isUnitHidden(u, overrides),
        views: wk?.views ?? null,
        whatsapp: wk?.whatsapp ?? null,
        note: wk?.noteAr,
        photos: { tier: u.imageTier, count: u.images.length },
        updatedAt: prices[u.code] ? TODAY : u.updatedAt,
        projectId: u.projectId,
      };
    });
    for (const [id, v] of Object.entries(createdApprovals ?? {})) {
      if (approvalsOv[id] !== "approved") continue;
      const c = v as { code: string; titleAr: string; priceSar: number; status: UnitStatus; projectId: string };
      rows.push({ code: c.code, name: c.titleAr, typeAr: "من مالك", beds: null, areaM2: null, priceSar: c.priceSar, status: overrides.unitStatus[c.code] ?? c.status, hidden: !!overrides.unitHidden[c.code], views: 0, whatsapp: 0, photos: null, updatedAt: TODAY, projectId: c.projectId, created: true });
    }
    for (const v of Object.values(createdUnits ?? {})) {
      const c = v as { code: string; name?: string; typeAr?: string; beds: number | null; areaM2: number | null; priceSar: number; status?: UnitStatus; hidden?: boolean; projectId?: string };
      rows.push({
        code: c.code,
        name: c.name ?? `${c.code.split("-")[1]} · روز`,
        typeAr: c.typeAr ?? "شقة",
        beds: c.beds,
        areaM2: c.areaM2,
        priceSar: c.priceSar,
        status: overrides.unitStatus[c.code] ?? c.status ?? "available",
        hidden: overrides.unitHidden[c.code] ?? c.hidden ?? true,
        views: 0,
        whatsapp: 0,
        photos: null,
        updatedAt: TODAY,
        projectId: c.projectId ?? "rwd-01",
        created: true,
      });
    }
    return rows;
  }, [overrides, prices, createdApprovals, createdUnits, deleted, approvalsOv]);
}

export function InventoryPage() {
  const q = useQuery();
  const { state } = usePresenter();
  const rows = useInventoryRows();
  const setUnitStatus = useStore((s) => s.setUnitStatus);
  const setUnitHidden = useStore((s) => s.setUnitHidden);
  const toast = useStore((s) => s.toast);
  const patch = useStore((s) => s.patch);

  const showImport = q.get("import") === "1";
  const empty = state.empty;
  const [search, setSearch] = useState("");
  const [projectId, setProjectId] = useState("rwd-01");
  const [filter, setFilter] = useState<Filter>("all");
  const [sel, setSel] = useState<string[] | null>(null);
  const selected = sel ?? (q.get("sel")?.split(",").filter(Boolean) ?? []);
  const [dialog, setDialog] = useState<null | "status" | "price" | "hide">(null);
  const [bulkStatus, setBulkStatus] = useState<UnitStatus>("reserved");
  const [bulkPct, setBulkPct] = useState("2");

  useEffect(() => {
    if (showImport) requestAnimationFrame(() => document.getElementById("import")?.scrollIntoView({ block: "start" }));
  }, [showImport]);

  const projectRows = rows.filter((r) => (projectId === "ind" ? r.projectId === "ind" : r.projectId !== "ind"));
  const counts = {
    all: projectRows.length,
    available: projectRows.filter((r) => r.status === "available").length,
    reserved: projectRows.filter((r) => r.status === "reserved").length,
    sold: projectRows.filter((r) => r.status === "sold").length,
  };
  const needle = search.trim().toLowerCase();
  const visible = projectRows.filter((r) => (filter === "all" || r.status === filter) && (!needle || `${r.code} ${r.name} ${r.typeAr}`.toLowerCase().includes(needle)));
  const topViews = [...rows].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 2).map((r) => r.code);
  const projectCount = new Set(units.map((u) => u.projectId)).size;

  function saveStatus(r: InvRow, v: StatusValue) {
    if (v === "hidden") setUnitHidden(r.code, true);
    else {
      setUnitHidden(r.code, false);
      setUnitStatus(r.code, v);
    }
    toast(`حُفظت الوحدة ${r.code} · ${STATUS_WORD[v]}`, r.slug ? { action: { label: "معاينة", href: `/units/${r.slug}` } } : undefined);
  }
  function exportCsv() {
    const head = ["code", "model", "type", "beds", "area_m2", "price_sar", "unit_status", "updated"];
    const lines = rows.map((r) => [r.code, r.name, r.typeAr, r.beds ?? "", r.areaM2 ?? "", r.priceSar, r.hidden ? "hidden" : r.status, r.updatedAt].join(","));
    download("smq-units.csv", [head.join(","), ...lines].join("\n"));
    toast("صُدّر ملف الوحدات · smq-units.csv");
  }
  function openImport() {
    setQuery({ import: "1" }, "push");
  }

  const columns: Column<InvRow>[] = [
    { key: "code", label: "الكود", width: "72px", bold: true, ltr: true, render: (r) => <span className="font-bold">{r.code}</span> },
    { key: "name", label: "النموذج · العمارة", width: "minmax(110px,1.2fr)", render: (r) => <span className="font-extrabold text-ink">{r.name}</span> },
    { key: "type", label: "النوع", width: "70px", className: "font-normal", render: (r) => r.typeAr },
    { key: "beds", label: "غرف", width: "44px", className: "font-normal", render: (r) => (r.beds ?? "—") },
    { key: "area", label: "م²", width: "64px", className: "font-normal", render: (r) => <span className="tnum">{r.areaM2 !== null ? r.areaM2.toFixed(2) : "—"}</span> },
    {
      key: "price",
      label: "السعر",
      width: "92px",
      render: (r) => (
        <span className="font-extrabold tnum">
          <Price value={r.priceSar} sign={false} className={cx(r.status === "sold" && "line-through")} />
        </span>
      ),
    },
    { key: "ppm", label: "للمتر", width: "60px", className: "font-normal", render: (r) => <span className="tnum">{r.areaM2 ? fmtNum(unitPpm({ priceSar: r.priceSar, areaM2: r.areaM2 })) : "—"}</span> },
    {
      key: "status",
      label: "الحالة (تحرير مباشر)",
      width: "112px",
      render: (r) => {
        const v: StatusValue = r.hidden ? "hidden" : r.status;
        return (
          <select
            aria-label={`حالة ${r.code}`}
            value={v}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => saveStatus(r, e.target.value as StatusValue)}
            className={cx(
              "h-8 min-w-[68px] px-1.5 text-[12px] font-bold",
              v === "sold" ? "border-interactive bg-ink text-paper" : v === "hidden" ? "border-[1.5px] border-line bg-cream text-muted" : "border-[1.5px] border-gold bg-paper text-ink",
            )}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        );
      },
    },
    {
      key: "views",
      label: "مشاهدات · واتساب · 7 أيام",
      width: "minmax(120px,1fr)",
      className: "font-normal",
      render: (r) => (r.views === null ? "—" : <span className={cx("tnum", topViews.includes(r.code) && "font-extrabold")}>{`${r.views} · ${r.whatsapp}${r.note ? ` (${r.note})` : ""}`}</span>),
    },
    {
      key: "photos",
      label: "الصور",
      width: "80px",
      render: (r) =>
        r.photos ? (
          <span className={cx("inline-block px-1.5 py-0.5 text-caption", r.photos.tier === "real" ? "bg-ink text-paper" : cx("border-hairline bg-sand", r.status === "sold" || r.hidden ? "text-muted" : "text-ink"))}>
            {TIER_WORD[r.photos.tier]} {r.photos.count}
          </span>
        ) : (
          <span className="text-caption text-muted">بلا صور</span>
        ),
    },
    { key: "updated", label: "آخر تحديث", width: "84px", render: (r) => <span className="text-muted tnum">{fmtDate(r.updatedAt)}</span> },
  ];

  const header = (
    <div className="flex flex-wrap items-center gap-2">
      <AdminButton variant="outline" size="md" onClick={exportCsv}>
        تصدير Excel
      </AdminButton>
      <AdminButton variant="outline" size="md" onClick={openImport} aria-expanded={showImport} aria-controls="import">
        استيراد من Excel
      </AdminButton>
      <AdminLinkButton href="/admin/units/new" variant="ink" size="md">
        + وحدة جديدة
      </AdminLinkButton>
    </div>
  );
  const last = importPreview.lastImport;
  const subtitle = empty
    ? "0 وحدات"
    : `${unitsWord(rows.filter((r) => !r.created).length)} في ${projectCount === 1 ? "مشروع واحد" : plural(projectCount, { one: "مشروع واحد", two: "مشروعين", few: "مشاريع", many: "مشروعاً" })} · آخر استيراد من Excel: ${fmtDate(last.date)}، ${plural(last.rows, { one: "صف واحد", two: "صفان", few: "صفوف", many: "صفاً" })}، ${last.errors === 0 ? "0 أخطاء" : plural(last.errors, { one: "خطأ واحد", two: "خطآن", few: "أخطاء", many: "خطأً" })}`;

  return (
    <G7Shell active="units" phoneActive="units" title="الوحدات" subtitle={subtitle} actions={header}>
      {empty ? (
        <EmptyState
          title="لا وحدات بعد"
          text="ارفع ملف Excel بالنماذج والأسعار، أو أضف وحدة يدوياً. الموقع يعرض «قريباً» في النتائج حتى تُنشر أول وحدة."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <AdminButton variant="ink" size="md" onClick={openImport}>
                استيراد Excel
              </AdminButton>
              <AdminLinkButton href="/admin/units/new" variant="outline" size="md">
                + وحدة يدوياً
              </AdminLinkButton>
            </div>
          }
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex h-10 items-center gap-2 border-interactive bg-paper px-3 text-label font-normal">
              <IconSearch size={16} />
              <span className="sr-only">ابحث في الوحدات</span>
              <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="كود، نموذج، عمارة" className="w-[200px] max-w-[48vw] bg-transparent text-label font-normal outline-none" />
            </label>
            <select aria-label="المشروع" value={projectId} onChange={(e) => setProjectId(e.target.value)} className="h-10 border-interactive bg-paper px-3 text-label">
              {projects
                .filter((p) => p.id === "rwd-01" || p.id === "ind")
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id === "ind" ? "وحدات فردية" : p.nameAr}
                  </option>
                ))}
            </select>
            <PeriodToggle
              label="الحالة"
              value={filter}
              onChange={(v) => setFilter(v as Filter)}
              options={[
                { value: "all", label: `الكل ${counts.all}` },
                { value: "available", label: `متاح ${counts.available}` },
                { value: "reserved", label: `محجوز ${counts.reserved}` },
                { value: "sold", label: `مباع ${counts.sold}` },
              ]}
            />
            {selected.length > 0 && (
              <span className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted" aria-live="polite">
                محدد: {selected.length} ·
                <BulkLink onClick={() => setDialog("status")}>تغيير الحالة</BulkLink>·
                <BulkLink onClick={() => setDialog("price")}>تحديث السعر</BulkLink>·
                <BulkLink onClick={() => setDialog("hide")}>إخفاء من الموقع</BulkLink>
              </span>
            )}
          </div>

          <DataTable
            label="الوحدات"
            columns={columns}
            rows={visible}
            rowKey={(r) => r.code}
            selectable
            selected={selected}
            onSelectionChange={(k) => setSel(k)}
            rowState={(r) => ({ selected: selected.includes(r.code), muted: r.status === "sold" || r.hidden })}
            actions={(r) =>
              r.slug ? (
                <Link href={`/admin/units/${r.slug}`} className="text-[12px] font-bold text-gold-text hover:text-ink hover:underline" onClick={(e) => e.stopPropagation()}>
                  تحرير
                </Link>
              ) : (
                <span className="text-caption text-muted">جديد</span>
              )
            }
            actionsWidth="52px"
            minWidth={1000}
            dense
            empty={<p className="px-4 py-6 text-label font-normal text-muted">لا وحدات تطابق البحث.</p>}
          />
        </>
      )}

      {showImport && <ImportBlock onClose={() => setQuery({ import: null }, "replace")} />}

      <Dialog
        open={dialog === "status"}
        onClose={() => setDialog(null)}
        title={`تغيير الحالة · ${selected.length}`}
        confirmLabel="تطبيق"
        onConfirm={() => {
          selected.forEach((c) => {
            setUnitHidden(c, false);
            setUnitStatus(c, bulkStatus);
          });
          toast(`حُفظت ${unitsWord(selected.length)} · ${STATUS_WORD[bulkStatus]}`);
          setDialog(null);
        }}
      >
        <label className="flex flex-col gap-2 text-[12px] font-bold text-muted">
          الحالة
          <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value as UnitStatus)} className="h-10 border-interactive bg-paper px-3 text-label text-ink">
            {STATUS_OPTIONS.filter((o) => o.value !== "hidden").map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </Dialog>
      <Dialog
        open={dialog === "price"}
        onClose={() => setDialog(null)}
        title={`تحديث السعر · ${selected.length}`}
        confirmLabel="تطبيق"
        onConfirm={() => {
          const pct = parseFloat(bulkPct.replace(",", ".")) || 0;
          selected.forEach((c) => {
            const r = rows.find((x) => x.code === c);
            if (r) patch("unitPrice", c, { priceSar: Math.round((r.priceSar * (1 + pct / 100)) / 1000) * 1000 });
          });
          toast(`حُدّث سعر ${unitsWord(selected.length)} · ${pct > 0 ? "+" : ""}${pct}%`);
          setDialog(null);
        }}
      >
        <label className="flex flex-col gap-2 text-[12px] font-bold text-muted">
          نسبة التغيير %
          <input dir="ltr" inputMode="decimal" value={bulkPct} onChange={(e) => setBulkPct(e.target.value)} className="h-10 border-interactive bg-paper px-3 text-right text-label text-ink" />
        </label>
      </Dialog>
      <Dialog
        open={dialog === "hide"}
        onClose={() => setDialog(null)}
        title={`إخفاء من الموقع · ${selected.length}`}
        confirmLabel="إخفاء"
        onConfirm={() => {
          selected.forEach((c) => setUnitHidden(c, true));
          toast(`أُخفيت ${unitsWord(selected.length)} من الموقع`);
          setSel([]);
          setDialog(null);
        }}
      >
        <p className="text-label font-normal text-ink-2">{selected.join("، ")}</p>
      </Dialog>
    </G7Shell>
  );
}

function BulkLink({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="min-h-8 font-bold text-gold-text underline hover:text-ink">
      {children}
    </button>
  );
}

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob(["﻿" + text], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const FIELDS = ["model_code (مفتاح)", "price_sar", "area_m2", "unit_status", "delivery_date", "beds", "baths", "floor", "orientation"];

function ImportBlock({ onClose }: { onClose: () => void }) {
  const patch = useStore((s) => s.patch);
  const toast = useStore((s) => s.toast);
  const [mapping, setMapping] = useState(() => importPreview.mapping.map((m) => (m.matched ? m.field : "")));
  const [applied, setApplied] = useState(false);
  const p = importPreview;
  function apply() {
    for (const u of p.updated) patch("unitPrice", u.code, { priceSar: u.to });
    for (const a of p.added) patch("createdUnit", a.code, { code: a.code, beds: a.beds, areaM2: a.areaM2, priceSar: a.priceSar, hidden: true });
    setApplied(true);
    toast(`طُبّق الاستيراد · ${p.file} · ${p.updated.length} تُحدَّث · ${p.added.length} جديد (مخفي)`, { action: { label: "السجل", href: "/admin" } });
    onClose();
  }
  return (
    <ImportPanel
      id="import"
      className="scroll-mt-24"
      intro="صف واحد لكل نموذج. المطابقة تُحفظ للملفات القادمة. «كود النموذج» هو المفتاح: صف موجود يُحدَّث، صف جديد يُضاف بحالة «مخفي» حتى تراجعه."
      mapping={
        <>
          <ImportMappingHead />
          {p.mapping.map((m, i) => {
            const matched = !!mapping[i];
            return (
              <ImportMappingRow key={m.fileColumn} fileColumn={m.fileColumn} matched={matched} status={matched ? "مطابق" : "غير مطابق"}>
                <select
                  aria-label={`حقل الموقع لعمود ${m.fileColumn}`}
                  value={mapping[i]}
                  onChange={(e) => setMapping((cur) => cur.map((v, j) => (j === i ? e.target.value : v)))}
                  className={cx("h-8 w-full px-2 text-[12px] font-bold", matched ? "border-interactive bg-paper" : "border-error bg-cream-focus")}
                >
                  {!matched && <option value="">اختر الحقل</option>}
                  {(m.matched ? [m.field, ...FIELDS.filter((f) => f !== m.field)] : FIELDS.slice(4)).map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </ImportMappingRow>
            );
          })}
          <ImportMappingRow fileColumn={`+ ${p.autoMatchedColumns} عموداً مطابقاً تلقائياً`} muted />
        </>
      }
      mappingActions={
        <>
          <AdminButton variant="ink" size="md" onClick={() => document.getElementById("import-preview")?.focus()}>
            معاينة التغييرات
          </AdminButton>
          <AdminButton variant="outline" size="md" onClick={() => download("smq-units-template.csv", importPreview.mapping.map((m) => m.fileColumn).join(","))}>
            تنزيل القالب
          </AdminButton>
        </>
      }
      previewTitle={
        <span id="import-preview" tabIndex={-1} className="outline-none">
          معاينة الاستيراد · <span dir="ltr">{p.file}</span>
        </span>
      }
      preview={
        <>
          <ImportStats>
            <ImportStat value={p.unchanged} label="بلا تغيير" />
            <ImportStat value={p.updated.length} label="تُحدَّث" variant="ink" />
            <ImportStat value={p.added.length} label="جديد (مخفي)" variant="outline" />
          </ImportStats>
          <div className="flex flex-col">
            {p.updated.map((u) => {
              const from = unitByCode(u.code)?.priceSar ?? u.from;
              const pct = importDiffPct(from, u.to);
              return (
                <ImportDiffRow
                  key={u.code}
                  code={u.code}
                  change={
                    <>
                      السعر: <s className="tnum">{fmtNum(from)}</s>
                    </>
                  }
                  result={<span className="tnum">{`${fmtNum(u.to)} (${pct > 0 ? "+" : ""}${pct}%)`}</span>}
                />
              );
            })}
            {p.added.map((a) => (
              <ImportDiffRow key={a.code} code={a.code} change="صف جديد" result={a.summaryAr} />
            ))}
            {p.warnings.map((w) => (
              <ImportDiffRow key={w.row} code={`صف ${w.row}`} change="تحذير" result={<span className="font-normal">{w.textAr}</span>} warning />
            ))}
          </div>
        </>
      }
      previewActions={
        <>
          <AdminButton variant="gold" size="md" onClick={apply} disabled={applied}>
            تطبيق الاستيراد
          </AdminButton>
          <span className="min-w-[180px] flex-1 text-caption font-normal text-muted">يُسجَّل في السجل ويمكن التراجع عنه خلال 24 ساعة. «آخر تحديث» للوحدات المعدلة يصبح اليوم.</span>
        </>
      }
    />
  );
}

