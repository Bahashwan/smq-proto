import type { Screen } from "./types";
// g9-room: marketers (stage board + detail) and the alliance room (overview D/M, applications, members + member,
// radar, requests, referrals, report, settings). One entry per board row of docs/route-map.md «34–37».
const S = "34–37 · Admin: marketers and the alliance room";

export const screens: Screen[] = [
  { board: "Admin-Marketers-D", route: "/admin/marketers", width: 1440, section: S, note: "stage board; «أنشئ الرابط وفعّل» on سارة باجابر moves the card to «نشط» (store)" },
  { board: "Admin-MarketerDetail-D", route: "/admin/marketers/mk-07", width: 1440, section: S, note: "stage strip moves the marketer; «إيقاف» asks first; notes kept in memory" },
  { board: "Admin-Alliance-D", route: "/admin/alliance", width: 1440, section: S, note: "overview with the sub-tabs; every tile and line computed from the alliance fixtures" },
  { board: "Admin-Alliance-M", route: "/admin/alliance", width: 390, section: S, note: "daily actions on the phone" },
  { board: "Admin-AllianceApplications-D", route: "/admin/alliance/applications?id=ALL-2026-0038", width: 1440, section: S, note: "licence check with date → «اعتمد كعضو موثّق» (store, toast); Google-forms import banner" },
  { board: "Admin-AllianceMembers-D", route: "/admin/alliance/members", width: 1440, section: S, note: "ledger cells; مكتب ل suspended" },
  { board: "Admin-AllianceMember-D", route: "/admin/alliance/members/office-01", width: 1440, section: S, note: "«صفحة العضو كما يراها» → /member/office-01" },
  { board: "Admin-AllianceRadar-D", route: "/admin/alliance/radar?district=obhur-north", width: 1440, section: S, note: "hexagon cell opens the district drawer; «أرسل للمكاتب» creates a request in memory" },
  { board: "Admin-AllianceRequests-D", route: "/admin/alliance/requests?req=REQ-2026-0412", width: 1440, section: S, note: "pick مكتب ط's offer → «أنشئ سجل إحالة» creates REF-2026-0117 and opens the referrals tab; ?wa=manual shows «أرسل على واتساب»" },
  { board: "Admin-AllianceReferrals-D", route: "/admin/alliance/referrals", width: 1440, section: S, note: "dispute panel on REF-2026-0098; stage update form" },
  { board: "Admin-AllianceReport-D", route: "/admin/alliance/report", width: 1440, section: S, note: "draft October preview; «انشر وأرسل» → toast; «افتح كما يراه العضو» → /member/office-01/report" },
  { board: "Admin-AllianceSettings-D", route: "/admin/alliance/settings", width: 1440, section: S, note: "charter, defaults, routing weights with the sum check, option lists, forms table" },
];
