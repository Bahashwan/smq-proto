// Saudi riyal sign · inline SVG at 0.75em, currentColor. Placeholder path from the Tokens sheet;
// replace with the official SAMA SVG when it is dropped at design/brand/riyal.svg.
export function RiyalSign({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 24"
      aria-label="ريال سعودي"
      role="img"
      className={`inline-block align-[-0.08em] ${className}`}
      style={{ height: "0.75em", width: "auto" }}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 2v15l-3 2.5M11 5v10M2 13.5l15-5M2 19.5l15-5" />
    </svg>
  );
}
