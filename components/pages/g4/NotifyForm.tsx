"use client";
// «نبّهني» (Projects-M/D, the draft project card): one phone field, validated as Contact-Error-M words it, and an
// inline confirmation. Nothing is sent: the number is kept in the in-memory store (patches.notify[projectId]).
import { useRef, useState, type FormEvent } from "react";
import { TextField } from "@/components/ui";
import { useStore } from "@/lib/store";
import { cx } from "@/lib/format";
import { checkPhone, maskPhone } from "./lib";
import { GoldHex } from "./parts";
import { CheckIcon } from "@/components/ui";

export function NotifyForm({ projectId, className }: { projectId: string; className?: string }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const patch = useStore((s) => s.patch);
  const input = useRef<HTMLInputElement>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const c = checkPhone(value);
    if (!c.ok) {
      setError(c.message);
      input.current?.focus();
      return;
    }
    setError(null);
    setDone(maskPhone(c.digits));
    patch("notify", projectId, { phone: c.digits, at: new Date().toISOString() });
  };

  if (done) {
    return (
      <div role="status" className={cx("flex items-start gap-3 border-[1.5px] border-gold bg-cream-focus px-3.5 py-3", className)}>
        <GoldHex className="size-8">
          <CheckIcon size={16} />
        </GoldHex>
        <p className="m-0 text-label font-normal leading-relaxed">
          <strong className="font-extrabold">سجّلنا رقمك</strong> <span dir="ltr" className="tnum">{done}</span>. نرسل لك الأسعار أول ما تُنشر، رسالة واحدة فقط.{" "}
          <button type="button" onClick={() => setDone(null)} className="inline-flex min-h-11 items-center border-0 bg-transparent p-0 text-label font-bold text-gold-text underline hover:text-ink">
            رقم آخر
          </button>
        </p>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submit} className={cx("flex items-start gap-2", className)}>
      <TextField
        ref={input}
        id={`notify-${projectId}`}
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        ltr
        placeholder="05XXXXXXXX"
        aria-label="رقم الجوال"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (error) setError(null);
        }}
        error={error ?? undefined}
        wrapperClassName="flex-1"
      />
      <button type="submit" className="inline-flex h-12 shrink-0 items-center justify-center bg-gold px-5 text-label font-extrabold text-ink cut-s hover:bg-gold-hover motion-hover transition-colors">
        نبّهني
      </button>
    </form>
  );
}
