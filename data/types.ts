// Fixture shapes · see docs/data-model.md. Every number on screen is computed from these records.

export type Tbc<T> = { value: T; tbc: boolean };

export type UnitCode = "RZ-A" | "RZ-B" | "RZ-C" | "RZ-D" | "RZ-RF" | "YS-A" | "YS-B" | "YS-C" | "YS-D" | "YS-RF";
export type UnitStatus = "available" | "reserved" | "sold";
export type ImageTier = "generated" | "real" | "typographic";
export type SlotId = string;

export interface UnitFeatures {
  maid: boolean;
  driver: boolean;
  balcony: boolean;
  smartHome: boolean;
  parking: number;
  roofTerrace: boolean;
  kitchen: "open" | "closed" | "tbc";
  privateLift?: boolean;
  pool?: boolean;
  privateEntrance?: boolean;
  majlis?: boolean;
  twoKitchens?: "yes" | "no" | "tbc";
}

export interface Unit {
  code: UnitCode;
  slug: string; // lower-case code, e.g. rz-a
  projectId: string;
  building: "RZ" | "YS";
  buildingNameAr: string; // روز · ياسمين
  model: "A" | "B" | "C" | "D" | "RF";
  type: "apartment" | "roof-villa";
  nameAr: string; // شقة نموذج A · فيلا روف
  beds: number;
  baths: number;
  areaM2: number;
  priceSar: number;
  status: UnitStatus;
  soldOn?: string; // YYYY-MM-DD
  reservedUntil?: string;
  floor?: Tbc<string>;
  orientation?: Tbc<string>;
  ceilingM?: Tbc<number>;
  features: UnitFeatures;
  otherFeatures: string[];
  imageTier: ImageTier;
  images: SlotId[]; // gallery slots, first is the cover
  plan?: string; // plan id
  updatedAt: string; // YYYY-MM-DD
  nameEn?: string; // "Apartment, model A"
  hidden?: boolean; // «مخفي» in the admin: never on the site
  terraceM2?: Tbc<number | null>; // roof villas: «م² التراس [للتأكيد]»
  featuresTbc?: string[]; // feature keys whose value is still [للتأكيد] (e.g. privateEntrance, majlis)
  adLicence?: string; // رقم ترخيص الإعلان (optional)
}

export interface Building {
  code: "RZ" | "YS";
  nameAr: string;
  letter: string;
}

export interface Project {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  districtSlug: string;
  status: "under-construction" | "ready" | "planned" | "draft";
  statusAr: string;
  deliveryLabel: Tbc<string>;
  buildings: Building[];
  features: string[];
  milestones: { label: string; date: string; done: boolean; tbc: boolean }[];
  warranties: "tbc";
  insurance: "tbc";
  occupancy: string;
  centre: { lat: number; lng: number };
  images: SlotId[];
  published: boolean;
  featured: boolean;
  descriptionAr: string;
  code?: string; // RWD-01 · ABH-01 · IND (the Excel key shown in the admin)
  autoGroup?: boolean; // «وحدات المُلّاك»: an automatic group, never a project on the site
  descriptionDraftAr?: string; // unsaved editor draft (Admin-ProjectEditor-D)
  descriptionEn?: string;
  tbcFields?: string[]; // «4 حقول بانتظار تأكيد المطوّر»
  adminNoteAr?: string; // the one-line summary on the admin projects card
  log?: { by: string; text: string; at: string }[];
  order?: number; // display order in /projects and the filters
}

export type Sector = "north" | "central" | "east" | "west" | "south";

export interface District {
  slug: string;
  ar: string;
  en: string;
  sector: Sector;
  centre: { lat: number; lng: number };
  comingSoon: boolean;
  inSiteList?: boolean; // one of the 14 districts of Admin-Lists-D (filter + «أضف عقارك»); the rest appear in the alliance lists only
  listNoteAr?: string; // the Lists board's row note, e.g. «مشروع مسودة»
}

export type OfficeStatus = "active" | "suspended";

export interface OfficeLedger {
  offersGiven: number;
  requestsGiven: number;
  dealsClosed: number;
  requestsReceived: number;
  replied: number;
  avgReplyMinutes: number;
}

export interface Office {
  id: string; // office-01 … office-12
  letter: string; // أ … ل
  nameAr: string; // مكتب أ
  fullName: string; // مكتب أ للعقارات
  sector: Sector;
  districts: string[];
  specialties: string[];
  licence: { number: string; verifiedOn: string; verifiedBy: string; expiresOn: string };
  hours: "single" | "morning" | "evening" | "other";
  applicantRole: string;
  memberSince: string;
  status: OfficeStatus;
  suspendedOn?: string;
  suspendedReason?: string;
  inDirectory: boolean;
  ledger: OfficeLedger;
  ownerName?: string; // «مالك المكتب عبدالعزيز»
  phoneMasked?: string;
  mapsLink?: string;
  charterVersion?: string; // «النسخة 1.0 · 2026/10/11»
  charterAcceptedOn?: string;
  licenceReminded?: boolean; // «ذُكِّر» (expiry within 30 days)
  notes?: { by: string; at: string; text: string }[];
  joinedThisMonth?: boolean; // the gold cell on the alliance honeycomb
}

export type ApplicationStatus = "review" | "missing" | "verified" | "rejected" | "imported";

export interface Application {
  id: string; // ALL-2026-0038
  officeName: string;
  licence: string;
  applicantName: string;
  applicantRole: string;
  phoneMasked: string;
  districtSlug: string;
  sectors: Sector[];
  districts: string[];
  specialties: string[];
  hours: Office["hours"];
  offersDirect: number;
  offersBrokered: number;
  requestsElsewhere: string[];
  want: string;
  add: string;
  notes: string;
  directoryConsent: boolean;
  charterConsent: boolean;
  status: ApplicationStatus;
  verification?: { date: string; expiry: string; nameAtRega: string; by: string };
  rejectReason?: string;
  submittedAt: string;
  wantSummary?: string; // the admin's shortened line
  addSummary?: string;
  missingNote?: string; // what is missing when status = missing
  mapsLink?: string;
  charterVersion?: string;
  offersLabel?: string; // «10 عروض» as the list writes it (computed by default)
}

export type RequestStage = "new" | "sent" | "offers" | "intro" | "closed";

export interface RequestOffer {
  officeId: string;
  type: string;
  areaM2?: number;
  priceSar?: number;
  note: string;
  brokered: boolean;
  repliedAt: string;
  replyMinutes: number;
}

export interface AllianceRequest {
  id: string; // REQ-2026-0412
  source: "visitor" | "staff" | "member";
  memberOfficeId?: string;
  districtSlug: string;
  type: string;
  beds?: number;
  budgetMax?: number;
  budgetMin?: number;
  timing: string;
  stage: RequestStage;
  sentTo: { officeId: string; mode: "auto" | "manual"; sentAt: string; status: "pending" | "replied" | "none" | "expired"; repliedAt?: string; replyMinutes?: number }[];
  offers: RequestOffer[];
  referralId?: string;
  closedReason?: string;
  createdAt: string;
  expiresAt: string;
  summaryAr: string;
  typeLabelAr?: string; // «شقة 4 غرف» · «أرض مطورة» (the board's short type)
  nearestCoverageAr?: string; // «أقرب تغطية: الشاطئ، مكتب ج» when no member covers the district
  unsentOfficeIds?: string[]; // offices that should have received it but did not (suspended, manual mode)
  unsentNoteAr?: string;
  buyerPhoneMasked?: string; // «05X XXX 3390» · stays at SMQ, never sent to a member
  closedAt?: string;
}

export type ReferralStage = "intro" | "viewing" | "negotiation" | "transfer" | "failed";

export interface Referral {
  id: string; // REF-2026-0117
  requestId: string;
  requesterOfficeId: "SMQ" | string;
  offerOfficeId: string;
  districtSlug: string;
  summary: string;
  offerSummary: string;
  brokered: boolean;
  valueSar: number;
  split: string;
  splitTbc: boolean;
  protectionDays: number;
  introducedOn: string;
  stage: ReferralStage;
  stageNote: string;
  dispute?: { openedDaysAgo: number; claim: string; counter: string };
  createdBy: string;
  createdAt?: string; // ISO with time, the receipt's «التاريخ والوقت»
  offerSentAt?: string;
  offerAreaM2?: number;
  stageLabelAr?: string; // «معاينة · الخميس»
  closedOn?: string; // إفراغ date
  finalValueSar?: number;
  noCommission?: boolean; // «لا عمولة» (failed deals)
  charterVersion?: string;
  disputeOpenedOn?: string;
}

export type MarketerStage = "new" | "interview" | "accepted" | "active" | "suspended";

export interface Marketer {
  id: string; // MK-07
  token: string; // mk-07
  name: string;
  slug: string; // abdullah → /r/abdullah
  stage: MarketerStage;
  phoneMasked: string;
  licence?: string;
  districts: string[];
  years: number;
  social: string;
  bio: string;
  cv?: string;
  agreementOn?: string;
  commission: "tbc";
  stats: { visits30d: number; whatsapp30d: number; leads: number; negotiating: number };
  attributedLeads: { when: string; unit: string; channel: string; status: string; team: string; code: string }[];
  notes: string;
  log: { at: string; text: string }[];
  yearsLabel?: string; // «3 إلى 5 سنوات»
  submittedAt?: string;
  activeSince?: string;
  acceptedOn?: string;
  interviewAt?: string; // «مقابلة الأحد 11 ص · واتساب · نورة»
  suspendedOn?: string;
  suspendedReason?: string;
  licenceVerifiedOn?: string;
  licenceExpiresOn?: string;
  peakNoteAr?: string; // «الذروة: مساء الخميس»
  negotiatingUnit?: string; // the unit code of the deal in negotiation
}

export type LeadKind = "whatsapp" | "call" | "form" | "notify" | "owner";
export type LeadStatus = "unanswered" | "answered" | "closed";

export interface Lead {
  id: string;
  /** visitor reference code shown in WhatsApp messages, e.g. SMQ-8F3A2 */
  code?: string;
  kind: LeadKind;
  title: string;
  detail: string;
  source: string;
  device: string;
  city: string;
  status: LeadStatus;
  closedReason?: string;
  at: string;
  path: string[];
  notes: { by: string; at: string; text: string }[];
  viaMarketer?: string;
  unitCode?: string; // the unit the lead is about, when any
  budgetSar?: number;
  phoneMasked?: string; // form submitters only
  name?: string; // form submitters only
  statusDetailAr?: string; // «زيارة محجوزة» · «تفاوض · زيارة الخميس» (shown beside the status)
  team?: string; // who handled it
  generated?: boolean; // illustrative filler row (keeps the 12 / 41 / 86 counts computed)
}

export interface Visitor {
  id: string; // v-8f3a2
  code?: string; // SMQ-8F3A2
  source: string;
  device: string;
  city: string;
  lang: "ar" | "en";
  visits: number;
  sessionLength: string;
  lastSearch: string;
  zeroResults: number;
  openedUnits: string[];
  whatsapp: number;
  path: string[];
  lastSeen: string;
  sourceDetail?: string; // «سناب شات · إعلان الروضة»
  deviceDetail?: string; // «iPhone · Safari»
  firstVisitLabel?: string; // «أول زيارة أمس»
  returning?: boolean;
  requestSaved?: boolean; // «طلب محفوظ»
  pathDetail?: { step: string; text: string; note: string }[];
  whatsappUnit?: string; // the unit code behind «نعم · D روز»
}

export type ApprovalKind = "apartment" | "villa" | "land" | "building";
export type ApprovalRole = "owner" | "agent" | "marketer";
export type ApprovalStatus = "new" | "awaiting-photos" | "approved" | "rejected";

export interface Approval {
  id: string; // 2026-1042
  kind: ApprovalKind;
  role: ApprovalRole;
  submitterName: string;
  phoneMasked: string;
  purpose: "sell" | "rent";
  city: string;
  districtSlug: string;
  landmark?: string;
  pin?: { lat: number; lng: number };
  relation: string;
  // step 2 (apartment / villa)
  beds?: number;
  baths?: number;
  areaM2?: number;
  floor?: string;
  ageYears?: number;
  occupancy?: string;
  features?: string[];
  askedPriceSar: number;
  // step 2 (building)
  landM2?: number;
  buildM2?: number;
  floors?: number;
  unitsCount?: number;
  incomeYearSar?: number;
  occupiedUnits?: number;
  // step 3
  photosCount: number;
  attachments: string[];
  timing: string;
  submittedAt: string;
  ageHours: number;
  status: ApprovalStatus;
  checklist: Record<ApprovalRole, { label: string; done: boolean; roleOnly?: boolean }[]>;
  log: { by: string; text: string; at: string; mode?: "auto" | "manual"; noteAr?: string }[];
  titleAr?: string; // «عمارة سكنية بدخل · حي النعيم»
  typeLabelAr?: string; // «عمارة سكنية» · «شقة» · «فيلا» · «أرض»
  ageLabel?: string; // «6 إلى 10 سنوات»
  streetWidth?: string;
  hasIncome?: boolean;
  contractsLabel?: string; // «عقود موثّقة»
  buildingFeatures?: string[];
  negotiable?: string;
  deedNumber?: string;
  ownerNotes?: string;
  priorRequestsAr?: string; // «طلب واحد سابق · لا شكاوى»
  modelCode?: string; // IND-BLD-02
  projectId?: string;
  publishedDescription?: string;
  publishFeatures?: { maid: boolean; driver: boolean; balcony: boolean; smartHome: boolean; parking: boolean };
  photos?: string[];
  withdrawn?: boolean;
  closedOn?: string;
  rejectReason?: string;
  sourceAr?: string; // «جوال · سناب شات»
  vsDistrictNoteAr?: string;
}

export interface FaqItem {
  id: string; // faq-01
  q: string;
  a: string;
  draft: boolean; // [مسودة إجابة]
  published: boolean;
  order: number;
  pages?: string[]; // «يظهر في»: الرئيسية · الوحدة · المشروع · أضف عقارك
  qEn?: string;
  aEn?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  consent: boolean;
  published: boolean;
  sample: boolean; // «نص تجريبي»
  unitCode?: string;
  date?: string; // 2026-07
  consentSource?: string; // «واتساب 2026-07-14»
}

export interface Partner {
  id: string;
  name: string;
  kind: "bank" | "developer" | "service";
  visible: boolean;
  placeholder: boolean;
  kindAr?: string; // «جهة تنظيمية» · «بنك» · «مطوّر» · «أخرى»
  logoLabel?: string; // the placeholder tile text
  url?: string;
  noteAr?: string; // «الاسم يُدخل بعد توقيع الاتفاقية [للتأكيد]»
  hasLogo?: boolean;
}

export type MediaTier = "generated" | "real" | "render" | "typographic" | "empty";

export interface MediaSlot {
  id: SlotId; // IMG-…
  group: "exterior" | "interior" | "editorial" | "brand" | "founder";
  titleAr: string;
  ratio: "3:2" | "16:9" | "4:5" | "1:1" | "21:9" | "2:3";
  tier: MediaTier;
  labelOn: boolean;
  pages: string[];
  promptEn: string;
  reference?: boolean; // one of the four anchors
  sectionAr?: string; // the admin Media screen section
  subjectAr?: string; // the Shots board subject, verbatim
  moodAr?: string;
  avoidAr?: string;
  ratiosLabel?: string; // the Shots board ratio text, e.g. «16:9 و3:2»
  pagesLabel?: string; // the Shots board page text
  labelOptional?: boolean; // «الوسم اختياري» (editorial, details)
  descriptionAr?: string; // the admin Media card line, e.g. «كورنيش جدة عند الفجر»
  order?: number;
}

export interface SiteSettings {
  office: { lat: number; lng: number; addressAr: string; addressEn: string; mapsLink: string; embedUrlAr: string; embedUrlEn: string };
  whatsapp: { number: string; templates: { id: string; label: string; text: string }[] };
  hours: { days: string; from: string; to: string };
  phone: string;
  email: string;
  licence: { rega: string; cr: string };
  switches: { financingBlock: boolean; testimonials: boolean; alliancePublic: boolean; marketersOpen: boolean };
  whatsappBusiness: { connected: boolean; number: string; lastSync: string; templatesApproved?: string; disconnectedNoteAr?: string };
  phoneIntl?: string; // «+966 55 660 7779»
  whatsappDisplay?: string; // «0559997929»
  whatsappIntl?: string; // «+966 55 999 7929»
  emailLeads?: string;
  companyNameAr?: string;
  companyNameEn?: string;
  taxNumber?: Tbc<string>;
  taglineAr?: string;
  footerLineAr?: string;
  hoursLabelAr?: string; // «السبت إلى الخميس · 9 ص إلى 6 م»
  hoursLabelEn?: string;
  fridayAr?: string; // «مغلق · واتساب يستقبل الرسائل»
  afterHoursAr?: string; // «نرد في أول ساعة عمل»
  businessHours?: { days: number[]; open: number; close: number; timeZone: string }; // JS weekday numbers, 24h
  social?: { handle: string; x: string; instagram: string; snapchat: string; tiktok: string; linkedin: string; youtube: string };
  siteSwitches?: { showSoldInResults: boolean; generatedLabel: boolean; acceptOwnerListings: boolean };
  domain?: string;
}

// ---------------------------------------------------------------------------
// Added by the fixtures owner (additive only). Shapes for the illustrative data
// that has no fixture type above: analytics, visitors summary, alliance report,
// alliance settings, content hub, SEO rows, option lists, admin pieces.
// ---------------------------------------------------------------------------

export type AnalyticsPeriodKey = "7d" | "30d" | "90d";

export interface PctRow {
  key: string;
  labelAr: string;
  pct: number;
  note?: string;
}

export interface ZeroResultSearch {
  labelAr: string;
  count: number;
  loosenAr: string; // «تخفيف: الحي»
}

export interface AnalyticsPeriod {
  key: AnalyticsPeriodKey;
  labelAr: string;
  days: number;
  visitors: number;
  visitorsDeltaPct?: number;
  sessions: number;
  searches: number;
  whatsappClicks: number;
  funnel: { labelAr: string; count: number }[];
  medianBudget: number;
  meanBudget: number;
  budgetBands: { labelAr: string; min: number | null; max: number | null; pct: number }[];
  supplyGapAr: string;
  districtsDemand: { slug: string | "all"; labelAr: string; pct: number }[];
  districtNoteAr: string;
  rooms: PctRow[];
  types: PctRow[];
  features: PctRow[];
  zeroResults: { count: number; pct: number; top: ZeroResultSearch[]; noteAr: string };
  sort: PctRow[];
  view: PctRow[];
  tools: PctRow[];
  hours: number[]; // 24 relative values (0..100)
  hoursNoteAr: string;
  outsideHoursPct: number;
}

export interface VisitorsSummary {
  visitors: number;
  sessions: number;
  sources: { labelAr: string; pct: number; whatsappPct: number }[];
  device: { mobilePct: number; iosPct: number; androidPct: number; desktopPct: number };
  lang: { arPct: number; enPct: number };
  avgSession: string;
  pagesPerSession: number;
  returningPct: number;
  cities: { labelAr: string; pct: number }[];
}

export interface RadarDistrict {
  slug: string;
  sessions: number;
  deltaPct?: number;
  medianBudget?: number;
  topDemandAr?: string; // «فلل · 5 غرف»
  topBeds?: number;
  whatsappNoResult?: number;
  supplyNoteAr?: string; // «مشروع أبحر قريباً [للتأكيد]» · «عرض بدخل قيد المراجعة»
  ownerUnits?: number; // illustrative owner units (الصفا: 1)
  summaryAr?: string; // the drawer headline
}

export interface ReportSlice {
  labelAr: string;
  sessions: number;
  offices: number;
  officeIds?: string[];
  supplyAr?: string; // «0 وحدة» · «1 وحدة من مالك»
}

export interface AllianceReport {
  id: string; // 2026-10
  monthAr: string; // «أكتوبر 2026»
  status: "draft" | "published";
  publishedOn?: string;
  generatesOn?: string;
  sessions: number;
  sessionsDeltaPct?: number;
  medianBudget?: number;
  noSupplyPct?: number;
  recipients: number;
  byDistrict: PctRow[];
  byBudget: PctRow[];
  byBeds: PctRow[];
  bedsNoteAr?: string;
  opportunities: ReportSlice[];
  wordAr: string;
  sections: { key: string; labelAr: string; on: boolean }[];
  newDistrictsAr?: string;
}

export interface AllianceSettings {
  charter: { version: string; date: string; fullText: string; summary: string };
  defaults: { split: string; splitTbc: boolean; splitOptions: string[]; protectionDays: number; replyBusinessDays: number; suspendAfterNoReplyDays: number };
  routing: { weights: { ledger: number; speed: number; specialty: number }; sendTo: number; sendToOptions: string[]; autoSend: boolean };
  options: { sectors: string[]; specialties: string[]; hours: string[]; applicantRoles: string[]; districtsCount: number };
  forms: { key: string; nameAr: string; metaAr: string; open: boolean; responses: number; imported?: number; path: string }[];
  rejectReasons: string[];
}

export interface SeoRow {
  key: string;
  pageAr: string;
  path: string;
  template: boolean;
  pagesCount?: number;
  titleAr: string;
  descriptionAr: string;
  titleEn?: string;
  descriptionEn?: string;
  titleNoteAr?: string;
  descriptionNoteAr?: string;
  exampleTitleAr?: string;
  exampleDescriptionAr?: string;
  og: string; // OG-Home · OG-Unit · OG-Project
  unsaved?: boolean;
}

export interface ListItem {
  key: string;
  labelAr: string;
  pluralAr?: string;
  value?: number;
  visible?: boolean;
  comingSoon?: boolean;
  noteAr?: string;
  count?: number; // usage count where the board shows one (rejection reasons)
  slug?: string;
}

export interface NeedsConfirmationItem {
  id: string;
  fieldAr: string;
  valueAr: string;
  whereAr: string;
  kind: "tbc" | "draft";
  count?: number;
  disabledReasonAr?: string;
  href?: string;
}

export interface CopyField {
  key: string;
  labelAr: string;
  ar: string;
  arDraft?: string;
  arPrevious?: string;
  en?: string;
  kind?: "text" | "textarea" | "select" | "image" | "number";
  options?: string[];
  noteAr?: string;
}

export interface PageSection {
  key: string;
  titleAr: string;
  visible: boolean; // on the public page (Home-D)
  visibleDraft?: boolean; // in the editor's unsaved draft (Admin-PageEditor-D) when it differs
  fields: CopyField[];
  noteAr?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  initial: string;
  role: "manager" | "editor";
  roleAr: string;
  email: string;
  lastLoginAr: string;
  noteAr?: string;
  pending?: boolean;
}
