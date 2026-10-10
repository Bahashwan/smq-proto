// Loading skeletons of the results list (State-Loading-M · Results-Loading-D): the header, title and filter labels
// are real at once, only the numbers wait. One 1.4 s pulse, no horizontal motion. Past 6 s the board's rule swaps the
// skeleton for «الاتصال بطيء، أعد المحاولة أو تواصل على واتساب» under the title.
import { Skeleton, WhatsAppLink } from "@/components/ui";

export const LOADING_STATUS_PHONE = "نبحث في الوحدات المتاحة…";
export const LOADING_STATUS_DESKTOP = "نحسب الوحدات ضمن فلاترك…";
/** «إن تجاوز التحميل 6 ثوانٍ» (Results-Loading-D rule) */
export const SLOW_AFTER_MS = 6000;

/** the phone status line under the title (md:hidden) and the desktop one (hidden md:flex) */
export function LoadingStatus() {
  return (
    <>
      <Skeleton.Status className="md:hidden">{LOADING_STATUS_PHONE}</Skeleton.Status>
      <Skeleton.Status className="hidden md:flex">{LOADING_STATUS_DESKTOP}</Skeleton.Status>
    </>
  );
}

/** «الاتصال بطيء، أعد المحاولة أو تواصل على واتساب» */
export function SlowNotice({ onRetry }: { onRetry: () => void }) {
  return (
    <p role="status" className="m-0 text-label font-normal text-ink-2">
      الاتصال بطيء،{" "}
      <button type="button" onClick={onRetry} className="inline font-bold text-gold-text underline hover:text-ink motion-hover transition-colors">
        أعد المحاولة
      </button>{" "}
      أو{" "}
      <WhatsAppLink className="font-bold text-gold-text underline hover:text-ink motion-hover transition-colors">
        تواصل على واتساب
      </WhatsAppLink>
    </p>
  );
}

/** Phone list skeleton under the toolbar skeleton: project row and two cards */
export function PhoneListSkeleton() {
  return (
    <div aria-label="جارٍ تحميل النتائج" aria-busy="true" className="flex flex-col gap-3.5">
      <span className="flex items-center justify-between gap-3">
        <Skeleton.Block w={150} h={18} />
        <Skeleton.Block w={80} h={24} tone="sand" />
      </span>
      <Skeleton.Card />
      <Skeleton.Card actions={false} />
    </div>
  );
}

/** Desktop sort + view toggle placeholders (Results-Loading-D: 200 and 180 px) */
export function ToolbarSkeleton() {
  return (
    <span aria-hidden="true" className="flex items-center gap-2.5">
      <Skeleton.Block w={200} h={48} />
      <Skeleton.Block w={180} h={48} />
    </span>
  );
}

/** Desktop filters column skeleton (Results-Loading-D aside): real labels, waiting controls */
export function FiltersColumnSkeleton() {
  const section = (label: string, body: React.ReactNode) => (
    <div className="flex flex-col gap-2">
      <span className="text-caption font-bold text-muted">{label}</span>
      {body}
    </div>
  );
  return (
    <aside aria-hidden="true" className="flex flex-col gap-5 border-interactive bg-paper p-4">
      <span className="text-body font-extrabold">الفلاتر</span>
      {section(
        "الميزانية",
        <>
          <Skeleton.Block h={2} className="w-full bg-line" />
          <span className="flex justify-between gap-2">
            <Skeleton.Block w={70} h={14} />
            <Skeleton.Block w={70} h={14} />
          </span>
        </>,
      )}
      {section(
        "الغرف",
        <span className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton.Block key={i} h={44} />
          ))}
        </span>,
      )}
      {section("النوع", <Skeleton.Block h={44} className="w-full" />)}
      {section("الحي", <Skeleton.Block h={44} className="w-full" />)}
      {section(
        "الحالة",
        <span className="flex gap-2">
          <Skeleton.Block h={40} className="flex-1" />
          <Skeleton.Block h={40} className="flex-1" />
        </span>,
      )}
      <Skeleton.Block h={48} className="w-full bg-line" />
    </aside>
  );
}

/** Desktop results grid skeleton: the project row and six cards */
export function DesktopGridSkeleton() {
  return (
    <div aria-label="جارٍ تحميل النتائج" aria-busy="true" className="flex flex-col gap-4">
      <span className="flex items-center justify-between gap-3">
        <Skeleton.Block w={160} h={20} />
        <Skeleton.Block w={120} h={24} tone="sand" />
      </span>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton.Card key={i} actions={false} />
        ))}
      </div>
    </div>
  );
}
