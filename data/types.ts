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
}

export type Sector = "north" | "central" | "east" | "west" | "south";

export interface District {
  slug: string;
  ar: string;
  en: string;
  sector: Sector;
  centre: { lat: number; lng: number };
  comingSoon: boolean;
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
  sentTo: { officeId: string; mode: "auto" | "manual"; sentAt: string; status: "pending" | "replied" | "none" | "expired" }[];
  offers: RequestOffer[];
  referralId?: string;
  closedReason?: string;
  createdAt: string;
  expiresAt: string;
  summaryAr: string;
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
}

export type LeadKind = "whatsapp" | "call" | "form" | "notify" | "owner";
export type LeadStatus = "unanswered" | "answered" | "closed";

export interface Lead {
  id: string;
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
  checklist: Record<ApprovalRole, { label: string; done: boolean }[]>;
  log: { by: string; text: string; at: string; mode?: "auto" | "manual" }[];
}

export interface FaqItem {
  id: string; // faq-01
  q: string;
  a: string;
  draft: boolean; // [مسودة إجابة]
  published: boolean;
  order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  consent: boolean;
  published: boolean;
  sample: boolean; // «نص تجريبي»
}

export interface Partner {
  id: string;
  name: string;
  kind: "bank" | "developer" | "service";
  visible: boolean;
  placeholder: boolean;
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
}

export interface SiteSettings {
  office: { lat: number; lng: number; addressAr: string; addressEn: string; mapsLink: string; embedUrlAr: string; embedUrlEn: string };
  whatsapp: { number: string; templates: { id: string; label: string; text: string }[] };
  hours: { days: string; from: string; to: string };
  phone: string;
  email: string;
  licence: { rega: string; cr: string };
  switches: { financingBlock: boolean; testimonials: boolean; alliancePublic: boolean; marketersOpen: boolean };
  whatsappBusiness: { connected: boolean; number: string; lastSync: string };
}
