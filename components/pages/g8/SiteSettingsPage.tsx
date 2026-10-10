"use client";
// /admin/content/site-settings (Admin-SiteSettings-D): contact, licences and identity, social links, the office pin
// (schematic PinPicker with coordinate fields, the real office coordinates), the six WhatsApp templates with a live
// example from RZ-A, and the global switches. The strip keeps reporting the one [للتأكيد] field (the tax number).
import { useMemo, useState, type ReactNode } from "react";
import { Switch, unsavedFieldsText } from "@/components/admin";
import { PinPicker } from "@/components/map";
import { Mark, MarkedText } from "@/components/ui";
import { leadById } from "@/data/leads";
import { projectById } from "@/data/projects";
import { fillTemplate, settings, WA_TEMPLATES } from "@/data/settings";
import { unitByCode } from "@/data/units";
import { usePatch, useStore } from "@/lib/store";
import { cx, fmtNum } from "@/lib/format";
import { ctl, Field, INPUT_H } from "./controls";
import { PATCH } from "./model";
import { ContentHead, G8Shell, LangSwitch, SAUD, SaveStrip, StripLink, type StripState } from "./shell";

interface S {
  whatsapp: string;
  phone: string;
  email: string;
  emailLeads: string;
  address: string;
  addressEn: string;
  hours: string;
  hoursEn: string;
  afterHours: string;
  afterHoursEn: string;
  company: string;
  companyEn: string;
  cr: string;
  rega: string;
  tax: string;
  tagline: string;
  taglineEn: string;
  footer: string;
  footerEn: string;
  x: string;
  instagram: string;
  snapchat: string;
  tiktok: string;
  linkedin: string;
  maps: string;
  lat: number;
  lng: number;
  templates: string[];
  showSold: boolean;
  generatedLabel: boolean;
  acceptOwners: boolean;
}

function fromFixture(): S {
  return {
    whatsapp: settings.whatsappIntl ?? settings.whatsapp.number,
    phone: settings.phoneIntl ?? settings.phone,
    email: settings.email,
    emailLeads: settings.emailLeads ?? "",
    address: settings.office.addressAr,
    addressEn: settings.office.addressEn,
    hours: settings.hoursLabelAr ?? "",
    hoursEn: settings.hoursLabelEn ?? "",
    afterHours: settings.afterHoursAr ?? "",
    afterHoursEn: "",
    company: settings.companyNameAr ?? "",
    companyEn: settings.companyNameEn ?? "",
    cr: settings.licence.cr,
    rega: settings.licence.rega,
    tax: settings.taxNumber?.value ?? "",
    tagline: settings.taglineAr ?? "",
    taglineEn: "",
    footer: settings.footerLineAr ?? "",
    footerEn: "",
    x: settings.social?.x ?? "",
    instagram: settings.social?.instagram ?? "",
    snapchat: settings.social?.snapchat ?? "",
    tiktok: settings.social?.tiktok ?? "",
    linkedin: settings.social?.linkedin ?? "",
    maps: settings.office.mapsLink,
    lat: settings.office.lat,
    lng: settings.office.lng,
    templates: WA_TEMPLATES.map((t) => t.text),
    showSold: settings.siteSwitches?.showSoldInResults ?? false,
    generatedLabel: settings.siteSwitches?.generatedLabel ?? true,
    acceptOwners: settings.siteSwitches?.acceptOwnerListings ?? true,
  };
}

/** The 11px muted hint under a field (`.hint` on the board). */
const HINT = "text-caption font-semibold text-muted";

/** Fields that change with the AR / EN tab (the rest are shared: numbers, addresses of the web). */
const BILINGUAL: Partial<Record<keyof S, keyof S>> = { address: "addressEn", hours: "hoursEn", afterHours: "afterHoursEn", company: "companyEn", tagline: "taglineEn", footer: "footerEn" };

function Section({ title, aside, children, wide, cols = 2 }: { title: string; aside?: string; children: ReactNode; wide?: boolean; cols?: 2 | 3 }) {
  return (
    <section aria-label={title} className={cx("border-interactive bg-paper", wide && "col-span-full")}>
      <header className="flex min-h-[50px] flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b-[1.5px] border-ink bg-sand px-4 py-3">
        <h2 className="text-[14px] font-extrabold">{title}</h2>
        {aside && <span className={HINT}>{aside}</span>}
      </header>
      <div className={cx("grid gap-3.5 p-4", cols === 2 ? "sm:grid-cols-2" : "md:grid-cols-3")}>{children}</div>
    </section>
  );
}

export function SiteSettingsPage() {
  const stored = usePatch<{ state: S }>("g8.settings", "state")?.state;
  const patch = useStore((s) => s.patch);
  const toast = useStore((s) => s.toast);
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [saved, setSaved] = useState<S>(() => stored ?? fromFixture());
  const [st, setSt] = useState<S>(() => stored ?? fromFixture());
  const [phase, setPhase] = useState<"edit" | "saving" | "saved">("edit");

  const changed = (Object.keys(st) as (keyof S)[]).filter((k) => JSON.stringify(st[k]) !== JSON.stringify(saved[k])).length;
  const taxTbc = !saved.tax.trim();
  const state: StripState = phase === "saving" ? "saving" : phase === "saved" ? "saved" : changed ? "dirty" : "clean";
  const message = (
    <>
      {taxTbc && (
        <>
          حقل واحد بوسم <Mark>[للتأكيد]</Mark> (الرقم الضريبي) ·{" "}
        </>
      )}
      {unsavedFieldsText(changed)}
    </>
  );

  const set = <K extends keyof S>(k: K, v: S[K]) => {
    setPhase("edit");
    setSt((prev) => ({ ...prev, [k]: v }));
  };
  const keyFor = (k: keyof S): keyof S => (lang === "en" && BILINGUAL[k] ? BILINGUAL[k]! : k);
  const text = (k: keyof S, label: string, opts: { ltr?: boolean; hint?: string; placeholder?: string } = {}) => {
    const kk = keyFor(k);
    const ltr = opts.ltr || (lang === "en" && !!BILINGUAL[k]);
    return (
      <Field label={label} note={opts.hint && <span className={HINT}>{opts.hint}</span>}>
        <input
          value={String(st[kk] ?? "")}
          onChange={(e) => set(kk, e.target.value as S[typeof kk])}
          dir={ltr ? "ltr" : undefined}
          placeholder={opts.placeholder ?? (lang === "en" && BILINGUAL[k] ? String(st[k]) : undefined)}
          className={ctl("admin", cx(INPUT_H, ltr && "text-right"))}
        />
      </Field>
    );
  };

  const rz = unitByCode("RZ-A");
  const example = useMemo(() => {
    if (!rz) return "";
    return fillTemplate(st.templates[0] ?? "", { unit_code: rz.code, project: projectById(rz.projectId)?.nameAr ?? "", price: fmtNum(rz.priceSar), code: leadById("SMQ-8F3A2")?.code ?? "" });
  }, [st.templates, rz]);

  const save = () => {
    setPhase("saving");
    setTimeout(() => {
      patch("g8.settings", "state", { state: st });
      if (st.tax.trim()) patch(PATCH.nc, "nc-tax", { confirmed: true });
      setSaved(st);
      setPhase("saved");
      toast("حُفظت إعدادات الموقع · تظهر في الرأس والتذييل وصفحات الوحدات", { kind: "ok", action: { label: "معاينة الرأس والتذييل", href: "/" } });
      setTimeout(() => setPhase("edit"), 6000);
    }, 600);
  };

  return (
    <G8Shell user={SAUD} mainClassName="pb-0 md:pb-0">
      <ContentHead
        trail="إعدادات الموقع"
        title="إعدادات الموقع"
        subtitle="بيانات التواصل والتراخيص والعبارات التي تتكرر في الرأس والتذييل وصفحات الوحدات. تُحفظ مرة وتظهر في كل مكان"
        actions={<LangSwitch value={lang} onChange={setLang} />}
      />

      <div className="grid items-start gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(440px,100%),1fr))]">
        <Section title="التواصل">
          {text("whatsapp", "رقم واتساب (الزر الأساسي في كل الصفحات)", { ltr: true, hint: "يُستخدم في wa.me وفي الرسائل المعبّأة" })}
          {text("phone", "هاتف الاتصال", { ltr: true })}
          {text("email", "البريد", { ltr: true })}
          {text("emailLeads", "البريد لتنبيهات الطلبات", { ltr: true, hint: "يستقبل نسخة من كل طلب وارد" })}
          <div className="sm:col-span-2">{text("address", "العنوان")}</div>
          {text("hours", "ساعات العمل")}
          {text("afterHours", "نص خارج ساعات العمل")}
        </Section>

        <Section title="التراخيص والهوية">
          {text("company", "اسم الشركة (كما في التذييل)")}
          {text("cr", "السجل التجاري", { ltr: true })}
          {text("rega", "ترخيص فال (الهيئة العامة للعقار)", { ltr: true, hint: "يظهر في التذييل وصفحة الوحدة" })}
          <Field label="الرقم الضريبي" as="div">
            {/* empty: the field shows its [للتأكيد] value, as the chip, until a number is typed */}
            <span className="relative block">
              <input value={st.tax} onChange={(e) => set("tax", e.target.value)} dir="ltr" inputMode="numeric" aria-label="الرقم الضريبي" className={ctl(st.tax ? "admin" : "tbc", cx(INPUT_H, "text-right"))} />
              {!st.tax && (
                <span aria-hidden className="pointer-events-none absolute inset-y-0 start-3 flex items-center">
                  <Mark>[للتأكيد]</Mark>
                </span>
              )}
            </span>
          </Field>
          <div className="sm:col-span-2">{text("tagline", "العبارة التعريفية (الرأس والمعاينات)")}</div>
          <div className="sm:col-span-2">{text("footer", "عبارة التذييل")}</div>
        </Section>

        <Section title="الحسابات الاجتماعية" aside="تظهر في التذييل إذا كان الرابط غير فارغ">
          {text("x", "إكس", { ltr: true, placeholder: "فارغ · لا يظهر" })}
          {text("instagram", "إنستغرام", { ltr: true, placeholder: "فارغ · لا يظهر" })}
          {text("snapchat", "سناب شات", { ltr: true, placeholder: "فارغ · لا يظهر" })}
          {text("tiktok", "تيك توك", { ltr: true, placeholder: "فارغ · لا يظهر" })}
          {text("linkedin", "لينكدإن", { ltr: true, placeholder: "فارغ · لا يظهر" })}
          {text("maps", "خرائط قوقل (المكتب)", { ltr: true })}
        </Section>

        <section aria-label="موقع المكتب على الخريطة" className="border-interactive bg-paper">
          <header className="flex min-h-[50px] items-center border-b-[1.5px] border-ink bg-sand px-4 py-3">
            <h2 className="text-[14px] font-extrabold">موقع المكتب على الخريطة</h2>
          </header>
          <div className="p-4">
            <PinPicker latLng={{ lat: st.lat, lng: st.lng }} coordinateFields="above" gridSize={30} hint="اسحب الدبوس أو أدخل الإحداثيات" ariaLabel="موقع المكتب على الخريطة" onChange={(v) => {
              setPhase("edit");
              setSt((prev) => ({ ...prev, lat: Math.round(v.lat * 1e7) / 1e7, lng: Math.round(v.lng * 1e7) / 1e7 }));
            }} />
          </div>
        </section>

        <Section title="قوالب رسائل واتساب" aside="المتغيرات بين أقواس تُستبدل تلقائياً. الرمز {code} يربط الضغطة بالمحادثة في الطلبات الواردة" wide cols={3}>
          {WA_TEMPLATES.map((t, i) => (
            <Field key={t.id} label={t.label} note={i === 0 && example ? <span className={HINT}>مثال: {example}</span> : undefined}>
              <textarea
                value={st.templates[i] ?? ""}
                onChange={(e) => set("templates", st.templates.map((x, j) => (j === i ? e.target.value : x)))}
                rows={3}
                className={ctl("admin", "min-h-[80px] py-2.5 leading-relaxed")}
              />
            </Field>
          ))}
        </Section>

        <Section title="مفاتيح عامة" wide cols={3}>
          <SwitchCard label="إظهار الوحدات المباعة في النتائج" hint="مطفأ: تظهر في صفحة المشروع فقط" checked={st.showSold} onChange={(v) => set("showSold", v)} />
          <SwitchCard label="وسم «صورة تعبيرية» على الصور المولّدة" hint="لا يُطفأ إلا بصلاحية مدير" checked={st.generatedLabel} onChange={(v) => set("generatedLabel", v)} />
          <SwitchCard label="استقبال عقارات المُلّاك" hint="مطفأ: صفحة «أضف عقارك» تعرض رسالة إيقاف مؤقت" checked={st.acceptOwners} onChange={(v) => set("acceptOwners", v)} />
        </Section>
      </div>

      <SaveStrip
        state={state}
        mark={taxTbc || changed > 0}
        message={message}
        onDiscard={() => setSt(saved)}
        links={<StripLink href="/">معاينة الرأس والتذييل</StripLink>}
        onSave={save}
        savedText="حُفظت إعدادات الموقع ·"
        openHref="/"
        openLabel="معاينة الرأس والتذييل"
      />
    </G8Shell>
  );
}

function SwitchCard({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 border-[1.5px] border-line px-3.5 py-3">
      <span className="flex flex-col gap-0.5">
        <span className="text-label font-bold">{label}</span>
        <span className={HINT}>
          <MarkedText text={hint} />
        </span>
      </span>
      <Switch checked={checked} onChange={onChange} aria-label={label} />
    </div>
  );
}
