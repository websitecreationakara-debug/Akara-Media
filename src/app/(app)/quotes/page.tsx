import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DocTable from "@/components/DocTable";

export default async function QuotesPage() {
  const quotes = await prisma.document.findMany({
    where: { type: "QUOTE" },
    include: { client: true, items: true, payments: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Quotes</h1>
        <Link href="/quotes/new" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
          + New Quote
        </Link>
      </div>
      {quotes.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center text-slate-500 shadow-sm ring-1 ring-slate-200">
          No quotes yet. Create one to send a price to a client.
        </div>
      ) : (
        <DocTable docs={quotes} />
      )}
    </div>
  );
}
