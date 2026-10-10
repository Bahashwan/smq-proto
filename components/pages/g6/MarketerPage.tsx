"use client";
// /m/[token] · MarketerPage-M (390 only): the marketer's private page, opened from WhatsApp without a login — the
// tracked link with a QR placeholder (SVG grid, not a scannable code), copy / save, the three 30-day numbers, the
// latest attributed leads (unit, channel, status only) and the commission note.
import { agoLabel, marketerByToken, MARKETER_STAGE_LABELS, trackedLink } from "@/data";
import { useStore } from "@/lib/store";
import { cx, fmtNum, waLink } from "@/lib/format";
import { Lockup, MarkedText, PhoneColumn, WhatsAppIcon } from "@/components/ui";
import { monthYear } from "./data";

/** Attribution window of /r/[name] (route-map «smq.ref, 30 days»). */
export const REF_DAYS = 30;
const QR_N = 9;

/** A deterministic placeholder pattern from the slug: three corner finder rings, the rest seeded cells. */
function qrCells(seed: string): boolean[][] {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  const rnd = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    return (h & 0xffff) / 0xffff;
  };
  const corner = (i: number) => (i < 3 ? i : i >= QR_N - 3 ? i - (QR_N - 3) : -1);
  return Array.from({ length: QR_N }, (_, r) =>
    Array.from({ length: QR_N }, (_, c) => {
      const rr = corner(r);
      const cc = corner(c);
      const finder = rr >= 0 && cc >= 0 && !(r >= QR_N - 3 && c >= QR_N - 3);
      if (finder) return !(rr === 1 && cc === 1);
      return rnd() > 0.5;
    }),
  );
}

const QR_SIZE = 120;
const QR_PAD = 8;
function qrRects(seed: string) {
  const unit = (QR_SIZE - QR_PAD * 2) / QR_N;
  return qrCells(seed).flatMap((row, r) => row.flatMap((on, c) => (on ? [{ x: QR_PAD + c * unit, y: QR_PAD + r * unit, s: unit - 2 }] : [])));
}

/** The QR placeholder drawn with the tokens (ink cells on paper). */
function QrPlaceholder({ seed }: { seed: string }) {
  return (
    <svg width={QR_SIZE} height={QR_SIZE} viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`} role="img" aria-label="رمز QR لرابطك" className="shrink-0 bg-paper">
      {qrRects(seed).map((q) => (
        <rect key={`${q.x}-${q.y}`} x={q.x} y={q.y} width={q.s} height={q.s} fill="var(--smq-ink)" />
      ))}
    </svg>
  );
}

/** The same drawing as a standalone SVG file, colours read from the tokens at click time. */
function qrFile(seed: string): string {
  const css = getComputedStyle(document.documentElement);
  const ink = css.getPropertyValue("--smq-ink").trim();
  const paper = css.getPropertyValue("--smq-paper").trim();
  const rects = qrRects(seed)
    .map((q) => `<rect x="${q.x.toFixed(2)}" y="${q.y.toFixed(2)}" width="${q.s.toFixed(2)}" height="${q.s.toFixed(2)}" fill="${ink}"/>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${QR_SIZE}" height="${QR_SIZE}" viewBox="0 0 ${QR_SIZE} ${QR_SIZE}"><rect width="${QR_SIZE}" height="${QR_SIZE}" fill="${paper}"/>${rects}</svg>`;
}

function statusLook(status: string): { text: string; tone: "ink" | "gold" | "muted" } {
  const [head, detail] = status.split(" · ");
  if (head.startsWith("مغلق")) return { text: head, tone: "muted" };
  if (detail) return { text: detail, tone: "gold" };
  return { text: head, tone: "ink" };
}

function negotiatingLine(n: number, unit?: string): string {
  const what = n === 0 ? "لا صفقات قيد التفاوض الآن" : n === 1 ? "صفقة واحدة قيد التفاوض الآن" : n === 2 ? "صفقتان قيد التفاوض الآن" : `${n} صفقات قيد التفاوض الآن`;
  return `${what}${n > 0 && unit ? ` (${unit})` : ""}.`;
}

export function MarketerPage({ token }: { token: string }) {
  const m = marketerByToken(token);
  const toast = useStore((s) => s.toast);
  if (!m) return null;
  const link = trackedLink(m);
  const first = m.name.split(" ")[0];
  const active = m.stage === "active";
  const s = m.stats;
  const pct = s.visits30d ? Math.round((s.whatsapp30d / s.visits30d) * 100) : 0;
  const leads = [...m.attributedLeads].sort((a, b) => (a.when < b.when ? 1 : -1)).slice(0, 3);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${link}`);
    } catch {
      /* clipboard blocked */
    }
    toast("نُسخ الرابط");
  };
  const saveQr = () => {
    const url = URL.createObjectURL(new Blob([qrFile(m.slug)], { type: "image/svg+xml" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${m.slug}.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <PhoneColumn className="bg-cream">
      <div className="min-h-dvh bg-cream text-ink">
        <header className="flex h-16 items-center justify-between gap-3 bg-ink px-4">
          <span className="flex items-center gap-2.5">
            <Lockup tone="goldmark-white" height={26} />
            <span className="bg-gold px-2 py-1 text-caption font-bold text-ink">صفحة مسوّق</span>
          </span>
          <a href={waLink(`مسوّق ${m.id}`)} target="_blank" rel="noopener" aria-label="تواصل مع فريق SMQ" className="flex h-11 w-11 items-center justify-center bg-gold text-ink hex-flat">
            <WhatsAppIcon size={20} />
          </a>
        </header>
        <main className="flex flex-col gap-5 px-4 py-6">
          <section className="flex flex-col gap-2">
            <span className="text-[12px] font-bold text-gold-text">
              {active ? "مسوّق معتمد" : MARKETER_STAGE_LABELS[m.stage]} · {m.id}
              {m.activeSince ? ` · منذ ${monthYear(m.activeSince)}` : ""}
            </span>
            <h1 className="text-[24px] font-extrabold">أهلاً {first}</h1>
            <span className="text-[12px] leading-relaxed text-muted">تُفتح هذه الصفحة من رابطك الخاص في واتساب، بلا دخول. لا تشاركها؛ شارك رابط التسويق أدناه.</span>
          </section>

          <section className="flex flex-col gap-4 bg-ink px-4 py-5 text-paper cut-l">
            <span className="text-[12px] font-bold text-gold">رابطك المتابَع</span>
            <div className="flex items-center gap-4">
              <QrPlaceholder seed={m.slug} />
              <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                <span dir="ltr" className="text-end font-mono text-[13px] font-bold break-all">
                  {link}
                </span>
                <button type="button" onClick={copy} className="inline-flex h-11 items-center justify-center bg-gold px-3 text-[13px] font-extrabold text-ink cut-s hover:bg-gold-hover">
                  نسخ الرابط
                </button>
                <button type="button" onClick={saveQr} className="inline-flex h-11 items-center justify-center px-3 text-[12px] font-bold text-paper hover:bg-ink-2" style={{ border: "1.5px solid var(--smq-paper)" }}>
                  حفظ QR كصورة
                </button>
              </div>
            </div>
            <span className="text-caption leading-relaxed text-on-ink-muted">أي صفحة على الموقع تُفتح من هذا الرابط تُنسب لك {REF_DAYS} يوماً، حتى لو عاد الزائر لاحقاً من قوقل.</span>
          </section>

          <section className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-0.5 bg-paper px-3 py-3.5 border-interactive">
              <span className="text-caption text-muted">زيارات</span>
              <span className="text-[28px] leading-tight font-extrabold tnum">{fmtNum(s.visits30d)}</span>
              <span className="text-caption text-muted">آخر 30 يوماً</span>
            </div>
            <div className="flex flex-col gap-0.5 bg-paper px-3 py-3.5 border-interactive">
              <span className="text-caption text-muted">ضغطات واتساب</span>
              <span className="text-[28px] leading-tight font-extrabold tnum">{fmtNum(s.whatsapp30d)}</span>
              <span className="text-caption text-muted">{pct}% من الزيارات</span>
            </div>
            <div className="flex flex-col gap-0.5 bg-ink px-3 py-3.5 text-paper cut-s">
              <span className="text-caption text-on-ink-muted">طلبات منسوبة</span>
              <span className="text-[28px] leading-tight font-extrabold text-gold tnum">{fmtNum(s.leads)}</span>
              <span className="text-caption text-on-ink-muted">{s.negotiating} زيارة محجوزة</span>
            </div>
          </section>

          <section className="flex flex-col gap-2.5">
            <span className="text-[13px] font-extrabold">آخر الطلبات المنسوبة لك</span>
            {leads.length > 0 && (
              <div className="flex flex-col bg-paper text-[12px] border-interactive">
                {leads.map((l, i) => {
                  const st = statusLook(l.status);
                  return (
                    <div key={l.code + l.when} className="flex min-h-11 items-center justify-between gap-3 px-3.5 py-3" style={i > 0 ? { borderTop: "1px solid var(--smq-line)" } : undefined}>
                      <span>
                        {agoLabel(l.when)} · <span dir="ltr">{l.unit}</span> · {l.channel}
                      </span>
                      <span className={cx("shrink-0", st.tone === "ink" && "font-extrabold", st.tone === "gold" && "font-extrabold text-gold-text", st.tone === "muted" && "font-bold text-muted")}>{st.text}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <span className="text-caption leading-relaxed text-muted">تظهر الوحدة والقناة والحالة فقط. لا أسماء ولا أرقام مشترين؛ فريق SMQ يتولّى التواصل.</span>
          </section>

          <section className="flex flex-col gap-1 bg-sand px-4 py-4 text-[12px] leading-relaxed">
            <span className="font-extrabold">العمولة</span>
            <span>
              <MarkedText text="تُحسب عند الإفراغ على الصفقات المنسوبة لك بنسبة [للتأكيد]." /> {negotiatingLine(s.negotiating, m.negotiatingUnit)}
            </span>
          </section>
        </main>
      </div>
    </PhoneColumn>
  );
}
