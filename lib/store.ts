"use client";
// In-memory mutations (status changes, approvals, created referrals, toasts). Persisted to sessionStorage
// under smq.store so a demo survives a reload; the presenter bar can reset it. Nothing is sent anywhere.
import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ApplicationStatus, ApprovalStatus, LeadStatus, MarketerStage, Referral, ReferralStage, RequestOffer, RequestStage, UnitStatus } from "@/data/types";

export interface Toast {
  id: number;
  text: string;
  kind?: "ok" | "info" | "error" | "loading";
  action?: { label: string; href: string };
}

export interface StoreState {
  unitStatus: Record<string, UnitStatus>;
  unitHidden: Record<string, boolean>;
  approvals: Record<string, ApprovalStatus>;
  leads: Record<string, { status: LeadStatus; closedReason?: string }>;
  applications: Record<string, ApplicationStatus>;
  marketers: Record<string, MarketerStage>;
  requests: Record<string, { stage?: RequestStage; offers?: RequestOffer[]; referralId?: string }>;
  referralStages: Record<string, { stage: ReferralStage; note?: string }>;
  createdReferrals: Referral[];
  createdRequests: { id: string; districtSlug: string; summaryAr: string; createdAt: string }[];
  /** free-form patches for anything else: patches[entity][id] = partial record */
  patches: Record<string, Record<string, Record<string, unknown>>>;
  toasts: Toast[];
  compare: string[]; // unit slugs (also mirrored to smq.compare by the compare hook)

  setUnitStatus: (code: string, status: UnitStatus) => void;
  setUnitHidden: (code: string, hidden: boolean) => void;
  setApproval: (id: string, status: ApprovalStatus) => void;
  setLead: (id: string, status: LeadStatus, closedReason?: string) => void;
  setApplication: (id: string, status: ApplicationStatus) => void;
  setMarketer: (id: string, stage: MarketerStage) => void;
  setRequest: (id: string, data: StoreState["requests"][string]) => void;
  addOffer: (requestId: string, offer: RequestOffer) => void;
  setReferralStage: (id: string, stage: ReferralStage, note?: string) => void;
  addReferral: (r: Referral) => void;
  addRequest: (r: StoreState["createdRequests"][number]) => void;
  patch: (entity: string, id: string, data: Record<string, unknown>) => void;
  toast: (text: string, opts?: Omit<Toast, "id" | "text">) => void;
  dismissToast: (id: number) => void;
  reset: () => void;
}

const initial = {
  unitStatus: {},
  unitHidden: {},
  approvals: {},
  leads: {},
  applications: {},
  marketers: {},
  requests: {},
  referralStages: {},
  createdReferrals: [],
  createdRequests: [],
  patches: {},
  toasts: [],
  compare: [],
};

let toastSeq = 1;

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      ...initial,
      setUnitStatus: (code, status) => set((s) => ({ unitStatus: { ...s.unitStatus, [code]: status } })),
      setUnitHidden: (code, hidden) => set((s) => ({ unitHidden: { ...s.unitHidden, [code]: hidden } })),
      setApproval: (id, status) => set((s) => ({ approvals: { ...s.approvals, [id]: status } })),
      setLead: (id, status, closedReason) => set((s) => ({ leads: { ...s.leads, [id]: { status, closedReason } } })),
      setApplication: (id, status) => set((s) => ({ applications: { ...s.applications, [id]: status } })),
      setMarketer: (id, stage) => set((s) => ({ marketers: { ...s.marketers, [id]: stage } })),
      setRequest: (id, data) => set((s) => ({ requests: { ...s.requests, [id]: { ...s.requests[id], ...data } } })),
      addOffer: (requestId, offer) =>
        set((s) => ({ requests: { ...s.requests, [requestId]: { ...s.requests[requestId], offers: [...(s.requests[requestId]?.offers ?? []), offer] } } })),
      setReferralStage: (id, stage, note) => set((s) => ({ referralStages: { ...s.referralStages, [id]: { stage, note } } })),
      addReferral: (r) => set((s) => ({ createdReferrals: [r, ...s.createdReferrals.filter((x) => x.id !== r.id)] })),
      addRequest: (r) => set((s) => ({ createdRequests: [r, ...s.createdRequests.filter((x) => x.id !== r.id)] })),
      patch: (entity, id, data) =>
        set((s) => ({ patches: { ...s.patches, [entity]: { ...(s.patches[entity] ?? {}), [id]: { ...(s.patches[entity]?.[id] ?? {}), ...data } } } })),
      toast: (text, opts) => {
        const id = toastSeq++;
        set((s) => ({ toasts: [...s.toasts, { id, text, ...opts }] }));
        setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 6000);
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      reset: () => set({ ...initial }),
    }),
    {
      name: "smq.store",
      storage: createJSONStorage(() => (typeof window === "undefined" ? ({ getItem: () => null, setItem: () => {}, removeItem: () => {} } as unknown as Storage) : window.sessionStorage)),
      partialize: (s) => {
        const { toasts: _toasts, ...rest } = s;
        void _toasts;
        return rest as StoreState;
      },
    },
  ),
);

/** Read a free-form patch for an entity id (undefined when none). */
export function usePatch<T extends Record<string, unknown>>(entity: string, id: string): Partial<T> | undefined {
  return useStore((s) => s.patches[entity]?.[id]) as Partial<T> | undefined;
}

/** The unit overrides for the selectors (`effectiveUnitStatus`, `filterUnits` …). Selects the two slices
 *  separately so the snapshot stays referentially stable (an inline object selector would loop). */
export function useUnitOverrides(): { unitStatus: Record<string, UnitStatus>; unitHidden: Record<string, boolean> } {
  const unitStatus = useStore((s) => s.unitStatus);
  const unitHidden = useStore((s) => s.unitHidden);
  return useMemo(() => ({ unitStatus, unitHidden }), [unitStatus, unitHidden]);
}
