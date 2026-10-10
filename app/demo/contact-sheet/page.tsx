import fs from "node:fs";
import path from "node:path";
import { media } from "@/data/media";

export const metadata = { title: "لوحة مرشحات الصور" };

interface Candidate { file: string; url: string }
function readCandidates(): Record<string, Candidate[]> {
  const dir = path.resolve("public/images/_candidates");
  const out: Record<string, Candidate[]> = {};
  if (!fs.existsSync(dir)) return out;
  for (const slot of fs.readdirSync(dir)) {
    const d = path.join(dir, slot);
    if (!fs.statSync(d).isDirectory()) continue;
    out[slot] = fs.readdirSync(d).filter((f) => /\.(png|jpg|webp)$/i.test(f)).sort().map((f) => ({ file: f, url: `/images/_candidates/${slot}/${f}` }));
  }
  return out;
}
function readPicks(): Record<string, { candidate: string; note?: string; model?: string }> {
  const p = path.resolve("scripts/images/picks.json");
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : {};
}

export default function ContactSheetPage() {
  const candidates = readCandidates();
  const picks = readPicks();
  const slots = media.filter((m) => m.group !== "founder");
  const withFiles = slots.filter((m) => candidates[m.id]?.length);
  return (
    <main className="container-smq py-10 flex flex-col gap-8">
      <header>
        <h1 className="m-0 text-h1">لوحة مرشحات الصور</h1>
        <p className="m-0 mt-2 text-body text-muted">مرشّحان لكل خانة من <code dir="ltr">public/images/_candidates</code> (لا تُرفع إلى المستودع). الاختيار يُسجَّل بـ <code dir="ltr">scripts/images/pick.ts</code>. {withFiles.length} من {slots.length} خانة لديها مرشحات على هذا البناء.</p>
      </header>
      {slots.map((m) => {
        const list = candidates[m.id] ?? [];
        const pick = picks[m.id];
        return (
          <section key={m.id} className="border-hairline p-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="m-0 text-h3" dir="ltr">{m.id}</h2>
              <span className="text-label text-muted">{m.titleAr} · {m.ratio}</span>
              {m.reference && <span className="text-caption font-bold bg-gold text-ink px-2 py-0.5 hex-flat">مرجع</span>}
              {pick && <span className="text-caption font-bold border border-gold text-gold-text px-2 py-0.5">المختار: {pick.candidate}{pick.note ? ` · ${pick.note}` : ""}</span>}
            </div>
            {list.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {list.map((c) => (
                  <figure key={c.file} className={`m-0 bg-slot ${pick && c.file.endsWith(`${pick.candidate}.png`) ? "outline outline-3 outline-gold" : ""}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.url} alt="" loading="lazy" className="w-full h-auto" />
                    <figcaption className="text-caption text-muted p-2" dir="ltr">{c.file}</figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <p className="m-0 text-caption text-muted">لا مرشحات بعد لهذه الخانة.</p>
            )}
          </section>
        );
      })}
    </main>
  );
}
