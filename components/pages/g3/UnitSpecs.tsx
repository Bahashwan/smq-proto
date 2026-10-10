"use client";
// The unit page's spec sections (Unit-M/D, Unit-Reserved-M, Unit-Sold-M, Unit-Roof-M). Which sections show and in
// which order follows the boards: an available apartment shows الموقع · الوحدة · السعر · المميزات · الضمانات · الحالة;
// a roof villa الوحدة · السعر · المميزات; reserved and sold units lead with الحالة, then السعر and a short الوحدة.
import Link from "next/link";
import type { ReactNode } from "react";
import { cx, fmtArea, fmtDate } from "@/lib/format";
import { Mark } from "@/components/ui";
import type { Unit } from "@/data/types";
import { ChipOnly, KV, SpecSection, StatusWord, Tile, Val } from "./parts";
import { bathsSpec, bedsCaption, bedsSpec, fmt2, parkingWord, riyalWord, yesNo, type UnitView } from "./view";

const Yes = ({ v }: { v: boolean | undefined }) => <span className={v ? "font-extrabold" : "font-bold text-muted"}>{yesNo(v)}</span>;

function kitchenWord(k: Unit["features"]["kitchen"]): ReactNode {
  return k === "open" ? "مفتوح" : k === "closed" ? "مغلق" : <ChipOnly>للتأكيد</ChipOnly>;
}
function licence(unit: Unit): ReactNode {
  return unit.adLicence ?? <ChipOnly>اختياري</ChipOnly>;
}
const tax = <Val text="شامل / غير شامل" tbc />;
const isTbc = (unit: Unit, key: string) => !!unit.featuresTbc?.includes(key);

function Location({ v }: { v: UnitView }) {
  return (
    <SpecSection title="الموقع" id="spec-location">
      <KV label="المدينة">جدة</KV>
      <KV label="الحي">{v.district?.ar}</KV>
      <KV label="المشروع">
        {v.project && (
          <Link href={`/projects/${v.project.slug}`} className="text-gold-text underline underline-offset-4 hover:text-ink">
            {v.project.nameAr} · {v.project.code}
          </Link>
        )}
      </KV>
      <KV label="العمارة">{v.unit.buildingNameAr}</KV>
    </SpecSection>
  );
}

function UnitApartment({ v, rows }: { v: UnitView; rows: "full" | "reserved" | "sold" }) {
  const u = v.unit;
  const floor = <Val text={v.floorWordAr} tbc={u.floor?.tbc} />;
  const facing = <Val text={u.orientation?.value} tbc={u.orientation?.tbc} />;
  if (rows !== "full")
    return (
      <SpecSection title="الوحدة" id="spec-unit">
        <KV label="كود النموذج">{u.code}</KV>
        <KV label="الطابق">{floor}</KV>
        <KV label="رقم ترخيص الإعلان">{licence(u)}</KV>
        {rows === "reserved" && <KV label="الاتجاه">{facing}</KV>}
      </SpecSection>
    );
  return (
    <SpecSection title="الوحدة" id="spec-unit">
      <div className="grid grid-cols-3 gap-2 py-3 border-b border-line md:hidden">
        <Tile value={fmtArea(u.areaM2)} caption="م²" />
        <Tile value={u.beds} caption={bedsCaption(u.beds)} />
        <Tile value={u.baths} caption={u.baths === 1 ? "حمام" : "حمامات"} />
      </div>
      <KV label="كود النموذج">{u.code}</KV>
      <KV label="نوع الوحدة">{v.typeAr}</KV>
      <KV label="الطابق">{floor}</KV>
      <KV label="رقم ترخيص الإعلان">{licence(u)}</KV>
      <KV label="عدد الغرف" only="md">
        {bedsSpec(u.beds)} · {bathsSpec(u.baths)}
      </KV>
      <KV label="المساحة" only="md">
        {fmt2(u.areaM2)} م²
      </KV>
      <KV label="مساحة السطح">{u.features.roofTerrace ? <Val text="تراس خاص" tbc={u.terraceM2?.tbc} /> : "لا يوجد"}</KV>
      <KV label="الاتجاه">{facing}</KV>
      {u.ceilingM && (
        <KV label="ارتفاع السقف">
          <Val text={`${fmt2(u.ceilingM.value)} م`} tbc={u.ceilingM.tbc} />
        </KV>
      )}
    </SpecSection>
  );
}

function UnitRoof({ v }: { v: UnitView }) {
  const u = v.unit;
  return (
    <SpecSection title="الوحدة" id="spec-unit">
      <div className="grid grid-cols-4 gap-2 py-3 border-b border-line">
        <Tile value={fmtArea(u.areaM2)} caption="م² إجمالي" />
        <Tile value={u.terraceM2?.value != null ? fmtArea(u.terraceM2.value) : <Mark className="ms-0 text-caption">للتأكيد</Mark>} caption="م² التراس" />
        <Tile value={u.beds} caption={bedsCaption(u.beds)} />
        <Tile value={u.baths} caption="حمامات" />
      </div>
      <KV label="كود النموذج">{u.code}</KV>
      <KV label="نوع الوحدة">فيلا روف (دوران)</KV>
      <KV label="الطوابق">
        <Val text={v.floorWordAr} tbc={u.floor?.tbc} />
      </KV>
      <KV label="مساحة السطح">
        <Val text="تراس خاص" tbc={u.terraceM2?.tbc} />
      </KV>
      <KV label="مجلس خارجي">
        <Val text={yesNo(u.features.majlis)} tbc={isTbc(u, "majlis")} />
      </KV>
      <KV label="مدخل مستقل">
        <Val text={yesNo(u.features.privateEntrance)} tbc={isTbc(u, "privateEntrance")} />
      </KV>
      <KV label="مواقف">{parkingWord(u.features.parking)}</KV>
      <KV label="رقم ترخيص الإعلان">{licence(u)}</KV>
      <KV label="الاتجاه">
        <Val text={u.orientation?.value} tbc={u.orientation?.tbc} />
      </KV>
    </SpecSection>
  );
}

function Price({ v }: { v: UnitView }) {
  const u = v.unit;
  const roof = u.type === "roof-villa";
  const sold = v.status === "sold";
  return (
    <SpecSection title="السعر" id="spec-price">
      <KV label={sold ? "سعر البيع المعلن" : "السعر"} strong valueClassName="text-body">
        {riyalWord(u.priceSar)}
      </KV>
      <KV label={roof && !sold ? "سعر المتر (مع التراس)" : "سعر المتر"}>{riyalWord(v.ppm)}</KV>
      <KV label="ضريبة التصرفات العقارية">{tax}</KV>
      {v.status === "available" && !roof && (
        <KV label="قياساً بالحي">
          <span className="md:hidden">{v.compared.bedsPart} في الحي</span>
          <span className="hidden md:inline">{v.compared.line}</span>
        </KV>
      )}
      {v.status === "available" && roof && v.projectLine && (
        <KV label="قياساً بالمشروع" valueClassName="font-semibold">
          {v.projectLine}
        </KV>
      )}
    </SpecSection>
  );
}

function Features({ v }: { v: UnitView }) {
  const u = v.unit;
  const f = u.features;
  if (u.type === "roof-villa")
    return (
      <SpecSection title="المميزات" id="spec-features">
        <div className="grid grid-cols-2 gap-x-4">
          <KV label="غرفة خادمة">
            <Yes v={f.maid} />
          </KV>
          <KV label="غرفة سائق">
            <Yes v={f.driver} />
          </KV>
          <KV label="مطبخان">{f.twoKitchens === "tbc" ? <ChipOnly>للتأكيد</ChipOnly> : <Yes v={f.twoKitchens === "yes"} />}</KV>
          <KV label="سمارت هوم">
            <Yes v={f.smartHome} />
          </KV>
          <KV label="مصعد خاص">
            <Yes v={f.privateLift} />
          </KV>
          <KV label="مسبح">
            <Yes v={f.pool} />
          </KV>
        </div>
      </SpecSection>
    );
  return (
    <SpecSection title="المميزات" id="spec-features">
      <div className="grid grid-cols-2 gap-x-4 md:grid-cols-1 md:gap-x-0">
        <KV label="غرفة خادمة">
          <Yes v={f.maid} />
        </KV>
        <KV label="غرفة سائق">
          <Yes v={f.driver} />
        </KV>
        <KV label="بلكونة">
          <Yes v={f.balcony} />
        </KV>
        <KV label="سمارت هوم">
          <Yes v={f.smartHome} />
        </KV>
        <KV label="نوع المطبخ">{kitchenWord(f.kitchen)}</KV>
        <KV label="موقف خاص" only="phone">
          <Yes v={f.parking > 0} />
        </KV>
      </div>
      {u.otherFeatures.length > 0 && <KV label="مميزات جوهرية أخرى">{u.otherFeatures.join(" · ")}</KV>}
      <KV label="مميزات إضافية">
        <ChipOnly>للتأكيد</ChipOnly>
      </KV>
    </SpecSection>
  );
}

function Guarantees({ v }: { v: UnitView }) {
  return (
    <SpecSection title="الضمانات" id="spec-guarantees">
      <KV label="الضمانات">
        <ChipOnly>للتأكيد من المطوّر</ChipOnly>
      </KV>
      <KV label="نوع التأمين">
        <ChipOnly>للتأكيد</ChipOnly>
      </KV>
      <KV label="شهادة الإشغال">{v.project?.occupancy}</KV>
    </SpecSection>
  );
}

function Status({ v }: { v: UnitView }) {
  const updated = fmtDate(v.updatedAt);
  if (v.status === "reserved")
    return (
      <SpecSection title="الحالة" id="spec-status">
        <KV label="حالة الوحدة" strong>
          <StatusWord status="reserved" />
        </KV>
        {v.reservedUntil && (
          <KV label="محجوزة حتى">
            {fmtDate(v.reservedUntil)} · {v.reservedDays} يوماً من العربون
          </KV>
        )}
        <KV label="ماذا يعني؟" valueClassName="font-semibold">
          قد تعود للعرض. سجّل في قائمة الانتظار بلا التزام.
        </KV>
        <KV label="آخر تحديث">{updated}</KV>
      </SpecSection>
    );
  if (v.status === "sold")
    return (
      <SpecSection title="الحالة" id="spec-status">
        <KV label="حالة الوحدة" strong>
          <StatusWord status="sold" />
        </KV>
        {v.soldOn && <KV label="تاريخ البيع">{fmtDate(v.soldOn)}</KV>}
        <KV label="لماذا تبقى الصفحة؟" valueClassName="font-semibold">
          سعر حقيقي بيع فعلاً، مرجع لدليل الأسعار وللمقارنة.
        </KV>
      </SpecSection>
    );
  return (
    <SpecSection title="الحالة" id="spec-status">
      <KV label="حالة الوحدة" strong>
        <StatusWord status="available" />
      </KV>
      <KV label="حالة المشروع">{v.projectStatusAr}</KV>
      <KV
        label={
          <>
            <span className="md:hidden">التسليم المتوقع</span>
            <span className="hidden md:inline">تاريخ التسليم المتوقع</span>
          </>
        }
      >
        {v.deliveryLong}
      </KV>
      <KV
        label={
          <>
            <span className="md:hidden">آخر تحديث</span>
            <span className="hidden md:inline">تاريخ آخر تحديث</span>
          </>
        }
      >
        {updated}
      </KV>
    </SpecSection>
  );
}

export function UnitSpecs({ v, className }: { v: UnitView; className?: string }) {
  const roof = v.unit.type === "roof-villa";
  let sections: ReactNode[];
  if (v.status === "reserved") sections = [<Status key="s" v={v} />, <Price key="p" v={v} />, <UnitApartment key="u" v={v} rows="reserved" />];
  else if (v.status === "sold") sections = [<Status key="s" v={v} />, <Price key="p" v={v} />, <UnitApartment key="u" v={v} rows="sold" />];
  else if (roof) sections = [<UnitRoof key="u" v={v} />, <Price key="p" v={v} />, <Features key="f" v={v} />];
  else sections = [<Location key="l" v={v} />, <UnitApartment key="u" v={v} rows="full" />, <Price key="p" v={v} />, <Features key="f" v={v} />, <Guarantees key="g" v={v} />, <Status key="s" v={v} />];
  return <div className={cx("grid grid-cols-1 gap-9 md:grid-cols-3 md:gap-x-10 md:gap-y-12", className)}>{sections}</div>;
}
