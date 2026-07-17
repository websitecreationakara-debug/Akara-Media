import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DocTable from "@/components/DocTable";

export default async function InvoicesPage() {
  const invoices = await prisma.document.findMany({
    where: { type: "INVOICE" },
    include: { client: true, items: true, payments: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link href="/invoices/new" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
          + New Invoice
        </Link>
      </div>
      {invoices.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center text-slate-500 shadow-sm ring-1 ring-slate-200">
          No invoices yet.
        </div>
      ) : (
        <DocTable docs={invoices} showBalance />
      )}
    </div>
  );
}
