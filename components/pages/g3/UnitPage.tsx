"use client";
// /units/[code] · Unit-M, Unit-D, Unit-Reserved-M (?ustatus=reserved), Unit-Sold-M, Unit-Roof-M and the three
// Unit-Tier boards (?tier=real|typo). Phone: media, title, price block, spec sections, sibling strip, sticky bar.
// Desktop: media beside an aside (title, price block, calls to action), the spec grid in three columns, siblings.
import Link from "next/link";
import type { ReactNode } from "react";
import { unitBySlug } from "@/data/units";
import type { Unit } from "@/data/types";
import { cx, fmtDate, fmtDateLong, fmtArea } from "@/lib/format";
import { unitsUrl, compareUrl } from "@/lib/url";
import { Breadcrumb, Container, Footer, Header, Mark, WhatsAppIcon, useVisitorCode, PHONE_DISPLAY, PHONE_TEL, HOURS_AR } from "@/components/ui";
import { askObject, bathsSpec, bedsSpec, unitsWord, unitWaText, useUnitView, type UnitView } from "./view";
import type { RealFiles } from "./slots";
import { UnitMedia } from "./UnitMedia";
import { UnitPriceBlock } from "./UnitPriceBlock";
import { UnitSpecs } from "./UnitSpecs";
import { MiniUnitCard } from "./MiniUnitCard";
import { CompareBox, GhostLink, HexDot, WaCta } from "./parts";
import { waLink } from "@/lib/format";

const MODEL_ORDER = ["A", "B", "C", "D", "RF"];
const DEFINITE_COUNT: Record<number, string> = { 2: "الاثنين", 3: "الثلاثة", 4: "الأربعة", 5: "الخمسة", 6: "الستة", 7: "السبعة", 8: "الثمانية", 9: "التسعة", 10: "العشرة" };

/** Same-bedroom alternatives, closest price first, the same building first on a tie (Unit-Reserved-M, Unit-Sold-M). */
function byProximity(list: Unit[], unit: Unit): Unit[] {
  return [...list].sort((a, b) => Math.abs(a.priceSar - unit.priceSar) - Math.abs(b.priceSar - unit.priceSar) || Number(b.building === unit.building) - Number(a.building === unit.building) || a.priceSar - b.priceSar);
}

function imagesSuffix(v: UnitView, realFiles: RealFiles): string {
  if (v.status !== "available") return "";
  const n = v.unit.images.length;
  if (v.tier === "generated") return n === 1 ? " · صورة تعبيرية واحدة" : n === 2 ? " · صورتان تعبيريتان" : ` · ${n} صور تعبيرية`;
  if (v.tier === "real") {
    const r = v.unit.images.filter((s) => realFiles[s]).length;
    return r ? ` · ${r} صور فعلية` : "";
  }
  return v.unit.plan ? " · المخطط متاح" : "";
}

export function UnitPage({ slug, realFiles }: { slug: string; realFiles: RealFiles }) {
  const unit = unitBySlug(slug) as Unit;
  const v = useUnitView(unit);
  const code = useVisitorCode();
  const roof = unit.type === "roof-villa";
  const { status, project, district } = v;
  const name = roof ? "فيلا روف" : `نموذج ${unit.model}`;
  const projectHref = project ? `/projects/${project.slug}` : "/projects";
  const wa = unitWaText(v, code);
  const similar = byProximity(v.similar, unit);
  const similarHref = unitsUrl({ beds: unit.beds });

  const crumbs = [
    { label: "جدة", href: "/units" },
    { label: district?.ar ?? "", href: "/guide" },
    { label: project?.nameAr ?? "", href: projectHref },
    {
      label: (
        <>
          {name} · <span className="hidden md:inline">عمارة </span>
          {unit.buildingNameAr}
        </>
      ),
    },
  ];

  const spec: ReactNode = roof ? (
    <>
      {bedsSpec(unit.beds)} · {bathsSpec(unit.baths)} · {fmtArea(unit.areaM2)} م² مع التراس · الدوران الأخيران · مدخل خاص
      {unit.featuresTbc?.includes("privateEntrance") && <Mark>للتأكيد</Mark>}
    </>
  ) : (
    <>
      {bedsSpec(unit.beds)} · {bathsSpec(unit.baths)} · {fmtArea(unit.areaM2)} م² · الطابق {v.floorWordAr}
      {unit.floor?.tbc && <Mark>للتأكيد</Mark>}
    </>
  );
  const meta = `آخر تحديث ${fmtDate(v.updatedAt)} · كود النموذج ${unit.code}${imagesSuffix(v, realFiles)}`;

  // Calls to action per state (the phone's sticky bar and the desktop aside carry the same pair)
  const waSub = status === "available" && !roof ? `رسالة جاهزة: ${project?.nameAr ?? ""} · ${unit.code}` : `رسالة جاهزة: ${unit.code}`;
  const waTitle = status === "reserved" ? "سجّلني في قائمة الانتظار" : `اسأل عن ${askObject(unit)}`;
  const soldCta = `اعرض ${unitsWord(similar.length)} مشابهة متاحة`;

  const primary = (cls?: string) =>
    status === "sold" ? (
      <Link href={similarHref} className={cx("flex items-center justify-center min-h-14 px-4 bg-ink text-paper text-body font-extrabold no-underline cut-m hover:bg-ink-2 motion-hover transition-colors", cls)}>
        {soldCta}
      </Link>
    ) : (
      <WaCta text={wa} title={waTitle} sub={waSub} className={cls} />
    );
  const secondary = (phone: boolean) =>
    status === "reserved" ? (
      <GhostLink href={similarHref} className={phone ? "min-h-14 px-5" : "flex-1"}>
        المتاح
      </GhostLink>
    ) : status === "sold" ? (
      phone ? (
        <a href={waLink(wa)} target="_blank" rel="noopener noreferrer" aria-label="واتساب" className="inline-flex items-center justify-center shrink-0 size-14 bg-gold text-ink hex-flat hover:bg-gold-hover motion-hover transition-colors">
          <WhatsAppIcon size={20} />
        </a>
      ) : (
        <GhostLink href={waLink(wa)} className="flex-1">
          <WhatsAppIcon size={18} />
          واتساب
        </GhostLink>
      )
    ) : (
      <CompareBox slug={unit.slug} label={phone ? "قارن" : "أضف للمقارنة"} className={phone ? "" : "flex-1 min-h-12"} />
    );

  return (
    <>
      <Header showEn />
      <main>
        <Container className="pt-3 md:pt-6 md:pb-20">
          <Breadcrumb items={crumbs} />

          {status === "reserved" && v.reservedUntil && (
            <div role="note" className="mt-3 flex items-start gap-3 px-3.5 py-3 border-interactive bg-cream text-label font-normal leading-relaxed">
              <HexDot tone="ring" flat dims="w-6 h-5" className="mt-0.5" />
              <span>
                <strong className="font-extrabold">محجوزة حتى {fmtDateLong(v.reservedUntil)}.</strong> عربون مدفوع والسعر مثبّت للحاجز. إن لم يُكمل، تعود للعرض هنا وتصلك رسالة إن سجّلت في قائمة الانتظار.
              </span>
            </div>
          )}
          {status === "sold" && v.soldOn && (
            <div role="note" className="mt-3 flex items-start gap-3 px-3.5 py-3 bg-ink text-paper text-label font-normal leading-relaxed cut-m">
              <HexDot tone="paper" flat dims="w-6 h-5" className="mt-0.5" />
              <span>
                <strong className="font-extrabold">بيعت في {fmtDateLong(v.soldOn)}.</strong> نُبقي الصفحة لأن سعرها الحقيقي يفيدك في المقارنة. {unitsWord(v.projectAvailableOthers)} أخرى متاحة في المشروع، منها {similar.length} بنفس الغرف.
              </span>
            </div>
          )}

          <div className="mt-3 md:mt-5 flex flex-col gap-5 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] md:gap-10 lg:gap-14 md:items-start">
            <UnitMedia view={v} realFiles={realFiles} thumbs={status === "available"} />

            <aside className="flex flex-col gap-4 min-w-0" aria-label="ملخص الوحدة">
              <div className="flex flex-col gap-1.5">
                <Link href={projectHref} className="self-start text-caption md:text-label font-bold text-gold-text no-underline hover:underline">
                  {project?.nameAr} · عمارة {unit.buildingNameAr} · حي {district?.ar}
                </Link>
                <h1 className={cx("m-0 text-h1 leading-tight", status === "sold" && "text-ink-2")}>{roof ? "فيلا روف" : unit.nameAr}</h1>
                <p className="m-0 text-label md:text-body font-normal leading-relaxed text-muted">{spec}</p>
                <p className="m-0 text-caption font-normal text-muted md:hidden">{meta}</p>
              </div>

              <UnitPriceBlock view={v} />

              <div className="hidden md:flex flex-col gap-3">
                {primary()}
                <div className="flex gap-3">
                  {secondary(false)}
                  <GhostLink href={`tel:${PHONE_TEL}`} className="flex-1">
                    اتصال {PHONE_DISPLAY}
                  </GhostLink>
                </div>
                <p className="m-0 text-caption font-normal leading-relaxed text-muted">
                  {meta} · ساعات العمل: {HOURS_AR}
                </p>
              </div>
            </aside>
          </div>

          <UnitSpecs v={v} className="mt-9 md:mt-14" />

          <Siblings v={v} similar={similar} similarHref={similarHref} realFiles={realFiles} projectHref={projectHref} />
        </Container>

        <div className="sticky bottom-0 z-30 mt-8 md:hidden border-t border-line bg-paper">
          <div className="container-smq flex items-stretch gap-2 py-3">
            {primary("flex-1 min-w-0")}
            {secondary(true)}
          </div>
        </div>
      </main>
      <Footer compact />
    </>
  );
}

function SiblingsHead({ title, titleD, link, linkD, href }: { title: string; titleD?: string; link: string; linkD?: string; href: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="m-0 text-h3 md:text-h2 leading-tight">
        {titleD ? (
          <>
            <span className="md:hidden">{title}</span>
            <span className="hidden md:inline">{titleD}</span>
          </>
        ) : (
          title
        )}
      </h2>
      <Link href={href} className="shrink-0 text-caption md:text-label font-bold text-gold-text no-underline hover:underline">
        {linkD ? (
          <>
            <span className="md:hidden">{link}</span>
            <span className="hidden md:inline">{linkD}</span>
          </>
        ) : (
          link
        )}
      </Link>
    </div>
  );
}

const strip = "flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible [scrollbar-width:none]";

function Siblings({ v, similar, similarHref, realFiles, projectHref }: { v: UnitView; similar: Unit[]; similarHref: string; realFiles: RealFiles; projectHref: string }) {
  const { unit, status, tier } = v;
  const cardCls = "w-50 md:w-auto";
  if (status !== "available") {
    if (!similar.length) return null;
    return (
      <section className="mt-12 md:mt-16 flex flex-col gap-4" aria-label="متاح الآن بنفس الغرف">
        <SiblingsHead title="متاح الآن بنفس الغرف" link={status === "sold" ? unitsWord(similar.length) : "كل المتاح"} href={similarHref} />
        <div className={strip}>
          {similar.map((u) => (
            <MiniUnitCard key={u.code} unit={u} status={u.status} tier={tier} realSrc={realFiles[u.images[0]]} withBuilding withStatus className={cardCls} />
          ))}
        </div>
      </section>
    );
  }
  if (unit.type === "roof-villa") {
    const other = v.otherRoof;
    if (!other) return null;
    return (
      <section className="mt-12 md:mt-16 flex flex-col gap-4" aria-label="الروف الآخر في المشروع">
        <SiblingsHead title="الروف الآخر في المشروع" link="كل النماذج" href={projectHref} />
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible [scrollbar-width:none]">
          <MiniUnitCard unit={other} status={other.status} tier={tier} realSrc={realFiles[other.images[0]]} withBuilding withBaths withStatus className="w-55 md:w-72" />
          <Link href={compareUrl([unit.slug, other.slug])} className="flex flex-col items-center justify-center gap-1.5 shrink-0 w-38 md:w-56 px-3 py-4 border-[1.5px] border-dashed border-ink text-center text-ink no-underline hover:bg-sand motion-hover transition-colors">
            <span className="text-label font-extrabold">قارن الروفين</span>
            <span className="text-caption font-semibold text-muted leading-snug">المساحة والسعر والمتر جنباً إلى جنب</span>
          </Link>
        </div>
      </section>
    );
  }
  const others = [...v.others].sort((a, b) => MODEL_ORDER.indexOf(a.model) - MODEL_ORDER.indexOf(b.model));
  if (!others.length) return null;
  return (
    <section className="mt-12 md:mt-16 flex flex-col gap-4" aria-label="نماذج أخرى">
      <SiblingsHead title={`نماذج أخرى في ${unit.buildingNameAr}`} titleD={`نماذج أخرى في ${v.project?.nameAr ?? ""}`} link="كل النماذج" linkD={DEFINITE_COUNT[v.projectListed] ? `كل النماذج ${DEFINITE_COUNT[v.projectListed]}` : "كل النماذج"} href={projectHref} />
      <div className={strip}>
        {others.map((u) => (
          <MiniUnitCard key={u.code} unit={u} status={u.status} tier={tier} realSrc={realFiles[u.images[0]]} withBuilding="md" className={cardCls} />
        ))}
      </div>
    </section>
  );
}
