"use client";
// /units/[code]/plan · Unit-Plan-M: a schematic plan marked illustrative, never a real floor plan. Rooms are drawn as
// rectangles from plans.ts (x mirrored so the drawing reads right-to-left like the board); tapping a room shows its
// computed area and windows; «مع الأبعاد / بلا أبعاد» shows or hides the areas on the drawing; + / − scale the drawing; roof villas
// get the «الدور الأول · السطح» tabs. «المخطط PDF» prints the page; «اطلب المخطط المعماري» opens WhatsApp.
import { useState } from "react";
import Link from "next/link";
import { unitBySlug } from "@/data/units";
import type { Unit } from "@/data/types";
import { bedsLabel, fmtArea, waLink } from "@/lib/format";
import { Mark, Segmented, useVisitorCode } from "@/components/ui";
import { useMarks } from "@/lib/presenter";
import { planOf, roomArea, windowNote, type PlanFloor, type PlanRoom, type Side } from "./plans";
import { bathsSpec, fmt1 } from "./view";

const PAD = 7;

function DownloadIcon() {
  return (
    <svg aria-hidden width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </svg>
  );
}

/** physical x of a room (plans.ts measures x from the start side, the right in RTL) */
const px = (floor: PlanFloor, r: { x: number; w: number }) => floor.W - r.x - r.w;

function windowSegments(room: PlanRoom, floor: PlanFloor): { x1: number; y1: number; x2: number; y2: number }[] {
  if (!room.windows?.length) return [];
  const x = px(floor, room);
  const out: { x1: number; y1: number; x2: number; y2: number }[] = [];
  const bySide = new Map<Side, number>();
  room.windows.forEach((s) => bySide.set(s, (bySide.get(s) ?? 0) + 1));
  bySide.forEach((count, side) => {
    const horizontal = side === "n" || side === "s";
    const len = horizontal ? room.w : room.h;
    const seg = Math.min(8, len / (count * 2));
    for (let i = 0; i < count; i++) {
      const c = (len * (i + 1)) / (count + 1);
      if (horizontal) {
        const y = side === "n" ? room.y : room.y + room.h;
        out.push({ x1: x + c - seg / 2, y1: y, x2: x + c + seg / 2, y2: y });
      } else {
        const wx = side === "e" ? x + room.w : x;
        out.push({ x1: wx, y1: room.y + c - seg / 2, x2: wx, y2: room.y + c + seg / 2 });
      }
    }
  });
  return out;
}

function PlanDrawing({ floor, unit, selected, onSelect, dims, scale }: { floor: PlanFloor; unit: Unit; selected: string; onSelect: (id: string) => void; dims: boolean; scale: number }) {
  const ent = floor.entrance;
  const marks = useMarks();
  return (
    <svg viewBox={`${-PAD} ${-PAD} ${floor.W + PAD * 2} ${floor.H + PAD * 2}`} style={{ width: `${scale * 100}%` }} className="block h-auto max-w-none mx-auto" role="group" aria-label="مخطط توضيحي">
      <defs>
        <pattern id={`grid-${floor.id}`} width={4} height={4} patternUnits="userSpaceOnUse">
          <path d="M4 0H0V4" fill="none" className="stroke-line" strokeWidth={0.15} />
        </pattern>
      </defs>
      <rect x={-PAD} y={-PAD} width={floor.W + PAD * 2} height={floor.H + PAD * 2} fill={`url(#grid-${floor.id})`} />
      {/* rooms (fill first so the walls draw on top) */}
      {floor.rooms.map((r) => {
        const on = r.id === selected;
        return (
          <rect
            key={`f-${r.id}`}
            x={px(floor, r)}
            y={r.y}
            width={r.w}
            height={r.h}
            className={on ? "fill-gold/25" : r.kind === "balcony" ? "fill-on-ink-muted/60" : "fill-paper"}
          />
        );
      })}
      {/* walls */}
      <g className="stroke-ink" fill="none" strokeWidth={0.9} strokeLinejoin="miter">
        {floor.rooms.map((r) => (
          <rect key={`w-${r.id}`} x={px(floor, r)} y={r.y} width={r.w} height={r.h} />
        ))}
      </g>
      {/* outline of the floor */}
      <rect x={0} y={0} width={floor.W} height={floor.H} fill="none" className="stroke-ink" strokeWidth={1.4} />
      {/* windows (gold), entrance (white) */}
      <g className="stroke-gold" strokeWidth={1.8} strokeLinecap="butt">
        {floor.rooms.flatMap((r) => windowSegments(r, floor).map((s, i) => <line key={`win-${r.id}-${i}`} {...s} />))}
      </g>
      <line x1={floor.W - ent.x - ent.w} y1={floor.H} x2={floor.W - ent.x} y2={floor.H} className="stroke-paper" strokeWidth={2.4} />
      {/* selected room frame */}
      {floor.rooms
        .filter((r) => r.id === selected)
        .map((r) => (
          <rect key={`sel-${r.id}`} x={px(floor, r) + 0.6} y={r.y + 0.6} width={r.w - 1.2} height={r.h - 1.2} fill="none" className="stroke-gold" strokeWidth={0.8} />
        ))}
      {/* labels: tap targets over each room */}
      {floor.rooms.map((r) => {
        const cxm = px(floor, r) + r.w / 2;
        const cym = r.y + r.h / 2;
        const small = r.w < 16 || r.h < 12;
        const area = roomArea(r, floor, unit.areaM2);
        const kitchenOpen = r.kind === "kitchen" && r.open;
        const sub = kitchenOpen ? "مفتوح" : small ? fmt1(area) : `${fmt1(area)} م²`;
        return (
          <g
            key={`l-${r.id}`}
            role="button"
            tabIndex={0}
            aria-label={`${r.label} · ${kitchenOpen ? "مفتوح" : `${fmt1(area)} م²`}`}
            aria-pressed={r.id === selected}
            onClick={() => onSelect(r.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(r.id);
              }
            }}
            className="cursor-pointer outline-none focus-visible:[&>rect]:stroke-gold"
          >
            <rect x={px(floor, r)} y={r.y} width={r.w} height={r.h} fill="transparent" strokeWidth={0.8} />
            <text x={cxm} y={dims ? cym - 0.6 : cym + 1} textAnchor="middle" direction="rtl" className="fill-ink font-extrabold" style={{ fontSize: Math.min(small ? 2.5 : 2.9, (r.w - 2) / (r.label.length * 0.56)) }}>
              {r.label}
            </text>
            {dims && (
              <text x={cxm} y={cym + 3.2} textAnchor="middle" direction="rtl" className="fill-muted font-semibold" style={{ fontSize: 2.4 }}>
                {sub}
              </text>
            )}
            {dims && marks && (r.tbc || (kitchenOpen && unit.features.kitchen === "tbc")) && (
              <g aria-hidden>
                <rect x={cxm - 5.2} y={cym + 4.6} width={10.4} height={3.4} className="fill-cream-focus stroke-gold" strokeWidth={0.3} />
                <text x={cxm} y={cym + 7.1} textAnchor="middle" direction="rtl" className="fill-gold-text font-bold" style={{ fontSize: 2.1 }}>
                  للتأكيد
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function PlanPage({ slug }: { slug: string }) {
  const unit = unitBySlug(slug) as Unit;
  const plan = planOf(unit);
  const code = useVisitorCode();
  const [floorIdx, setFloorIdx] = useState(0);
  const floor = plan?.floors[floorIdx] ?? plan?.floors[0];
  const defaultRoom = floor?.rooms.find((r) => r.tbc)?.id ?? floor?.rooms[0]?.id ?? "";
  const [picked, setPicked] = useState<Record<string, string>>({});
  const selected = floor ? (picked[floor.id] ?? defaultRoom) : "";
  const [dims, setDims] = useState<"with" | "without">("with");
  const [scale, setScale] = useState(1);
  const roof = unit.type === "roof-villa";
  const unitHref = `/units/${unit.slug}`;
  const name = roof ? "فيلا الروف" : `نموذج ${unit.model}`;
  const room = floor?.rooms.find((r) => r.id === selected);
  const area = room && floor ? roomArea(room, floor, unit.areaM2) : 0;
  const wa = `أريد مخطط ${unit.code} بالأبعاد${code ? ` · ${code}` : ""}`;

  return (
    <div className="min-h-dvh bg-paper text-ink" aria-label={`مخطط ${name}`}>
      <div className="mx-auto w-full max-w-3xl flex flex-col">
        <div className="flex items-start justify-between gap-3 px-4 py-3.5 border-b-[1.5px] border-ink">
          <div className="flex flex-col gap-0.5 min-w-0">
            <h1 className="m-0 text-label md:text-h3 font-extrabold leading-snug">
              مخطط {name} · {unit.code}
            </h1>
            <p className="m-0 text-caption font-normal text-muted leading-relaxed">
              {fmtArea(unit.areaM2)} م² · {bedsLabel(unit.beds)} · {bathsSpec(unit.baths)} · مخطط توضيحي من المطوّر
              <Mark>للتأكيد</Mark>
            </p>
          </div>
          <Link href={unitHref} aria-label="إغلاق" className="inline-flex items-center justify-center size-11 shrink-0 border-interactive bg-paper text-ink text-h3 font-extrabold leading-none no-underline hover:bg-sand motion-hover transition-colors">
            ×
          </Link>
        </div>

        <div className="flex flex-col gap-3 px-4 pt-3">
          {roof && plan && plan.floors.length > 1 && (
            <Segmented label="الدور" value={String(floorIdx)} onChange={(val) => setFloorIdx(Number(val))} options={plan.floors.map((f, i) => ({ value: String(i), label: f.label }))} stretch />
          )}
          <div className="flex items-center justify-between gap-3">
            <Segmented
              label="طريقة العرض"
              size="s"
              value={dims}
              onChange={(val) => setDims(val)}
              options={[
                { value: "with", label: "مع الأبعاد" },
                { value: "without", label: "بلا أبعاد" },
              ]}
            />
            <span className="text-caption font-normal text-muted">اضغط غرفة لرؤية مساحتها</span>
          </div>

          {floor ? (
            <div className="relative border-interactive bg-cream">
              <div className="overflow-auto px-3 pt-12 pb-14">
                <PlanDrawing floor={floor} unit={unit} selected={selected} onSelect={(id) => setPicked((p) => ({ ...p, [floor.id]: id }))} dims={dims === "with"} scale={scale} />
              </div>
              <span aria-label="الشمال" className="absolute top-2.5 end-2.5 inline-flex items-center justify-center size-8 bg-paper border-interactive text-caption font-extrabold">
                ش
              </span>
              <span className="absolute bottom-2.5 end-2.5 px-2 py-1 bg-paper text-caption font-bold leading-snug">الذهبي: نوافذ · الأبيض: المدخل · الرمادي: الشرفة</span>
              <div className="absolute bottom-2.5 start-2.5 flex flex-col">
                <button type="button" aria-label="تكبير" disabled={scale >= 2} onClick={() => setScale((s) => Math.min(2, s + 0.5))} className="inline-flex items-center justify-center size-11 border-interactive bg-paper text-h3 font-extrabold disabled:text-disabled">
                  +
                </button>
                <button type="button" aria-label="تصغير" disabled={scale <= 1} onClick={() => setScale((s) => Math.max(1, s - 0.5))} className="inline-flex items-center justify-center size-11 -mt-[1.5px] border-interactive bg-paper text-h3 font-extrabold disabled:text-disabled">
                  −
                </button>
              </div>
            </div>
          ) : (
            <p className="m-0 px-4 py-10 border-interactive bg-cream text-center text-label text-muted">المخطط يُنشر بعد استلامه من المطوّر</p>
          )}

          {room && (
            <div className="flex items-start justify-between gap-3 px-3.5 py-3 bg-sand text-label font-normal" aria-live="polite">
              <span>
                <strong className="font-extrabold">{room.label}</strong>
                {" · "}
                {room.kind === "kitchen" && room.open ? "مفتوح" : `${fmt1(area)} م²`}
                {windowNote(room.windows) ? ` · ${windowNote(room.windows)}` : ""}
              </span>
              {(room.tbc || (room.kind === "kitchen" && room.open && unit.features.kitchen === "tbc")) && <Mark className="ms-0 shrink-0">للتأكيد</Mark>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 min-h-12 px-3 border-interactive bg-paper text-label font-extrabold hover:bg-sand motion-hover transition-colors">
              <DownloadIcon />
              المخطط PDF
            </button>
            <a href={waLink(wa)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center min-h-12 px-2 bg-gold text-ink text-label font-extrabold whitespace-nowrap no-underline cut-m hover:bg-gold-hover motion-hover transition-colors">
              اطلب المخطط المعماري
            </a>
          </div>
          <p className="m-0 pb-6 text-caption font-normal leading-relaxed text-muted">
            المساحات تقريبية من مخطط المطوّر، والمساحة الموثّقة في الصك هي المرجع.{roof ? "" : " فيلا الروف تعرض مخططين بتبويب «الدور الأول · السطح»."}
          </p>
        </div>
      </div>
    </div>
  );
}
