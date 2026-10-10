// Any unknown URL · NotFound-M / NotFound-D: «404», budget chips to /units?max=…, home and WhatsApp.
import { Button, Chip, Footer, Header, LogoMark, WA_URL } from "@/components/ui";
import { lists } from "@/data/content";
import { unitsUrl } from "@/lib/url";

const CHIP_KEYS = ["500k", "700k", "1m"];

export default function NotFound() {
  const chips = lists.budgets.filter((b) => b.visible !== false && CHIP_KEYS.includes(b.key));
  return (
    <>
      <Header />
      <main className="relative overflow-hidden min-h-[calc(100dvh-64px)] md:min-h-0">
        <LogoMark size={380} className="absolute -top-6 -start-24 opacity-8 pointer-events-none select-none md:hidden" />
        <div className="container-smq relative py-10 md:py-20 md:grid md:grid-cols-2 md:gap-12 md:items-center">
          <div className="flex flex-col items-start gap-4">
            <span className="text-[112px] md:text-[160px] font-extrabold leading-none text-gold tnum tracking-tight">404</span>
            <h1 className="m-0 text-[26px] md:text-h1 font-extrabold leading-tight">
              هذه الصفحة غير موجودة.
              <br />
              الوحدات موجودة.
            </h1>
            <p className="m-0 text-body md:text-[16px] text-muted leading-relaxed">ربما تغيّر الرابط أو بيعت الوحدة. ابدأ من ميزانيتك وسنعرض لك ما هو متاح الآن.</p>
            <div className="flex flex-wrap items-center gap-2.5 mt-1">
              {chips.map((b) => (
                <Chip key={b.key} href={unitsUrl({ max: b.value })}>
                  {b.labelAr}
                </Chip>
              ))}
              <Button href="/" variant="secondary" size="s" className="hidden md:inline-flex h-11 px-4">
                الصفحة الرئيسية
              </Button>
            </div>
            <Button href="/" variant="secondary" size="m" arrow between full className="md:hidden mt-2">
              الصفحة الرئيسية
            </Button>
            <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="md:hidden text-label font-bold text-ink no-underline hover:underline">
              أو اكتب لنا على واتساب
            </a>
          </div>
          <div className="hidden md:flex items-center justify-center">
            <LogoMark size={420} className="opacity-12 pointer-events-none select-none" />
          </div>
        </div>
      </main>
      <Footer compact className="hidden md:block" />
    </>
  );
}
