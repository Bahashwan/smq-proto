"use client";
// Home finder: budget stepper + district / rooms pickers; the answer block recomputes from the fixtures.
import { useMemo, useState } from "react";
import { AnswerBlock, BottomSheet, BudgetBlock, Button, Chip, SelectButton, WhatsAppLink } from "@/components/ui";
import { finderAnswer, type FinderType } from "@/data/selectors";
import { districts, districtAr, siteDistricts } from "@/data/districts";
import { useUnitOverrides } from "@/lib/store";
import { fmtNum, fmtArea, cx } from "@/lib/format";
import { unitsUrl } from "@/lib/url";

const PRESETS = [
  { label: "500 ألف", value: 500_000 },
  { label: "700 ألف", value: 700_000 },
  { label: "مليون", value: 1_000_000 },
  { label: "2 مليون", value: 2_000_000 },
];
const BEDS_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: "الكل" },
  { value: 2, label: "غرفتان" },
  { value: 3, label: "3 غرف" },
  { value: 4, label: "4 غرف" },
  { value: 5, label: "5 غرف فأكثر" },
];
const COUNT_WORDS: Record<number, string> = { 1: "الوحدة الواحدة", 2: "الوحدتين", 3: "الوحدات الثلاث", 4: "الوحدات الأربع", 5: "الوحدات الخمس", 6: "الوحدات الست", 7: "الوحدات السبع", 8: "الوحدات الثماني", 9: "الوحدات التسع", 10: "الوحدات العشر" };

export function ctaLabel(count: number): string {
  if (count === 0) return "اعرض كل الوحدات المتاحة";
  return count <= 10 ? `اعرض ${COUNT_WORDS[count]}` : `اعرض ${count} وحدة`;
}

function bedsLine(min: number, max: number): string {
  const w = (n: number) => (n === 2 ? "غرفتان" : `${n} غرف`);
  return min === max ? w(min) : `${w(min)} إلى ${w(max)}`;
}

export function HomeFinder({ variant = "page" }: { variant?: "page" | "preview" }) {
  const [budget, setBudget] = useState(700_000);
  const [district, setDistrict] = useState<string>("rawdah");
  const [beds, setBeds] = useState<number | null>(null);
  const [picker, setPicker] = useState<"district" | "beds" | null>(null);
  const overrides = useUnitOverrides();
  const type: FinderType = "all";
  const answer = useMemo(() => finderAnswer(budget, district, type, beds, overrides), [budget, district, beds, overrides]);

  const resultsHref = unitsUrl({ district, max: budget, beds, type: [] });
  const line = `حتى ${fmtNum(budget)} في ${district === "all" ? "كل جدة" : `حي ${districtAr(district)}`}`;
  const ranges = answer.count
    ? [answer.beds && bedsLine(answer.beds.min, answer.beds.max), answer.area && `${fmtArea(answer.area.min)} إلى ${fmtArea(answer.area.max)} م²`, answer.ppm && `${fmtNum(answer.ppm.min)} إلى ${fmtNum(answer.ppm.max)} للمتر`].filter(Boolean).join(" · ")
    : "لا وحدات ضمن هذه الميزانية في هذا الحي بعد";

  const pickers = (
    <>
      <SelectButton label="الحي" value={district === "all" ? "كل جدة" : districtAr(district)} onClick={() => setPicker("district")} aria-haspopup="dialog" />
      <SelectButton label="الغرف" value={BEDS_OPTIONS.find((b) => b.value === beds)?.label ?? "الكل"} onClick={() => setPicker("beds")} aria-haspopup="dialog" />
    </>
  );
  const cta = (
    <Button variant="secondary" size="l" href={resultsHref} arrow between className="text-body font-bold">
      {ctaLabel(answer.count)}
    </Button>
  );
  const answerBlock = <AnswerBlock count={answer.count} countLabel="وحدات متاحة" line={line} from={answer.fromPrice ?? undefined} ranges={ranges} />;

  return (
    <div id="finder" className={cx("scroll-mt-16", variant === "page" && "md:grid md:grid-cols-2 md:gap-8")}>
      <BudgetBlock eyebrow="ابدأ من هنا" title="كم ميزانيتك؟" as="h2" titleSize="display" value={budget} onChange={setBudget} presets={PRESETS}
        description={<span className="hidden md:block">نعرض الوحدات المتاحة فعلاً في جدة، بأسعارها وسعر المتر، ثم نجلس معك على واتساب.</span>}>
        <div className="grid grid-cols-2 gap-2.5 mt-1">{pickers}</div>
        <div className="hidden md:block mt-2">{cta}</div>
      </BudgetBlock>

      {/* phone: answer, CTA, footnote */}
      <div className="flex flex-col gap-3.5 px-4 pt-5 md:hidden">
        {answerBlock}
        {cta}
        <p className="m-0 text-caption text-muted">
          أو <WhatsAppLink text="أريد عرضاً يناسب ميزانيتي" className="font-bold text-ink underline">أرسل ميزانيتك على واتساب</WhatsAppLink>، نرد خلال ساعات العمل.
        </p>
      </div>

      {/* desktop: illustrative image with the answer block over its foot */}
      <div className="relative hidden md:flex md:flex-col md:justify-end min-h-[560px]">
        <div className="absolute inset-0 bg-slot cut-xl">
          <ImageSlotLazy />
        </div>
        <div className="relative z-10 me-10 ms-0 mb-0">{answerBlock}</div>
      </div>

      <BottomSheet open={picker === "district"} onClose={() => setPicker(null)} title="اختر الحي" desktop="dialog">
        <div className="flex flex-wrap gap-2 p-4">
          <Chip active={district === "all"} onClick={() => { setDistrict("all"); setPicker(null); }}>كل جدة</Chip>
          {siteDistricts().map((d) => (
            <Chip key={d.slug} active={district === d.slug} onClick={() => { setDistrict(d.slug); setPicker(null); }}>
              {d.ar}{d.comingSoon ? " · قريباً" : ""}
            </Chip>
          ))}
          <p className="w-full m-0 text-caption text-muted">الوحدات المدرجة اليوم في {districtAr("rawdah")} فقط؛ بقية الأحياء {districts.length - 1} حياً قريباً.</p>
        </div>
      </BottomSheet>
      <BottomSheet open={picker === "beds"} onClose={() => setPicker(null)} title="عدد الغرف" desktop="dialog">
        <div className="flex flex-wrap gap-2 p-4">
          {BEDS_OPTIONS.map((b) => (
            <Chip key={String(b.value)} active={beds === b.value} onClick={() => { setBeds(b.value); setPicker(null); }}>{b.label}</Chip>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}

import { ImageSlot } from "@/components/ui";
function ImageSlotLazy() {
  return <ImageSlot slotId="IMG-ED-ROWDAH-TREES" tier="generated" ratio="4:5" cut="none" className="h-full w-full" as="div" />;
}
