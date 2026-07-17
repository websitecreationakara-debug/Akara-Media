import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { docTotals } from "@/lib/docs";
import { money, fmtDate, PAYMENT_METHODS } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/quotes/new" className="rounded-lg bg-white px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
            + New Quote
          </Link>
          <Link href="/invoices/new" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
            + New Invoice
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={`Income — ${now.toLocaleDateString("en-US", { month: "long" })}`} value={money(monthPayments._sum.amount ?? 0)} accent="text-green-600" />
        <StatCard label="Outstanding (unpaid)" value={money(outstanding)} accent="text-amber-600" sub={`${openInvoices.length} open invoice${openInvoices.length === 1 ? "" : "s"}`} />
        <StatCard label="Pending quotes" value={String(pendingQuotes)} accent="text-blue-600" />
      </div>

      {overdue.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <h2 className="mb-2 font-semibold text-red-700">⚠ Overdue invoices</h2>
          <ul className="space-y-1 text-sm">
            {overdue.map((d) => (
              <li key={d.id}>
                <Link href={`/invoices/${d.id}`} className="text-red-700 underline">
                  {d.number}
                </Link>{" "}
                — {d.client.name} — {money(docTotals(d).balance)} due {fmtDate(d.dueDate)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 font-semibold">Recent payments</h2>
          {recentPayments.length === 0 ? (
            <p className="text-sm text-slate-500">No payments recorded yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {recentPayments.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <div>
                    <Link href={`/invoices/${p.documentId}`} className="font-medium hover:underline">
                      {p.document.number}
                    </Link>
                    <span className="text-slate-500"> — {p.document.client.name}</span>
                    <div className="text-xs text-slate-400">
                      {fmtDate(p.paidAt)} · {PAYMENT_METHODS[p.method] ?? p.method}
                    </div>
                  </div>
                  <span className="font-semibold text-green-600">+{money(p.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 font-semibold">Recent documents</h2>
          {recentDocs.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nothing yet — start by creating a{" "}
              <Link href="/quotes/new" className="underline">quote</Link>.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {recentDocs.map((d) => (
                <li key={d.id} className="flex items-center justify-between py-2">
                  <div>
                    <Link
                      href={d.type === "QUOTE" ? `/quotes/${d.id}` : `/invoices/${d.id}`}
                      className="font-medium hover:underline"
                    >
                      {d.number}
                    </Link>
                    <span className="text-slate-500"> — {d.client.name}</span>
                    <div className="text-xs text-slate-400">{fmtDate(d.issueDate)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{money(docTotals(d).total)}</span>
                    <StatusBadge status={d.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent, sub }: { label: string; value: string; accent: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${accent}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}
