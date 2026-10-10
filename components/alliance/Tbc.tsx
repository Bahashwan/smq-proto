"use client";
// «[للتأكيد]» inside the alliance sheets: a thin wrapper over the public <Mark /> (components/ui), which strips the
// brackets, draws the gold-outlined chip and hides itself with the presenter switch ?marks=0.
import { Mark } from "@/components/ui";

export function Tbc({ text = "[للتأكيد]", className }: { text?: string; className?: string }) {
  return <Mark className={className}>{text}</Mark>;
}
