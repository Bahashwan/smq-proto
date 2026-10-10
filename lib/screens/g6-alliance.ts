import type { Screen } from "./types";
// g6-alliance: the alliance page (and launch day), the three application steps, sent and status, the member pages
// (390 only, no login) and the marketer page. When a board shows several states, the extra states come first and the
// board's main state last, so the shots script's docs/shots/<Board>.png is the main state.
const S30 = "30–32 · تعاون معنا";
const S33 = "33 · Member pages (390 only, no login)";
const REQ = "/member/office-09/requests/REQ-2026-0412";

export const screens: Screen[] = [
  { board: "Alliance-M", route: "/alliance", width: 390, section: S30, note: "12 members; the honeycomb fills cell by cell on load", prepare: { wait: 1700 } },
  { board: "Alliance-D", route: "/alliance", width: 1440, section: S30, prepare: { wait: 1700 } },
  { board: "Alliance-Launch-M", route: "/alliance?members=0", width: 390, section: S30, note: "presenter «alliance members 12 / 0»: empty directory, «مطلوب» cells, the Google-form note", prepare: { wait: 1700 } },
  { board: "AllianceApply-Step1-M", route: "/alliance/apply", width: 390, section: S30, note: "draft kept 7 days on this device (smq.allianceApply); «ألصق رابطاً» preview" },
  { board: "AllianceApply-Step2-M", route: "/alliance/apply/coverage", width: 390, section: S30 },
  { board: "AllianceApply-Step2-D", route: "/alliance/apply/coverage", width: 1440, section: S30, note: "radar preview of the chosen coverage" },
  { board: "AllianceApply-Step3-M", route: "/alliance/apply/offers", width: 390, section: S30, note: "charter consent required → /alliance/apply/sent" },
  { board: "AllianceApply-Success-M", route: "/alliance/apply/sent", width: 390, section: S30, note: "ALL-2026-0038, مكتب م للعقارات (decision log)" },
  { board: "AllianceApply-Status-M", route: "/alliance/status/ALL-2026-0038?app=verified", width: 390, section: S30, note: "presenter «application status»: موثّق" },
  { board: "AllianceApply-Status-M", route: "/alliance/status/ALL-2026-0038?app=rejected", width: 390, section: S30, note: "مرفوض مع السبب (/alliance/status/ALL-2026-0031 is rejected in the fixtures)" },
  { board: "AllianceApply-Status-M", route: "/alliance/status/ALL-2026-0038", width: 390, section: S30, note: "قيد المراجعة by default" },
  { board: "MarketerPage-M", route: "/m/mk-07", width: 390, section: S30, note: "/r/abdullah stores smq.ref for 30 days and replaces the URL with /" },
  { board: "Member-Request-M", route: REQ, width: 390, section: S33, note: "مكتب ط, open request with the offer form (alliance tour)" },
  { board: "Member-Request-States-M", route: `${REQ}?mreq=expired`, width: 390, section: S33, note: "presenter «member request»: expired" },
  { board: "Member-Request-States-M", route: `${REQ}?mreq=answered`, width: 390, section: S33, note: "answered (also after submitting the form)" },
  { board: "Member-Referral-M", route: "/member/office-09/referrals/REF-2026-0117", width: 390, section: S33, note: "SMQ ↔ مكتب ط, stage معاينة" },
  { board: "Member-Ledger-M", route: "/member/office-09", width: 390, section: S33, note: "مكتب ط, the alliance tour's last step" },
  { board: "Member-Ledger-M", route: "/member/office-01", width: 390, section: S33, note: "مكتب أ, as designed" },
  { board: "Member-Report-M", route: "/member/office-01/report", width: 390, section: S33 },
  { board: "Member-Report-D", route: "/member/office-01/report", width: 1440, section: S33 },
];
