"use client";
// /add/sent?no=… · Add-Success-M / Add-Success-D. Shows this session's submission when its number matches `no`,
// otherwise the approvals fixture for that number (2026-1043 the apartment, 2026-1042 the income building the owner
// tour then opens in admin), so the page works when opened directly. «نسخ» copies the number; the WhatsApp button
// is prefilled with «طلب <number>». A fresh submission clears the draft so the next visit starts over.
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui";
import { approvalById } from "@/data/approvals";
import { waLink } from "@/lib/format";
import { useHasHydrated, useQuery } from "@/lib/location";
import { usePresenter } from "@/lib/presenter";
import { usePatch, useStore } from "@/lib/store";
import { requestNumber, sentFromApproval, sentLine, sentRows, sentWaLabel, useAddDraft, type AddSent as Sent } from "./draft";
import { HomeButton, NumberBlock, SentLayout, SentSteps, SentSummary } from "./Sent";
import { Shell } from "./parts";

export function AddSent() {
  const hydrated = useHasHydrated();
  const q = useQuery();
  const { state } = usePresenter();
  const stored = usePatch<Sent & { fresh?: boolean }>("add", "sent");
  const patch = useStore((s) => s.patch);
  const { reset } = useAddDraft();
  const wanted = q.get("no") ?? "";

  const s: Sent = useMemo(() => {
    if (hydrated && stored?.no && (!wanted || stored.no === wanted)) return stored as Sent;
    const a = approvalById(wanted) ?? approvalById(requestNumber("شقة"));
    return sentFromApproval(a!);
  }, [hydrated, stored, wanted]);

  useEffect(() => {
    if (!stored?.fresh) return;
    reset();
    patch("add", "sent", { fresh: false });
  }, [stored?.fresh, reset, patch]);

  const building = s.kind === "building";
  const manual = state.wa === "manual";
  const line = manual ? (
    <>ستصلك رسالة واتساب بنفس الرقم على {<span dir="ltr" className="tnum">{s.phone}</span>} من فريقنا.</>
  ) : (
    <>
      أُرسلت رسالة واتساب بنفس الرقم إلى <span dir="ltr" className="tnum">{s.phone}</span>
      <span className="hidden md:inline">. اذكر الرقم في أي تواصل.</span>
    </>
  );

  return (
    <Shell>
      <SentLayout
        text={sentLine(s)}
        number={<NumberBlock no={s.no} line={line} />}
        summary={<SentSummary rows={sentRows(s)} />}
        steps={
          <SentSteps
            steps={[
              { title: "الآن", phone: "الطلب عند فريق المراجعة. لا يظهر على الموقع بعد.", desktop: "عند فريق المراجعة. لا يظهر على الموقع بعد." },
              { title: "خلال 24 ساعة عمل", phone: "نتصل أو نراسلك بتقييم أولي وموعد تصوير.", desktop: building ? "تقييم أولي بالعائد وسعر المتر، وموعد تصوير." : "تقييم أولي بسعر المتر، وموعد تصوير." },
              { title: "بعد الموافقة", phone: "يُنشر بوسم «من مالك» وبسعر معلن، ونرسل لك رابطه.", desktop: "نشر بوسم «من مالك» وبسعر معلن، ورابط يصلك." },
            ]}
          />
        }
        actions={
          <>
            <Button variant="whatsapp" href={waLink(`طلب ${s.no}`)} className="w-full md:w-auto">
              {sentWaLabel(s)}
            </Button>
            <HomeButton />
          </>
        }
      />
    </Shell>
  );
}
