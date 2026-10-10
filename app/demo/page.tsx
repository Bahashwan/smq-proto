import Link from "next/link";
import { allScreens, SECTIONS } from "@/lib/screens";
import { TOURS, tourHref } from "@/lib/tours";
import { PRESENTER_PARAMS } from "@/lib/presenter";

export const metadata = { title: "خريطة الشاشات" };

export default function DemoPage() {
  return (
    <main className="container-smq py-10 flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="m-0 text-h1">خريطة الشاشات</h1>
        <p className="m-0 text-body text-muted">كل لوحة تصميم كرابط إلى حالتها. شريط العرض: <kbd className="border px-1">Shift</kbd>+<kbd className="border px-1">P</kbd> خارج الحقول أو <code dir="ltr">?demo=1</code>. الزوار لا يرون هذه الصفحة في أي رابط عام.</p>
        <div className="flex flex-wrap gap-3 text-label">
          <Link href="/demo/components" className="underline text-gold-text">ورقة المكونات</Link>
          <Link href="/demo/contact-sheet" className="underline text-gold-text">لوحة مرشحات الصور</Link>
          <Link href="/?demo=1" className="underline text-gold-text">الرئيسية مع شريط العرض</Link>
        </div>
      </header>

      <section>
        <h2 className="m-0 text-h2">الجولات</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          {TOURS.map((t) => (
            <div key={t.id} className="border-interactive p-5 flex flex-col gap-2">
              <h3 className="m-0 text-h3">{t.title}</h3>
              <p className="m-0 text-label font-normal text-muted">{t.intro}</p>
              <ol className="m-0 ps-5 text-caption text-muted list-decimal">{t.steps.map((s) => <li key={s.route + s.title}>{s.title}</li>)}</ol>
              <Link href={tourHref(t, 1)} className="mt-2 inline-flex min-h-11 items-center justify-center bg-gold text-ink cut-s px-4 text-label font-extrabold">ابدأ الجولة</Link>
            </div>
          ))}
        </div>
      </section>

      {SECTIONS.map((section) => {
        const rows = allScreens.filter((s) => s.section === section);
        if (!rows.length) return null;
        return (
          <section key={section}>
            <h2 className="m-0 text-h2">{section}</h2>
            <ul className="mt-3 divide-y divide-line border-hairline m-0 p-0 list-none">
              {rows.map((s) => (
                <li key={s.board + s.route + s.width} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 text-label">
                  <span className="w-56 font-bold">{s.board}</span>
                  <Link href={s.route} className="text-gold-text underline break-all" dir="ltr">{s.route}</Link>
                  <span className="text-caption text-muted tnum">{s.width}</span>
                  {s.note && <span className="text-caption text-muted">{s.note}</span>}
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section>
        <h2 className="m-0 text-h2">معاملات العرض</h2>
        <table className="mt-3 w-full text-label border-hairline">
          <thead className="bg-cream text-caption text-muted"><tr><th className="text-start p-2">المفتاح</th><th className="text-start p-2">المعامل</th><th className="text-start p-2">القيم</th></tr></thead>
          <tbody>
            {(Object.keys(PRESENTER_PARAMS) as (keyof typeof PRESENTER_PARAMS)[]).map((k) => (
              <tr key={k} className="border-t border-line"><td className="p-2">{PRESENTER_PARAMS[k].label}</td><td className="p-2" dir="ltr"><code>{k}</code></td><td className="p-2" dir="ltr">{PRESENTER_PARAMS[k].values}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
