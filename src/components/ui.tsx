import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-teal-500/30 transition hover:bg-teal-600"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-teal-500/30 transition hover:bg-teal-600"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function TableCard({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

const thBase = "px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400";
export const th = `${thBase} text-left`;
export const thRight = `${thBase} text-right`;
export const thCenter = `${thBase} text-center`;
export const td = "px-5 py-4";

export function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
      {initials || "?"}
    </div>
  );
}

export function FilterTabs({
  tabs,
  active,
  basePath,
  param = "status",
}: {
  tabs: { key: string; label: string; count: number }[];
  active: string;
  basePath: string;
  param?: string;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 w-fit">
      {tabs.map((t) => {
        const on = t.key === active;
        return (
          <Link
            key={t.key}
            href={t.key === "all" ? basePath : `${basePath}?${param}=${t.key}`}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
              on ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
            <span className={`rounded-full px-1.5 text-xs font-semibold ${on ? "bg-teal-50 text-teal-700" : "bg-slate-200/70 text-slate-500"}`}>
              {t.count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export function SummaryCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone: "teal" | "green" | "amber";
  icon: ReactNode;
}) {
  const tones = {
    teal: "bg-teal-50 text-teal-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
  } as const;
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </div>
      <div>
        <div className="text-sm text-slate-500">{label}</div>
        <div className="text-2xl font-bold tracking-tight tabular-nums text-slate-900">{value}</div>
      </div>
    </div>
  );
}

export const inputCls =
  "w-full rounded-xl border-0 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm ring-1 ring-slate-200 transition placeholder:text-slate-400 hover:ring-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export function FormSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {icon}
          </svg>
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {description && <p className="text-sm text-slate-500">{description}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
