"use client";
// /add · أضف عقارك step 1 «النوع والموقع» (Add-Step1-M at 390, Add-D at 1440): type, purpose, city, district, landmark,
// the schematic pin picker (drag the hexagon, «موقعي الحالي» on the phone, «ألصق رابطاً» for a Google Maps link) and
// the relation. The phone page shows the hero, «كيف يسير الأمر» and the form; the desktop page the Add-D hero with the
// step list beside the form. Choosing «عمارة سكنية» / «عمارة تجارية» leads to the building variant of step 2.
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PinPicker } from "@/components/map";
import { Container, SelectField, TextField } from "@/components/ui";
import { setQuery, useQuery } from "@/lib/location";
import { cx } from "@/lib/format";
import { CITIES, DISTRICT_OPTIONS, FIELD, OTHER_DISTRICT, PURPOSES, RELATIONS, TYPES, checkStep1, focusFirst, isBuilding, roleFromRelation, typeChange, useAddDraft, type Errors, type Purpose } from "./draft";
import { FormCard, HeroDesktopIntro, HeroPhone, HowItWorks, NavRow, Shell, StepBar, StepListAside, TileGroup, TypeMark, WaCard, sectionLabel, useIsDesktop } from "./parts";

export function AddStep1() {
  const router = useRouter();
  const q = useQuery();
  const desktop = useIsDesktop();
  const { draft, update } = useAddDraft();
  const [tried, setTried] = useState(false);
  const errors: Errors = tried ? checkStep1(draft) : {};
  const otherCity = draft.city !== CITIES[0];
  const otherDistrict = !otherCity && draft.district === OTHER_DISTRICT;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = checkStep1(draft);
    setTried(true);
    if (Object.keys(found).length) {
      requestAnimationFrame(() => focusFirst(found));
      return;
    }
    router.push(isBuilding(draft.type) ? "/add/details?type=building" : "/add/details");
  };

  const setType = (t: string) => {
    update(typeChange(draft, t));
    if (q.get("type") && !isBuilding(t)) setQuery({ type: null }, "replace");
  };

  return (
    <Shell>
      <HeroPhone text="ثلاث خطوات، دقيقتان. يمكنك التوقف والعودة لاحقاً من نفس الجوال." />
      <HeroDesktopIntro />
      <Container className="mt-6 md:hidden">
        <HowItWorks variant="phone" />
      </Container>

      <Container className="mt-6 md:mt-14 md:grid md:grid-cols-[280px_minmax(0,1fr)] md:items-start md:gap-8">
        <StepListAside current={1} />
        <form noValidate onSubmit={submit} aria-label="أضف عقارك · النوع والموقع">
          <FormCard title="النوع والموقع" step={1}>
            <div className="flex flex-col gap-6 px-4 pb-6 pt-4 md:px-6 md:pb-7 md:pt-6">
              <StepBar current={1} className="md:hidden" />

              <TileGroup
                legend="نوع العقار"
                name="add-type"
                options={TYPES.map((t) => ({
                  value: t,
                  label: (
                    <span className="inline-flex items-center gap-2">
                      <TypeMark type={t} />
                      {t}
                    </span>
                  ),
                }))}
                value={draft.type}
                onChange={setType}
                gridClassName="grid grid-cols-3 gap-2 md:flex md:flex-wrap"
                tileClassName="h-12 md:h-11 md:px-4"
              />

              <TileGroup<Purpose>
                legend="الغرض"
                name="add-purpose"
                options={PURPOSES}
                value={draft.purpose}
                onChange={(v) => update({ purpose: v })}
                gridClassName="grid grid-cols-2 gap-2 md:flex md:gap-0"
                tileClassName="h-12 md:h-11 md:px-5 md:[&:not(:first-child)]:border-s-0"
              />

              <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
                <legend className={cx("mb-3 p-0 md:sr-only", sectionLabel)}>الموقع</legend>
                <div className="flex flex-col gap-3 md:grid md:grid-cols-3 md:gap-4">
                  <SelectField id="add-city" label="المدينة" options={CITIES.map((c) => ({ value: c, label: c }))} value={draft.city} onChange={(e) => update({ city: e.target.value, pin: null })} />
                  {otherCity ? (
                    <TextField id={FIELD.districtName} label="الحي" value={draft.districtName} onChange={(e) => update({ districtName: e.target.value })} error={errors[FIELD.districtName]} autoComplete="address-level3" />
                  ) : (
                    <SelectField id="add-district" label="الحي" options={DISTRICT_OPTIONS} value={draft.district} onChange={(e) => update({ district: e.target.value, pin: null })} />
                  )}
                  <TextField
                    id="add-landmark"
                    label={
                      <>
                        <span className="md:hidden">أقرب شارع أو معلم (اختياري)</span>
                        <span className="hidden md:inline">الشارع أو أقرب معلم (اختياري)</span>
                      </>
                    }
                    placeholder="مثال: قرب حديقة الروضة"
                    value={draft.landmark}
                    onChange={(e) => update({ landmark: e.target.value })}
                    autoComplete="street-address"
                  />
                  {otherDistrict && (
                    <TextField id={FIELD.districtName} label="اسم الحي" value={draft.districtName} onChange={(e) => update({ districtName: e.target.value })} error={errors[FIELD.districtName]} wrapperClassName="md:col-span-3" />
                  )}
                </div>
                <div className="flex flex-col gap-2 md:mt-3">
                  <span className={cx("hidden md:block", sectionLabel)}>الموقع على الخريطة (اختياري)</span>
                  <PinPicker
                    key={desktop ? "d" : "m"}
                    districtSlug={otherCity || otherDistrict ? undefined : draft.district}
                    value={draft.pin ? { x: draft.pin.x, y: draft.pin.y } : null}
                    onChange={(v) => update({ pin: { x: v.x, y: v.y, lat: v.lat, lng: v.lng } })}
                    showModeTabs
                    mode={draft.pinMode}
                    onModeChange={(m) => update({ pinMode: m })}
                    link={draft.pinLink}
                    onLinkChange={(l) => update({ pinLink: l })}
                    locateButton={!desktop}
                    hint={desktop ? "اضغط لتحديد الموقع أو اسحب الدبوس" : undefined}
                    hintPlacement={desktop ? "center" : "corner"}
                    height={desktop ? 180 : 150}
                  />
                </div>
              </fieldset>

              <TileGroup
                legend="صلتك بالعقار"
                name="add-relation"
                options={RELATIONS.map((r) => ({ value: r, label: r }))}
                value={draft.relation}
                onChange={(r) => update({ relation: r, role: roleFromRelation(r) })}
                gridClassName="grid grid-cols-3 gap-2 md:max-w-xl"
                hint={<span className="text-caption font-normal leading-relaxed text-muted">الوسيط يرفق رقم ترخيص فال في الخطوة 3. لا نعرض عقاراً بلا صك أو تفويض.</span>}
              />
            </div>
            <div className="flex flex-col gap-3 px-4 pb-5 md:flex-row-reverse md:items-center md:justify-between md:border-t-[1.5px] md:border-ink md:bg-cream md:px-6 md:py-4">
              <NavRow next="التالي: التفاصيل والسعر" />
              <span className="hidden text-caption font-normal text-muted md:block">الحقول المطلوبة: النوع، الغرض، المدينة، الحي.</span>
            </div>
          </FormCard>
        </form>
      </Container>

      <Container className="mt-6 md:hidden">
        <WaCard text="أرسل الصك والصور والسعر مباشرة ونكمل الباقي." />
      </Container>
    </Shell>
  );
}
