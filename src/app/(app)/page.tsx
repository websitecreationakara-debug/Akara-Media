import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { docTotals } from "@/lib/docs";
import { money, fmtDate, PAYMENT_METHODS } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import { Avatar } from "@/components/ui";

export default async function Dashboard() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [monthPayments, openInvoices, pendingQuotes, recentPayments, recentDocs] =
    await Promise.all([
      prisma.payment.aggregate({ _sum: { amount: true }, where: { paidAt: { gte: monthStart } } }),
      prisma.document.findMany({
        where: { type: "INVOICE", status: { in: ["UNPAID", "PARTIAL"] } },
        include: { items: true, payments: true, client: true },
        orderBy: { issueDate: "asc" },
      }),
      prisma.document.count({ where: { type: "QUOTE", status: { in: ["DRAFT", "SENT"] } } }),
      prisma.payment.findMany({
        take: 5,
        orderBy: { paidAt: "desc" },
        include: { document: { include: { client: true } } },
      }),
      prisma.document.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { client: true, items: true, payments: true },
      }),
    ]);

  const outstanding = openInvoices.reduce((s, d) => s + docTotals(d).balance, 0);
  const overdue = openInvoices.filter((d) => d.dueDate && d.dueDate < now);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            {now.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/quotes/new"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:ring-slate-300"
          >
            <PlusIcon /> New Quote
          </Link>
          <Link
            href="/invoices/new"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-teal-500/30 transition hover:bg-teal-600"
          >
            <PlusIcon /> New Invoice
          </Link>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard
          label={`Income — ${now.toLocaleDateString("en-US", { month: "long" })}`}
          value={money(monthPayments._sum.amount ?? 0)}
          tone="green"
          sub="Payments received this month"
          icon={<path d="M3 17l6-6 4 4 8-8M15 7h6v6" />}
        />
        <StatCard
          label="Outstanding (unpaid)"
          value={money(outstanding)}
          tone="amber"
          sub={`${openInvoices.length} open invoice${openInvoices.length === 1 ? "" : "s"}`}
          icon={
            <>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </>
          }
        />
        <StatCard
          label="Pending quotes"
          value={String(pendingQuotes)}
          tone="blue"
          sub="Draft or sent"
          icon={
            <>
              <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
              <path d="M14 3v5h5M9 13h6M9 17h4" />
            </>
          }
        />
      </div>

      {overdue.length > 0 && (
        <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4M12 17h.01" />
              <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-red-800">Overdue invoices</h2>
            <ul className="mt-1 space-y-1 text-sm text-red-700">
              {overdue.map((d) => (
                <li key={d.id}>
                  <Link href={`/invoices/${d.id}`} className="font-semibold underline decoration-red-300 underline-offset-2">
                    {d.number}
                  </Link>{" "}
                  — {d.client.name} — {money(docTotals(d).balance)} due {fmtDate(d.dueDate)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Recent payments">
          {recentPayments.length === 0 ? (
            <Empty text="No payments recorded yet." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentPayments.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  <Avatar name={p.document.client.name} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">
                      <Link href={`/invoices/${p.documentId}`} className="font-semibold text-slate-900 hover:text-teal-600">
                        {p.document.number}
                      </Link>
                      <span className="text-slate-500"> — {p.document.client.name}</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {fmtDate(p.paidAt)} · {PAYMENT_METHODS[p.method] ?? p.method}
                    </div>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-green-600">+{money(p.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent documents">
          {recentDocs.length === 0 ? (
            <Empty
              text={
                <>
                  Nothing yet — start by creating a{" "}
                  <Link href="/quotes/new" className="font-medium text-teal-600 underline">
                    quote
                  </Link>
                  .
                </>
              }
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentDocs.map((d) => (
                <li key={d.id} className="flex items-center gap-3 py-3">
                  <Avatar name={d.client.name} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">
                      <Link
                        href={d.type === "QUOTE" ? `/quotes/${d.id}` : `/invoices/${d.id}`}
                        className="font-semibold text-slate-900 hover:text-teal-600"
                      >
                        {d.number}
                      </Link>
                      <span className="text-slate-500"> — {d.client.name}</span>
                    </div>
                    <div className="text-xs text-slate-400">{fmtDate(d.issueDate)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold tabular-nums">{money(docTotals(d).total)}</span>
                    <StatusBadge status={d.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

const TONES = {
  green: "bg-green-50 text-green-600",
  amber: "bg-amber-50 text-amber-600",
  blue: "bg-blue-50 text-blue-600",
} as const;

function StatCard({
  label,
  value,
  tone,
  sub,
  icon,
}: {
  label: string;
  value: string;
  tone: keyof typeof TONES;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="text-sm font-medium text-slate-500">{label}</div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${TONES[tone]}`}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {icon}
          </svg>
        </div>
      </div>
      <div className="mt-3 text-3xl font-bold tracking-tight tabular-nums text-slate-900">{value}</div>
      <div className="mt-1 h-4 text-xs text-slate-400">{sub}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
      <h2 className="mb-2 text-base font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

function Empty({ text }: { text: React.ReactNode }) {
  return (
    <div className="mt-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
