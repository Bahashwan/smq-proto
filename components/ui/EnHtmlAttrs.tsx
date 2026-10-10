"use client";
// Flips <html lang dir> to en/ltr for the /en pages: an inline script runs before paint on a full load, the effect
// handles client navigation and restores ar/rtl on unmount.
import { useEffect } from "react";

const SCRIPT = "document.documentElement.setAttribute('lang','en');document.documentElement.setAttribute('dir','ltr');";

export function EnHtmlAttrs() {
  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute("lang", "en");
    el.setAttribute("dir", "ltr");
    return () => {
      el.setAttribute("lang", "ar");
      el.setAttribute("dir", "rtl");
    };
  }, []);
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
