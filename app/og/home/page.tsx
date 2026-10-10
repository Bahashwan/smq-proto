import { Lockup } from "@/components/ui";
import { OgFrame } from "../OgFrame";
import { fromPrice } from "@/data/selectors";
import { fmtNum } from "@/lib/format";

export const metadata = { title: "OG · الرئيسية" };

export default function OgHome() {
  const from = fromPrice() ?? 0;
  const cells = ["ink", "paper", "ink", "ink", "ink", null, "paper", "ink"] as const;
  return (
    <OgFrame className="bg-ink text-paper">
      <div className="absolute inset-y-0 left-0 w-[460px] bg-gold" />
      <div className="absolute inset-y-0 left-[460px] w-[120px] bg-gold [clip-path:polygon(0_0,100%_0,0_100%)]" />
      <div className="absolute left-[300px] top-[108px] grid grid-cols-3 gap-x-1 gap-y-1 w-[316px]" dir="rtl">
        {cells.map((c, i) => (
          <span key={i} className={`block h-[100px] hex-flat ${c === "ink" ? "bg-ink" : c === "paper" ? "bg-paper" : ""}`} />
        ))}
      </div>
      <div className="absolute right-[72px] top-[80px] w-[540px] flex flex-col gap-7">
        <Lockup tone="goldmark-white" height={44} />
        <span className="text-[52px] font-extrabold leading-[1.2]">شقق وفلل روف<br />بأسعار معلنة في جدة</span>
        <span className="text-[22px] leading-[1.6] text-on-ink-muted">ابدأ من ميزانيتك. الروضة من <span className="tnum">{fmtNum(from)}</span> ريال.<br />لا «اتصل للسعر».</span>
      </div>
      <div className="absolute right-[72px] bottom-[50px] flex items-center gap-3 text-[18px] font-bold text-gold">
        <span className="block size-5 hex-flat bg-gold" />
        <span dir="ltr">smq-re.com</span>
      </div>
    </OgFrame>
  );
}
