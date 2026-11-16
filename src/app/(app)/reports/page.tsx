import { prisma } from "@/lib/prisma";
import { money, round2, PAYMENT_METHODS } from "@/lib/format";
import { PageHeader, SummaryCard } from "@/components/ui";

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
    months.push({ label: d.toLocaleDateString("en-US", { month: "short" }), total: round2(total) });
  }
  const maxMonth = Math.max(1, ...months.map((m) => m.total));
  const thisMonth = months[5].total;
  const lastMonth = months[4].total;
  const change = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null;

  // income by method this year
  const byMethod = new Map<string, number>();
  for (const p of yearPayments) byMethod.set(p.method, (byMethod.get(p.method) ?? 0) + p.amount);
  const methods = [...byMethod.entries()].sort((a, b) => b[1] - a[1]);
  const yearTotal = round2(yearPayments.reduce((s, p) => s + p.amount, 0));

  // top billed services
  const byService = new Map<string, { total: number; qty: number }>();
  for (const i of invoiceItems) {
    const cur = byService.get(i.name) ?? { total: 0, qty: 0 };
    cur.total += i.qty * i.unitPrice;
    cur.qty += i.qty;
    byService.set(i.name, cur);
  }
  const topServices = [...byService.entries()].sort((a, b) => b[1].total - a[1].total).slice(0, 10);
  const maxService = Math.max(1, ...topServices.map(([, v]) => v.total));

  const avgPayment = yearPayments.length ? yearTotal / yearPayments.length : 0;

  return (
    <div className="space-y-8">
      <PageHeader title="Reports" subtitle={`Income and sales overview — ${now.getFullYear()}`} />

      <div className="grid gap-5 sm:grid-cols-3">
        <SummaryCard
          label={`Income ${now.getFullYear()}`}
          value={money(yearTotal)}
          tone="teal"
          icon={<path d="M3 17l6-6 4 4 8-8M15 7h6v6" />}
        />
        <SummaryCard
          label={`This month${change !== null ? ` (${change >= 0 ? "+" : ""}${change}% vs last)` : ""}`}
          value={money(thisMonth)}
          tone="green"
          icon={
            <>
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18M8 3v4M16 3v4" />
            </>
          }
        />
        <SummaryCard
          label={`Average payment (${yearPayments.length})`}
          value={money(avgPayment)}
          tone="amber"
          icon={
            <>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v10M9.5 9.5c0-1 1-1.5 2.5-1.5s2.5.6 2.5 1.7-1 1.5-2.5 1.8-2.5.7-2.5 1.8 1 1.7 2.5 1.7 2.5-.5 2.5-1.5" />
            </>
          }
        />
      </div>

      <Card title="Income received" sub="Last 6 months">
        <div className="relative mt-6 h-64">
          {/* gridlines */}
          <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="border-t border-dashed border-slate-100" />
            ))}
          </div>
          <div className="relative flex h-full items-stretch gap-3 sm:gap-6">
            {months.map((m, idx) => {
              const current = idx === months.length - 1;
              return (
                <div key={m.label + idx} className="flex flex-1 flex-col">
                  <div className="flex flex-1 items-end justify-center pt-6">
                    <div
                      title={money(m.total)}
                      className={`relative w-full max-w-16 rounded-t-xl transition-all ${
                        m.total === 0
                          ? "bg-slate-100"
                          : current
                            ? "bg-gradient-to-t from-teal-500 to-teal-300"
                            : "bg-gradient-to-t from-slate-800 to-slate-600"
                      }`}
                      style={{ height: `${m.total === 0 ? 4 : Math.max(6, (m.total / maxMonth) * 100)}%` }}
                    >
                      {m.total > 0 && (
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-slate-700">
                          {money(m.total)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`mt-3 h-5 text-center text-xs font-medium ${current ? "text-teal-600" : "text-slate-400"}`}>
                    {m.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Income by payment method" sub={`${now.getFullYear()}`}>
          {methods.length === 0 ? (
            <Empty text="No payments this year yet." />
          ) : (
            <ul className="mt-4 space-y-4">
              {methods.map(([method, total]) => {
                const pct = yearTotal > 0 ? (total / yearTotal) * 100 : 0;
                return (
                  <li key={method}>
                    <div className="mb-1.5 flex items-baseline justify-between text-sm">
                      <span className="font-medium text-slate-700">{PAYMENT_METHODS[method] ?? method}</span>
                      <span>
                        <span className="font-semibold tabular-nums text-slate-900">{money(total)}</span>
                        <span className="ml-2 text-xs text-slate-400">{Math.round(pct)}%</span>
                      </span>
                    </div>
                    <Bar pct={pct} />
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card title="Top services billed" sub="All time">
          {topServices.length === 0 ? (
            <Empty text="No invoiced items yet." />
          ) : (
            <ol className="mt-4 space-y-4">
              {topServices.map(([name, v], i) => (
                <li key={name} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-baseline justify-between gap-4 text-sm">
                      <span className="truncate font-medium text-slate-700">{name}</span>
                      <span className="shrink-0 font-semibold tabular-nums text-slate-900">{money(v.total)}</span>
                    </div>
                    <Bar pct={(v.total / maxService) * 100} />
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </div>
  );
}

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {sub && <span className="text-xs font-medium text-slate-400">{sub}</span>}
      </div>
      {children}
    </section>
  );
}

function Bar({ pct }: { pct: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-500"
        style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
      />
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}
