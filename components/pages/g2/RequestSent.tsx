"use client";
// /alliance/request/sent?req=REQ-2026-0412 · State-Empty-Success-M: the request echoed back (fixture or the one
// the bridge form just created in the store), the number to copy, what was sent, the timing and the exit links.
import { useState } from "react";
import { Button, CheckIcon, Container, Footer, Header } from "@/components/ui";
import { cx, fmtNum } from "@/lib/format";
import { useQuery } from "@/lib/location";
import { usePatch, useStore, useUnitOverrides } from "@/lib/store";
import { unitsUrl, type UnitTypeParam } from "@/lib/url";
import { districtAr } from "@/data/districts";
import { requestById } from "@/data/requests";
import { bedsWord, filterUnits, TYPE_PARAM_LABELS } from "@/data/selectors";

const DEFAULT_REQ = "REQ-2026-0412";
const TYPE_AR_TO_PARAM: Record<string, UnitTypeParam> = { شقة: "apt", "فيلا روف": "roof", فيلا: "villa", دوبلكس: "duplex" };

interface EchoedRequest {
  id: string;
  districtSlug: string;
  typeLabelAr: string;
  type: UnitTypeParam;
  beds: number | null;
  budgetMax: number | null;
  phoneMasked: string;
}

/** the fields the bridge form patches onto a created request (a type alias, so it fits the store's Record shape) */
type CreatedPatch = {
  beds?: number | null;
  budgetMax?: number | null;
  type?: UnitTypeParam | null;
  typeLabelAr?: string;
  buyerPhoneMasked?: string;
  districtSlug?: string;
};

function useEchoedRequest(id: string): EchoedRequest {
  const created = useStore((s) => s.createdRequests).find((r) => r.id === id);
  const patch = usePatch<CreatedPatch>("request", id);
  const fixture = requestById(id) ?? requestById(DEFAULT_REQ)!;
  if (created) {
    return {
      id,
      districtSlug: patch?.districtSlug ?? created.districtSlug,
      typeLabelAr: patch?.typeLabelAr ?? "وحدة",
      type: patch?.type ?? "apt",
      beds: patch?.beds ?? null,
      budgetMax: patch?.budgetMax ?? null,
      phoneMasked: patch?.buyerPhoneMasked ?? "05X XXX XXXX",
    };
  }
  return {
    id: fixture.id,
    districtSlug: fixture.districtSlug,
    typeLabelAr: fixture.typeLabelAr ?? fixture.type,
    type: TYPE_AR_TO_PARAM[fixture.type] ?? "apt",
    beds: fixture.beds ?? null,
    budgetMax: fixture.budgetMax ?? null,
    phoneMasked: fixture.buyerPhoneMasked ?? "05X XXX XXXX",
  };
}

export function RequestSent() {
  const q = useQuery();
  const id = q.get("req") ?? DEFAULT_REQ;
  const req = useEchoedRequest(id);
  const toast = useStore((s) => s.toast);
  const overrides = useUnitOverrides();
  const [copied, setCopied] = useState(false);
  const dAr = req.districtSlug === "all" ? "كل جدة" : districtAr(req.districtSlug);

  // «في الانتظار؟ شقق 4 غرف في كل جدة · 6»: the same type and rooms across Jeddah; rooms dropped when that gives nothing
  const withBeds = filterUnits({ type: [req.type], beds: req.beds }, overrides).available.length;
  const useBeds = req.beds != null && withBeds > 0;
  const waiting = useBeds ? withBeds : filterUnits({ type: [req.type] }, overrides).available.length;
  const waitingLabel = `${TYPE_PARAM_LABELS[req.type]}${useBeds && req.beds != null ? ` ${bedsWord(req.beds)}` : ""} في كل جدة`;
  const waitingHref = unitsUrl({ type: [req.type], beds: useBeds ? req.beds : null });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(req.id);
      setCopied(true);
      toast("نُسخ رقم الطلب");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast(req.id);
    }
  };

  const rows: { tone: string; title: string; text: string }[] = [
    { tone: "bg-gold", title: "ما أُرسل للمكتب:", text: "الحي، الميزانية، عدد الغرف، النوع. لا اسمك ولا رقمك." },
    { tone: "bg-ink", title: "المدة:", text: "المكاتب تردّ عادةً خلال يوم عمل. إن لم يردّ أحد خلال 3 أيام نخبرك." },
    { tone: "bg-paper ring-hex", title: "بلا التزام:", text: "اكتب «توقف» على واتساب لإلغاء الطلب في أي وقت." },
  ];

  return (
    <>
      <Header />
      <main className="pb-10">
        <Container className="pt-6">
          <div className="mx-auto flex w-full max-w-[480px] flex-col gap-4">
            <span aria-hidden="true" className="hex-flat inline-flex size-14 items-center justify-center bg-gold text-ink">
              <CheckIcon size={26} />
            </span>
            <h1 className="m-0 text-[26px] font-extrabold leading-tight md:text-h1">أُرسل طلبك إلى التحالف</h1>
            <p className="m-0 text-label font-normal leading-relaxed text-ink-2">
              {req.typeLabelAr} في {dAr}
              {req.budgetMax != null && <> حتى {fmtNum(req.budgetMax)} ريال</>}. وصل الطلب لمكتب موثّق يغطي الحي. حين يردّ بعرض مطابق نراسلك نحن على واتساب ونعرّفكم ببعض.
            </p>
            <div className="flex flex-col gap-1.5 bg-ink p-4 text-paper cut-l">
              <span className="text-caption font-bold text-on-ink-muted">رقم الطلب</span>
              <div className="flex items-center justify-between gap-3">
                <span className="text-h2 font-extrabold tnum" dir="ltr">
                  {req.id}
                </span>
                <button type="button" onClick={copy} aria-live="polite" className="inline-flex h-10 items-center border-[1.5px] border-paper px-3 text-caption font-extrabold text-paper hover:bg-ink-2 motion-hover transition-colors">
                  {copied ? "نُسخ" : "نسخ"}
                </button>
              </div>
              <span className="text-caption font-normal text-on-ink-muted">
                رسالة واتساب بنفس الرقم إلى <span dir="ltr">{req.phoneMasked}</span>
              </span>
            </div>
            <div className="flex flex-col border-interactive">
              {rows.map((row, i) => (
                <div key={row.title} className={cx("flex items-start gap-3 p-3 text-caption font-normal leading-relaxed", i > 0 && "border-t border-line")}>
                  <span aria-hidden="true" className="relative mt-1 inline-flex size-3.5 shrink-0 items-center justify-center">
                    {row.tone === "bg-paper ring-hex" ? (
                      <>
                        <span className="hex-point absolute inset-0 bg-ink" />
                        <span className="hex-point absolute inset-[2px] bg-paper" />
                      </>
                    ) : (
                      <span className={cx("hex-point absolute inset-0", row.tone)} />
                    )}
                  </span>
                  <span>
                    <strong className="font-bold">{row.title}</strong> {row.text}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-col gap-2.5">
              <Button variant="secondary" size="l" full href={waitingHref} className="text-label">
                في الانتظار؟ {waitingLabel} · {waiting}
              </Button>
              <Button variant="ghost" size="m" full href="/" className="text-label font-bold">
                العودة إلى الرئيسية
              </Button>
            </div>
          </div>
        </Container>
      </main>
      <Footer compact />
    </>
  );
}
