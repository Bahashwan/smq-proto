// /en · the English pages render LTR in the Latin face; the cuts mirror through the [dir=ltr] token variables and
// <EnHtmlAttrs /> flips the <html lang dir> attributes before paint and restores them on the way out.
import type { ReactNode } from "react";
import { EnHtmlAttrs } from "@/components/ui";

export default function EnLayout({ children }: { children: ReactNode }) {
  return (
    <div dir="ltr" lang="en" className="font-latin">
      <EnHtmlAttrs />
      {children}
    </div>
  );
}
