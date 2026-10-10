"use client";
// /alliance/apply/coverage · AllianceApply-Step2-M / -D: sectors, districts (fixed list, grouped, searchable), the radar
// preview (desktop), specialties, working hours.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { allianceSettings, coverageBySector, districtBySlug, districts, HOURS_LABELS, type Office, type Sector } from "@/data";
import { ErrorSummary, ErrorText, RadioGroup } from "@/components/ui";
import { DistrictMultiSelect, HexGrid, SECTOR_LABELS, SECTOR_ORDER, type HexCellProps } from "@/components/alliance";
import { maskedLicence } from "../data";
import { ApplyShell, CheckTile, FormCard, GroupLabel, MainButton, StepNav } from "./parts";
import { errorsTitle, step2Errors, updateDraft, useApplyDraft } from "./draft";

function districtsWord(n: number): string {
  if (n === 1) return "حي واحد";
  if (n === 2) return "حيّان";
  if (n >= 3 && n <= 10) return `${n} أحياء`;
  return `${n} حياً`;
}

function RadarPreview({ sectors, selected }: { sectors: Sector[]; selected: string[] }) {
  const wanted = new Set(coverageBySector().flatMap((s) => s.districts.filter((d) => d.wanted).map((d) => d.district.slug)));
  const pool = districts.filter((d) => sectors.includes(d.sector) || selected.includes(d.slug));
  const cells: (HexCellProps & { key: string })[] = pool.map((d) => {
    const on = selected.includes(d.slug);
    if (on) return { key: d.slug, label: d.ar, state: "active", ariaLabel: `${d.ar} · ضمن تغطيتك` };
    if (wanted.has(d.slug)) return { key: d.slug, label: d.ar, value: "مطلوب", state: "required", ariaLabel: `${d.ar} · مطلوب` };
    return { key: d.slug, label: d.ar, state: "muted", ariaLabel: d.ar };
  });
  return (
    <div className="flex flex-col gap-3 bg-cream p-4" style={{ border: "1.5px solid var(--smq-line)" }}>
      <span className="text-[12px] font-extrabold">تغطيتك كما ستظهر في الرادار</span>
      {cells.length ? <HexGrid cells={cells} columns={4} size={56} gap={3} rowGap={3} shift="odd" ariaLabel="تغطيتك كما ستظهر في الرادار" /> : <span className="text-caption text-muted">اختر الجهة أولاً</span>}
      <span className="text-caption leading-relaxed text-muted">{districtsWord(selected.length)} · الذهبي حيث يبحث مشترو SMQ اليوم ولا يغطيه عضو. تستقبل طلبات هذه الأحياء من أول يوم بعد التوثيق.</span>
    </div>
  );
}

const LABELS: Record<string, string> = { sectors: "الجهة على مستوى جدة", districts: "الأحياء التي يغطيها المكتب" };

export function ApplyStep2() {
  const d = useApplyDraft();
  const router = useRouter();
  const errors = d.attempted[2] ? step2Errors(d) : {};
  const list = Object.keys(errors).map((k) => ({ id: `apply-${k}`, label: LABELS[k] ?? k }));
  const role = d.role.replace(/ العقاري$/, "");
  const district = districtBySlug(d.district)?.ar;
  const toggle = <T extends string>(arr: T[], v: T, on: boolean) => (on ? [...arr.filter((x) => x !== v), v] : arr.filter((x) => x !== v));

  const next = () => {
    const e = step2Errors(d);
    updateDraft({ attempted: { ...d.attempted, 2: true } });
    if (Object.keys(e).length === 0) router.push("/alliance/apply/offers");
  };

  return (
    <ApplyShell
      aside={
        <>
          <div className="hidden flex-col gap-2 bg-ink px-5 py-5 text-paper cut-l md:flex">
            <span className="text-[12px] font-bold text-gold">لماذا الأحياء من قائمة؟</span>
            <span className="text-[14px] leading-relaxed text-on-ink-muted">طلب المشتري يحمل اسم الحي كما في فلاتر SMQ. حين تتطابق الأسماء يصلك الطلب في ثوانٍ، ولا يضيع في «أبحر» مقابل «أبحر الشمالية».</span>
          </div>
          <div className="hidden flex-col gap-2 px-5 py-4 text-[13px] md:flex" style={{ border: "1.5px solid var(--smq-ink)" }}>
            <span className="text-[12px] font-extrabold">ما يبقى بعد هذه الخطوة</span>
            <span>· العروض التي لديكم وعددها</span>
            <span>· طلباتكم في أحياء أخرى</span>
            <span>· ماذا تريدون وماذا ستضيفون</span>
            <span>· الموافقة على الميثاق</span>
          </div>
          <Link href="/alliance/status/ALL-2026-0038" className="hidden text-[12px] font-bold text-gold-text no-underline hover:text-ink hover:underline md:inline">
            قدّمت من قبل عبر نموذج قوقل؟ تابع حالة طلبك ←
          </Link>
        </>
      }
    >
      <FormCard step={2} h1>
        <div className="flex items-center justify-between gap-3 bg-sand px-3.5 py-3 text-[12px] md:text-[13px]">
          <span className="leading-relaxed">
            <strong className="font-extrabold">{d.officeName || "—"}</strong> · فال <span className="tnum">{maskedLicence(d.licence)}</span>
            {district && ` · ${district}`}
            <span className="hidden md:inline"> · {role}</span>
          </span>
          <Link href="/alliance/apply" className="relative inline-flex h-9 shrink-0 items-center bg-paper px-3 text-[12px] font-bold text-ink no-underline after:absolute after:-inset-1 after:content-[''] hover:bg-cream" style={{ border: "1.5px solid var(--smq-ink)" }}>
            تعديل
          </Link>
        </div>
        <form
          noValidate
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
        >
          {list.length > 0 && <ErrorSummary title={errorsTitle(list.length, "لم ننتقل للخطوة التالية.")} errors={list} />}
          <fieldset id="apply-sectors" tabIndex={-1} className="m-0 flex flex-col gap-2.5 border-0 p-0 outline-none" aria-invalid={errors.sectors ? true : undefined}>
            <legend className="mb-2.5 p-0">
              <GroupLabel required note="(اختر أكثر من واحدة)">
                الجهة على مستوى جدة
              </GroupLabel>
            </legend>
            <div className="flex flex-wrap gap-2">
              {SECTOR_ORDER.map((s) => (
                <CheckTile key={s} name="sectors" label={SECTOR_LABELS[s]} checked={d.sectors.includes(s)} onChange={(on) => updateDraft({ sectors: toggle(d.sectors, s, on) })} />
              ))}
            </div>
            {errors.sectors && <ErrorText>{errors.sectors}</ErrorText>}
          </fieldset>
          <div className="grid gap-5 md:grid-cols-2 md:items-start md:gap-6">
            <div id="apply-districts" tabIndex={-1} className="outline-none">
              <DistrictMultiSelect
                districts={districts}
                value={d.districts}
                onChange={(v) => updateDraft({ districts: v })}
                label="الأحياء التي يغطيها المكتب"
                error={errors.districts ? true : undefined}
                note="قائمة ثابتة لا نص حر: الطلبات تُوجَّه بالحي، فلا بد أن تتطابق الأسماء."
                sheetTitle="الأحياء التي يغطيها المكتب"
              />
            </div>
            <div className="hidden md:block">
              <RadarPreview sectors={d.sectors} selected={d.districts} />
            </div>
          </div>
          <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
            <legend className="mb-2.5 p-0">
              <GroupLabel note="(اختر ما ينطبق)">التخصص</GroupLabel>
            </legend>
            <div className="flex flex-wrap gap-2">
              {allianceSettings.options.specialties.map((sp) => (
                <CheckTile key={sp} name="specialties" label={sp} checked={d.specialties.includes(sp)} onChange={(on) => updateDraft({ specialties: toggle(d.specialties, sp, on) })} />
              ))}
            </div>
          </fieldset>
          <div className="flex flex-col gap-1.5">
            <div className="md:hidden">
              <RadioGroup<Office["hours"]>
                name="apply-hours"
                label="طريقة الدوام"
                columns={2}
                options={(Object.keys(HOURS_LABELS) as Office["hours"][]).map((h) => ({ value: h, label: HOURS_LABELS[h] }))}
                value={d.hours}
                onChange={(v) => updateDraft({ hours: v })}
              />
            </div>
            <div className="hidden md:block">
              <RadioGroup<Office["hours"]>
                name="apply-hours-d"
                label="طريقة الدوام"
                columns={4}
                options={(Object.keys(HOURS_LABELS) as Office["hours"][]).map((h) => ({ value: h, label: HOURS_LABELS[h] }))}
                value={d.hours}
                onChange={(v) => updateDraft({ hours: v })}
              />
            </div>
            <span className="text-caption leading-relaxed text-muted md:text-[12px]">نرسل الطلبات في وقت دوامك، ونحسب سرعة الرد ضمن ساعات العمل فقط.</span>
          </div>
          <StepNav back="/alliance/apply">
            <MainButton>التالي: ما عندكم وما تحتاجون</MainButton>
          </StepNav>
        </form>
      </FormCard>
    </ApplyShell>
  );
}
