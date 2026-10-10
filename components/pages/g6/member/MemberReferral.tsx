"use client";
// /member/[token]/referrals/[id] · Member-Referral-M: the referral record both offices open from WhatsApp. Rendered
// from the fixture (REF-2026-0117 is SMQ ↔ مكتب ط); a record created in the alliance room is read from the store; the
// stage follows the store's updates.
import { districtAr, officeById, referrals, requestById, type AllianceRequest, type Referral } from "@/data";
import { useStore } from "@/lib/store";
import { fmtDate, waLink } from "@/lib/format";
import { LICENCE, PhoneColumn } from "@/components/ui";
import { ReferralReceipt, type ReceiptParty } from "@/components/alliance";
import { MemberHeader } from "../chrome";

const SOURCE_AR: Record<AllianceRequest["source"], string> = { visitor: "زائر SMQ بلا نتائج", staff: "فريق SMQ", member: "مكتب عضو" };

function party(id: string): ReceiptParty {
  if (id === "SMQ") return { name: "SMQ العقارية", licence: `فال ${LICENCE.rega}` };
  const o = officeById(id);
  return { name: o?.fullName ?? id, licence: `فال ${o?.licence.number ?? ""} · موثّقة` };
}
/** «2026-10-10T10:42:00+03:00» → «2026/10/10 · 10:42» (Jeddah time as written in the record) */
function stamp(iso?: string): string | undefined {
  if (!iso) return undefined;
  return `${fmtDate(iso.slice(0, 10))} · ${iso.slice(11, 16)}`;
}

function PrintIcon() {
  return (
    <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
      <path d="M7 9V3h10v6" />
      <path d="M7 17H4v-7h16v7h-3" />
      <path d="M7 14h10v7H7z" />
    </svg>
  );
}

export function MemberReferral({ officeId, referralId }: { officeId: string; referralId: string }) {
  const created = useStore((s) => s.createdReferrals);
  const stageOverride = useStore((s) => s.referralStages[referralId]);
  const base: Referral | undefined = created.find((r) => r.id === referralId) ?? referrals.find((r) => r.id === referralId);
  if (!base || !officeById(officeId)) return null;
  const r: Referral = stageOverride ? { ...base, stage: stageOverride.stage, stageNote: stageOverride.note ?? base.stageNote } : base;
  const req = requestById(r.requestId);

  return (
    <PhoneColumn className="bg-cream">
      <div className="min-h-dvh bg-cream text-ink print:bg-paper">
        <MemberHeader
          subtitle="سجل إحالة · يُفتح من رابط واتساب للمكتبين"
          className="print:hidden"
          action={
            <button type="button" aria-label="مشاركة أو طباعة" onClick={() => window.print()} className="flex h-11 w-11 shrink-0 items-center justify-center text-paper hover:bg-ink-2" style={{ border: "1.5px solid var(--smq-muted)" }}>
              <PrintIcon />
            </button>
          }
        />
        <main className="flex flex-col gap-4 px-4 py-5">
          <ReferralReceipt
            referral={r}
            requester={party(r.requesterOfficeId)}
            offerer={party(r.offerOfficeId)}
            district={districtAr(r.districtSlug)}
            time={r.createdAt?.slice(11, 16)}
            createdBy={r.createdBy}
            requestSource={req ? SOURCE_AR[req.source] : undefined}
            offerSentAt={stamp(r.offerSentAt)}
            charterLine={r.charterVersion ? `النسخة ${r.charterVersion} · وافق عليه المكتبان` : undefined}
          />
          <div className="grid grid-cols-2 gap-2.5 print:hidden">
            <button type="button" onClick={() => window.print()} className="inline-flex h-12 items-center justify-center bg-paper text-[13px] font-extrabold text-ink hover:bg-sand" style={{ border: "1.5px solid var(--smq-ink)" }}>
              حفظ PDF
            </button>
            <a href={waLink(r.id)} target="_blank" rel="noopener" className="inline-flex h-12 items-center justify-center bg-gold text-[13px] font-extrabold text-ink no-underline cut-s hover:bg-gold-hover">
              اعتراض أو تحديث
            </a>
          </div>
        </main>
      </div>
    </PhoneColumn>
  );
}
