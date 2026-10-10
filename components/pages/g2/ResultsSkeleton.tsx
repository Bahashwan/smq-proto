// Loading skeletons of the results list (State-Loading-M · Results-Loading-D): the header, title and filters are
// real at once, only the numbers wait. One 1.4 s pulse, no horizontal motion.
import { Skeleton } from "@/components/ui";

export const LOADING_STATUS_PHONE = "نبحث في الوحدات المتاحة…";
export const LOADING_STATUS_DESKTOP = "نحسب الوحدات ضمن فلاترك…";

/** the phone status line under the title (md:hidden) and the desktop one (hidden md:flex) */
export function LoadingStatus() {
  return (
    <>
      <Skeleton.Status className="md:hidden">{LOADING_STATUS_PHONE}</Skeleton.Status>
      <Skeleton.Status className="hidden md:flex">{LOADING_STATUS_DESKTOP}</Skeleton.Status>
    </>
  );
}

/** Phone list skeleton: filter row, project row, two cards */
export function PhoneListSkeleton() {
  return (
    <div aria-label="جارٍ تحميل النتائج" aria-busy="true" className="flex flex-col gap-4">
      <Skeleton.Filters />
      <span className="flex items-center justify-between gap-3 pt-2">
        <Skeleton.Block w={150} h={18} />
        <Skeleton.Block w={90} h={24} tone="sand" />
      </span>
      <Skeleton.Card />
      <Skeleton.Card actions={false} />
    </div>
  );
}

/** Desktop filters column skeleton (Results-Loading-D aside) */
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
          <span className="flex gap-2">
            <Skeleton.Block h={44} className="flex-1" />
            <Skeleton.Block h={44} className="flex-1" />
          </span>
        </>,
      )}
      {section(
        "الغرف",
        <span className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton.Block key={i} h={40} tone={i ? "sand" : "slot"} />
          ))}
        </span>,
      )}
      {section("النوع", <Skeleton.Block h={44} className="w-full" />)}
      {section("الحي", <Skeleton.Block h={44} className="w-full" />)}
      {section(
        "الحالة",
        <span className="flex gap-2">
          <Skeleton.Block h={36} className="flex-1" tone="sand" />
          <Skeleton.Block h={36} className="flex-1" tone="sand" />
        </span>,
      )}
      <Skeleton.Block h={1.5} className="w-full bg-line" />
    </aside>
  );
}

/** Desktop results grid skeleton: two title blocks and six cards */
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
