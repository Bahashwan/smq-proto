"use client";
// /marketers/sent · the marketer form has no designed success board, so this is the Add-Success pattern: the number
// (MK-10, the next marketer id), «نسخ», the three next steps (review → a short interview within a week → the page and
// the tracked link on acceptance), WhatsApp prefilled with the number, and «ملخص ما أرسلت» on desktop. Opened without a
// submission in this session it shows the newest «جديد» application of the fixtures.
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui";
import { districtAr } from "@/data/districts";
import { waLink } from "@/lib/format";
import { useHasHydrated } from "@/lib/location";
import { usePatch, useStore } from "@/lib/store";
import { MARKETER_EMPTY } from "./MarketerForm";
import { latestApplication, type MarketerSent as Sent } from "./marketer";
import { MARKETER_FOOTER, Shell } from "./parts";
import { HomeButton, NumberBlock, SentLayout, SentSteps, SentSummary } from "./Sent";

export function MarketerSent() {
  const hydrated = useHasHydrated();
  const stored = usePatch<Sent>("marketer-form", "sent");
  const patch = useStore((s) => s.patch);
  const s: Sent = useMemo(() => (hydrated && stored?.no ? (stored as Sent) : latestApplication()), [hydrated, stored]);

  useEffect(() => {
    if (!stored?.fresh) return;
    patch("marketer-form", "draft", { ...MARKETER_EMPTY });
    patch("marketer-form", "sent", { fresh: false });
  }, [stored?.fresh, patch]);

  const rows = [
    { label: "الاسم", value: s.name },
    { label: "الجوال", value: <span dir="ltr">{s.phone}</span> },
    { label: "رخصة فال", value: s.fal || "لا توجد" },
    { label: "الأحياء", value: s.districts.map(districtAr).join("، ") || "—" },
    { label: "سنوات الخبرة", value: s.years },
  ];

  return (
    <Shell footer={MARKETER_FOOTER}>
      <SentLayout
        text="طلب انضمامك كمسوّق عند فريق SMQ. نتواصل معك خلال أسبوع لمقابلة قصيرة على واتساب أو اتصال، وعند القبول تصلك صفحتك ورابطك."
        number={<NumberBlock no={s.no} line="اذكر الرقم في أي تواصل." />}
        summary={<SentSummary rows={rows} />}
        steps={
          <SentSteps
            steps={[
              { title: "الآن", phone: "الطلب عند فريق SMQ للمراجعة.", desktop: "عند فريق SMQ للمراجعة." },
              { title: "خلال أسبوع", phone: "مقابلة قصيرة على واتساب أو اتصال.", desktop: "مقابلة قصيرة على واتساب أو اتصال." },
              { title: "عند القبول", phone: "تصلك صفحتك ورابطك المتابَع ورمز QR باسمك.", desktop: "صفحتك ورابطك المتابَع ورمز QR باسمك." },
            ]}
          />
        }
        actions={
          <>
            <Button variant="whatsapp" href={waLink(`طلب انضمام ${s.no}`)} className="w-full md:w-auto">
              تابع طلبك عبر واتساب
            </Button>
            <HomeButton />
            <Button variant="link" href="/m/mk-07" className="h-11 self-center whitespace-nowrap md:ms-2">
              كيف تبدو صفحة المسوّق بعد القبول ←
            </Button>
          </>
        }
      />
    </Shell>
  );
}
