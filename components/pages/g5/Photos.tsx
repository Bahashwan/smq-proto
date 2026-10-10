"use client";
// «صور العقار» (Add-M, Add-Step3-D): choose or take up to ten photos, local previews only (object URLs kept in this
// tab's memory; nothing is uploaded), × removes, the first is «الغلاف», drag to reorder on desktop, «+7 متاحة» opens
// the picker again. The draft keeps the names, so after a reload the tiles stay as neutral frames.
import { useRef, useState, type DragEvent } from "react";
import { ErrorText } from "@/components/ui";
import { cx } from "@/lib/format";
import { PHOTOS_MAX, type Photo } from "./draft";
import { HexBadge, UploadIcon } from "./parts";

const urls = new Map<string, string>();
const MAX_BYTES = 10 * 1024 * 1024;
let seq = 0;

export function Photos({ photos, onChange }: { photos: Photo[]; onChange: (p: Photo[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState(false);
  const left = PHOTOS_MAX - photos.length;

  const add = (files: FileList | File[]) => {
    const list = Array.from(files);
    const bad: string[] = [];
    const next = [...photos];
    for (const f of list) {
      if (!/^image\/(jpeg|png)$/.test(f.type)) {
        bad.push(`${f.name}: الصور بصيغة JPG أو PNG فقط.`);
        continue;
      }
      if (f.size > MAX_BYTES) {
        bad.push(`${f.name}: الصورة أكبر من 10 ميجابايت.`);
        continue;
      }
      if (next.length >= PHOTOS_MAX) {
        bad.push(`وصلت إلى ${PHOTOS_MAX} صور، الحد الأعلى.`);
        break;
      }
      const id = `p-${Date.now().toString(36)}-${seq++}`;
      urls.set(id, URL.createObjectURL(f));
      next.push({ id, name: f.name });
    }
    setErrors(bad);
    onChange(next);
  };
  const remove = (id: string) => {
    const u = urls.get(id);
    if (u) URL.revokeObjectURL(u);
    urls.delete(id);
    onChange(photos.filter((p) => p.id !== id));
  };
  const move = (from: number, to: number) => {
    if (from === to) return;
    const next = [...photos];
    const [p] = next.splice(from, 1);
    next.splice(to, 0, p);
    onChange(next);
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    if (e.dataTransfer.files?.length) add(e.dataTransfer.files);
  };

  return (
    <div className="flex min-w-0 flex-col gap-2.5">
      <label htmlFor="add-photos" className="text-label font-bold text-ink md:font-extrabold">
        صور العقار{" "}
        <span className="text-caption font-medium text-muted md:text-label">
          <span className="md:hidden">(حتى 10، من جوالك يكفي)</span>
          <span className="hidden md:inline">(حتى 10، من الجوال يكفي)</span>
        </span>
      </label>
      <div className="flex flex-col gap-2.5 md:grid md:grid-cols-[220px_minmax(0,1fr)] md:items-start md:gap-3">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
          className={cx(
            "relative flex flex-col items-center justify-center gap-2 border-[1.5px] border-dashed border-ink px-4 py-6 text-center has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold md:min-h-45",
            over ? "bg-cream-focus" : "bg-cream",
          )}
        >
          <HexBadge tone="gold" className="size-10">
            <UploadIcon className="size-4.5" />
          </HexBadge>
          <span className="text-label font-bold text-ink">
            <span className="md:hidden">اضغط لاختيار الصور أو التقطها الآن</span>
            <span className="hidden md:inline">اسحب الصور هنا أو اختر</span>
          </span>
          <span className="text-caption font-normal text-muted">
            JPG أو PNG · حتى 10 ميجابايت<span className="md:hidden"> للصورة</span>
          </span>
          <input
            ref={input}
            id="add-photos"
            type="file"
            accept="image/jpeg,image/png"
            multiple
            disabled={left <= 0}
            className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
            onChange={(e) => {
              if (e.target.files?.length) add(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <ul className="m-0 grid list-none grid-cols-4 gap-2 p-0 md:grid-cols-5" aria-label="الصور المختارة">
            {photos.map((p, i) => {
              const src = urls.get(p.id);
              return (
                <li
                  key={p.id}
                  draggable
                  onDragStart={() => setDrag(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (drag !== null) move(drag, i);
                    setDrag(null);
                  }}
                  title={p.name}
                  className={cx("relative aspect-square overflow-hidden bg-slot md:aspect-[3/2]", drag === i && "opacity-60")}
                >
                  {/* a local preview of the visitor's own file, never a generated image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {src && <img src={src} alt="" className="absolute inset-0 size-full object-cover" />}
                  <button
                    type="button"
                    aria-label={`حذف الصورة ${i + 1}`}
                    onClick={() => remove(p.id)}
                    className="absolute start-1 top-1 inline-flex size-6 items-center justify-center bg-ink text-label font-bold leading-none text-paper hover:bg-ink-2 after:absolute after:-inset-2.5 after:content-['']"
                  >
                    ×
                  </button>
                  {i === 0 && <span className="absolute bottom-1 end-1 bg-gold px-1.5 py-0.5 text-caption font-bold leading-tight text-ink">الغلاف</span>}
                </li>
              );
            })}
            {left > 0 && (
              <li className="contents">
                <button
                  type="button"
                  onClick={() => input.current?.click()}
                  className="flex aspect-square items-center justify-center border border-line bg-paper text-caption font-normal text-muted hover:bg-cream md:aspect-[3/2]"
                >
                  {`+${left} متاحة`}
                </button>
              </li>
            )}
          </ul>
          <span className="hidden text-caption font-normal text-muted md:block">الصورة الأولى هي الغلاف. اسحب لإعادة الترتيب. صور الأشخاص تُحذف قبل النشر.</span>
          {errors.map((e) => (
            <ErrorText key={e}>{e}</ErrorText>
          ))}
        </div>
      </div>
    </div>
  );
}
