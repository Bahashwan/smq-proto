import type { Screen } from "./types";
// g8-content: content hub, page editor, FAQ, partners, testimonials, lists, site settings, SEO, media, users, and the
// Admin-Pieces-D row (bell dropdown over the needs-confirmation list; the empty states live on g7's routes).
// Where a board has several states, the last entry is the one the shots script keeps as docs/shots/<Board>.png.
const S = "16–22 · Admin";
const BELL = 'button[aria-label^="الإشعارات،"]';

export const screens: Screen[] = [
  { board: "Admin-Content-D", route: "/admin/content", width: 1440, section: S, note: "«11 عنصراً بانتظار التأكيد» opens /admin/content/needs-confirmation; block counts computed from the content fixtures" },
  { board: "Admin-PageEditor-D", route: "/admin/content/pages/home", width: 1440, section: S, note: "AR / EN tabs; the 390 / 1440 preview follows the fields as you type; «نشر» → «نُشرت الرئيسية الآن» for 6 s" },
  { board: "Admin-FAQ-D", route: "/admin/content/faq?edit=faq-05", width: 1440, section: S, note: "drag order (pointer or arrow keys on the handle); publish switch disabled while [مسودة إجابة]" },
  { board: "Admin-Partners-D", route: "/admin/content/partners", width: 1440, section: S, note: "visibility switches drive the «من نحن» block preview; «مرئي» stays off without a logo" },
  { board: "Admin-Testimonials-D", route: "/admin/content/testimonials", width: 1440, section: S, note: "3+ rule meter; «سجّل الموافقة» enables the publish switch" },
  { board: "Admin-Lists-D", route: "/admin/content/lists", width: 1440, section: S, note: "opens with the three «قريباً» flags unsaved, as the board" },
  { board: "Admin-SiteSettings-D", route: "/admin/content/site-settings", width: 1440, section: S, note: "office pin: schematic PinPicker with coordinate fields; WhatsApp templates with the live RZ-A example" },
  { board: "Admin-SEO-D", route: "/admin/content/seo", width: 1440, section: S, note: "60 / 155 counters; link previews use public/og/*.png" },
  { board: "Admin-Media-D", route: "/admin/content/media", width: 1440, section: S, note: "32 slots: 31 generated (تعبيرية, label locked), IMG-FOUNDER empty and upload-only; «استبدال» previews a local file" },
  { board: "Admin-Users-D", route: "/admin/users?wa=manual", width: 1440, section: S, note: "presenter «WhatsApp Business» manual: «غير متصل · وضع يدوي»" },
  { board: "Admin-Users-D", route: "/admin/users", width: 1440, section: S, note: "WhatsApp Business «متصل» by default" },
  { board: "Admin-Pieces-D", route: "/admin/units?empty=1", width: 1440, section: S, note: "empty state «لا وحدات بعد» (g7 route)" },
  { board: "Admin-Pieces-D", route: "/admin/leads?empty=1", width: 1440, section: S, note: "empty state «لا طلبات بلا رد» (g7 route)" },
  { board: "Admin-Pieces-D", route: "/admin/units/rz-a", width: 1440, section: S, note: "delete dialog: «حذف الوحدة» types the code (g7 route)", prepare: { click: 'button:has-text("حذف الوحدة نهائياً")' }, viewport: true },
  { board: "Admin-Pieces-D", route: "/admin/content/needs-confirmation", width: 1440, section: S, note: "the bell dropdown open over the «يحتاج تأكيداً» list; toasts follow every action", prepare: { click: BELL }, viewport: true },
];
