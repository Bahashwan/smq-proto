"use client";
// Mounted once in the root layout: presenter bar (hidden unless demo=1 / Shift+P), toasts, tour overlay.
// The page groups never edit this file; the presenter agent fills PresenterBar, Toasts and TourOverlay.
import type { ReactNode } from "react";
import dynamic from "next/dynamic";

const PresenterBar = dynamic(() => import("./PresenterBar").then((m) => m.PresenterBar), { ssr: false });
const Toasts = dynamic(() => import("./Toasts").then((m) => m.Toasts), { ssr: false });
const TourOverlay = dynamic(() => import("./TourOverlay").then((m) => m.TourOverlay), { ssr: false });

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toasts />
      <TourOverlay />
      <PresenterBar />
    </>
  );
}
