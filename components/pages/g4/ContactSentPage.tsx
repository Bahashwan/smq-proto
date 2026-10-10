"use client";
// /contact/sent · Contact-Success-M. Echoes the message sent from /contact (session store); the reply-time line is
// computed from the moment it was sent and the business hours (replyTimeLine). Opened directly (the presenter's deep
// link), it shows the boards' example message at the prototype's clock.
import { Container, Header, WhatsAppIcon } from "@/components/ui";
import { replyTimeLine } from "@/data/selectors";
import { usePatch, useUnitOverrides } from "@/lib/store";
import { useHasHydrated } from "@/lib/location";
import { waLink } from "@/lib/format";
import { unitsUrl } from "@/lib/url";
import { maskPhone, readAsk } from "./lib";
import { CheckHex, FOOTER_LINKS, OutlineLink, PageFooter } from "./parts";
import type { ContactSent } from "./ContactPage";

/** The boards' example (Contact-Error-M / Contact-Success-M): what a visitor typed, not a figure. */
const SAMPLE = { name: "خالد باعشن", message: "أبحث عن شقة 3 غرف بميزانية 700 ألف، هل يمكن زيارة يوم السبت؟", phoneMasked: "05X XXX 0000", at: undefined as string | undefined };

export function ContactSentPage() {
  const hydrated = useHasHydrated();
  const last = usePatch<ContactSent>("contact", "last");
  const live = useUnitOverrides();
  const real = hydrated && last?.message ? last : null;
  const s = real ? { name: real.name ?? "", message: real.message ?? "", phoneMasked: maskPhone(real.phoneDigits ?? ""), at: real.at } : SAMPLE;
  const reply = replyTimeLine(s.at ?? undefined);
  const first = s.name.trim().split(/\s+/)[0] ?? "";
  const ask = readAsk(s.message, hydrated ? live : undefined);

  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100svh-64px)] flex-col md:min-h-0">
        <Container className="flex flex-1 flex-col pb-6 pt-8 md:max-w-xl md:pb-16 md:pt-14">
          <CheckHex className="size-14" icon={26} />
          <h1 className="m-0 mt-4.5 text-h1 font-extrabold">وصلتنا رسالتك</h1>
          <p className="m-0 mt-4.5 text-body font-normal text-ink-2" aria-live="polite">
            شكراً {first}. نرد خلال ساعات العمل، {reply.hoursAr}. {reply.lineAr}
          </p>
          <div className="mt-4.5 flex flex-col gap-2 border-interactive px-4 py-3.5">
            <span className="text-caption font-extrabold md:text-label">ما أرسلته</span>
            <span className="text-label font-normal leading-relaxed text-ink-2">«{s.message}»</span>
            <span className="text-caption font-normal text-muted">
              الرد على <span dir="ltr" className="tnum">{s.phoneMasked}</span> · واتساب أو اتصال، كما اخترت
            </span>
          </div>
          <div className="mt-4.5 flex flex-col gap-1.5 bg-sand px-3.5 py-3 text-caption font-normal leading-relaxed md:text-label md:font-normal">
            <span className="font-extrabold">مستعجل؟</span>
            <span>واتساب أسرع من النموذج خارج ساعات العمل: الرسائل تصل الفريق على الجوال.</span>
          </div>
          <div className="mt-auto flex flex-col gap-2 pt-10">
            <a href={waLink(`${s.name}، ${s.message}`)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-13 items-center justify-center gap-2.5 bg-gold px-4 text-body font-extrabold text-ink no-underline cut-m hover:bg-gold-hover motion-hover transition-colors">
              <WhatsAppIcon size={20} />
              أكمل على واتساب برسالتك نفسها
            </a>
            {ask && (
              <OutlineLink href={unitsUrl(ask.filters)} className="min-h-12 text-body">
                {ask.labelAr}
              </OutlineLink>
            )}
          </div>
        </Container>
      </main>
      <PageFooter links={FOOTER_LINKS.contact} />
    </>
  );
}
