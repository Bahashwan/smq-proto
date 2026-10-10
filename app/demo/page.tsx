import { allScreens, SECTIONS } from "@/lib/screens";
import Link from "next/link";

export const metadata = { title: "خريطة الشاشات" };

export default function DemoPage() {
  return (
    <main className="container-smq py-10">
      <h1 className="text-h1">خريطة الشاشات</h1>
      {SECTIONS.map((section) => {
        const rows = allScreens.filter((s) => s.section === section);
        if (!rows.length) return null;
        return (
          <section key={section} className="mt-8">
            <h2 className="text-h2">{section}</h2>
            <ul className="mt-3 divide-y divide-line border-hairline">
              {rows.map((s) => (
                <li key={s.board + s.route} className="flex items-center gap-4 px-4 py-2 text-label">
                  <span className="w-56 font-bold">{s.board}</span>
                  <Link href={s.route} className="text-gold-text underline" dir="ltr">{s.route}</Link>
                  <span className="text-caption text-muted">{s.width}</span>
                  {s.note && <span className="text-caption text-muted">{s.note}</span>}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
