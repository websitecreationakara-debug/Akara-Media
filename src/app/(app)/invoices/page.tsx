import { prisma } from "@/lib/prisma";
import DocTable from "@/components/DocTable";
import { docTotals } from "@/lib/docs";
import { money } from "@/lib/format";
import { PageHeader, EmptyState, FilterTabs, SummaryCard } from "@/components/ui";

const TABS = [
  { key: "all", label: "All" },
  { key: "UNPAID", label: "Unpaid" },
  { key: "PARTIAL", label: "Partial" },
  { key: "PAID", label: "Paid" },
  { key: "VOID", label: "Void" },
];

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const active = TABS.some((t) => t.key === raw) ? (raw as string) : "all";

  const invoices = await prisma.document.findMany({
    where: { type: "INVOICE" },
    include: { client: true, items: true, payments: true },
    orderBy: { createdAt: "desc" },
  });

  const live = invoices.filter((d) => d.status !== "VOID");
  const sums = live.reduce(
    (a, d) => {
      const t = docTotals(d);
      return { billed: a.billed + t.total, paid: a.paid + t.paid, due: a.due + t.balance };
    },
    { billed: 0, paid: 0, due: 0 },
  );

  const tabs = TABS.map((t) => ({
    ...t,
    count: t.key === "all" ? invoices.length : invoices.filter((d) => d.status === t.key).length,
  }));
  const shown = active === "all" ? invoices : invoices.filter((d) => d.status === active);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Invoices"
        subtitle={`${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`}
        action={{ href: "/invoices/new", label: "New Invoice" }}
      />

      {invoices.length === 0 ? (
        <EmptyState
          icon={
            <>
              <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
              <path d="M9 8h6M9 12h6" />
            </>
          }
          title="No invoices yet"
          text="Create an invoice to bill a client and track payments."
          action={{ href: "/invoices/new", label: "Create your first invoice" }}
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-3">
            <SummaryCard
              label="Total invoiced"
              value={money(sums.billed)}
              tone="teal"
              icon={
                <>
                  <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
                  <path d="M9 8h6M9 12h6" />
                </>
              }
            />
            <SummaryCard
              label="Collected"
              value={money(sums.paid)}
              tone="green"
              icon={
                <>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M8 12.5l3 3 5-6" />
                </>
              }
            />
            <SummaryCard
              label="Outstanding"
              value={money(sums.due)}
              tone="amber"
              icon={
                <>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </>
              }
            />
          </div>

          <div className="space-y-4">
            <FilterTabs tabs={tabs} active={active} basePath="/invoices" />
            {shown.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
                No {active.toLowerCase()} invoices.
              </div>
            ) : (
              <DocTable docs={shown} showBalance />
            )}
          </div>
        </>
      )}
    </div>
  );
}
