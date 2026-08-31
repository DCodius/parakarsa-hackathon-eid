import Link from "next/link";

type ButtonTone = "primary" | "accent" | "outline";

const tones: Record<ButtonTone, string> = {
  primary: "bg-primary text-white hover:bg-primary-700",
  accent: "bg-accent text-white hover:brightness-95",
  outline: "border border-hairline bg-surface text-ink hover:border-ink-muted",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition";

export function Button({
  tone = "primary",
  className = "",
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: ButtonTone }) {
  return (
    <button className={`${base} ${tones[tone]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  tone = "primary",
  className = "",
  children,
  ...rest
}: React.ComponentProps<typeof Link> & { tone?: ButtonTone }) {
  return (
    <Link className={`${base} ${tones[tone]} ${className}`} {...rest}>
      {children}
    </Link>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-canvas-alt px-3 py-1 text-xs font-medium text-ink-soft">
      {children}
    </span>
  );
}

/** Emerald tick: the claim behind it was checked against an e.id credential. */
export function VerifiedTick({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-label="Terverifikasi" role="img">
      <circle cx="8" cy="8" r="8" fill="var(--color-primary)" />
      <path
        d="m4.6 8.2 2.2 2.2 4.6-4.8"
        fill="none"
        stroke="#fff"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Badge({
  tone = "green",
  children,
}: {
  tone?: "green" | "amber";
  children: React.ReactNode;
}) {
  const styles =
    tone === "green"
      ? "bg-badge-green text-primary"
      : "bg-badge-amber text-accent";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles}`}
    >
      {children}
    </span>
  );
}

export function SectionTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`display text-2xl text-primary md:text-3xl ${className}`}>{children}</h2>
  );
}
