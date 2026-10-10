import type { Screen } from "./types";
// g4-places: the price guide, the project page, the projects list, contact (+ the invalid submit, ?offline=1) and the
// contact success screen. One entry per board row of docs/route-map.md.
const R1 = "1–12 · Public site, round 1";
const R2 = "23–29 · Public, round 2";
const PROJECT = "/projects/garden-rawdah";

/** Contact-Error-M: the board's example typed into the three-field form, then «أرسل الرسالة». */
const INVALID_SUBMIT: Screen["prepare"] = {
  fill: {
    "#contact-name": "خالد باعشن",
    "#contact-phone": "05512",
    "#contact-message": "أبحث عن شقة 3 غرف بميزانية 700 ألف، هل يمكن زيارة يوم السبت؟",
  },
  click: "#contact-submit",
  wait: 400,
};

export const screens: Screen[] = [
  { board: "Guide-M", route: "/guide", width: 390, section: R1, note: "only الروضة is live; every other chip district «قريباً»" },
  { board: "Guide-D", route: "/guide", width: 1440, section: R1 },
  { board: "Project-M", route: PROJECT, width: 390, section: R1, note: "keyless embed at the الروضة centre, «الموقع تقريبي [للتأكيد]»" },
  { board: "Project-D", route: PROJECT, width: 1440, section: R1 },
  { board: "Contact-M", route: "/contact", width: 390, section: R1, note: "office embed at street level (z=17)" },
  { board: "Contact-D", route: "/contact", width: 1440, section: R1 },
  { board: "Projects-M", route: "/projects", width: 390, section: R2, note: "«نبّهني» validates and confirms inline" },
  { board: "Projects-D", route: "/projects", width: 1440, section: R2 },
  { board: "Contact-Success-M", route: "/contact/sent", width: 390, section: R2, note: "after a valid submit the message is echoed; opened directly it shows the boards' example", viewport: true },
  {
    board: "Contact-Error-M",
    route: "/contact?offline=1",
    width: 390,
    section: R2,
    note: "invalid submit (phone 05512, no consent) opens «اكتب لنا»; offline=1 adds the connection-lost banner",
    prepare: INVALID_SUBMIT,
  },
];
