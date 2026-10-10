"use client";
// File upload (Components2 · 6). Nothing is sent anywhere: files stay in the browser as object URLs. States: empty
// (dashed drop zone), drag over (2px gold on cream-focus), uploading (simulated progress bar), done (thumbnail,
// dimensions, tier line, «إزالة»), error (2px gold on cream-focus with the hexagon bullet).
import { useCallback, useEffect, useId, useRef, useState, type DragEvent, type ReactNode } from "react";
import { cx } from "@/lib/format";
import { IconUpload } from "./icons";
import { AdminButton } from "./buttons";

export type UploadStatus = "uploading" | "done" | "error";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  url?: string;
  width?: number;
  height?: number;
  progress: number;
  status: UploadStatus;
  error?: string;
  /** Real photos switch the «صورة تعبيرية» label off automatically. */
  tier?: "real" | "generated";
}

export interface FileUploadProps {
  /** Visible label above the control. */
  label?: ReactNode;
  accept?: string;
  maxSizeMB?: number;
  minWidth?: number;
  multiple?: boolean;
  /** Controlled list; uncontrolled when omitted. */
  files?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
  /** Hint line under the drop zone. Default: built from accept / maxSizeMB / minWidth as on the sheet. */
  hint?: ReactNode;
  /** Appended to the min-width error: «… نحتاج 2400 على الأقل للهيرو.» */
  errorContext?: string;
  tier?: "real" | "generated";
  /** Simulate the upload progress (default true; nothing is actually uploaded). */
  simulateProgress?: boolean;
  /** QA: render the drag-over state without a drag. */
  dragOverPreview?: boolean;
  className?: string;
  id?: string;
}

function extLabel(accept: string): string {
  const parts = accept
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.startsWith(".") ? s.slice(1) : s.replace(/^image\//, "").replace("jpeg", "jpg")))
    .map((s) => s.toUpperCase());
  const uniq = Array.from(new Set(parts));
  if (uniq.length <= 1) return uniq[0] ?? "";
  return `${uniq.slice(0, -1).join("، ")} أو ${uniq[uniq.length - 1]}`;
}

export function FileUpload({
  label,
  accept = "image/jpeg,image/png",
  maxSizeMB = 10,
  minWidth = 2400,
  multiple,
  files,
  onChange,
  hint,
  errorContext,
  tier = "real",
  simulateProgress = true,
  dragOverPreview,
  className,
  id,
}: FileUploadProps) {
  const inputId = useId();
  const [internal, setInternal] = useState<UploadedFile[]>([]);
  const list = files ?? internal;
  const listRef = useRef(list);
  useEffect(() => {
    listRef.current = list;
  }, [list]);
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<number[]>([]);

  const commit = useCallback(
    (next: UploadedFile[]) => {
      if (files === undefined) setInternal(next);
      onChange?.(next);
    },
    [files, onChange],
  );
  const update = useCallback(
    (fid: string, patch: Partial<UploadedFile>) => {
      commit(listRef.current.map((f) => (f.id === fid ? { ...f, ...patch } : f)));
    },
    [commit],
  );

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach((x) => window.clearInterval(x));
  }, []);

  const defaultHint = `${extLabel(accept)} · حتى ${maxSizeMB} MB · ${minWidth} عرضاً على الأقل`;

  const accepts = (file: File) => {
    const list = accept.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (!list.length) return true;
    const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
    return list.some((a) => (a.startsWith(".") ? a === ext : a.endsWith("/*") ? file.type.startsWith(a.slice(0, -1)) : a === file.type.toLowerCase()));
  };

  const addFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    const picked = multiple ? arr : arr.slice(0, 1);
    const next: UploadedFile[] = picked.map((file) => ({ id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`, name: file.name, size: file.size, progress: 0, status: "uploading", tier }));
    commit(multiple ? [...listRef.current, ...next] : next);
    picked.forEach((file, i) => {
      const entry = next[i];
      if (!accepts(file)) {
        update(entry.id, { status: "error", error: `النوع غير مدعوم · ${defaultHint}` });
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        update(entry.id, { status: "error", error: `الملف ${(file.size / 1024 / 1024).toFixed(1)} MB · الحد ${maxSizeMB} MB` });
        return;
      }
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (minWidth && w < minWidth) {
          update(entry.id, { url, width: w, height: h, status: "error", error: `الصورة ${w} عرضاً فقط. نحتاج ${minWidth} على الأقل${errorContext ? ` ${errorContext}` : ""}.` });
          return;
        }
        if (!simulateProgress) {
          update(entry.id, { url, width: w, height: h, progress: 100, status: "done" });
          return;
        }
        let p = 0;
        const t = window.setInterval(() => {
          p = Math.min(100, p + 8);
          if (p >= 100) {
            window.clearInterval(t);
            update(entry.id, { url, width: w, height: h, progress: 100, status: "done" });
          } else update(entry.id, { progress: p });
        }, 70);
        timers.current.push(t);
      };
      img.onerror = () => update(entry.id, { url, status: "error", error: `النوع غير مدعوم · ${defaultHint}` });
      img.src = url;
    });
  };

  const remove = (fid: string) => {
    const f = listRef.current.find((x) => x.id === fid);
    if (f?.url) URL.revokeObjectURL(f.url);
    commit(listRef.current.filter((x) => x.id !== fid));
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const showZone = multiple || list.length === 0;
  const isOver = over || !!dragOverPreview;

  return (
    <div className={cx("flex min-w-0 flex-col gap-2.5 text-[12px] font-bold", className)} id={id}>
      {label && (
        <label htmlFor={inputId} className="text-[12px] font-bold text-muted">
          {label}
        </label>
      )}
      {showZone && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
          className={cx(
            "flex flex-col items-center justify-center gap-1 text-center",
            isOver ? "h-[60px] border-2 border-gold bg-cream-focus font-extrabold" : "h-24 border-[1.5px] border-dashed border-ink bg-cream",
          )}
        >
          {isOver ? (
            "أفلت هنا"
          ) : (
            <>
              <IconUpload className="text-ink" />
              <span>
                اسحب صورة أو{" "}
                <button type="button" onClick={() => inputRef.current?.click()} className="cursor-pointer text-gold-text hover:text-ink hover:underline">
                  اختر ملفاً
                </button>
              </span>
              <span className="text-caption font-semibold text-muted">{hint ?? defaultHint}</span>
            </>
          )}
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={accept}
            multiple={multiple}
            className="sr-only"
            onChange={(e) => {
              if (e.target.files?.length) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      )}
      {list.map((f) => (
        <UploadItem key={f.id} file={f} onRemove={() => remove(f.id)} />
      ))}
    </div>
  );
}

/** One file in its uploading / done / error state. */
export function UploadItem({ file, onRemove }: { file: UploadedFile; onRemove?: () => void }) {
  if (file.status === "error") {
    return (
      <div role="alert" className="flex items-center gap-2 border-2 border-gold bg-cream-focus px-3 py-2.5 text-[12px] font-bold">
        <span aria-hidden className="hex-point size-2 shrink-0 bg-gold" />
        <span className="flex-1">{file.error}</span>
        {onRemove && (
          <AdminButton size="xs" onClick={onRemove} className="h-[30px] text-caption">
            إزالة
          </AdminButton>
        )}
      </div>
    );
  }
  if (file.status === "uploading") {
    return (
      <div className="flex flex-col gap-1.5 border-interactive px-3 py-2.5 text-[12px] font-bold" aria-busy>
        <span className="flex justify-between gap-3">
          <span dir="ltr" className="truncate text-right">
            {file.name}
          </span>
          <span className="tnum">{file.progress}%</span>
        </span>
        <span className="relative block h-1.5 bg-slot" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={file.progress} aria-label={file.name}>
          <span className="absolute inset-y-0 start-0 bg-gold" style={{ width: `${file.progress}%` }} />
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2.5 border-interactive px-3 py-2.5 text-[12px] font-bold">
      {file.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={file.url} alt="" className="h-8 w-12 shrink-0 object-cover" />
      ) : (
        <span aria-hidden className="h-8 w-12 shrink-0 bg-ink-2" />
      )}
      <span className="min-w-0 flex-1">
        <span dir="ltr" className="block truncate text-right tnum">
          {file.name}
          {file.width && file.height ? ` · ${file.width}×${file.height}` : ""}
        </span>
        {file.tier === "real" && <span className="block text-caption font-semibold text-muted">فعلية · الوسم مطفأ تلقائياً</span>}
      </span>
      {onRemove && (
        <AdminButton size="xs" onClick={onRemove} className="h-[30px] text-caption">
          إزالة
        </AdminButton>
      )}
    </div>
  );
}
