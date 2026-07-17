import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fmtDate } from "@/lib/format";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { documents: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Link href="/clients/new" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
          + Add Client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center text-slate-500 shadow-sm ring-1 ring-slate-200">
          No clients yet. Add your first client to start creating quotes.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Documents</th>
                <th className="px-4 py-3">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/clients/${c.id}`} className="font-medium text-blue-600 hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.company || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{c.phone || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{c._count.documents}</td>
                  <td className="px-4 py-3 text-slate-500">{fmtDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
