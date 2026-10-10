import type { Screen } from "./types";
// g7-admin: login, overview (desktop + phone), approvals, units + editor, projects + editor, leads, analytics, visitors.
// The empty states (/admin/units?empty=1, /admin/leads?empty=1) belong to the Admin-Pieces-D row (g8-content).
const S = "16–22 · Admin";

export const screens: Screen[] = [
  { board: "Admin-Login-M", route: "/admin/login?error=1", width: 390, section: S, note: "designed error; any non-empty email and password open /admin", viewport: true },
  { board: "Admin-Login-D", route: "/admin/login?error=1", width: 1440, section: S, note: "designed error; empty submit shows it too", viewport: true },
  { board: "Admin-M", route: "/admin", width: 390, section: S, note: "phone tabs; approval cards, unanswered leads, unit status selects (store)" },
  { board: "Admin-Overview-D", route: "/admin", width: 1440, section: S, note: "period toggle switches the tiles; «علّم كمردود» writes to the store" },
  { board: "Admin-Approvals-D", route: "/admin/approvals/2026-1042?wa=manual", width: 1440, section: S, note: "presenter «WhatsApp Business» manual: the owner message waits in the log with «أرسل على واتساب»" },
  { board: "Admin-Approvals-D", route: "/admin/approvals/2026-1042", width: 1440, section: S, note: "role tabs switch the checklist; «اعتماد ونشر» enables when complete; the log message «أُرسلت تلقائياً» (WhatsApp Business connected)" },
  { board: "Admin-Inventory-D", route: "/admin/units?import=1&sel=RZ-A,RZ-B", width: 1440, section: S, note: "Excel mapping + preview (canned diff); two rows selected for the bulk actions" },
  { board: "Admin-UnitEditor-D", route: "/admin/units/rz-a", width: 1440, section: S, note: "Excel vs admin fields; delete dialog types the code; /admin/units/new for a new unit" },
  { board: "Admin-Projects-D", route: "/admin/projects", width: 1440, section: S },
  { board: "Admin-ProjectEditor-D", route: "/admin/projects/rwd-01", width: 1440, section: S, note: "opens dirty with the description draft; /admin/projects/abh-01 draft, /admin/projects/new" },
  { board: "Admin-Leads-D", route: "/admin/leads?lead=SMQ-8F3A2", width: 1440, section: S, note: "details column; close asks for the reason" },
  { board: "Admin-Leads-M", route: "/admin/leads?lead=SMQ-8F3A2", width: 390, section: S, note: "the details bottom sheet the board draws under the list", viewport: true },
  { board: "Admin-Leads-M", route: "/admin/leads", width: 390, section: S, note: "«التفاصيل» opens the bottom sheet (?lead=SMQ-8F3A2)" },
  { board: "Admin-Analytics-D", route: "/admin/analytics", width: 1440, section: S, note: "period toggle 7 / 30 / 90 days, source filter" },
  { board: "Admin-Visitors-D", route: "/admin/visitors?v=v-8f3a2", width: 1440, section: S, note: "row click opens the visitor drawer" },
];
