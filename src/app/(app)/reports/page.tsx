import { prisma } from "@/lib/prisma";
import { money, round2, PAYMENT_METHODS } from "@/lib/format";

export default async function ReportsPage() {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [recentPayments, yearPayments, invoiceItems] = await Promise.all([
    prisma.payment.findMany({ where: { paidAt: { gte: sixMonthsAgo } }, select: { amount: true, paidAt: true } }),
    prisma.payment.findMany({ where: { paidAt: { gte: yearStart } }, select: { amount: true, method: true } }),
    prisma.lineItem.findMany({
      where: { document: { type: "INVOICE", status: { not: "VOID" } } },
      select: { name: true, qty: true, unitPrice: true },
    }),
  ]);

  // income per month, last 6 months
  const months: { label: string; total: number }[] = [];
  for (let k = 5; k >= 0; k--) {
    const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
    const total = recentPayments
      .filter((p) => p.paidAt.getFullYear() === d.getFullYear() && p.paidAt.getMonth() === d.getMonth())
      .reduce((s, p) => s + p.amount, 0);
    months.push({ label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }), total: round2(total) });
  }
  const maxMonth = Math.max(1, ...months.map((m) => m.total));

  // income by method this year
  const byMethod = new Map<string, number>();
  for (const p of yearPayments) byMethod.set(p.method, (byMethod.get(p.method) ?? 0) + p.amount);

  // top billed services
  const byService = new Map<string, { total: number; qty: number }>();
  for (const i of invoiceItems) {
    const cur = byService.get(i.name) ?? { total: 0, qty: 0 };
    cur.total += i.qty * i.unitPrice;
    cur.qty += i.qty;
    byService.set(i.name, cur);
  }
  const topServices = [...byService.entries()].sort((a, b) => b[1].total - a[1].total).slice(0, 10);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Reports</h1>

      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-4 font-semibold">Income received — last 6 months</h2>
        <div className="flex h-48 items-end gap-3">
          {months.map((m) => (
            <div key={m.label} className="flex flex-1 flex-col items-center gap-1">
              <div className="text-xs font-medium text-slate-600">{m.total > 0 ? money(m.total) : ""}</div>
              <div
                className="w-full rounded-t bg-slate-800"
                style={{ height: `${Math.max(2, (m.total / maxMonth) * 100)}%` }}
              />
              <div className="text-xs text-slate-400">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 font-semibold">Income by payment method — {now.getFullYear()}</h2>
          {byMethod.size === 0 ? (
            <p className="text-sm text-slate-500">No payments this year.</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {[...byMethod.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([method, total]) => (
                  <li key={method} className="flex justify-between py-2">
                    <span>{PAYMENT_METHODS[method] ?? method}</span>
                    <span className="font-medium">{money(total)}</span>
                  </li>
                ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 font-semibold">Top services billed (all time)</h2>
          {topServices.length === 0 ? (
            <p className="text-sm text-slate-500">No invoiced items yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {topServices.map(([name, v]) => (
                <li key={name} className="flex justify-between gap-4 py-2">
                  <span className="min-w-0 truncate">{name}</span>
                  <span className="shrink-0 font-medium">{money(v.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
