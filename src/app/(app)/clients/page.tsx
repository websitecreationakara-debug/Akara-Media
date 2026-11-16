import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { docTotals } from "@/lib/docs";
import { fmtDate, money } from "@/lib/format";
import { PageHeader, EmptyState, TableCard, Avatar, SummaryCard, th, thRight, td } from "@/components/ui";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const q = ((Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "").trim();

  const all = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      documents: { include: { items: true, payments: true } },
    },
  });

  const rows = all.map((c) => {
    const invoices = c.documents.filter((d) => d.type === "INVOICE" && d.status !== "VOID");
    const totals = invoices.map(docTotals);
    return {
      ...c,
      docCount: c.documents.length,
      billed: totals.reduce((s, t) => s + t.total, 0),
      due: totals.reduce((s, t) => s + t.balance, 0),
    };
  });

  const needle = q.toLowerCase();
  const shown = needle
    ? rows.filter((c) => [c.name, c.company, c.phone, c.email].some((v) => v.toLowerCase().includes(needle)))
    : rows;

  const totalDue = rows.reduce((s, c) => s + c.due, 0);
  const owing = rows.filter((c) => c.due > 0).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Clients"
        subtitle={`${all.length} client${all.length === 1 ? "" : "s"}`}
        action={{ href: "/clients/new", label: "Add Client" }}
      />

      {all.length === 0 ? (
        <EmptyState
          icon={
            <>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
            </>
          }
          title="No clients yet"
          text="Add your first client to start creating quotes and invoices."
          action={{ href: "/clients/new", label: "Add your first client" }}
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-3">
            <SummaryCard
              label="Total clients"
              value={String(all.length)}
              tone="teal"
              icon={
                <>
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
                </>
              }
            />
            <SummaryCard
              label="Clients with a balance"
              value={String(owing)}
              tone="amber"
              icon={
                <>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </>
              }
            />
            <SummaryCard
              label="Total owed"
              value={money(totalDue)}
              tone="green"
              icon={<path d="M12 3v18M16 7.5c0-1.4-1.8-2.5-4-2.5s-4 1.1-4 2.5 1.8 2.5 4 2.5 4 1.1 4 2.5-1.8 2.5-4 2.5-4-1.1-4-2.5" />}
            />
          </div>

          <form action="/clients" className="relative max-w-md">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by name, company, phone or email…"
              className="w-full rounded-xl border-0 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </form>

          {shown.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
              No clients match “{q}”.{" "}
              <Link href="/clients" className="font-medium text-teal-600 underline">
                Clear search
              </Link>
            </div>
          ) : (
            <TableCard>
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className={th}>Name</th>
                  <th className={th}>Phone</th>
                  <th className={th}>Docs</th>
                  <th className={thRight}>Billed</th>
                  <th className={thRight}>Balance</th>
                  <th className={th}>Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shown.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-slate-50/80">
                    <td className={td}>
                      <Link href={`/clients/${c.id}`} className="flex items-center gap-3">
                        <Avatar name={c.name} />
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-slate-900 hover:text-teal-600">{c.name}</div>
                          <div className="truncate text-xs text-slate-400">{c.company || c.email || "—"}</div>
                        </div>
                      </Link>
                    </td>
                    <td className={`${td} text-slate-600`}>{c.phone || "—"}</td>
                    <td className={td}>
                      <span className="inline-flex min-w-7 justify-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                        {c.docCount}
                      </span>
                    </td>
                    <td className={`${td} text-right font-semibold tabular-nums text-slate-800`}>{money(c.billed)}</td>
                    <td
                      className={`${td} text-right font-semibold tabular-nums ${
                        c.due > 0 ? "text-amber-600" : "text-slate-300"
                      }`}
                    >
                      {money(c.due)}
                    </td>
                    <td className={`${td} text-slate-500`}>{fmtDate(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </TableCard>
          )}
        </>
      )}
    </div>
  );
}
