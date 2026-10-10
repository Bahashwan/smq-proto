"use client";
// /admin/content/lists (Admin-Lists-D): districts with the «قريباً» flags (the board opens with the three new flags
// unsaved), cities, unit types (name, plural, shape), the budget chips under the finder slider and the owner
// rejection reasons. Counts are computed from the units; rows reorder by drag or arrow keys; «حفظ ونشر» stores the
// lists in memory (g8.lists).
import { useState, type ReactNode } from "react";
import { DragHandle, Switch } from "@/components/admin";
import { lists } from "@/data/content";
import { availableUnits, listedUnits, unitDistrictSlug } from "@/data/selectors";
import { usePatch, useStore } from "@/lib/store";
import { cx, fmtCompactAr, fmtNum } from "@/lib/format";
import { ctl, useDragSort } from "./controls";
import { countWord, W } from "./model";
import { ContentHead, G8Shell, SAUD, SaveStrip, type StripState } from "./shell";

interface District { key: string; labelAr: string; slug?: string; comingSoon: boolean; noteAr?: string }
interface Simple { key: string; labelAr: string; noteAr?: string }
interface UnitType { key: string; labelAr: string; pluralAr: string; noteAr?: string }
interface Budget { key: string; labelAr: string; value: number; visible: boolean; noteAr?: string }
interface Reason { key: string; labelAr: string; count: number }
interface State { districts: District[]; cities: Simple[]; unitTypes: UnitType[]; budgets: Budget[]; reasons: Reason[] }

const FIRST_DISTRICTS = 6;

function fromFixture(): State {
  return {
    districts: lists.districts.map((d) => ({ key: d.key, labelAr: d.labelAr, slug: d.slug, comingSoon: !!d.comingSoon, noteAr: d.noteAr })),
    cities: lists.cities.map((c) => ({ key: c.key, labelAr: c.labelAr, noteAr: c.noteAr })),
    unitTypes: lists.unitTypes.map((u) => ({ key: u.key, labelAr: u.labelAr, pluralAr: u.pluralAr ?? u.labelAr, noteAr: u.noteAr })),
    budgets: lists.budgets.map((b) => ({ key: b.key, labelAr: b.labelAr, value: b.value ?? 0, visible: b.visible ?? true, noteAr: b.noteAr })),
    reasons: lists.rejectionReasons.map((r) => ({ key: r.key, labelAr: r.labelAr, count: r.count ?? 0 })),
  };
}
/** The board's starting point: the three «قريباً» flags are the unsaved change. */
function boardBaseline(s: State): State {
  return { ...s, districts: s.districts.map((d) => ({ ...d, comingSoon: false })) };
}

/** «3 أحياء وُسمت «قريباً»» */
function flaggedLine(n: number): string {
  if (n === 1) return "حي واحد وُسم «قريباً»";
  if (n === 2) return "حيّان وُسما «قريباً»";
  if (n <= 10) return `${n} أحياء وُسمت «قريباً»`;
  return `${n} حياً وُسم «قريباً»`;
}

export function ListsPage() {
  const stored = usePatch<{ state: State }>("g8.lists", "state")?.state;
  const patch = useStore((s) => s.patch);
  const toast = useStore((s) => s.toast);
  const [saved, setSaved] = useState<State>(() => stored ?? boardBaseline(fromFixture()));
  const [st, setSt] = useState<State>(() => stored ?? fromFixture());
  const [phase, setPhase] = useState<"edit" | "saving" | "saved">("edit");
  const [allDistricts, setAllDistricts] = useState(false);

  const listed = listedUnits();
  const avail = availableUnits();
  const unitsIn = (slug?: string) => listed.filter((u) => unitDistrictSlug(u) === slug).length;
  const unitsOfType = (key: string) => listed.filter((u) => u.type === key).length;
  const budgetCount = (b: Budget) => (b.labelAr.startsWith("أكثر من") ? avail.filter((u) => u.priceSar > b.value).length : avail.filter((u) => u.priceSar <= b.value).length);

  // dirty line: flag changes worded as the board, anything else counted
  const savedFlags = new Map(saved.districts.map((d) => [d.key, d.comingSoon]));
  const flagChanges = st.districts.filter((d) => savedFlags.has(d.key) && savedFlags.get(d.key) !== d.comingSoon);
  const allOn = flagChanges.every((d) => d.comingSoon);
  const norm = (s: State) => JSON.stringify({ ...s, districts: s.districts.map((d) => ({ ...d, comingSoon: false })) });
  const otherChanged = norm(st) !== norm(saved);
  const parts = [flagChanges.length ? (allOn ? flaggedLine(flagChanges.length) : `تغيّر وسم «قريباً» في ${countWord(flagChanges.length, W.district)}`) : "", otherChanged ? "تعديلات أخرى في القوائم" : ""].filter(Boolean);
  const dirty = parts.length > 0;
  const state: StripState = phase === "saving" ? "saving" : phase === "saved" ? "saved" : dirty ? "dirty" : "clean";

  const set = <K extends keyof State>(k: K, v: State[K]) => {
    setPhase("edit");
    setSt((prev) => ({ ...prev, [k]: v }));
  };
  const save = () => {
    setPhase("saving");
    setTimeout(() => {
      patch("g8.lists", "state", { state: st });
      setSaved(st);
      setPhase("saved");
      toast("نُشرت القوائم · الفلاتر والنماذج تعرض القيم الجديدة", { kind: "ok" });
      setTimeout(() => setPhase("edit"), 6000);
    }, 600);
  };
  const key = () => `n-${Date.now().toString(36)}`;

  const districts = allDistricts ? st.districts : st.districts.slice(0, FIRST_DISTRICTS);
  const moreDistricts = st.districts.length - FIRST_DISTRICTS;

  return (
    <G8Shell user={SAUD} mainClassName="pb-0 md:pb-0">
      <ContentHead trail="القوائم" title="القوائم" subtitle="القيم التي تملأ الفلاتر والنماذج. التغيير هنا ينعكس على الموقع فوراً بعد الحفظ، ولا يغيّر الوحدات القائمة" />

      <div className="grid items-start gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(380px,100%),1fr))]">
        <ListPanel
          title="الأحياء"
          count={`${st.districts.length} · ${st.districts.filter((d) => d.comingSoon).length} قريباً`}
          meta="تظهر في فلتر الحي وفي «أضف عقارك»"
          addLabel="حي جديد"
          onAdd={(v) => set("districts", [...st.districts, { key: key(), labelAr: v, comingSoon: true }])}
          footer={
            moreDistricts > 0 && (
              <button type="button" onClick={() => setAllDistricts((x) => !x)} aria-expanded={allDistricts} className="w-full cursor-pointer border-t border-line px-4 py-3 text-start text-[12px] font-normal text-ink-2 hover:bg-cream">
                {allDistricts ? `عرض أول ${FIRST_DISTRICTS} فقط` : `و${countWord(moreDistricts, W.district)} أخرى بلا وحدات (تظهر في «أضف عقارك» فقط)`}
              </button>
            )
          }
        >
          <SortRows
            items={districts}
            onReorder={(ids) => set("districts", [...ids.map((id) => st.districts.find((d) => d.key === id)!), ...st.districts.filter((d) => !ids.includes(d.key))])}
            rowClass={(d) => (d.comingSoon ? "bg-cream-focus" : undefined)}
            render={(d) => {
              const n = unitsIn(d.slug);
              return (
                <>
                  <span className="min-w-0 flex-1 text-label">
                    <span className="font-extrabold">{d.labelAr}</span>
                    <span className="text-[12px] font-normal text-muted"> · {d.noteAr ?? (n > 0 ? countWord(n, W.unit) : "0")}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2.5">
                    {d.comingSoon ? <span className="border-[1.5px] border-gold px-1.5 py-px text-[12px] font-extrabold text-gold-text">قريباً</span> : <span className="text-[12px] font-bold text-muted">قريباً</span>}
                    <Switch checked={d.comingSoon} onChange={(v) => set("districts", st.districts.map((x) => (x.key === d.key ? { ...x, comingSoon: v } : x)))} aria-label={`قريباً · ${d.labelAr}`} />
                  </span>
                </>
              );
            }}
          />
        </ListPanel>

        <div className="flex flex-col gap-4">
          <ListPanel title="المدن" count={String(st.cities.length)} meta={st.cities.length === 1 ? lists.citiesNoteAr : `${st.cities.length} مدن · يظهر فلتر المدينة`} addLabel="مدينة جديدة" onAdd={(v) => set("cities", [...st.cities, { key: key(), labelAr: v }])}>
            {st.cities.map((c) => (
              <div key={c.key} className="flex min-h-12 items-center justify-between gap-3 border-t border-line px-4 py-2.5 text-label first:border-t-0">
                <span className="font-extrabold">{c.labelAr}</span>
                {c.noteAr && <span className="text-[12px] font-normal text-muted">{c.noteAr}</span>}
              </div>
            ))}
          </ListPanel>
          <ListPanel title="أنواع الوحدات" count={String(st.unitTypes.length)} meta="الاسم والجمع والأيقونة (شكل)" addLabel="نوع جديد" onAdd={(v) => set("unitTypes", [...st.unitTypes, { key: key(), labelAr: v, pluralAr: v }])}>
            <SortRows
              items={st.unitTypes}
              onReorder={(ids) => set("unitTypes", ids.map((id) => st.unitTypes.find((u) => u.key === id)!))}
              render={(u, i) => (
                <>
                  <span className="min-w-0 flex-1 text-label">
                    <span className="font-extrabold">{u.labelAr}</span>
                    <span className="text-[12px] font-normal text-muted">
                      {" "}
                      · {u.pluralAr} · {unitsOfType(u.key)}
                      {u.noteAr ? ` · ${u.noteAr}` : ""}
                    </span>
                  </span>
                  <TypeShape k={u.key} i={i} />
                </>
              )}
            />
          </ListPanel>
        </div>

        <ListPanel title="الميزانيات المقترحة" count={String(st.budgets.length)} meta="أزرار تحت المنزلق، بالريال" addLabel="قيمة بالريال" numeric onAdd={(v) => {
          const value = parseInt(v.replace(/[^\d]/g, ""), 10);
          if (!value) return false;
          set("budgets", [...st.budgets, { key: key(), labelAr: `حتى ${fmtCompactAr(value)}`, value, visible: true }]);
        }}>
          <SortRows
            items={st.budgets}
            onReorder={(ids) => set("budgets", ids.map((id) => st.budgets.find((b) => b.key === id)!))}
            render={(b, i) => {
              const n = budgetCount(b);
              const openEnded = b.labelAr.startsWith("أكثر من");
              const meta = [openEnded ? "" : fmtNum(b.value), i === 0 || n === 0 ? countWord(n, W.unit) : String(n), b.noteAr ?? (b.visible ? "" : "مخفي")].filter(Boolean).join(" · ");
              return (
                <>
                  <span className="min-w-0 flex-1 text-label">
                    <span className="font-extrabold">{b.labelAr}</span>
                    <span className="text-[12px] font-normal text-muted tnum"> · {meta}</span>
                  </span>
                  <Switch checked={b.visible} onChange={(v) => set("budgets", st.budgets.map((x) => (x.key === b.key ? { ...x, visible: v, noteAr: x.noteAr === "مخفي" && v ? undefined : x.noteAr } : x)))} aria-label={b.visible ? "ظاهر" : "مخفي"} />
                </>
              );
            }}
          />
        </ListPanel>

        <ListPanel title="أسباب رفض عقار مالك" count={String(st.reasons.length)} meta="تُرسل للمالك على واتساب مع الرفض" addLabel="سبب جديد" onAdd={(v) => set("reasons", [...st.reasons, { key: key(), labelAr: v, count: 0 }])}>
          <SortRows
            items={st.reasons}
            onReorder={(ids) => set("reasons", ids.map((id) => st.reasons.find((r) => r.key === id)!))}
            render={(r, i) => (
              <>
                <span className="min-w-0 flex-1 text-label font-extrabold">{r.labelAr}</span>
                <span className="shrink-0 text-[12px] font-normal text-muted tnum">{i === 0 ? `${r.count} مرة` : r.count}</span>
              </>
            )}
          />
        </ListPanel>
      </div>

      <SaveStrip state={state} message={`تغييرات غير محفوظة: ${parts.join("، ")}`} onDiscard={() => setSt(saved)} saveLabel="حفظ ونشر" onSave={save} savedText="نُشرت القوائم الآن ·" />
    </G8Shell>
  );
}

const SHAPE_OF: Record<string, number> = { apartment: 0, "roof-villa": 1, villa: 2 };
function TypeShape({ k, i }: { k: string; i: number }) {
  const shape = SHAPE_OF[k] ?? i % 3;
  if (shape === 0) return <span aria-hidden className="block size-5 shrink-0 border-2 border-ink" />;
  if (shape === 1) return <span aria-hidden className="block size-5 shrink-0 bg-ink [clip-path:polygon(0_100%,50%_0,100%_100%)]" />;
  return <span aria-hidden className="hex-flat block h-[18px] w-5 shrink-0 bg-ink" />;
}

function ListPanel({ title, count, meta, children, addLabel, onAdd, numeric, footer }: { title: string; count: string; meta: string; children: ReactNode; addLabel: string; onAdd: (v: string) => void | false; numeric?: boolean; footer?: ReactNode }) {
  const [v, setV] = useState("");
  const [err, setErr] = useState(false);
  const add = () => {
    if (!v.trim() || onAdd(v.trim()) === false) return setErr(true);
    setErr(false);
    setV("");
  };
  return (
    <section aria-label={title} className="border-interactive bg-paper">
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b-[1.5px] border-ink bg-sand px-4 py-3">
        <h2 className="text-[16px] font-extrabold">
          {title} <span className="text-caption font-bold text-muted tnum">{count}</span>
        </h2>
        <span className="text-[12px] text-muted">{meta}</span>
      </header>
      <div>{children}</div>
      {footer}
      <div className="flex gap-2 border-t-[1.5px] border-ink p-3">
        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={addLabel}
          aria-label={addLabel}
          inputMode={numeric ? "numeric" : undefined}
          className={ctl(err ? "error" : "admin", "h-11")}
        />
        <button type="button" onClick={add} className="flex h-11 shrink-0 cursor-pointer items-center bg-ink px-4 text-label font-extrabold text-paper motion-hover transition-colors hover:bg-ink-2">
          أضف
        </button>
      </div>
    </section>
  );
}

function SortRows<T extends { key: string }>({ items, onReorder, render, rowClass }: { items: T[]; onReorder: (ids: string[]) => void; render: (item: T, i: number) => ReactNode; rowClass?: (item: T) => string | undefined }) {
  const ids = items.map((x) => x.key);
  const { rowRef, handleProps, dragging } = useDragSort(ids, onReorder);
  return (
    <>
      {items.map((it, i) => (
        <div key={it.key} ref={rowRef(it.key)} className={cx("relative flex min-h-12 items-center gap-3 border-t border-line py-1.5 pe-4 ps-1.5 first:border-t-0", dragging === it.key ? "bg-sand" : rowClass?.(it))}>
          {dragging === it.key && <span aria-hidden className="absolute inset-x-0 -top-px h-[3px] bg-gold" />}
          <DragHandle {...handleProps(it.key, "اسحب")} />
          {render(it, i)}
        </div>
      ))}
    </>
  );
}
