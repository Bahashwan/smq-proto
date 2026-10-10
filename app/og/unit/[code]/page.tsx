import { Lockup, PlaceholderDrawing, IllustrativeLabel, Price } from "@/components/ui";
import { OgFrame } from "../../OgFrame";
import { units, unitBySlug, floorLabel } from "@/data/units";
import { projectById } from "@/data/projects";
import { unitPpm } from "@/data/selectors";
import { districtAr } from "@/data/districts";
import { fmtNum, fmtArea, bathsLabel } from "@/lib/format";

export const dynamicParams = false;
export function generateStaticParams() {
  return units.map((u) => ({ code: u.slug }));
}
export const metadata = { title: "OG · الوحدة" };

export default async function OgUnit({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const unit = unitBySlug(code)!;
  const project = projectById(unit.projectId)!;
  const status = unit.status;
  const badge = status === "available" ? { cls: "bg-gold text-ink", word: "متاح" } : status === "reserved" ? { cls: "bg-paper text-ink ring-2 ring-ink", word: "محجوز" } : { cls: "bg-ink text-paper", word: "بيعت" };
  const title = unit.type === "roof-villa" ? `فيلا روف ${unit.beds} غرف · ${fmtArea(unit.areaM2)} م²` : `شقة ${unit.beds === 2 ? "غرفتين" : `${unit.beds} غرف`} · ${fmtArea(unit.areaM2)} م²`;
  const delivery = project.milestones.find((m) => m.label === "التسليم")?.date ?? "";
  return (
    <OgFrame className="bg-paper text-ink">
      <div className="absolute inset-y-0 start-0 w-[700px] p-14 flex flex-col justify-center gap-5">
        <span className="flex items-center gap-3 text-[18px] font-bold text-gold-text">
          <span className={`inline-flex items-center justify-center h-8 px-4 text-[11px] font-extrabold hex-flat ${badge.cls}`}>{badge.word}</span>
          {project.nameAr} · عمارة {unit.buildingNameAr} · حي {districtAr(project.districtSlug)}
        </span>
        <span className="text-[54px] font-extrabold leading-[1.15]">{title}</span>
        <Price value={unit.priceSar} className="text-[96px] font-extrabold leading-none" signClassName="text-gold" />
        <span className="text-[22px] text-ink-2 tnum">{fmtNum(unitPpm(unit))} ريال للمتر · {bathsLabel(unit.baths)}{unit.floor ? ` · الطابق ${floorLabel(unit)}` : ""}{delivery ? ` · تسليم ${delivery.replace("/Q", " · الربع ").replace(/(\d{4}) · الربع (\d)/, "الربع $2 · $1")}` : ""}</span>
      </div>
      <div className="absolute inset-y-0 end-0 w-[500px] bg-slot overflow-hidden [clip-path:polygon(0_0,100%_0,calc(100%_-_140px)_100%,0_100%)]">
        <PlaceholderDrawing tone="slot" className="absolute inset-0 opacity-50" />
        <IllustrativeLabel size="m" className="absolute bottom-6 start-6" />
      </div>
      <div className="absolute bottom-0 inset-x-0 h-[70px] bg-ink text-paper flex items-center justify-between px-10">
        <Lockup tone="goldmark-white" height={32} />
        <span className="text-[16px] font-bold text-on-ink-muted" dir="ltr">smq-re.com/units/{unit.slug} · {unit.code}</span>
      </div>
    </OgFrame>
  );
}
