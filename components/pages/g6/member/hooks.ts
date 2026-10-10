"use client";
// Session answers of a member (store) → the member views of requests (open list, request page).
import { useMemo } from "react";
import type { AllianceRequest } from "@/data";
import { useStore } from "@/lib/store";
import { memberRequestView, requestsForOffice, type SessionAnswer } from "../data";

export function useSessionAnswer(): (r: AllianceRequest, officeId: string) => SessionAnswer {
  const requests = useStore((s) => s.requests);
  const answers = useStore((s) => s.patches.memberAnswer);
  return useMemo(
    () => (r: AllianceRequest, officeId: string) => ({
      offer: requests[r.id]?.offers?.some((o) => o.officeId === officeId) ?? false,
      none: answers?.[`${r.id}:${officeId}`]?.answer === "none",
      stage: requests[r.id]?.stage,
      referralId: requests[r.id]?.referralId,
    }),
    [requests, answers],
  );
}

/** Requests waiting for this office's answer («طلبات مفتوحة في أحيائك»), soonest deadline first. */
export function useOpenRequests(officeId: string): AllianceRequest[] {
  const answerOf = useSessionAnswer();
  return useMemo(
    () =>
      requestsForOffice(officeId)
        .filter((r) => r.sentTo.some((s) => s.officeId === officeId) && memberRequestView(r, officeId, answerOf(r, officeId)) === "open")
        .sort((a, b) => (a.expiresAt < b.expiresAt ? -1 : 1)),
    [officeId, answerOf],
  );
}
