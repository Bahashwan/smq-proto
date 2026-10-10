"use client";
// /admin/alliance/members (Admin-AllianceMembers-D). The twelve members in abjad order with the ledger cells (gold =
// what the office gave, ink = what it received, bars scaled to the busiest office), licence state (verified, expiring
// with the reminder, suspended) and the mean reply time. مكتب ل is suspended: muted, out of the directory and routing.
// Search by office or district, filter by sector; «الملف» opens the member's file.
import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminButton } from "@/components/admin";
import { daysLabel, fmtReply } from "@/components/alliance";
import { MarkedText } from "@/components/ui";
import { districtAr, SECTORS } from "@/data/districts";
import { offices } from "@/data/offices";
import { allianceSettings, settings } from "@/data/settings";
import { ledgerNet, TODAY } from "@/data/selectors";
import type { Office, Sector } from "@/data/types";
import { cx, fmtDate, fmtDateLong } from "@/lib/format";
import { useStore } from "@/lib/store";
import { AllianceTabs, G9Shell, RoomTitle } from "./shell";

const SECTOR_KEYS: Sector[] = ["north", "central", "east", "west", "south"];
export const sectorShort = (s: Sector) => SECTORS[s].ar.replace(" جدة", "");
const DAY_MS = 86400000;
/** Days until the licence expires at the prototype's today. */
export const licenceDaysLeft = (o: Office) => Math.round((Date.parse(o.licence.expiresOn) - Date.parse(TODAY)) / DAY_MS);
/** A reply slower than one business day shows in gold. */
const BUSINESS_DAY_MIN = ((settings.businessHours?.close ?? 18) - (settings.businessHours?.open ?? 9)) * 60;
/** «منذ أكتوبر 2026» */
export const sinceLabel = (iso: string) => `منذ ${fmtDateLong(iso).split(" ").slice(1).join(" ")}`;

export function LedgerCells({ o, max }: { o: Office; max: number }) {
  const { gave, received } = ledgerNet(o);
  const muted = o.status === "suspended";
  const w = (n: number) => `${Math.max(4, Math.round((n / Math.max(1, max)) * 60))}px`;
  return (
    <span className="inline-flex items-center gap-2 text-[11px] font-extrabold tnum" aria-label={`أعطى ${gave} · استقبل ${received}`}>
      <i className="inline-flex items-center gap-1 not-italic">
        <span aria-hidden className={cx("inline-block h-2.5", muted ? "bg-line" : "bg-gold")} style={{ width: w(gave) }} />
        {gave}
      </i>
      <b className="inline-flex items-center gap-1 font-extrabold">
        <span aria-hidden className={cx("inline-block h-2.5", muted ? "bg-line" : "bg-ink")} style={{ width: w(received) }} />
        {received}
      </b>
    </span>
  );
}

/** «موثّقة» · «تنتهي بعد 24 يوماً» · «موقوف»: the short licence chip of the members table (hexagon + word). */
function LicenceChip({ tone, children }: { tone: "ok" | "soon" | "off"; children: React.ReactNode }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 whitespace-nowrap px-1.5 py-0.5 text-[11px] font-extrabold", tone === "soon" ? "border-hairline bg-paper" : "bg-sand", tone === "off" && "text-muted")}>
      <span aria-hidden className={cx("hex-flat relative inline-block h-2 w-2.5 shrink-0", tone === "ok" ? "bg-gold" : tone === "soon" ? "bg-ink" : "bg-line")}>
        {tone === "soon" && <span className="hex-flat absolute inset-[1.5px] bg-paper" />}
      </span>
      {children}
    </span>
  );
}

export function LicenceCell({ o }: { o: Office }) {
  if (o.status === "suspended")
    return (
      <span className="flex flex-col items-start gap-1">
        <LicenceChip tone="off">موقوف</LicenceChip>
        <span className="text-[12px] text-muted">{o.suspendedReason}</span>
      </span>
    );
  const left = licenceDaysLeft(o);
  const soon = left <= 30;
  return (
    <span className="flex flex-col items-start gap-1">
      {soon ? <LicenceChip tone="soon">{`تنتهي بعد ${daysLabel(left)}`}</LicenceChip> : <LicenceChip tone="ok">موثّقة</LicenceChip>}
      {soon ? (
        <span className="text-[12px] font-bold text-gold-text">{`${fmtDate(o.licence.expiresOn)}${o.licenceReminded ? " · ذُكِّر" : ""}`}</span>
      ) : (
        <span className="text-[12px] text-muted">{`حتى ${fmtDate(o.licence.expiresOn)}`}</span>
      )}
    </span>
  );
}

const chipCls = "inline-block whitespace-nowrap border-hairline bg-paper px-1.5 py-px text-[11px] font-bold";

export function MembersPage() {
  const toast = useStore((s) => s.toast);
  const [q, setQ] = useState("");
  const [sector, setSector] = useState<Sector | "">("");
  const max = Math.max(...offices.map((o) => Math.max(ledgerNet(o).gave, ledgerNet(o).received)));
  const rows = useMemo(() => {
    const needle = q.trim();
    return offices.filter((o) => (!sector || o.sector === sector) && (!needle || o.nameAr.includes(needle) || o.fullName.includes(needle) || o.districts.some((d) => districtAr(d).includes(needle))));
  }, [q, sector]);
  const n = offices.length;
  const suspended = offices.filter((o) => o.status === "suspended");

  return (
    <G9Shell
      title={<RoomTitle section="الأعضاء" />}
      subtitle={`${n >= 11 ? `${n} عضواً موثّقاً` : `${n} أعضاء موثّقين`} · الميزان: ما أعطى (ذهبي) مقابل ما استقبل (أسود) · سرعة الرد ضمن ساعات الدوام`}
      actions={
        <>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث باسم المكتب أو الحي"
            aria-label="بحث"
            className="h-10 w-[240px] max-w-full border-interactive bg-paper px-3 text-[13px] focus:border-gold focus:bg-cream-focus focus-visible:outline-0"
          />
          <select aria-label="الجهة" value={sector} onChange={(e) => setSector(e.target.value as Sector | "")} className="h-10 border-interactive bg-paper px-3 text-[12px] font-bold">
            <option value="">كل الجهات</option>
            {SECTOR_KEYS.map((s) => (
              <option key={s} value={s}>
                {sectorShort(s)}
              </option>
            ))}
          </select>
          <AdminButton variant="outline" size="md" onClick={() => toast("صُدّر ملف الأعضاء · smq-alliance-members.csv")}>
            تصدير CSV
          </AdminButton>
        </>
      }
    >
      <AllianceTabs active="members" />

      <div className="overflow-x-auto border-interactive bg-paper">
        <table className="w-full min-w-[1000px] border-collapse text-start text-[12px]">
          <thead>
            <tr className="border-b-[1.5px] border-ink bg-sand text-[11px] font-extrabold text-muted">
              {["المكتب", "الجهة", "الأحياء", "التخصص", "الرخصة", "الميزان · أعطى / استقبل", "متوسط الرد", ""].map((h, i) => (
                <th key={i} scope="col" className="whitespace-nowrap px-3 py-2.5 text-start font-extrabold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => {
              const off = o.status === "suspended";
              const mins = o.ledger.avgReplyMinutes;
              return (
                <tr key={o.id} className={cx("border-b border-line last:border-b-0 hover:bg-cream", off && "text-muted")}>
                  <td className="px-3 py-2.5">
                    <strong className="block whitespace-nowrap text-[12px] font-extrabold text-ink">{o.nameAr}</strong>
                    <span className="whitespace-nowrap text-muted">{off ? `موقوف ${o.suspendedOn ? fmtDate(o.suspendedOn) : ""}` : sinceLabel(o.memberSince)}</span>
                  </td>
                  <td className="px-3 py-2.5">{sectorShort(o.sector)}</td>
                  <td className="px-3 py-2.5">
                    <span className="flex gap-0.5">
                      {o.districts.map((d) => (
                        <span key={d} className={chipCls}>
                          {districtAr(d)}
                        </span>
                      ))}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="flex gap-0.5">
                      {o.specialties.map((s) => (
                        <span key={s} className={chipCls}>
                          {s}
                        </span>
                      ))}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <LicenceCell o={o} />
                  </td>
                  <td className="px-3 py-2.5">
                    <LedgerCells o={o} max={max} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <strong className={cx("font-extrabold tnum", mins >= BUSINESS_DAY_MIN ? "text-gold-text" : "text-ink", !mins && "font-bold text-muted")}>{mins ? fmtReply(mins) : "بلا رد"}</strong>
                  </td>
                  <td className="px-3 py-2.5 text-end">
                    <Link href={`/admin/alliance/members/${o.id}`} className="inline-flex h-9 items-center border-interactive bg-paper px-3 text-[12px] font-extrabold text-ink no-underline hover:bg-sand">
                      الملف
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[12px] leading-relaxed text-muted">
        <MarkedText
          text={`الميزان يرتّب من يستقبل أولاً حين يغطي الحي أكثر من مكتب: المعطي أكثر يتقدّم. الأسماء مواضع للتصميم (${offices
            .slice(0, 2)
            .map((o, i) => (i === 0 ? o.nameAr : o.letter))
            .join("، ")}).${suspended.length ? ` ${suspended.map((o) => o.nameAr).join("، ")} موقوف لانعدام الرد ${allianceSettings.defaults.suspendAfterNoReplyDays} يوماً وفق الميثاق [للتأكيد]؛ لا يظهر في الدليل ولا يستقبل طلبات.` : ""}`}
        />
      </p>
    </G9Shell>
  );
}
