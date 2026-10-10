"use client";
// /admin/alliance/radar?district=obhur-north (Admin-AllianceRadar-D). The hexagon grid of the 33 districts by sector
// (sessions · SMQ units · covering members), the district drawer (`?district=`), and the districts ranked by
// opportunity = sessions × (1 if SMQ has no units) × members covering (radarRanking()). «أرسل للمكاتب» creates a
// request in memory from the visitors' searches (segment and budget only) and sends it to the covering members.
import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminButton } from "@/components/admin";
import { RadarGrid, RadarLegend, budgetLabel, fmtReply, membersLabel, type RadarDistrict } from "@/components/alliance";
import { MarkedText } from "@/components/ui";
import { analytics } from "@/data/analytics";
import { districts, SECTORS } from "@/data/districts";
import { officeById } from "@/data/offices";
import { requests, shortRequestId } from "@/data/requests";
import { effectiveRequest, radarRanking, routingOrder, type RadarRow } from "@/data/selectors";
import { demandType, specialtyGap } from "./room";
import { setQuery, useQuery } from "@/lib/location";
import { useStore, useUnitOverrides } from "@/lib/store";
import { cx, fmtNum, plural } from "@/lib/format";
import { useRoomActions } from "./actions";
import { AllianceTabs, G9Shell, RoomTitle } from "./shell";
import { cnt, letters } from "./util";

type Period = "30d" | "90d";

const reqState = (stage: string, replies: number) => (stage === "offers" ? "وصلت عروض" : stage === "sent" ? (replies ? "أُرسل · ردود" : "أُرسل · بلا رد") : stage === "new" ? "جديد" : stage === "intro" ? "تعارف" : "مغلق");

function DrawerRow({ k, children, gold }: { k: string; children: React.ReactNode; gold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line py-2.5 text-[12px] last:border-b-0">
      <span className="text-muted">{k}</span>
      <span className={cx("text-end font-extrabold", gold && "text-gold-text")}>{children}</span>
    </div>
  );
}

function DistrictDrawer({ row, onClose, onSend, created }: { row: RadarRow; onClose: () => void; onSend: (row: RadarRow) => void; created: number }) {
  const reqOv = useStore((s) => s.requests);
  const d = row.detail;
  const routed = routingOrder(row.district.slug, demandType(row));
  const open = requests.map((r) => effectiveRequest(r, reqOv)).filter((r) => r.districtSlug === row.district.slug && r.stage !== "closed");
  const gap = specialtyGap(row);
  const noResult = d?.whatsappNoResult ?? 0;
  const to = plural(row.members, { one: "للمكتب", two: "للمكتبين", few: "للمكاتب", many: "للمكاتب" });
  return (
    <aside aria-label={row.district.ar} className="relative flex min-w-0 flex-col border-interactive bg-paper">
      <span aria-hidden className="absolute inset-y-0 start-0 w-1 bg-gold" />
      <header className="flex items-center justify-between gap-3 border-b-[1.5px] border-ink bg-sand px-4 py-3">
        <span className="text-[14px] font-extrabold">{`${row.district.ar} · ${SECTORS[row.district.sector].ar}`}</span>
        <button type="button" aria-label="إغلاق" onClick={onClose} className="flex size-9 items-center justify-center border-interactive bg-paper text-[14px] font-extrabold hover:bg-sand">
          ×
        </button>
      </header>
      <div className="flex flex-col gap-4 p-4">
        {d?.summaryAr && (
          <div className="flex items-center gap-2.5 border-error px-3.5 py-3 text-[12px] font-bold">
            <span aria-hidden className="hex-point size-2.5 shrink-0 bg-gold" />
            {d.summaryAr}
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-[12px] font-extrabold">الطلب · 30 يوماً</span>
          <DrawerRow k="جلسات بحث">{`${fmtNum(row.sessions)}${d?.deltaPct != null ? ` · ${d.deltaPct > 0 ? "+" : ""}${d.deltaPct}% عن الشهر السابق` : ""}`}</DrawerRow>
          {d?.medianBudget != null && <DrawerRow k="الميزانية الوسيطة">{fmtNum(d.medianBudget)}</DrawerRow>}
          {d?.topDemandAr && <DrawerRow k="الأكثر طلباً">{d.topDemandAr}</DrawerRow>}
          {d?.whatsappNoResult != null && <DrawerRow k="ضغطات واتساب بلا نتيجة">{fmtNum(d.whatsappNoResult)}</DrawerRow>}
        </div>
        <div className="flex flex-col">
          <span className="text-[12px] font-extrabold">ما لدى SMQ</span>
          <DrawerRow k="وحدات متاحة" gold={row.smqUnits === 0}>
            <MarkedText text={[fmtNum(row.smqUnits), d?.supplyNoteAr].filter(Boolean).join(" · ")} />
          </DrawerRow>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-extrabold">الأعضاء الذين يغطيه</span>
          {routed.length === 0 && <span className="text-[12px] font-bold text-gold-text">لا أعضاء</span>}
          {routed.map((r) => (
            <div key={r.office.id} className="flex items-center justify-between gap-3 border-interactive px-3 py-2.5 text-[12px]">
              <span>
                <strong className="font-extrabold">{r.office.nameAr}</strong>
                {` · ${r.office.specialties.map((s) => s.split(" ")[0]).join("، ")} · رد ${r.office.ledger.avgReplyMinutes ? fmtReply(r.office.ledger.avgReplyMinutes) : "بلا رد"}`}
              </span>
              <span className={cx("font-extrabold", r.rank === 1 && "text-gold-text")}>{r.rankAr}</span>
            </div>
          ))}
          {row.suspendedIds.map((id) => (
            <span key={id} className="text-[11px] text-muted">{`(${officeById(id)?.letter ?? ""} موقوف)`}</span>
          ))}
          {gap && <span className="text-[11px] font-bold text-gold-text">{gap}</span>}
        </div>
        {open.length + created > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-extrabold">{`طلبات مفتوحة هنا · ${open.length + created}`}</span>
            {open.map((r) => (
              <Link key={r.id} href={`/admin/alliance/requests?req=${r.id}`} className="flex min-h-11 items-center justify-between gap-3 bg-sand px-3 py-2 text-[12px] text-ink no-underline hover:bg-cream">
                <span>{`${shortRequestId(r.id)} · ${r.typeLabelAr ?? r.type} ${budgetLabel(r.budgetMin, r.budgetMax, true)}`}</span>
                <span className="font-extrabold">{reqState(r.stage, r.offers.length)}</span>
              </Link>
            ))}
          </div>
        )}
        {row.action === "self" ? (
          <span className="text-[12px] font-bold text-muted">نغطيه بأنفسنا</span>
        ) : row.members === 0 || gap ? (
          <Link href="/admin/alliance/applications" className="flex min-h-12 items-center justify-center border-interactive bg-paper text-[13px] font-extrabold text-ink no-underline hover:bg-sand">
            يحتاج أعضاء
          </Link>
        ) : (
          <>
            <AdminButton variant="gold" size="lg" className="min-h-12 w-full justify-start" onClick={() => onSend(row)}>
              {`أرسل للمكاتب${noResult ? ` · ${cnt(noResult, "زائر", "زوار", "زائراً")} بلا نتيجة` : ""}`}
            </AdminButton>
            <span className="text-[11px] leading-relaxed text-muted">{`«أرسل للمكاتب» ينشئ طلباً مجمّعاً من بحوث الزوار (الشريحة والميزانية فقط) ويرسله ${to}، بلا أي بيانات زوار.`}</span>
          </>
        )}
      </div>
    </aside>
  );
}

export function RadarPage() {
  const q = useQuery();
  const [period, setPeriod] = useState<Period>("30d");
  const unitOv = useUnitOverrides();
  const reqOv = useStore((s) => s.requests);
  const createdRequests = useStore((s) => s.createdRequests);
  const { sendRadarRequest, toast } = useRoomActions();
  const rows = useMemo(() => radarRanking(period, unitOv, reqOv), [period, unitOv, reqOv]);
  const bySlug = useMemo(() => new Map(rows.map((r) => [r.district.slug, r])), [rows]);
  const sessions = period === "90d" ? analytics.districtSessions90d : analytics.districtSessions30d;
  const createdIn = (slug: string) => createdRequests.filter((c) => c.districtSlug === slug).length;

  const cells: RadarDistrict[] = districts.map((d) => {
    const r = bySlug.get(d.slug);
    return { slug: d.slug, ar: d.ar, sector: d.sector, sessions: r?.sessions ?? sessions[d.slug] ?? 0, units: r?.smqUnits ?? 0, members: r?.members ?? 0, rank: r && r.score > 0 ? r.rank : undefined };
  });
  const selectedSlug = q.get("district");
  const selected = selectedSlug ? bySlug.get(selectedSlug) : undefined;
  const table = rows.filter((r) => r.detail);

  return (
    <G9Shell
      title={<RoomTitle section="الرادار" />}
      subtitle="لكل حي: ما بحث عنه الزوار (30 يوماً)، ما لدى SMQ، ومن يغطيه من الأعضاء. الذهبي هو الفرصة: طلب بلا وحدات لنا ويغطيه أعضاء"
      actions={
        <>
          <select aria-label="المدة" value={period} onChange={(e) => setPeriod(e.target.value as Period)} className="h-10 border-interactive bg-paper px-3 text-[12px] font-bold">
            <option value="30d">آخر 30 يوماً</option>
            <option value="90d">آخر 90 يوماً</option>
          </select>
          <AdminButton variant="outline" size="md" onClick={() => toast("صُدّر ملف الرادار · smq-alliance-radar.csv")}>
            تصدير CSV
          </AdminButton>
        </>
      }
    >
      <AllianceTabs active="radar" />

      <div className={cx("grid items-start gap-5", selected && "lg:grid-cols-[minmax(0,1fr)_380px]")}>
        <section className="flex min-w-0 flex-col border-interactive bg-paper" aria-labelledby="radar-grid">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b-[1.5px] border-ink bg-sand px-4 py-3">
            <h2 id="radar-grid" className="text-[14px] font-extrabold">
              شبكة الأحياء
            </h2>
            <RadarLegend />
          </header>
          <div className="overflow-x-auto p-4">
            <RadarGrid
              districts={cells}
              selected={selected?.district.slug ?? null}
              onSelect={(slug) => setQuery({ district: slug }, "replace")}
              size={78}
              columns={Math.max(...(["north", "central", "east", "west", "south"] as const).map((sec) => districts.filter((d) => d.sector === sec).length))}
              caption="الخلية: الحي · جلسات البحث · وحدات SMQ المتاحة · المكاتب التي تغطيه. انقر خلية لتفتح الدُّرج."
            />
          </div>
        </section>
        {selected && (
          <DistrictDrawer
            row={selected}
            created={createdIn(selected.district.slug)}
            onClose={() => setQuery({ district: null }, "replace")}
            onSend={(row) => sendRadarRequest(row)}
          />
        )}
      </div>

      <section className="flex min-w-0 flex-col border-interactive bg-paper" aria-labelledby="radar-table">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b-[1.5px] border-ink bg-sand px-4 py-3">
          <h2 id="radar-table" className="text-[14px] font-extrabold">
            الأحياء مرتّبة بالفرصة
          </h2>
          <span className="text-caption font-bold text-muted">الفرصة = جلسات × (1 إن لا وحدات لنا) × (يغطيه أعضاء)</span>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-[12px]">
            <thead>
              <tr className="border-b-[1.5px] border-ink bg-sand text-[11px] font-extrabold text-muted">
                {["#", "الحي", "جلسات", "الميزانية الوسيطة", "الغرف الأكثر", "وحدات SMQ", "أعضاء يغطونه", "طلبات مفتوحة", ""].map((h, i) => (
                  <th key={i} scope="col" className="whitespace-nowrap px-3 py-2.5 text-start font-extrabold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.map((r, i) => {
                const gap = specialtyGap(r);
                const send = r.action === "send" && !gap;
                // the four best opportunities get the cream row, the gold button and the gold supply figure
                const hot = send && r.score > 0 && i < 4;
                const d = r.detail;
                const typeWord = demandType(r);
                // a district to send shows its figure alone (its project note stays in the drawer)
                const supply = d?.ownerUnits ? d.supplyNoteAr ?? "" : send ? fmtNum(r.smqUnits) : [fmtNum(r.smqUnits), d?.supplyNoteAr].filter(Boolean).join(" · ");
                return (
                  <tr key={r.district.slug} className={cx("border-b border-line last:border-b-0", hot ? "bg-cream-focus" : "hover:bg-cream")}>
                    <td className="px-3 py-2.5 tnum">{i + 1}</td>
                    <td className="px-3 py-2.5">
                      <button type="button" onClick={() => setQuery({ district: r.district.slug }, "replace")} className="min-h-8 text-start font-extrabold hover:underline">
                        {r.district.ar}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 tnum">{fmtNum(r.sessions)}</td>
                    <td className="px-3 py-2.5 tnum">{d?.medianBudget != null ? fmtNum(d.medianBudget) : ""}</td>
                    <td className="px-3 py-2.5">{d?.topBeds != null ? `${d.topBeds}${typeWord === "فلل" ? ` (${typeWord})` : ""}` : ""}</td>
                    <td className={cx("px-3 py-2.5", hot ? "font-extrabold text-gold-text" : r.smqUnits > 0 && r.action === "self" ? "font-extrabold" : "")}>
                      <MarkedText text={supply} />
                    </td>
                    <td className={cx("px-3 py-2.5", (r.members === 0 || gap) && "font-extrabold text-gold-text")}>
                      {r.members === 0
                        ? membersLabel(0)
                        : `${r.members} · ${letters(r.memberIds)}${r.suspendedIds.length ? `، (${letters(r.suspendedIds)} موقوف)` : ""}${gap ? ` ${gap}` : ""}`}
                    </td>
                    <td className="px-3 py-2.5 tnum">{r.openRequests + createdIn(r.district.slug)}</td>
                    <td className="px-3 py-2.5 text-end">
                      {r.action === "self" ? (
                        <span className="text-[11px] text-muted">نغطيه بأنفسنا</span>
                      ) : send ? (
                        <AdminButton variant={hot ? "gold" : "outline"} size="xs" onClick={() => sendRadarRequest(r)}>
                          أرسل للمكاتب
                        </AdminButton>
                      ) : (
                        <Link href="/admin/alliance/applications" className="inline-flex h-8 items-center border-interactive bg-paper px-3 text-[12px] font-bold text-ink no-underline hover:bg-sand">
                          يحتاج أعضاء
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </G9Shell>
  );
}
