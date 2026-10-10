"use client";
// /projects · Projects-M, Projects-D. The published project card, the automatic owner group, the draft «قريباً» with
// the «نبّهني» form, and the numbers row. Every figure is computed (store overrides merged).
import Link from "next/link";
import type { ReactNode } from "react";
import { Button, Container, Header, ImageSlot, MarkedText } from "@/components/ui";
import { projects, publicProjects } from "@/data/projects";
import { districtAr } from "@/data/districts";
import { availableUnits, listedUnits, projectStats } from "@/data/selectors";
import type { Project, Unit } from "@/data/types";
import { useUnitOverrides } from "@/lib/store";
import { useHasHydrated } from "@/lib/location";
import { bedsLabel, cx, fmtNum } from "@/lib/format";
import { unitsUrl } from "@/lib/url";
import type { UnitOverrides } from "@/data/selectors";
import { apartmentBedsPhrase, buildingsNom, cheapestAvailable, deliveryShort, modelsWord, ownerGroup, roofsWord, soldThisYear, soldWord, unitPhrase, unitsDefinite } from "./lib";
import { FOOTER_LINKS, GoldHex, OutlineLink, PageFooter, RingHex } from "./parts";
import { NotifyForm } from "./NotifyForm";

/** Projects-M words the draft card shorter than the fixture text (Projects-D). */
const DRAFT_COPY_PHONE = "الأسعار والنماذج تُعلن عند الإطلاق [للتأكيد]. اترك جوالك ونرسل لك الأسعار أول ما تُنشر، بلا تسجيل حساب.";

export function ProjectsPage() {
  const hydrated = useHasHydrated();
  const live = useUnitOverrides();
  const ov = hydrated ? live : undefined;
  const published = publicProjects();
  const drafts = projects.filter((p) => p.status === "draft");
  const owner = ownerGroup();
  const available = availableUnits(ov);
  const cheapest = cheapestAvailable(ov);
  const sold = soldThisYear(ov);
  const soldBuildings = [...new Set(sold.map((u) => u.buildingNameAr))].join(" و");
  const eyebrow = `جدة · ${published.length === 1 ? "مشروع منشور" : published.length === 2 ? "مشروعان منشوران" : `${published.length} مشاريع منشورة`}${drafts.length === 1 ? "، وآخر قريباً" : drafts.length > 1 ? `، و${drafts.length} قريباً` : ""}`;
  const perProject = published.map((p) => `${availableUnits(ov).filter((u) => u.projectId === p.id).length} في ${p.nameAr}`);

  return (
    <>
      <Header />
      <main className="pb-12 lg:pb-16">
        <section className="bg-ink pb-12 pt-7 text-paper [clip-path:polygon(0_0,100%_0,100%_100%,52px_100%,0_calc(100%-30px))] lg:pb-16 lg:pt-12 lg:[clip-path:polygon(0_0,100%_0,100%_100%,120px_100%,0_calc(100%-69px))]">
          <Container className="flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:items-center lg:gap-8">
            <div className="flex flex-col gap-1.5">
              <span className="text-caption font-bold text-gold lg:text-label">{eyebrow}</span>
              <h1 className="m-0 text-h1 font-extrabold">المشاريع</h1>
            </div>
            <p className="m-0 max-w-lg text-label font-normal leading-relaxed text-on-ink-muted lg:text-body">
              كل مشروع بوحداته وأسعاره المعلنة وتاريخ تسليمه. الأرقام تتحدّث كلما بيعت وحدة<span className="hidden lg:inline">، ولا نكتب «اتصل للسعر»</span>.
            </p>
          </Container>
        </section>

        <Container className="mt-6 flex flex-col gap-4 lg:mt-9 lg:gap-6">
          {published.map((p) => (
            <ProjectCard key={p.id} p={p} ov={ov} />
          ))}

          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-6">
            {/* the automatic owner group */}
            {owner.project && (
              <article className="flex flex-col gap-3 border-interactive px-4 py-5 lg:gap-4 lg:px-6 lg:py-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-caption font-bold text-gold-text lg:text-label">أحياء متفرقة · بعد تحققنا</span>
                    <Link href={owner.districtSlug ? unitsUrl({ district: owner.districtSlug }) : "/units"} className="text-h3 font-extrabold text-ink no-underline hover:underline lg:text-h2">
                      وحدات من مُلّاك
                    </Link>
                  </div>
                  <RingHex size="l" className="text-body">
                    {owner.count}
                  </RingHex>
                </div>
                <p className="m-0 text-caption font-normal leading-relaxed text-muted lg:text-label lg:font-normal">
                  عقارات أرسلها مُلّاكها عبر «أضف عقارك»، راجعنا صكوكها وصوّرناها، وتظهر بوسم «من مالك» وبسعر معلن<span className="hidden lg:inline"> مثل باقي الوحدات</span>.
                  {owner.count > 0 && owner.districtAr && (
                    <>
                      {" "}
                      الآن: <span className="lg:hidden">{owner.typeAr}</span>
                      <span className="hidden lg:inline">{owner.titleAr}</span> في {owner.districtAr}.
                    </>
                  )}
                </p>
                <div className="grid grid-cols-2 gap-2.5 lg:flex">
                  <OutlineLink href={owner.districtSlug ? unitsUrl({ district: owner.districtSlug }) : "/units"} className="min-h-12 font-extrabold lg:px-5">
                    اعرض الوحدة
                  </OutlineLink>
                  <Link href="/add" className="inline-flex min-h-12 items-center justify-center bg-sand px-5 text-label font-extrabold text-ink no-underline hover:bg-slot motion-hover transition-colors">
                    أضف عقارك
                  </Link>
                </div>
              </article>
            )}

            {/* drafts: «قريباً» with «نبّهني» */}
            {drafts.map((p) => (
              <article key={p.id} className="flex flex-col gap-3 border-[1.5px] border-dashed border-ink px-4 py-5 lg:gap-4 lg:px-6 lg:py-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-caption font-bold text-gold-text lg:text-label">{districtAr(p.districtSlug)} · قريباً</span>
                    <span className="text-h3 font-extrabold lg:text-h2">{p.nameAr}</span>
                  </div>
                  <RingHex size="l">قريباً</RingHex>
                </div>
                <p className="m-0 text-caption font-normal leading-relaxed text-muted lg:text-label lg:font-normal">
                  <MarkedText text={DRAFT_COPY_PHONE} className="lg:hidden" />
                  <MarkedText text={p.descriptionAr ?? ""} className="hidden lg:inline" />
                </p>
                <NotifyForm projectId={p.id} />
              </article>
            ))}
          </div>

          {/* the numbers */}
          <section aria-labelledby="projects-numbers" className="mt-6 flex flex-col gap-3 lg:mt-2">
            <h2 id="projects-numbers" className="m-0 text-body font-extrabold lg:sr-only">
              بالأرقام
            </h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
              <NumberTile label="وحدات متاحة الآن" value={fmtNum(available.length + owner.count)} note={[...perProject, owner.count ? `${owner.count} من مالك` : null].filter(Boolean).join(" · ")} />
              <NumberTile label="أقل سعر معلن" value={cheapest ? fmtNum(cheapest.priceSar) : "—"} note={cheapest ? unitPhrase(cheapest) : ""} />
              <NumberTile className="hidden lg:flex" label="بيعت هذا العام" value={fmtNum(sold.length)} note={sold.length ? `${sold.map((u) => u.code).join(" و ")} · ${soldBuildings}` : ""} />
              <Link href="/guide" className="hidden flex-col gap-1.5 bg-ink px-5 py-5 text-paper no-underline cut-m hover:bg-ink-2 motion-hover transition-colors lg:flex">
                <span className="text-caption font-normal text-on-ink-muted">كل الأرقام</span>
                <span className="text-h3 font-extrabold">دليل الأسعار</span>
                <span className="text-caption font-normal text-gold">النطاقات بالغرف والنوع ←</span>
              </Link>
            </div>
            <Link href="/guide" className="inline-flex min-h-11 items-center self-start text-label font-bold text-gold-text no-underline hover:underline lg:hidden">
              دليل الأسعار الكامل ←
            </Link>
          </section>
        </Container>
      </main>
      <PageFooter links={FOOTER_LINKS.projects} />
    </>
  );
}

function NumberTile({ label, value, note, className }: { label: string; value: ReactNode; note: ReactNode; className?: string }) {
  return (
    <div className={cx("flex flex-col gap-1.5 bg-sand px-4 py-4 lg:px-5 lg:py-6", className)}>
      <span className="text-caption font-normal text-muted lg:text-caption">{label}</span>
      <span className="text-h2 font-extrabold leading-none tnum">{value}</span>
      <span className="text-caption font-normal text-muted">{note}</span>
    </div>
  );
}

/** The published project card (Projects-M stacked, Projects-D side by side with the image at the end). */
function ProjectCard({ p, ov }: { p: Project; ov?: UnitOverrides }) {
  const stats = projectStats(p.id, ov);
  const list = listedUnits(ov).filter((u) => u.projectId === p.id);
  const avail = list.filter((u) => u.status === "available");
  const apts = avail.filter((u) => u.type === "apartment");
  const roofs = avail.filter((u) => u.type === "roof-villa");
  const roofCount = list.filter((u) => u.type === "roof-villa").length;
  const aptFrom = minPrice(apts);
  const topBeds = Math.max(0, ...apts.map((u) => u.beds));
  const topBedsFrom = minPrice(apts.filter((u) => u.beds === topBeds));
  const delivery = p.deliveryLabel.value ? `${deliveryShort(p.deliveryLabel.value)}${p.deliveryLabel.tbc ? " [للتأكيد]" : ""}` : "";
  const beds = apartmentBedsPhrase(list);
  const head = `${modelsWord(stats.listed)}: ${beds}${roofCount ? `، و${roofsWord(roofCount)}` : ""}`;
  const counts = `${stats.available} متاحة${stats.sold ? `، ${soldWord(stats.sold)}` : ""}.`;
  const textD = `${head}${roofCount ? " بتراس خاص" : ""}. ${p.features.join("، ")}. ${counts}${delivery ? ` التسليم ${delivery}.` : ""}`;
  const textM = `${head}. ${counts}${delivery ? ` تسليم ${delivery}.` : ""}`;
  const href = `/projects/${p.slug}`;
  const unitsHref = unitsUrl({ district: p.districtSlug });
  const eyebrow = `${p.districtSlug ? `حي ${districtAr(p.districtSlug)}` : ""} · ${buildingsNom(p)}`;

  return (
    <article className="border-interactive lg:grid lg:grid-cols-[minmax(0,1fr)_520px]">
      <div className="relative lg:order-2">
        <ImageSlot slotId={p.images[0]} tier="generated" showId={false} cut="xl" alt={`${p.nameAr}، واجهة المشروع`} className="h-48 lg:h-full lg:min-h-80 lg:[clip-path:none]" />
        <GoldHex className="absolute start-4 top-3 size-14 text-caption lg:start-5 lg:top-4 lg:size-16">
          <span>{stats.available}</span>
          <span>متاحة</span>
        </GoldHex>
        <span className="absolute bottom-0 end-0 bg-ink py-2 pe-3.5 ps-5 text-caption font-bold text-paper cut-tag lg:hidden">{p.statusAr}</span>
      </div>
      <div className="flex min-w-0 flex-col lg:order-1">
        <div className="flex flex-col gap-1.5 px-4 pb-4 pt-4 lg:gap-2 lg:px-6 lg:pt-6">
          <span className="flex flex-wrap items-center gap-2 text-caption font-bold text-gold-text lg:text-label">
            {eyebrow}
            <span className="hidden bg-ink px-2 py-0.5 text-caption font-bold text-paper lg:inline">{p.statusAr}</span>
          </span>
          <Link href={href} className="text-h2 font-extrabold text-ink no-underline hover:underline">
            {p.nameAr}
          </Link>
          <p className="m-0 text-caption font-normal leading-relaxed text-muted lg:text-label lg:font-normal lg:text-ink-2">
            <MarkedText text={textM} className="lg:hidden" />
            <MarkedText text={textD} className="hidden lg:inline" />
          </p>
        </div>
        {/* phone: from · to · per m² from */}
        <div className="grid grid-cols-3 border-y border-ink lg:hidden">
          <Cell label="من" value={stats.fromPrice} />
          <Cell label="إلى" value={stats.toPrice} />
          <Cell label="المتر من" value={stats.ppm?.min ?? null} />
        </div>
        {/* desktop: apartments from · top beds · roof from · per m² */}
        <div className="hidden grid-cols-4 border-y border-ink bg-cream lg:grid">
          <Cell label="الشقق من" value={aptFrom} />
          <Cell label={topBeds ? bedsLabel(topBeds) : ""} value={topBedsFrom} />
          <Cell label="فيلا روف من" value={minPrice(roofs)} />
          <Cell label="المتر" value={stats.ppm ? `${fmtNum(stats.ppm.min)} إلى ${fmtNum(stats.ppm.max)}` : null} />
        </div>
        <div className="flex gap-2.5 px-4 py-4 lg:mt-auto lg:px-6 lg:py-4">
          <Button href={href} variant="secondary" size="m" className="flex-1 lg:flex-none">
            صفحة المشروع
          </Button>
          <OutlineLink href={unitsHref} className="min-h-12 lg:px-5">
            <span className="lg:hidden">الوحدات {stats.available}</span>
            <span className="hidden lg:inline">{unitsDefinite(stats.available)}</span>
          </OutlineLink>
          <OutlineLink href={unitsUrl({ district: p.districtSlug, pin: p.id }, "/units/map")} className="min-h-12 max-lg:hidden lg:px-5">
            على الخريطة
          </OutlineLink>
        </div>
      </div>
    </article>
  );
}
function minPrice(list: Unit[]): number | null {
  return list.length ? Math.min(...list.map((u) => u.priceSar)) : null;
}
function Cell({ label, value }: { label: string; value: number | string | null }) {
  return (
    <span className="flex min-w-0 flex-col gap-1 border-s border-line px-4 py-3 first:border-s-0 lg:px-4 lg:py-4">
      <small className="text-caption font-normal text-muted">{label}</small>
      <b className="whitespace-nowrap text-body font-extrabold tnum lg:text-h3">{value == null ? "—" : typeof value === "number" ? fmtNum(value) : value}</b>
    </span>
  );
}
