"use client";
// QA styleguide for components/admin · rendered at /demo/components#admin. Every component in every state, in the
// order of the Components2 sheet, then the Admin-Pieces-D pieces and the shell. Sample data: ./sample.ts.
import { useState, type ReactNode } from "react";
import { Price } from "@/components/ui/Price";
import { bedsLabel, cx, fmtArea, fmtNum, ppm } from "@/lib/format";
import { useStore } from "@/lib/store";
import {
  AdminButton,
  AdminField,
  AdminLinkButton,
  AdminShell,
  Badge,
  ConfirmChip,
  Counter,
  DataTable,
  Dialog,
  DragHandle,
  Drawer,
  DropTarget,
  EmptyState,
  FieldGroup,
  FileUpload,
  ImportDiffRow,
  ImportMappingHead,
  ImportMappingRow,
  ImportPanel,
  ImportStat,
  ImportStats,
  InlineSelect,
  LangTabs,
  NotificationsBell,
  NotificationsList,
  PageHeader,
  Panel,
  PeriodToggle,
  PreviewFrame,
  SaveBar,
  StatGrid,
  StatTile,
  StatusPill,
  Switch,
  TableHead,
  TableRow,
  TextLink,
  ToastView,
  UnitStatusMark,
  UploadItem,
  type Column,
  type Lang,
} from "./index";
import { SAMPLE_NOTIFICATIONS, SAMPLE_UNITS, type SampleUnit } from "./sample";

function Sheet({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cx("flex min-w-0 flex-col gap-3", className)}>
      <h3 className="text-h3">{title}</h3>
      {children}
    </section>
  );
}
function St({ children }: { children: ReactNode }) {
  return <span className="mb-1 block text-caption font-extrabold lowercase text-muted">{children}</span>;
}
function Note({ children }: { children: ReactNode }) {
  return <span className="text-[12px] font-bold leading-normal text-muted">{children}</span>;
}

const TEMPLATE = "36px 90px 1fr 110px 90px 80px";
const unitLine = (u: SampleUnit) => `${u.buildingNameAr} · شقة · ${bedsLabel(u.beds)} · ${fmtArea(u.areaM2)} م²`;
const STATES = ["default", "hover · خلفية كريمية", "selected · شريط ذهبي يمين", "focus (لوحة المفاتيح)", "changed · معاينة الاستيراد", "hidden · نص باهت، الحالة تبقى بالشكل"];

export function Styleguide() {
  const toast = useStore((s) => s.toast);
  const [sw, setSw] = useState({ on: true, off: false, focus: true, label: true });
  const [lang, setLang] = useState<Lang>("ar");
  const [period, setPeriod] = useState("7d");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" }>({ key: "price", dir: "desc" });
  const [dialog, setDialog] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [delCode] = useState(SAMPLE_UNITS[4].code);

  const unread = SAMPLE_NOTIFICATIONS.filter((n) => !n.read).length;
  const available = SAMPLE_UNITS.filter((u) => u.status === "available").length;
  const sold = SAMPLE_UNITS.filter((u) => u.status === "sold").length;
  const changed = SAMPLE_UNITS.filter((u) => u.previousPriceSar).length;
  const hidden = SAMPLE_UNITS.filter((u) => u.hidden).length;
  const counts = { approvals: unread, leads: SAMPLE_UNITS.length, marketers: sold, alliance: SAMPLE_NOTIFICATIONS.length - unread };

  const columns: Column<SampleUnit>[] = [
    { key: "code", label: "الرمز", width: "90px", sortable: true, ltr: true, bold: true },
    { key: "unit", label: "الوحدة", render: (u) => unitLine(u) + (u.hidden ? " · مخفية من الموقع" : "") },
    {
      key: "price",
      label: "السعر",
      width: "130px",
      sortable: true,
      bold: true,
      render: (u) =>
        u.previousPriceSar ? (
          <span className="text-gold-text">
            <Price value={u.priceSar} />{" "}
            <span className="text-caption font-semibold">
              كان <Price value={u.previousPriceSar} />
            </span>
          </span>
        ) : (
          <Price value={u.priceSar} />
        ),
    },
    { key: "status", label: "الحالة", width: "90px", render: (u) => <UnitStatusMark status={u.status} /> },
  ];
  const sortedRows = [...SAMPLE_UNITS].sort((a, b) => {
    const dir = sort.dir === "asc" ? 1 : -1;
    return sort.key === "price" ? (a.priceSar - b.priceSar) * dir : a.code.localeCompare(b.code) * dir;
  });

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-1 border-b-[1.5px] border-ink pb-4">
        <h2 className="text-h2">ورقة المكونات 2 · مكونات الإدارة</h2>
        <span className="text-[12px] text-muted">تكمل ورقة المكونات الأولى · نفس الرموز: لا زوايا، لا ظلال، لا تدرّجات، الخطأ بالذهبي، الحالة بالشكل والكلمة</span>
      </div>

      {/* 1 */}
      <Sheet title="1 · صف جدول البيانات">
        <div className="overflow-x-auto border-interactive bg-paper">
          <div role="table" aria-label="صف جدول البيانات" className="min-w-[720px]">
            <TableHead template={TEMPLATE}>
              <span className="flex items-center">
                <input type="checkbox" aria-label="تحديد الكل" className="size-4 accent-ink" readOnly />
              </span>
              <span>الرمز ↕</span>
              <span>الوحدة</span>
              <span>السعر ↓</span>
              <span>الحالة</span>
              <span />
            </TableHead>
            {SAMPLE_UNITS.map((u, i) => {
              const state = i === 1 ? { hover: true } : i === 2 ? { selected: true } : i === 3 ? { focus: true } : i === 4 ? { warning: true } : i === 5 ? { muted: true } : {};
              return (
                <TableRow key={u.code} template={TEMPLATE} state={state}>
                  <span className="flex items-center">
                    <input type="checkbox" aria-label="تحديد" defaultChecked={i === 2} disabled={u.hidden} className="size-4 accent-ink" />
                  </span>
                  <span dir="ltr" className="text-right font-extrabold tnum">
                    {u.code}
                  </span>
                  <span>
                    {unitLine(u)}
                    {u.hidden && " · مخفية من الموقع"}
                  </span>
                  <span className={cx("font-extrabold", !!u.previousPriceSar && "text-gold-text")}>
                    <Price value={u.priceSar} />
                    {u.previousPriceSar && (
                      <span className="text-caption font-semibold">
                        {" "}
                        كان <Price value={u.previousPriceSar} />
                      </span>
                    )}
                  </span>
                  <UnitStatusMark status={u.status} />
                  <TextLink href={`/admin/units/${u.slug}`} className="text-[12px] font-extrabold">
                    تحرير
                  </TextLink>
                  <span className="col-span-full text-caption font-extrabold lowercase text-muted">{STATES[i]}</span>
                </TableRow>
              );
            })}
          </div>
        </div>
        <St>live · DataTable (تحديد، فرز، إجراءات جماعية، نقر الصف)</St>
        <DataTable
          label="الوحدات"
          columns={columns}
          rows={sortedRows}
          rowKey={(u) => u.code}
          selectable
          stickyHead
          sort={sort}
          onSort={(key) => setSort((s) => ({ key, dir: s.key === key && s.dir === "desc" ? "asc" : "desc" }))}
          rowState={(u) => ({ muted: u.hidden, warning: !!u.previousPriceSar, selectionDisabled: u.hidden })}
          onRowClick={(u) => toast(`${u.code} · ${unitLine(u)}`)}
          actions={(u) => (
            <TextLink href={`/admin/units/${u.slug}`} className="text-[12px] font-extrabold">
              تحرير
            </TextLink>
          )}
          bulkActions={(keys) => (
            <>
              <Counter value={keys.length} tone="gold" />
              <AdminButton size="xs">تصدير Excel</AdminButton>
            </>
          )}
        />
      </Sheet>

      <div className="grid gap-8 md:grid-cols-2">
        {/* 2 */}
        <Sheet title="2 · مجموعة حقول">
          <FieldGroup legend="السعر" meta="3 حقول · 1 للتأكيد">
            <AdminField label="من Excel" source="excel" defaultValue={fmtNum(SAMPLE_UNITS[0].priceSar)} ltr />
            <AdminField label="إدارة فقط" defaultValue="الثالث" />
            <AdminField label="للتأكيد" source="tbc" defaultValue="غير محدد [للتأكيد]" />
            <AdminField label="محسوب" source="computed" value={`${fmtNum(ppm(SAMPLE_UNITS[0].priceSar, SAMPLE_UNITS[0].areaM2))} / م²`} readOnly />
            <AdminField label="خطأ" defaultValue="690.000,00" ltr span error="اكتب الرقم بالأرقام الغربية بلا فواصل عشرية: 690000" />
          </FieldGroup>
        </Sheet>

        <div className="flex flex-col gap-6">
          {/* 3 */}
          <Sheet title="3 · المفتاح">
            <div className="flex flex-wrap items-start gap-x-5 gap-y-3 md:grid md:grid-cols-5 md:gap-3">
              <div>
                <St>on</St>
                <Switch checked={sw.on} onChange={(v) => setSw({ ...sw, on: v })} aria-label="on" />
              </div>
              <div>
                <St>off</St>
                <Switch checked={sw.off} onChange={(v) => setSw({ ...sw, off: v })} aria-label="off" />
              </div>
              <div>
                <St>focus</St>
                <span className="inline-flex outline-2 outline-offset-[3px] outline-gold">
                  <Switch checked={sw.focus} onChange={(v) => setSw({ ...sw, focus: v })} aria-label="focus" />
                </span>
              </div>
              <div>
                <St>disabled</St>
                <Switch checked={false} onChange={() => {}} disabled aria-label="disabled" />
              </div>
              <div>
                <St>with label</St>
                <Switch checked={sw.label} onChange={(v) => setSw({ ...sw, label: v })} label="ظاهر" />
              </div>
            </div>
            <Note>المقبض سداسي: ذهبي يسار = مفعّل، أسود يمين = مطفأ. الكلمة بجانب المفتاح إجبارية إذا لم يكن له عنوان.</Note>
          </Sheet>
          {/* 4 */}
          <Sheet title="4 · مقبض السحب">
            <div className="flex flex-wrap items-start gap-x-5 gap-y-3 md:grid md:grid-cols-5 md:gap-3">
              <div>
                <St>default</St>
                <DragHandle />
              </div>
              <div>
                <St>hover</St>
                <DragHandle className="bg-sand text-ink" />
              </div>
              <div>
                <St>dragging</St>
                <DragHandle dragging />
              </div>
              <div className="w-full md:col-span-2 md:w-auto">
                <St>drop target</St>
                <DropTarget />
              </div>
            </div>
          </Sheet>
          {/* 5 */}
          <Sheet title="5 · حبّة الحالة">
            <div className="flex flex-wrap items-center gap-2.5">
              {(["منشور", "مسودة", "يحتاج تأكيداً", "بلا رد", "تم الرد", "مغلق", "بانتظار الموافقة", String(unread), "من Excel", "مخفية"] as const).map((s) => (
                <StatusPill key={s} status={s} />
              ))}
            </div>
            <Note>حالات الوحدة (متاح، محجوز، مباع) لا تُكتب كحبّة؛ تبقى سداسياً مع الكلمة كما في الورقة الأولى.</Note>
          </Sheet>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* 6 */}
        <Sheet title="6 · رفع ملف">
          <div className="flex flex-col gap-2.5">
            <div>
              <St>empty</St>
              <FileUpload errorContext="للهيرو" />
            </div>
            <div>
              <St>drag over</St>
              <FileUpload dragOverPreview />
            </div>
            <div>
              <St>uploading 64%</St>
              <UploadItem file={{ id: "u1", name: "rz-a-living.jpg", size: 0, progress: 64, status: "uploading" }} />
            </div>
            <div>
              <St>done · tier chosen</St>
              <UploadItem file={{ id: "u2", name: "rz-a-living.jpg", size: 0, width: 2400, height: 1600, progress: 100, status: "done", tier: "real" }} onRemove={() => toast("أُزيلت الصورة")} />
            </div>
            <div>
              <St>error</St>
              <UploadItem file={{ id: "u3", name: "rz-a-living.jpg", size: 0, progress: 0, status: "error", error: "الصورة 1200 عرضاً فقط. نحتاج 2400 على الأقل للهيرو." }} />
            </div>
          </div>
        </Sheet>
        {/* 7 */}
        <Sheet title="7 · تبويب العربية / English">
          <div className="flex flex-col gap-3.5">
            <div>
              <St>default · AR active</St>
              <LangTabs value={lang} onChange={setLang} />
            </div>
            <div>
              <St>EN active · LTR fields below</St>
              <LangTabs value="en" onChange={() => {}} />
            </div>
            <div>
              <St>EN has empty fields</St>
              <LangTabs value="ar" onChange={() => {}} enEmpty={4} />
            </div>
            <div>
              <St>focus</St>
              <span className="inline-flex outline-2 outline-offset-2 outline-gold">
                <LangTabs value="ar" onChange={() => {}} />
              </span>
            </div>
            <Note>التبويب يبدّل لغة الحقول في المحرر كله، لا لغة اللوحة. النص الإنجليزي الفارغ يرث العربي على الموقع مع وسم «EN missing» في اللوحة فقط.</Note>
          </div>
        </Sheet>
        {/* 8 */}
        <Sheet title="8 · شريط الحفظ">
          <div className="flex flex-col gap-2.5">
            <div>
              <St>clean</St>
              <SaveBar state="clean" onSave={() => {}} />
            </div>
            <div>
              <St>dirty</St>
              <SaveBar state="dirty" dirtyCount={3} onSave={() => toast("نُشر")} onDiscard={() => {}} onDraft={() => {}} />
            </div>
            <div>
              <St>saving</St>
              <SaveBar state="saving" onSave={() => {}} />
            </div>
            <div>
              <St>just published</St>
              <SaveBar state="saved" onSave={() => {}} onUndo={() => {}} openHref="/" />
            </div>
            <div>
              <St>error</St>
              <SaveBar state="error" onSave={() => {}} errorText="لم يُحفظ: حقل السعر فارغ" onFix={() => {}} />
            </div>
          </div>
        </Sheet>
      </div>

      <div className="grid gap-8 md:[grid-template-columns:1.3fr_1fr_1fr]">
        {/* 9 */}
        <Sheet title="9 · الدُّرج الجانبي">
          <div className="relative h-[300px] overflow-hidden border-[1.5px] border-line bg-slot">
            <Drawer open onClose={() => setDrawer(true)} inline width={300} title="تفاصيل الطلب SMQ-8F3A2" bodyClassName="p-3.5 text-[12px] leading-[1.7] text-ink-2" footer={
              <>
                <AdminButton variant="gold" size="sm" className="flex-1">
                  علّم كمردود
                </AdminButton>
                <AdminButton variant="outline" size="sm">
                  إغلاق
                </AdminButton>
              </>
            }>
              المحتوى يتدرّج من اليمين، يُفتح من صف الجدول، ويُغلق بـ Esc أو بالنقر على التعتيم أو بالزر. العرض 420 إلى 520 على سطح المكتب، وملء الشاشة على الجوال كورقة سفلية.
            </Drawer>
          </div>
          <Note>يفتح من اليسار لأن المحتوى يمتد يميناً في RTL: الصف الذي أتى منه يبقى مرئياً.</Note>
          <div>
            <AdminButton size="sm" onClick={() => setDrawer(true)}>
              افتح الدُّرج
            </AdminButton>
            <Drawer open={drawer} onClose={() => setDrawer(false)} title="تفاصيل الطلب SMQ-8F3A2" footer={
              <>
                <AdminButton variant="gold" size="sm" className="flex-1" onClick={() => { toast("عُلّم كمردود"); setDrawer(false); }}>
                  علّم كمردود
                </AdminButton>
                <AdminButton variant="outline" size="sm" onClick={() => setDrawer(false)}>
                  إغلاق
                </AdminButton>
              </>
            }>
              <p className="m-0 text-[12px] leading-[1.7] text-ink-2">المحتوى يتدرّج من اليمين، يُفتح من صف الجدول، ويُغلق بـ Esc أو بالنقر على التعتيم أو بالزر. العرض 420 إلى 520 على سطح المكتب، وملء الشاشة على الجوال كورقة سفلية.</p>
            </Drawer>
          </div>
        </Sheet>
        {/* 10 */}
        <Sheet title="10 · الحوار">
          <div className="relative min-h-[300px] bg-ink-2">
            <Dialog open inline onClose={() => {}} title="تغيير الحالة إلى «مباع»؟" confirmLabel="تأكيد البيع" onConfirm={() => {}} className="px-4 py-4">
              <p>تختفي YS-B من النتائج ودليل الأسعار فوراً. تبقى في صفحة المشروع بوسم «مباع».</p>
              <AdminField label="تاريخ البيع" defaultValue="2026-10-10" ltr className="mt-2.5" inputClassName="h-10" />
            </Dialog>
          </div>
          <Note>حدّ ذهبي علوي 6px يميّزه عن الدُّرج. المدمّر يطلب كتابة الرمز (القطع الصغيرة، 3).</Note>
          <div>
            <AdminButton size="sm" onClick={() => setDialog(true)}>
              افتح الحوار
            </AdminButton>
            <Dialog open={dialog} onClose={() => setDialog(false)} title="تغيير الحالة إلى «مباع»؟" confirmLabel="تأكيد البيع" onConfirm={() => { toast("تغيّرت الحالة إلى «مباع»"); setDialog(false); }}>
              <p>تختفي YS-B من النتائج ودليل الأسعار فوراً. تبقى في صفحة المشروع بوسم «مباع».</p>
              <AdminField label="تاريخ البيع" defaultValue="2026-10-10" ltr className="mt-2.5" inputClassName="h-10" />
            </Dialog>
          </div>
        </Sheet>
        {/* 11 */}
        <Sheet title="11 · التوست">
          <div className="flex flex-col gap-2.5">
            <div>
              <St>success</St>
              <ToastView kind="success" onClose={() => {}}>
                حُفظت الوحدة
              </ToastView>
            </div>
            <div>
              <St>info + undo</St>
              <ToastView kind="info" onClose={() => {}} action={<button type="button" className="cursor-pointer text-gold">تراجع</button>}>
                حُذف السؤال ·
              </ToastView>
            </div>
            <div>
              <St>error</St>
              <ToastView kind="error" action={<button type="button" className="cursor-pointer">أعد</button>}>
                لم يُحفظ
              </ToastView>
            </div>
            <div>
              <St>loading (persistent)</St>
              <ToastView kind="loading">يستورد 10 صفوف…</ToastView>
            </div>
          </div>
          <Note>يظهر أسفل يسار الشاشة، واحد في كل مرة، 6 ثوانٍ، بلا حركة سوى ظهور واختفاء.</Note>
          <div>
            <AdminButton size="sm" onClick={() => toast("حُفظت الوحدة RZ-A ·", { action: { label: "معاينة", href: "/units/rz-a" } })}>
              توست حي من المخزن
            </AdminButton>
          </div>
        </Sheet>
      </div>

      {/* Pieces */}
      <div className="flex flex-col gap-1 border-b-[1.5px] border-ink pb-4">
        <h2 className="text-h2">قطع صغيرة · حالات عابرة ومشتركة بين الصفحات</h2>
      </div>
      <div className="grid gap-8 md:[grid-template-columns:380px_1fr_1fr]">
        <Sheet title="1 · قائمة الإشعارات">
          <div className="flex h-[60px] items-center justify-start bg-ink px-4 text-paper">
            <NotificationsBell items={SAMPLE_NOTIFICATIONS} />
            <span className="ms-3 text-[12px] font-bold text-on-ink-muted">تنسدل من الجرس · 380 عرضاً · آخر 7 أيام</span>
          </div>
          <NotificationsList items={SAMPLE_NOTIFICATIONS} />
          <Note>يُشعَر المديرون بكل شيء، والمحررون بما يخص المحتوى والطلبات الواردة فقط. لا إشعارات بريدية إلا لعقار مالك جديد وانقطاع واتساب.</Note>
        </Sheet>
        <Sheet title="2 · قائمة «يحتاج تأكيداً»">
          <div className="flex flex-wrap items-center gap-2.5">
            <ConfirmChip />
            <ConfirmChip count={SAMPLE_NOTIFICATIONS.length} />
            <StatusPill status="يحتاج تأكيداً" />
          </div>
          <Note>تجمع كل [للتأكيد] و[مسودة إجابة] من كل الصفحات · للمدير فقط · تُفتح من زر المحتوى والأسئلة</Note>
          <Sheet title="عدّادات">
            <div className="flex flex-wrap items-center gap-3">
              <Counter value={unread} tone="gold" />
              <Counter value={SAMPLE_UNITS.length} />
              <span className="relative inline-flex size-10 items-center justify-center bg-ink text-paper">
                <Badge value={unread} className="absolute left-1.5 top-1.5" />
              </span>
            </div>
          </Sheet>
          <Sheet title="الفترة">
            <PeriodToggle
              value={period}
              onChange={setPeriod}
              options={[
                { value: "today", label: "اليوم" },
                { value: "7d", label: "7 أيام" },
                { value: "30d", label: "30 يوماً" },
              ]}
            />
          </Sheet>
        </Sheet>
        <Sheet title="3 · حوار تأكيد الحذف">
          <div className="relative bg-ink-2">
            <Dialog
              open
              inline
              destructive
              onClose={() => {}}
              title={`حذف الوحدة ${delCode} نهائياً؟`}
              confirmLabel={`احذف ${delCode}`}
              confirmCode={delCode}
              onConfirm={() => toast(`حُذفت ${delCode}`)}
              safeAlternative={<TextLink href={`/admin/units/${SAMPLE_UNITS[4].slug}`}>إخفاء من الموقع</TextLink>}
            >
              <p>تختفي من الموقع فوراً، وتُحذف صورها وسجلّ تغييراتها، ويتحوّل رابطها إلى صفحة 404. 2 طلبان واردان مرتبطان بها سيبقيان بلا وحدة. لا يمكن التراجع.</p>
            </Dialog>
          </div>
          <Note>نفس الحوار لحذف مشروع (يكتب رقم المشروع) وسؤال ومستخدم (بلا كتابة، زر الحذف مفعّل مباشرة). الزر الأساسي أسود لا ذهبي: الذهبي لا يُستخدم لإجراء مدمّر.</Note>
        </Sheet>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <Sheet title="4 · حالات فارغة">
          <EmptyState
            title="لا وحدات بعد"
            text="ارفع ملف Excel بالنماذج والأسعار، أو أضف وحدة يدوياً. الموقع يعرض «قريباً» في النتائج حتى تُنشر أول وحدة."
            action={
              <>
                <AdminButton variant="ink">استيراد Excel</AdminButton>
                <AdminLinkButton href="/admin/units/new">+ وحدة يدوياً</AdminLinkButton>
              </>
            }
          />
          <EmptyState icon="gold" title="لا طلبات بلا رد" text="كل الطلبات الواردة مُعلَّمة. آخر طلب وصل قبل 3 ساعات وردّت عليه نورة." action={<TextLink href="/admin/leads" className="text-[12px] font-extrabold">عرض «تم الرد»</TextLink>} />
        </Sheet>
        <Sheet title="المؤشرات · بطاقات الأرقام">
          <StatGrid>
            <StatTile label="الوحدات" value={available} suffix={`/ ${SAMPLE_UNITS.length}`} note={`متاحة ${available} · مباعة ${sold} · لا محجوزات`} />
            <StatTile variant="ink" label="بانتظار موافقتك" value={unread} note="طلبات إضافة عقار" />
            <StatTile variant="gold" label="عروض تنتظر" value={changed} />
          </StatGrid>
          <StatGrid columns={3}>
            <StatTile size="sm" label="زائر" value={SAMPLE_UNITS.length} />
            <StatTile size="sm" label="جوال" value={`${Math.round((available / SAMPLE_UNITS.length) * 100)}%`} />
            <StatTile size="sm" label="مخفية" value={hidden} />
          </StatGrid>
          <PageHeader title="عنوان الصفحة" subtitle="سطر فرعي باهت" note actions={<AdminLinkButton href="/admin/units/new" variant="ink">+ وحدة جديدة</AdminLinkButton>} />
          <Panel title="لوحة بيضاء" action={<TextLink href="/admin">الكل</TextLink>}>
            <p className="m-0 text-label text-muted">إطار حبري 1.5px، رأس بخط فاصل، المحتوى يُحدَّد من الصفحة.</p>
          </Panel>
        </Sheet>
      </div>

      <Sheet title="إطار استيراد Excel">
        <ImportPanel
          intro="صف واحد لكل نموذج. المطابقة تُحفظ للملفات القادمة. «كود النموذج» هو المفتاح: صف موجود يُحدَّث، صف جديد يُضاف بحالة «مخفي» حتى تراجعه."
          mapping={
            <>
              <ImportMappingHead />
              <ImportMappingRow fileColumn="كود النموذج" status="مطابق" matched>
                <InlineSelect aria-label="كود النموذج" className="w-full">
                  <option>model_code (مفتاح)</option>
                </InlineSelect>
              </ImportMappingRow>
              <ImportMappingRow fileColumn="السعر (ريال)" status="مطابق" matched>
                <InlineSelect aria-label="السعر (ريال)" className="w-full">
                  <option>price_sar</option>
                </InlineSelect>
              </ImportMappingRow>
              <ImportMappingRow fileColumn="تاريخ التسليم المتوقع" status="غير مطابق">
                <InlineSelect aria-label="تاريخ التسليم المتوقع" className="w-full border-2 border-gold bg-cream-focus">
                  <option>اختر الحقل</option>
                </InlineSelect>
              </ImportMappingRow>
            </>
          }
          mappingActions={
            <>
              <AdminButton variant="ink">معاينة التغييرات</AdminButton>
              <AdminButton>تنزيل القالب</AdminButton>
            </>
          }
          previewTitle="معاينة الاستيراد · smq-units-oct.xlsx"
          preview={
            <>
              <ImportStats>
                <ImportStat value={SAMPLE_UNITS.length - changed - hidden} label="بلا تغيير" />
                <ImportStat value={changed} label="تُحدَّث" variant="ink" />
                <ImportStat value={hidden} label="جديد (مخفي)" variant="outline" />
              </ImportStats>
              <div className="flex flex-col">
                {SAMPLE_UNITS.filter((u) => u.previousPriceSar).map((u) => (
                  <ImportDiffRow
                    key={u.code}
                    code={u.code}
                    change={
                      <>
                        السعر: <s>{fmtNum(u.previousPriceSar!)}</s>
                      </>
                    }
                    result={`${fmtNum(u.priceSar)} (${(((u.priceSar - u.previousPriceSar!) / u.previousPriceSar!) * 100).toFixed(1)}%)`}
                  />
                ))}
                <ImportDiffRow code="—" change="تحذير" result="السعر فارغ · يُتجاهل الصف" warning />
              </div>
            </>
          }
          previewActions={
            <>
              <AdminButton variant="gold">تطبيق الاستيراد</AdminButton>
              <span className="text-caption text-muted">يُسجَّل في السجل ويمكن التراجع عنه خلال 24 ساعة. «آخر تحديث» للوحدات المعدلة يصبح اليوم.</span>
            </>
          }
        />
      </Sheet>

      <div className="grid gap-8 md:grid-cols-[1fr_380px]">
        <Sheet title="الصدفة · سطح المكتب 1440">
          <PreviewFrame width={1440} showToggle={false} title="AdminShell · layout=desktop">
            <AdminShell
              layout="desktop"
              active="overview"
              counts={counts}
              notifications={SAMPLE_NOTIFICATIONS}
              title="قطع صغيرة"
              subtitle="حالات عابرة ومشتركة بين الصفحات"
              note
              actions={
                <>
                  <PeriodToggle
                    value={period}
                    onChange={setPeriod}
                    options={[
                      { value: "today", label: "اليوم" },
                      { value: "7d", label: "7 أيام" },
                      { value: "30d", label: "30 يوماً" },
                    ]}
                  />
                  <AdminLinkButton href="/admin/units/new" variant="ink">
                    + وحدة جديدة
                  </AdminLinkButton>
                </>
              }
            >
              <StatGrid>
                <StatTile label="الوحدات" value={available} suffix={`/ ${SAMPLE_UNITS.length}`} note={`متاحة ${available} · مباعة ${sold} · لا محجوزات`} />
                <StatTile variant="ink" label="بانتظار موافقتك" value={unread} note="طلبات إضافة عقار" />
                <StatTile label="مخفية" value={hidden} />
                <StatTile label="تُحدَّث" value={changed} />
              </StatGrid>
              <div className="grid gap-6 md:grid-cols-2">
                <Panel title="لوحة" action={<TextLink href="/admin">الكل</TextLink>} bodyClassName="p-0">
                  <NotificationsList items={SAMPLE_NOTIFICATIONS.slice(0, 3)} className="border-0" />
                </Panel>
                <EmptyState icon="gold" title="لا طلبات بلا رد" text="كل الطلبات الواردة مُعلَّمة." />
              </div>
            </AdminShell>
          </PreviewFrame>
        </Sheet>
        <Sheet title="الصدفة · الجوال 390">
          <PreviewFrame width={390} showToggle={false} title="AdminShell · layout=phone">
            <AdminShell layout="phone" active="overview" phoneActive="approvals" counts={counts} notifications={SAMPLE_NOTIFICATIONS}>
              <StatGrid>
                <StatTile label="الوحدات" value={available} suffix={`/ ${SAMPLE_UNITS.length}`} />
                <StatTile variant="ink" label="بانتظار موافقتك" value={unread} />
              </StatGrid>
              <EmptyState title="لا وحدات بعد" text="ارفع ملف Excel بالنماذج والأسعار، أو أضف وحدة يدوياً." />
            </AdminShell>
          </PreviewFrame>
        </Sheet>
      </div>
    </div>
  );
}
