# components/admin · admin component library and shell

Built from `docs/boards/Components2.txt` (11 sections) and the shell boards (Admin-Overview-D, Admin-M, Admin-Pieces-D, Admin-Login-D, Admin-Alliance-M). Cream page background, white panels with hairlines or the 1.5px ink frame, ink headings; cuts only on primary buttons; no shadows, no radius; errors in gold; status by shape and word. Import from `@/components/admin`. QA sheet: `/demo/components#admin` (`_styleguide.tsx`).

Toasts are not duplicated here: fire `useStore().toast(text, { action })` from `lib/store.ts`; `components/presenter/Toasts.tsx` renders the stack. `ToastView` below is the presentational piece (the four states on the sheet) that the presenter can adopt.

## Shell

| Export | Props |
|---|---|
| `AdminShell` | `title?`, `subtitle?`, `actions?` (slot), `children`, `active?: NavKey` (derived from the path when omitted), `phoneActive?: NavKey`, `notifications?: Notification[]`, `phoneTabs?: boolean \| PhoneTab[]` (default the seven Admin-M tabs), `counts?: NavCounts` (approvals / leads / marketers / alliance numbers from the page's fixtures), `note?: boolean \| ReactNode` (true → «الأرقام توضيحية» on the header line), `user?: AdminUser` (default سعود · مدير · س), `topbarCaption?`, `phoneHideHeader?`, `layout?: "auto" \| "desktop" \| "phone"` (previews), `className?`, `mainClassName?` |
| `AdminTopbar` | `notifications?`, `onMenu?`, `user?`, `searchPlaceholder?` («ابحث في الوحدات والطلبات والزوار»), `siteHref?` («عرض الموقع» → `/`), `caption?`, `layout?`, `className?` |
| `AdminSidebar` | `active?: NavKey`, `counts?`, `className?`, `onNavigate?`, `inSheet?` |
| `AdminPhoneTabs` | `active?`, `counts?`, `tabs?: PhoneTab[]`, `layout?: "auto" \| "desktop" \| "phone"` (auto = hidden from md), `className?` |
| `ADMIN_NAV`, `PHONE_TABS`, `COLLABORATE_GROUP_LABEL`, `navKeyFromPath(path)` | Nav items in the boards' order with the route-map hrefs: overview `/admin`, approvals `/admin/approvals`, units `/admin/units`, projects `/admin/projects`, leads `/admin/leads`, analytics `/admin/analytics`, visitors `/admin/visitors`, «تعاون معنا»: marketers `/admin/marketers`, alliance `/admin/alliance`, content `/admin/content`, users `/admin/users`. Phone tabs: `/admin`, `/admin#approvals`, `/admin/leads`, `/admin#units`, `/admin#stats`, `/admin#visitors`, `/admin/alliance` (the `/admin` phone page gives its sections those ids) |
| `NotificationsBell` | `items: Notification[]`, `onMarkAllRead?`, `allHref?` (default `/admin`), `large?` (44px, phone), `boxed?`, `className?`. Dropdown: «الإشعارات», «علّم الكل كمقروء», «كل الإشعارات»; closes on Esc / outside click |
| `NotificationsList` | `items`, `className?` — the list alone |
| `Notification` | `{ id, title?, text, when, href?, linkLabel?, read? }` |
| `PageHeader` | `title`, `subtitle?`, `actions?`, `note?: boolean \| ReactNode`, `as?: "h1" \| "h2"`, `size?: "page" \| "section"`, `className?` |
| `SectionHeader` | `title`, `action?`, `subtitle?`, `className?` — h2 + link opposite (Admin-M sections) |
| `ILLUSTRATIVE_NOTE` | the string «الأرقام توضيحية» |
| `Panel` | `title?`, `action?`, `children`, `className?`, `bodyClassName?` (default `p-4`), `hairline?`, `as?`, `id?`, `aria-label?` — white panel with the ink frame and an optional header |
| `StatTile` | `label`, `value`, `suffix?` («/ 10»), `delta?`, `note?`, `variant?: "paper" \| "ink" \| "gold"`, `size?: "sm" \| "md" \| "lg" \| "responsive"`, `className?`, `id?` |
| `StatGrid` | `children`, `columns?: 2 \| 3 \| 4`, `label?`, `className?` — 2-up on the phone, auto-fit 190px on desktop |
| `PeriodToggle` | `options: { value, label }[]`, `value`, `onChange`, `label?` («الفترة»), `size?: "md" \| "sm"`, `className?` |
| `Counter` | `value`, `tone?: "gold" \| "outline"`, `className?` — nav counts |
| `Badge` | `value`, `className?` — the gold 10px badge on the bell |

## Components2 sheet

| # | Export | Props |
|---|---|---|
| 1 | `DataTable<T>` | `columns: Column<T>[]` (`key`, `label`, `width?` grid track, `align?`, `sortable?`, `render?`, `ltr?`, `bold?`, `hideOnPhone?`, `className?`), `rows: T[]`, `rowKey(row)`, `label` (accessible name), `selectable?`, `selected?: string[]` + `onSelectionChange?` (uncontrolled when omitted), `bulkActions?(selectedKeys)` (sand bar above the rows), `stickyHead?`, `onRowClick?(row)`, `rowState?(row): { selected?, muted?, warning?, selectionDisabled? }`, `sort?: { key, dir }` + `onSort?(key)` (↕ / ↓ marks), `actions?(row)` + `actionsWidth?`, `minWidth?` (scrolls on the phone), `empty?`, `dense?`, `className?` |
| 1 | `TableHead`, `TableRow` | hand-built tables: `template` (grid-template-columns), `TableHead.sticky?`, `TableRow.state?: { selected?, muted?, warning?, focus?, hover? }` (focus / hover force those states for QA), `onClick?`, `dense?` |
| 2 | `FieldGroup` | `legend`, `meta?` («3 حقول · 1 للتأكيد»), `children`, `columns?: 1 \| 2 \| 3`, `className?`, `id?` |
| 2 | `AdminField` / `AdminSelect` / `AdminTextarea` | `label`, `source?: "admin" \| "excel" \| "tbc" \| "computed" \| "error"`, `hint?` (defaults: «يُستبدل عند الاستيراد», «يبقى بالوسم على الموقع», «لا يُحرَّر»), `error?` (gold bullet line, switches the frame), `span?`, `ltr?` (field), plus the native input/select/textarea props. `FieldShell` wraps any control; `InlineSelect` is the bare framed select; `fieldControlClass(source)` gives the control classes |
| 3 | `Switch` | `checked`, `onChange`, `label?` (the word beside it; otherwise `aria-label` / `aria-labelledby`), `disabled?`, `labelAfter?`, `className?`, `id?` |
| 4 | `DragHandle` | `dragging?` + button props (`aria-label` «مقبض السحب») · `DropTarget`: `height?`, `className?` |
| 5 | `StatusPill` | `status` (منشور / نُشر / مسودة / يحتاج تأكيداً / معلّق / جديد / بانتظار / بانتظار الموافقة / بانتظار صور / معتمد / مرفوض / بلا رد / تم الرد / مغلق / من Excel / مخفية / تنبيه محفوظ / a number), `variant?: "ink" \| "outline" \| "tbc" \| "goldOutline" \| "muted" \| "gold" \| "sand" \| "hairline"`, `className?`, `children?`. `pillVariantFor(status)` returns the mapping. `UnitStatusMark({ status })` draws متاح / محجوز / مباع as hexagon + word |
| 6 | `FileUpload` | `label?`, `accept?` (default JPG/PNG), `maxSizeMB?` (10), `minWidth?` (2400), `multiple?`, `files?: UploadedFile[]` + `onChange?` (uncontrolled when omitted), `hint?`, `errorContext?` («للهيرو»), `tier?: "real" \| "generated"`, `simulateProgress?`, `dragOverPreview?`, `className?`, `id?`. Local object-URL preview; nothing is uploaded. `UploadItem({ file, onRemove })` renders one file |
| 7 | `LangTabs` | `value: "ar" \| "en"`, `onChange`, `enEmpty?` (number → «n فارغة»), `label?`, `className?` |
| 8 | `SaveBar` | `state: "clean" \| "dirty" \| "saving" \| "saved" \| "error"`, `onSave`, `onDiscard?`, `onDraft?`, `onUndo?`, `onFix?`, `dirtyCount?` (→ `unsavedFieldsText`), `message?`, `savedText?` (default «نُشر الآن ·»), `openHref?` + `openLabel?` («افتح»), `errorText?`, `labels?` (save / publish / draft / discard / undo / fix / saving / published), `extra?`, `sticky?`, `className?` |
| 9 | `Drawer` | `open`, `onClose`, `title`, `children`, `footer?`, `side?: "end" \| "start"` (end = the left in RTL), `width?` (480), `inline?`, `bodyClassName?`, `aria-label?`. 200ms, Esc, overlay click, focus trap, bottom sheet on the phone. `useModalBehaviour`, `trapTab` are the shared helpers |
| 10 | `Dialog` | `open`, `onClose`, `title`, `children?`, `confirmLabel`, `cancelLabel?` («إلغاء»), `onConfirm`, `destructive?`, `confirmCode?` (type-to-confirm: «اكتب RZ-C للتأكيد», confirm enables when it matches), `safeAlternative?` («البديل الآمن:» + node), `confirmDisabled?`, `inline?`, `width?` (420) |
| 11 | `ToastView` | `kind: "success" \| "info" \| "error" \| "loading"`, `children`, `action?`, `onClose?`, `className?` |

## Pieces (Admin-Pieces-D) and frames

| Export | Props |
|---|---|
| `ConfirmChip` | `count?`, `className?` — «يحتاج تأكيداً» with the gold outline |
| `EmptyState` | `title`, `text?`, `action?`, `icon?: "ring" \| "gold"`, `className?` |
| `ImportPanel` | `title?` («استيراد من Excel · مطابقة الأعمدة»), `intro?`, `mapping` (slot), `mappingActions?`, `previewTitle?`, `preview?` (slot), `previewActions?`, `className?`, `id?`. Helpers: `ImportMappingHead({ columns? })`, `ImportMappingRow({ fileColumn, children, status?, matched?, muted? })`, `ImportStats` + `ImportStat({ value, label, variant?: "sand" \| "ink" \| "outline" })`, `ImportDiffRow({ code, change, result, warning? })` |
| `PreviewFrame` | `width?: 390 \| 1440` + `onWidthChange?` (uncontrolled when omitted), `children`, `title?` («معاينة حية · المسودة»), `note?`, `sticky?`, `height?`, `showToggle?` (default true), `className?` — scales the children to fit the column; `AdminShell layout="phone" \| "desktop"` inside it previews a whole page at either width |
| `AdminButton` | `variant?: "gold" \| "ink" \| "outline" \| "ghost" \| "onInkOutline" \| "onInkWhite"`, `size?: "xs" \| "sm" \| "md" \| "lg"` + button props · `AdminLinkButton` (same + `href`) · `TextLink` (`href`) |
| icons | `IconSearch`, `IconBell`, `IconMenu`, `IconOverview`, `IconApprovals`, `IconUnits`, `IconProjects`, `IconLeads`, `IconWhatsApp`, `IconAnalytics`, `IconVisitors`, `IconContent`, `IconSettings`, `IconUpload`, `IconCheck`, `IconGrip`, `IconEye` (`size?`, svg props) |

## Notes

- Money: `<Price value={n} />` from `components/ui/Price.tsx` inside cells; the table itself never formats money.
- Numbers on screen come from `/data` selectors; `sample.ts` feeds only the styleguide.
- Brand images are imported from `design/brand/*.png` (static imports), so nothing was written to `public/`.
