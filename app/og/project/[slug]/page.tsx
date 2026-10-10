import { Lockup, PlaceholderDrawing, IllustrativeLabel, Price } from "@/components/ui";
import { OgFrame } from "../../OgFrame";
import { publicProjects, projectBySlug } from "@/data/projects";
import { projectStats } from "@/data/selectors";
import { districtAr } from "@/data/districts";
import { fmtNum } from "@/lib/format";

export const dynamicParams = false;
export function generateStaticParams() {
  return publicProjects().map((p) => ({ slug: p.slug }));
}
export const metadata = { title: "OG · المشروع" };

export default async function OgProject({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projectBySlug(slug)!;
  const stats = projectStats(project.id);
  return (
    <OgFrame className="bg-cream text-ink grid grid-cols-[640px_560px]">
      <div className="relative bg-slot overflow-hidden">
        <PlaceholderDrawing tone="slot" className="absolute inset-0 opacity-50" />
        <IllustrativeLabel size="m" className="absolute bottom-6 start-6" />
        <div className="absolute inset-y-0 end-0 w-[120px] bg-cream [clip-path:polygon(0_0,100%_100%,0_100%)]" />
      </div>
      <div className="relative flex flex-col justify-between p-12">
        <div className="flex flex-col gap-3">
          <span className="text-[18px] font-bold text-gold-text">حي {districtAr(project.districtSlug)}، جدة · {project.statusAr}</span>
          <span className="text-[60px] font-extrabold leading-[1.15]">{project.nameAr}</span>
          <span className="text-[20px] text-ink-2">{stats.available} وحدات متاحة · شقق غرفتين و3 غرف وفيلتا روف</span>
        </div>
        <div className="bg-ink text-paper px-7 py-5 flex flex-col gap-1 [clip-path:polygon(0_0,calc(100%_-_22px)_0,100%_38px,100%_100%,0_100%)]">
          <span className="text-[14px] text-on-ink-muted">أسعار معلنة من</span>
          <span className="flex items-baseline gap-3"><Price value={stats.fromPrice ?? 0} sign={false} className="text-[44px] font-extrabold" /><span className="text-[18px] text-on-ink-muted">إلى <span className="tnum">{fmtNum(stats.toPrice ?? 0)}</span> ريال</span></span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <Lockup tone="goldmark-ink" height={36} />
          <span className="text-[16px] font-bold text-muted" dir="ltr">smq-re.com/projects/{project.slug}</span>
        </div>
      </div>
    </OgFrame>
  );
}
