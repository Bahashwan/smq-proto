"use client";
// /alliance/apply · AllianceApply-Step1-M: office, licence, applicant, role, district, Google Maps link or pin.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { allianceSettings, districts } from "@/data";
import { Button, ErrorSummary, FieldShell, RadioGroup, SelectField, TextField } from "@/components/ui";
import { SECTOR_LABELS, SECTOR_ORDER } from "@/components/alliance";
import { PinPicker } from "@/components/map";
import { ApplyShell, FormCard } from "./parts";
import { DRAFT_DAYS, errorsTitle, step1Errors, updateDraft, useApplyDraft } from "./draft";

const FIELD_LABELS: Record<string, string> = {
  officeName: "اسم المكتب العقاري",
  licence: "رقم رخصة فال للمكتب",
  applicantName: "الاسم الكريم",
  phone: "رقم التواصل",
  district: "حي المكتب",
  maps: "موقع المكتب على خرائط قوقل",
};

export function ApplyStep1() {
  const d = useApplyDraft();
  const router = useRouter();
  const errors = d.attempted[1] ? step1Errors(d) : {};
  const list = Object.keys(errors).map((k) => ({ id: `apply-${k}`, label: FIELD_LABELS[k] ?? k }));
  const roles = allianceSettings.options.applicantRoles;

  const next = () => {
    const e = step1Errors(d);
    updateDraft({ attempted: { ...d.attempted, 1: true } });
    if (Object.keys(e).length === 0) router.push("/alliance/apply/coverage");
  };

  return (
    <ApplyShell
      aside={
        <Link href="/alliance/status/ALL-2026-0038" className="hidden text-[12px] font-bold text-gold-text no-underline hover:text-ink hover:underline md:inline">
          قدّمت من قبل عبر نموذج قوقل؟ تابع حالة طلبك ←
        </Link>
      }
    >
      <div className="mb-5 flex flex-col gap-2">
        <h1 className="text-[24px] font-extrabold md:text-[30px]">انضمام مكتبك إلى التحالف</h1>
        <p className="text-[12px] leading-relaxed text-muted md:text-[13px]">
          ثلاث خطوات، 5 دقائق. الحقول بعلامة <span className="font-extrabold text-gold-text">*</span> مطلوبة. يُحفظ ما تكتبه على هذا الجوال {DRAFT_DAYS} أيام.
        </p>
      </div>
      <FormCard step={1}>
        <form
          noValidate
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
        >
          {list.length > 0 && <ErrorSummary title={errorsTitle(list.length, "لم ننتقل للخطوة التالية.")} errors={list} />}
          <TextField id="apply-officeName" label="اسم المكتب العقاري" required requiredMark="asterisk" placeholder="كما في الرخصة" value={d.officeName} onChange={(e) => updateDraft({ officeName: e.target.value })} error={errors.officeName} autoComplete="organization" />
          <TextField
            id="apply-licence"
            label="رقم رخصة فال للمكتب"
            required
            requiredMark="asterisk"
            ltr
            inputMode="numeric"
            maxLength={10}
            placeholder="10 أرقام"
            hint="نتحقق منها يدوياً في موقع الهيئة العامة للعقار."
            value={d.licence}
            onChange={(e) => updateDraft({ licence: e.target.value.replace(/[^\d]/g, "") })}
            error={errors.licence}
          />
          <TextField id="apply-applicantName" label="الاسم الكريم" required requiredMark="asterisk" placeholder="اسم مقدم الطلب" value={d.applicantName} onChange={(e) => updateDraft({ applicantName: e.target.value })} error={errors.applicantName} autoComplete="name" />
          <TextField
            id="apply-phone"
            label="رقم التواصل"
            required
            requiredMark="asterisk"
            type="tel"
            ltr
            inputMode="tel"
            maxLength={10}
            placeholder="05XXXXXXXX"
            hint="واتساب. تصل عليه الطلبات ورابط صفحة العضو."
            value={d.phone}
            onChange={(e) => updateDraft({ phone: e.target.value.replace(/[^\d]/g, "") })}
            error={errors.phone}
            autoComplete="tel"
          />
          <RadioGroup name="apply-role" label="صفة مقدم الطلب" required columns={2} options={roles.map((r) => ({ value: r, label: r }))} value={d.role} onChange={(v) => updateDraft({ role: v })} />
          <SelectField id="apply-district" label="حي المكتب" required requiredMark="asterisk" placeholder="اختر الحي" value={d.district} onChange={(e) => updateDraft({ district: e.target.value, pin: null })} error={errors.district}>
            {SECTOR_ORDER.map((s) => (
              <optgroup key={s} label={SECTOR_LABELS[s]}>
                {districts
                  .filter((x) => x.sector === s)
                  .map((x) => (
                    <option key={x.slug} value={x.slug}>
                      {x.ar}
                    </option>
                  ))}
              </optgroup>
            ))}
          </SelectField>
          <FieldShell id="apply-maps-field" as="div" label={FIELD_LABELS.maps} required requiredMark="asterisk" error={errors.maps}>
            <div id="apply-maps" tabIndex={-1} className="outline-none">
            <PinPicker
              showModeTabs
              mode={d.mapsMode}
              onModeChange={(m) => updateDraft({ mapsMode: m })}
              link={d.mapsLink}
              onLinkChange={(l) => updateDraft({ mapsLink: l })}
              districtSlug={d.district || undefined}
              value={d.pin ? { x: d.pin.x, y: d.pin.y } : null}
              onChange={(v) => updateDraft({ pin: v })}
              height={110}
              gridSize={24}
              showRoads={false}
              echoLink={false}
              pinSize="s"
              ariaLabel="موقع المكتب على الخريطة"
            />
            </div>
          </FieldShell>
          <Button type="submit" variant="secondary" size="m" arrow full className="mt-1">
            التالي: التغطية والتخصص
          </Button>
        </form>
      </FormCard>
      <p className="mt-4 text-caption leading-relaxed text-muted">بياناتك تصل لفريق SMQ فقط للتحقق. اسم المكتب والحي والتخصص يظهران في الدليل بعد موافقتك في الخطوة 3.</p>
    </ApplyShell>
  );
}
