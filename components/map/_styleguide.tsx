"use client";
// QA styleguide section for components/map · rendered at /demo/components#map.
import { useState } from "react";
import { SchematicMap, type MapPin } from "./SchematicMap";
import { PinPicker, type PinPickerChange } from "./PinPicker";
import { MapEmbed, PROJECT_ZOOM } from "./MapEmbed";
import { OfficePlaceholder, ProjectPlaceholder } from "./placeholders";
import { HexPin } from "./HexPin";
import { OFFICE, RAWDAH_CENTRE, formatCoord } from "./geometry";

/** Sample pins: the board's illustrative counts (the pages compute theirs from the fixtures). */
const SAMPLE_PINS: MapPin[] = [
  { id: "rwd-01", districtSlug: "rawdah", kind: "available", count: 7, label: "جاردن الروضة" },
  { id: "owner-safa", districtSlug: "safa", kind: "owner", count: 1, label: "من مالك · الصفا" },
  { id: "abh-01", districtSlug: "obhur-north", kind: "soon", label: "مشروع أبحر" },
];

/** Stand-in for `<Mark />` from components/ui (not landed yet): the «للتأكيد» chip without literal brackets. */
function TbcChip() {
  return <span className="text-caption ms-1 inline-block border border-gold bg-cream-focus px-[6px] py-[1px] font-bold text-gold-text">للتأكيد</span>;
}

function Block({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-h3">{title}</h3>
        {note && <span className="text-caption text-muted">{note}</span>}
      </div>
      {children}
    </div>
  );
}

export function Styleguide() {
  const [selected, setSelected] = useState<string | null>("rwd-01");
  const [addPin, setAddPin] = useState<PinPickerChange | null>(null);
  const [district, setDistrict] = useState("rawdah");
  const [office, setOffice] = useState<{ lat: number; lng: number }>(OFFICE);
  const selectedPin = SAMPLE_PINS.find((p) => p.id === selected);

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-h2">الخرائط</h2>
        <p className="text-caption text-muted">خريطة تخطيطية تفاعلية ومنتقي دبوس وإطار تضمين بلا مفتاح · الأرقام توضيحية</p>
      </div>

      <Block title="خريطة النتائج · SchematicMap" note="اضغط على دبوس · «+» و«−» تكبّر الرسم حول المركز">
        <SchematicMap
          pins={SAMPLE_PINS}
          selectedId={selected}
          onSelect={(id) => setSelected(id === selected ? null : id)}
          regionLabel="جدة · شمال وسط"
          className="h-[420px] md:h-[640px]"
          renderPopover={(pin) => (
            <div className="border-interactive flex flex-col gap-1 bg-paper p-4">
              <span className="text-caption font-bold text-gold-text">{pin.districtSlug === "rawdah" ? "الروضة" : pin.districtSlug === "safa" ? "الصفا" : "أبحر الشمالية"}</span>
              <span className="text-h3">{pin.label}</span>
              <span className="text-caption text-muted">البطاقة المصمّمة تأتي من الصفحة · هذا مكانها فقط</span>
            </div>
          )}
        />
        <div className="text-caption text-muted">
          المحدد: <span className="tnum font-bold text-ink">{selectedPin ? selectedPin.label : "لا شيء"}</span>
        </div>
      </Block>

      <Block title="الدبابيس · HexPin" note="ذهبي متاح · أبيض بحلقة حبر: من مالك أو قريباً · المحدد بحلقة خارجية">
        <div className="flex flex-wrap items-center gap-6 bg-slot p-6">
          <HexPin kind="available" count={7} />
          <HexPin kind="available" count={7} selected size={60} textSize={17} />
          <HexPin kind="owner" count={1} />
          <HexPin kind="soon" />
          <HexPin kind="available" count={3} size={44} textSize={13} />
          <HexPin kind="owner" count={2} size={44} textSize={13} />
          <HexPin kind="soon" size={44} textSize={13} />
        </div>
      </Block>

      <div className="grid gap-8 md:grid-cols-2">
        <Block title="منتقي الدبوس · أضف عقارك" note="اسحب الدبوس أو الأسهم · «موقعي الحالي»">
          <label className="flex flex-col gap-1 text-[11px] font-semibold text-muted">
            الحي
            <select value={district} onChange={(e) => setDistrict(e.target.value)} className="border-interactive h-12 bg-paper px-3 text-[15px] font-semibold text-ink">
              <option value="rawdah">الروضة</option>
              <option value="safa">الصفا</option>
              <option value="naeem">النعيم</option>
              <option value="obhur-north">أبحر الشمالية</option>
              <option value="shati">الشاطئ</option>
              <option value="mohammadiyah">المحمدية</option>
            </select>
          </label>
          <PinPicker districtSlug={district} locateButton onChange={setAddPin} />
          <span dir="ltr" className="text-caption tnum text-end text-muted">
            {addPin ? `${formatCoord(addPin.lat)}, ${formatCoord(addPin.lng)} · svg ${Math.round(addPin.x)}, ${Math.round(addPin.y)}` : "—"}
          </span>
        </Block>

        <Block title="منتقي الدبوس · ألصق رابطاً" note="حالة المعاينة من لوحة طلب الانضمام">
          <PinPicker districtSlug="rawdah" showModeTabs defaultMode="link" defaultLink="https://maps.app.goo.gl/" height={110} gridSize={24} pinSize="s" />
          <PinPicker
            districtSlug="rawdah"
            showModeTabs
            defaultMode="link"
            defaultLink="https://www.google.com/maps/place/SMQ/@21.5604526,39.1811231,17z"
            height={110}
            gridSize={24}
            pinSize="s"
            previewHint="معاينة الرابط · الدبوس يُضبط من الرابط تلقائياً"
          />
        </Block>

        <Block title="منتقي الدبوس · محرر المشروع" note="حقول الإحداثيات بسبع خانات عشرية">
          <PinPicker latLng={office} onChange={(v) => setOffice({ lat: v.lat, lng: v.lng })} coordinateFields="below" gridSize={30} hint="اسحب الدبوس أو أدخل الإحداثيات" />
        </Block>

        <Block title="منتقي الدبوس · إعدادات الموقع" note="الحقول فوق الخريطة">
          <PinPicker latLng={office} onChange={(v) => setOffice({ lat: v.lat, lng: v.lng })} coordinateFields="above" gridSize={30} hint="اسحب الدبوس أو أدخل الإحداثيات" showLabels />
        </Block>
      </div>

      <Block title="خريطة مضمّنة · المكتب" note="إطار على الحاوية · الرسم التخطيطي حتى يكتمل التحميل · يبقى عند الفشل">
        <MapEmbed lat={OFFICE.lat} lng={OFFICE.lng} title="خريطة مكتب SMQ" placeholder="office" directionsHref="https://maps.google.com/?q=SMQ+Real+Estate+Jeddah" />
      </Block>

      <Block title="خريطة مضمّنة · المشروع" note="تكبير على مستوى الحي · العنوان خارج الإطار">
        <MapEmbed
          lat={RAWDAH_CENTRE.lat}
          lng={RAWDAH_CENTRE.lng}
          zoom={PROJECT_ZOOM}
          title="خريطة موقع جاردن الروضة"
          placeholder="project"
          label={
            <>
              الموقع تقريبي
              <TbcChip />
            </>
          }
        />
      </Block>

      <Block title="الرسوم التخطيطية · placeholders" note="تُستخدم وحدها عند الحاجة">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border-interactive relative h-[220px]">
            <OfficePlaceholder />
          </div>
          <div className="border-interactive relative h-[220px]">
            <ProjectPlaceholder />
          </div>
        </div>
      </Block>
    </div>
  );
}
