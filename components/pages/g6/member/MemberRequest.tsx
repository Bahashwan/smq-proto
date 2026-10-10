"use client";
// /member/[token]/requests/[id] · Member-Request-M (open, with the offer form) and Member-Request-States-M (answered,
// expired). Presenter «member request» (?mreq=) wins. Otherwise the request is open while it runs, until this session
// answers it (the form → store addOffer, «لا يوجد حالياً» → a patch); a closed or timed-out request is expired. The
// office's offer in the fixtures (مكتب ط on REQ-2026-0412: 165 م², 440,000) prefills the form, as the board shows.
import Link from "next/link";
import { useState } from "react";
import { allianceSettings, districtAr, expiresInLabel, NOW, officeById, requestById, whenLabel, type AllianceRequest, type RequestOffer } from "@/data";
import { usePresenter } from "@/lib/presenter";
import { usePatch, useStore } from "@/lib/store";
import { cx, fmtNum } from "@/lib/format";
import { PhoneColumn, RadioGroup, SelectField, TextArea, TextField } from "@/components/ui";
import { AlliancePill, HexDot, PointDot, Tbc, daysLabel, officesCount } from "@/components/alliance";
import { HeaderLink, MemberHeader } from "../chrome";
import { memberRequestView } from "../data";
import { useOpenRequests } from "./hooks";

const OFFER_TYPES = ["شقة", "دور", "فيلا", "فيلا روف"];
const SOURCE_AR: Record<AllianceRequest["source"], string> = { visitor: "زائر SMQ بلا نتائج", staff: "فريق SMQ", member: "مكتب عضو" };

function durationAr(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} دقيقة`;
  if (!m) return `${h} ساعة`;
  return `${h} ساعة و${m} دقيقة`;
}
function budgetText(r: AllianceRequest): string {
  if (r.budgetMin != null && r.budgetMax != null) return `${fmtNum(r.budgetMin)} إلى ${fmtNum(r.budgetMax)}`;
  if (r.budgetMax != null) return `حتى ${fmtNum(r.budgetMax)}`;
  if (r.budgetMin != null) return `من ${fmtNum(r.budgetMin)}`;
  return "—";
}
function title(r: AllianceRequest): string {
  return `${districtAr(r.districtSlug)} · ${r.typeLabelAr ?? r.type}`;
}

function Tile({ k, v, small }: { k: string; v: string; small?: boolean }) {
  return (
    <div className="flex flex-col gap-1 bg-sand px-3 py-2.5">
      <small className="text-caption text-muted">{k}</small>
      <b className={cx("font-extrabold tnum", small ? "text-[13px]" : "text-[16px]")}>{v}</b>
    </div>
  );
}

const banner = "[clip-path:polygon(0_0,100%_0,100%_100%,24px_100%,0_calc(100%-14px))]";

export function MemberRequest({ officeId, requestId }: { officeId: string; requestId: string }) {
  const office = officeById(officeId);
  const base = requestById(requestId);
  const { state } = usePresenter();
  const storeReq = useStore((s) => s.requests[requestId]);
  const addOffer = useStore((s) => s.addOffer);
  const setRequest = useStore((s) => s.setRequest);
  const patch = useStore((s) => s.patch);
  const none = usePatch<{ answer: string; at: string }>("memberAnswer", `${requestId}:${officeId}`);
  const [editing, setEditing] = useState(false);
  const openCount = useOpenRequests(officeId).length;

  const fixtureOffer = base?.offers.find((o) => o.officeId === officeId);
  const sessionOffer = storeReq?.offers?.find((o) => o.officeId === officeId);
  const [form, setForm] = useState(() => ({
    type: fixtureOffer?.type ?? (base && OFFER_TYPES.includes(base.type) ? base.type : OFFER_TYPES[0]),
    area: fixtureOffer?.areaM2 ? String(fixtureOffer.areaM2) : "",
    price: fixtureOffer?.priceSar ? fmtNum(fixtureOffer.priceSar) : "",
    note: fixtureOffer?.note ?? "",
    brokered: (fixtureOffer?.brokered ?? true) ? "yes" : "no",
  }));

  if (!office || !base) return null;
  const computed = memberRequestView(base, officeId, { offer: Boolean(sessionOffer), none: none?.answer === "none", stage: storeReq?.stage, referralId: storeReq?.referralId });
  const view = state.mreq ?? (editing ? "open" : computed);
  const offer: RequestOffer | undefined = sessionOffer ?? fixtureOffer;
  const sentAt = base.sentTo.find((s) => s.officeId === officeId)?.sentAt ?? base.createdAt;
  const days = allianceSettings.defaults.replyBusinessDays;

  const submit = () => {
    const price = parseInt(form.price.replace(/\D/g, ""), 10);
    const area = parseFloat(form.area.replace(/[^\d.]/g, ""));
    const repliedAt = fixtureOffer?.repliedAt ?? NOW;
    const replyMinutes = fixtureOffer?.replyMinutes ?? Math.max(1, Math.round((new Date(repliedAt).getTime() - new Date(sentAt).getTime()) / 60000));
    const next: RequestOffer = { officeId, type: form.type, areaM2: Number.isFinite(area) ? area : undefined, priceSar: Number.isFinite(price) ? price : undefined, note: form.note.trim(), brokered: form.brokered === "yes", repliedAt, replyMinutes };
    // the store's list replaces the fixture's offers (effectiveRequest): seed it with the other offices' offers first
    const others = (storeReq?.offers ?? base.offers).filter((o) => o.officeId !== officeId);
    const stage = storeReq?.stage ?? (base.stage === "new" || base.stage === "sent" ? "offers" : base.stage);
    if (storeReq?.offers?.some((o) => o.officeId === officeId)) setRequest(base.id, { offers: [...others, next], stage });
    else {
      setRequest(base.id, { offers: others, stage });
      addOffer(base.id, next);
    }
    patch("memberAnswer", `${requestId}:${officeId}`, { answer: "offer", at: repliedAt });
    setEditing(false);
    window.scrollTo({ top: 0 });
  };
  const sayNone = () => {
    patch("memberAnswer", `${requestId}:${officeId}`, { answer: "none", at: NOW });
    window.scrollTo({ top: 0 });
  };
  const withdraw = () => {
    setRequest(base.id, { offers: (storeReq?.offers ?? base.offers).filter((o) => o.officeId !== officeId) });
    patch("memberAnswer", `${requestId}:${officeId}`, { answer: "", at: "" });
  };

  return (
    <PhoneColumn className="bg-cream">
      <div className="min-h-dvh bg-cream text-ink">
        <MemberHeader subtitle={`صفحة عضو · ${office.fullName} · بلا دخول`} action={<HeaderLink href={`/member/${officeId}`}>الميزان</HeaderLink>} />
        <main className="flex flex-col gap-4 px-4 py-5">
          {view === "open" && (
            <>
              <section className="bg-paper border-interactive">
                <div className={cx("flex items-start justify-between gap-3 bg-gold px-4 pt-3.5 pb-6 text-ink", banner)}>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-caption font-bold text-on-gold-muted">طلب جديد في حي تغطيه</span>
                    <h1 className="text-[18px] font-extrabold">{title(base)}</h1>
                  </span>
                  <span dir="ltr" className="shrink-0 pt-4 text-caption font-extrabold tnum">
                    {base.id}
                  </span>
                </div>
                <div className="flex flex-col gap-3 px-3.5 pt-3 pb-4">
                  <div className="grid grid-cols-2 gap-1.5">
                    <Tile k="الحي" v={districtAr(base.districtSlug)} />
                    <Tile k="الميزانية" v={budgetText(base)} />
                    <Tile k="النوع" v={base.type} />
                    <Tile k="الغرف" v={base.beds != null ? String(base.beds) : "—"} />
                    <Tile k="التوقيت" v={base.timing} />
                    <Tile k="المصدر" v={SOURCE_AR[base.source]} small />
                  </div>
                  <p className="text-[12px] leading-relaxed text-muted">
                    لا اسم ولا رقم للمشتري: SMQ تعرّفكم ببعض بعد قبول العرض وتسجّل التعارف في سجل إحالة. الطلب أُرسل لـ {officesCount(base.sentTo.length)}
                    {base.sentTo.length === 1 ? " (أنتم)" : ""} · ينتهي بعد <strong className="text-ink">{expiresInLabel(base.expiresAt)}</strong>.
                  </p>
                </div>
              </section>
              <div className="grid grid-cols-2 gap-2.5">
                <a href="#offer" className="inline-flex h-12 items-center justify-center bg-ink px-3 text-[14px] font-extrabold text-paper no-underline cut-m hover:bg-ink-2">
                  عندي عرض مطابق
                </a>
                <button type="button" onClick={sayNone} className="inline-flex h-12 items-center justify-center bg-paper px-3 text-[14px] font-bold text-ink hover:bg-sand" style={{ border: "1.5px solid var(--smq-ink)" }}>
                  لا يوجد حالياً
                </button>
              </div>
              <section id="offer" className="relative scroll-mt-4 bg-paper border-interactive">
                <span aria-hidden className="absolute -inset-y-[1.5px] -start-[1.5px] w-[5px] bg-gold" />
                <div className="px-4 py-3.5 text-[14px] font-extrabold" style={{ borderBottom: "1.5px solid var(--smq-ink)" }}>
                  عرضك المطابق · ثلاثون ثانية
                </div>
                <form
                  className="flex flex-col gap-4 px-4 pt-4 pb-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                  }}
                >
                  <div className="grid grid-cols-2 gap-2.5">
                    <SelectField id="offer-type" label="النوع" options={OFFER_TYPES.map((t) => ({ value: t, label: t }))} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
                    <TextField id="offer-area" label="المساحة (م²)" inputMode="decimal" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
                  </div>
                  <TextField
                    id="offer-price"
                    label="السعر (ريال)"
                    inputMode="numeric"
                    className="text-[16px] font-extrabold tnum"
                    value={form.price}
                    onChange={(e) => {
                      const n = parseInt(e.target.value.replace(/\D/g, ""), 10);
                      setForm({ ...form, price: Number.isFinite(n) ? fmtNum(n) : "" });
                    }}
                  />
                  <TextArea id="offer-note" label="ملاحظة للمشتري (عبر SMQ)" rows={2} placeholder="الطابق، الواجهة، سنة البناء…" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                  <RadioGroup<"yes" | "no">
                    name="offer-brokered"
                    label="عقد وساطة موثّق في موقع الهيئة؟"
                    columns={2}
                    options={[
                      { value: "yes", label: "نعم" },
                      { value: "no", label: "لا، من المالك مباشرة" },
                    ]}
                    value={form.brokered as "yes" | "no"}
                    onChange={(v) => setForm({ ...form, brokered: v })}
                  />
                  <button type="submit" className="inline-flex h-12 items-center justify-center bg-gold px-4 text-[14px] font-extrabold text-ink cut-m hover:bg-gold-hover">
                    أرسل العرض إلى SMQ
                  </button>
                  <span className="text-caption leading-relaxed text-muted">يصل العرض لفريق SMQ، لا للمشتري مباشرة. إن وافق المشتري يُنشأ سجل إحالة برقم وتاريخ قبل أي تعارف.</span>
                </form>
              </section>
              <p className="text-caption leading-relaxed text-muted">فُتحت هذه الصفحة من رابط واتساب خاص بمكتبكم. لا تشاركوا الرابط؛ كل رد يُسجَّل باسم المكتب ويدخل في الميزان.</p>
            </>
          )}

          {view === "answered" && (
            <section className="bg-paper border-interactive">
              <div className={cx("flex items-start justify-between gap-3 bg-ink px-4 pt-3.5 pb-6 text-paper", banner)}>
                <span className="flex flex-col gap-0.5">
                  <span className="text-caption font-bold text-gold">طلب في حي تغطيه</span>
                  <h1 className="text-[18px] font-extrabold">{title(base)}</h1>
                </span>
                <AlliancePill tone="gold" className="mt-3 text-[11px]">
                  مُجاب
                </AlliancePill>
              </div>
              <div className="flex flex-col gap-3 px-3.5 pt-3 pb-4">
                <div className="grid grid-cols-3 gap-1.5">
                  <Tile k="الميزانية" v={budgetText(base)} small />
                  <Tile k="الغرف" v={base.beds != null ? String(base.beds) : "—"} small />
                  <Tile k="ردّيتم" v={whenLabel(none?.answer === "none" ? none.at || NOW : (offer?.repliedAt ?? NOW))} small />
                </div>
                <div className="relative flex flex-col gap-1.5 px-3.5 py-3" style={{ border: "1.5px solid var(--smq-ink)" }}>
                  <span aria-hidden className="absolute -inset-y-[1.5px] -start-[1.5px] w-[5px] bg-gold" />
                  <span className="text-[12px] font-extrabold">عرضكم</span>
                  {none?.answer === "none" || !offer ? (
                    <span className="text-[13px]">لا يوجد حالياً</span>
                  ) : (
                    <span className="text-[13px] leading-relaxed">
                      {offer.type}
                      {offer.areaM2 ? ` · ${fmtNum(offer.areaM2)} م²` : ""}
                      {offer.priceSar ? (
                        <>
                          {" · "}
                          <strong className="font-extrabold tnum">{fmtNum(offer.priceSar)}</strong>
                        </>
                      ) : null}
                      {" · "}
                      {offer.brokered ? "عقد وساطة موثّق" : "مباشر من المالك"}
                      {offer.note ? ` · «${offer.note.replace(/[.。]\s*$/, "")}».` : "."}
                    </span>
                  )}
                  {offer && none?.answer !== "none" && <span className="text-caption text-muted">رُدّ خلال {durationAr(offer.replyMinutes)} من الإرسال · يُحسب في الميزان</span>}
                </div>
                <ul className="flex flex-col gap-1.5 text-[12px] text-ink-2">
                  <li className="flex items-center gap-2">
                    <HexDot size={11} tone="ink" /> العرض عند SMQ · يُعرض على المشتري اليوم
                  </li>
                  <li className="flex items-center gap-2">
                    <HexDot size={11} tone="paper" border="ink" /> إن وافق: سجل إحالة برقم، ثم تعارف
                  </li>
                  <li className="flex items-center gap-2">
                    <HexDot size={11} tone="paper" border="line" /> إن رفض: تصلكم رسالة بالسبب إن ذُكر
                  </li>
                </ul>
                <div className="grid grid-cols-2 gap-2.5">
                  <button type="button" onClick={() => setEditing(true)} className="inline-flex h-12 items-center justify-center bg-paper text-[13px] font-bold hover:bg-sand" style={{ border: "1.5px solid var(--smq-ink)" }}>
                    عدّل العرض
                  </button>
                  <button type="button" onClick={withdraw} className="inline-flex h-12 items-center justify-center bg-paper text-[13px] font-bold hover:bg-sand" style={{ border: "1.5px solid var(--smq-ink)" }}>
                    اسحب العرض
                  </button>
                </div>
                <span className="text-caption leading-relaxed text-muted">التعديل والسحب متاحان حتى يُنشأ سجل الإحالة. بعدها يصبح العرض جزءاً من السجل.</span>
              </div>
            </section>
          )}

          {view === "expired" && (
            <section className="bg-paper text-muted" style={{ border: "1.5px solid var(--smq-line)" }}>
              <div className="flex items-start justify-between gap-3 bg-sand px-4 py-3.5">
                <span className="flex flex-col gap-0.5">
                  <span className="text-caption font-bold">طلب في حي تغطيه</span>
                  <h1 className="text-[18px] font-extrabold text-ink">{title(base)}</h1>
                </span>
                <span className="mt-2 shrink-0 px-2 py-0.5 text-caption font-extrabold" style={{ border: "1.5px solid var(--smq-muted)" }}>
                  منتهٍ
                </span>
              </div>
              <div className="flex flex-col gap-3 px-3.5 pt-3 pb-4">
                <div className="grid grid-cols-3 gap-1.5">
                  <Tile k="الميزانية" v={budgetText(base)} small />
                  <Tile k="الغرف" v={base.beds != null ? String(base.beds) : "—"} small />
                  <Tile k="انتهى" v={whenLabel(base.expiresAt)} small />
                </div>
                <div className="flex items-start gap-2 px-3.5 py-3 text-[12px] leading-relaxed text-ink border-error">
                  <PointDot size={10} className="mt-1.5" />
                  <span>
                    <strong className="font-extrabold">انتهت مهلة الرد ({daysLabel(days)}).</strong> الطلب أُغلق أو ذهب لمكتب آخر. الردود المتأخرة لا تُحسب، ويُسجَّل «بلا رد» في الميزان.
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button type="button" disabled className="inline-flex h-12 cursor-not-allowed items-center justify-center bg-slot text-[13px] font-extrabold text-disabled">
                    عندي عرض مطابق
                  </button>
                  <Link href={`/member/${officeId}`} className="inline-flex h-12 items-center justify-center bg-paper text-[13px] font-bold text-ink no-underline hover:bg-sand" style={{ border: "1.5px solid var(--smq-ink)" }}>
                    الطلبات المفتوحة · {openCount}
                  </Link>
                </div>
                <span className="text-caption leading-relaxed">عندكم عرض يناسبه مستقبلاً؟ أرسلوه كعرض عام من صفحة الميزان، وسيُطابَق مع الطلبات القادمة.</span>
              </div>
            </section>
          )}

          {view !== "open" && (
            <p className="text-caption leading-relaxed text-muted">
              كل طلب يعيش {days} أيام عمل افتراضياً <Tbc />. سرعة الرد تُحسب ضمن ساعات دوامكم المسجّلة فقط.
            </p>
          )}
        </main>
      </div>
    </PhoneColumn>
  );
}
