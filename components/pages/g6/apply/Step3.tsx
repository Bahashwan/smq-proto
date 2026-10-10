"use client";
// /alliance/apply/offers · AllianceApply-Step3-M: offer counters and total, requests in other districts, the two text
// fields, notes, the directory consent (optional) and the charter consent (required) → /alliance/apply/sent.
import { useRouter } from "next/navigation";
import { allianceSettings, districts } from "@/data";
import { Checkbox, ErrorSummary, ErrorText, RadioGroup, TextArea } from "@/components/ui";
import { DistrictMultiSelect, Tbc, daysLabel } from "@/components/alliance";
import { useStore } from "@/lib/store";
import { APPLY_ID } from "../data";
import { ApplyShell, CharterSheet, Counter, FormCard, MainButton, StepNav, useSheet } from "./parts";
import { errorsTitle, resetDraft, step1Errors, step2Errors, step3Errors, updateDraft, useApplyDraft } from "./draft";

const LABELS: Record<string, string> = { want: "ماذا تريدون من التحالف", add: "ماذا ستضيفون للتحالف", charter: "أوافق على ميثاق التحالف" };

export function ApplyStep3() {
  const d = useApplyDraft();
  const router = useRouter();
  const patch = useStore((s) => s.patch);
  const [charterOpen, openCharter, closeCharter] = useSheet();
  const errors = d.attempted[3] ? step3Errors(d) : {};
  const list = Object.keys(errors).map((k) => ({ id: `apply-${k}`, label: LABELS[k] ?? k }));
  const def = allianceSettings.defaults;

  const submit = () => {
    const attempted = { ...d.attempted, 3: true };
    if (Object.keys(step3Errors(d)).length) return updateDraft({ attempted });
    if (Object.keys(step1Errors(d)).length) {
      updateDraft({ attempted: { ...attempted, 1: true } });
      return router.push("/alliance/apply");
    }
    if (Object.keys(step2Errors(d)).length) {
      updateDraft({ attempted: { ...attempted, 2: true } });
      return router.push("/alliance/apply/coverage");
    }
    const last4 = d.phone.replace(/\D/g, "").slice(-4);
    patch("application", APPLY_ID, { officeName: d.officeName.trim(), ...(last4.length === 4 ? { phoneMasked: `+966 5X XXX ${last4}` } : {}), districts: d.districts, submitted: true });
    resetDraft();
    router.push("/alliance/apply/sent");
  };

  return (
    <ApplyShell>
      <FormCard step={3} h1>
        <form
          noValidate
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          {list.length > 0 && <ErrorSummary title={errorsTitle(list.length, "لم يُرسل الطلب.")} errors={list} />}
          <div className="flex flex-col gap-3">
            <span className="text-[13px] font-extrabold">العروض التي لديكم الآن</span>
            <div className="grid grid-cols-2 gap-2.5">
              <Counter label="عدد العروض من الملاك مباشرة" value={d.offersDirect} onChange={(n) => updateDraft({ offersDirect: n })} />
              <Counter label="عدد العروض بعقود وساطة موثقة في موقع الهيئة" value={d.offersBrokered} onChange={(n) => updateDraft({ offersBrokered: n })} />
            </div>
            <div className="flex items-center justify-between gap-3 bg-sand px-3.5 py-3 text-[13px]">
              <span>إجمالي العروض المتاحة</span>
              <strong className="text-[18px] font-extrabold tnum" aria-live="polite">
                {d.offersDirect + d.offersBrokered}
              </strong>
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <RadioGroup<"yes" | "no">
              name="apply-elsewhere"
              label={<span className="text-[13px] font-extrabold text-ink">هل لديكم طلبات في أحياء أخرى؟</span>}
              columns={2}
              options={[
                { value: "yes", label: "نعم" },
                { value: "no", label: "لا" },
              ]}
              value={d.elsewhere}
              onChange={(v) => updateDraft({ elsewhere: v })}
            />
            {d.elsewhere === "yes" && (
              <div className="relative flex flex-col gap-1 bg-cream px-3.5 py-3.5" style={{ border: "1.5px solid var(--smq-ink)" }}>
                <span aria-hidden className="absolute -inset-y-[1.5px] -start-[1.5px] w-[5px] bg-gold" />
                <DistrictMultiSelect
                  districts={districts}
                  value={d.elsewhereDistricts}
                  onChange={(v) => updateDraft({ elsewhereDistricts: v })}
                  label="أي أحياء؟"
                  placeholder="أضف حياً"
                  inlineList={false}
                  sheetTitle="أي أحياء؟"
                />
                <span className="text-caption font-semibold leading-relaxed text-muted">هذه الطلبات تُرسل لمن يغطي تلك الأحياء بعد التوثيق مباشرة.</span>
              </div>
            )}
          </div>
          <TextArea id="apply-want" label="ماذا تريدون من التحالف" required rows={3} placeholder="مثال: طلبات مشترين جادّين في أبحر، وتقرير عن أسعار المتر" value={d.want} onChange={(e) => updateDraft({ want: e.target.value })} error={errors.want} />
          <TextArea id="apply-add" label="ماذا ستضيفون للتحالف" required rows={3} placeholder="مثال: 10 عروض فلل بعقود وساطة" value={d.add} onChange={(e) => updateDraft({ add: e.target.value })} error={errors.add} />
          <TextArea id="apply-notes" label="ملاحظات" rows={3} placeholder="اختياري" value={d.notes} onChange={(e) => updateDraft({ notes: e.target.value })} />
          <Checkbox id="apply-directory" label="أوافق على ظهور اسم المكتب والحي والتخصص في دليل الأعضاء بعد التوثيق (اختياري)." checked={d.directoryConsent} onChange={(e) => updateDraft({ directoryConsent: e.target.checked })} />
          <div className="flex flex-col gap-1">
            <label
              htmlFor="apply-charter"
              className={errors.charter ? "flex cursor-pointer items-start gap-2.5 p-3.5 text-[12px] leading-relaxed text-ink border-error" : "flex cursor-pointer items-start gap-2.5 bg-cream p-3.5 text-[12px] leading-relaxed text-ink"}
              style={errors.charter ? undefined : { border: "1.5px solid var(--smq-ink)" }}
            >
              <input
                id="apply-charter"
                type="checkbox"
                checked={d.charterConsent}
                onChange={(e) => updateDraft({ charterConsent: e.target.checked })}
                aria-invalid={errors.charter ? true : undefined}
                aria-describedby={errors.charter ? "apply-charter-error" : undefined}
                aria-required
                className="mt-0.5 size-[18px] shrink-0 accent-ink"
              />
              <span>
                <strong className="font-extrabold">
                  أوافق على ميثاق التحالف<span className="text-gold-text"> *</span>
                </strong>
                : تقسيم العمولة {def.split}، حماية الإحالة {daysLabel(def.protectionDays)}، والإخراج عند تخطّي سجل إحالة أو انتهاء الرخصة أو انعدام الرد {daysLabel(def.suspendAfterNoReplyDays)} <Tbc />.{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    openCharter();
                  }}
                  className="font-bold text-gold-text underline hover:text-ink"
                >
                  النص الكامل
                </button>
                .
              </span>
            </label>
            {errors.charter && <ErrorText id="apply-charter-error">{errors.charter}</ErrorText>}
          </div>
          <StepNav back="/alliance/apply/coverage">
            <MainButton tone="gold">أرسل طلب الانضمام</MainButton>
          </StepNav>
        </form>
      </FormCard>
      <CharterSheet open={charterOpen} onClose={closeCharter} />
    </ApplyShell>
  );
}
