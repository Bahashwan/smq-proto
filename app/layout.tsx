import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { PresenterProvider } from "@/lib/presenter";
import { AppShell } from "@/components/presenter/AppShell";

export const metadata: Metadata = {
  title: { default: "إس إم كيو العقارية", template: "%s · إس إم كيو العقارية" },
  description: "نموذج أولي · إس إم كيو العقارية، جدة",
  robots: { index: false, follow: false, noarchive: true, nocache: true },
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/favicon-32.png", sizes: "32x32" }], apple: "/apple-touch-icon.png" },
  metadataBase: new URL("https://smq-prototype.vercel.app"),
  manifest: "/manifest.webmanifest",
  // OG-Home serves every page without its own preview (About, Services, Contact …)
  openGraph: { type: "website", locale: "ar_SA", siteName: "إس إم كيو العقارية", images: [{ url: "/og/home.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/og/home.png"] },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#141311" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        <PresenterProvider>
          <AppShell>{children}</AppShell>
        </PresenterProvider>
      </body>
    </html>
  );
}
