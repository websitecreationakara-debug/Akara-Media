import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveClient, deleteClient } from "@/lib/actions";
import { docTotals } from "@/lib/docs";
import { money, fmtDate } from "@/lib/format";
import ClientFormFields from "@/components/ClientFormFields";
import StatusBadge from "@/components/StatusBadge";

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const client = await prisma.client.findUnique({
    where: { id: Number(id) },
    include: {
      documents: { include: { items: true, payments: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!client) notFound();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{client.name}</h1>
          {client.company && <p className="text-sm text-slate-500">{client.company}</p>}
        </div>
        <div className="flex gap-2">
          <Link href={`/quotes/new?client=${client.id}`} className="rounded-lg bg-white px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
            + Quote
          </Link>
          <Link href={`/invoices/new?client=${client.id}`} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
            + Invoice
          </Link>
        </div>
      </div>

      {error === "has-documents" && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          This client has quotes/invoices and cannot be deleted.
        </p>
      )}

      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-3 font-semibold">Documents</h2>
        {client.documents.length === 0 ? (
          <p className="text-sm text-slate-500">No quotes or invoices yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {client.documents.map((d) => (
              <li key={d.id} className="flex items-center justify-between py-2">
                <div>
                  <Link
                    href={d.type === "QUOTE" ? `/quotes/${d.id}` : `/invoices/${d.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {d.number}
                  </Link>
                  <span className="ml-2 text-xs text-slate-400">{fmtDate(d.issueDate)}</span>
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

      <section className="mx-auto w-full">
        <h2 className="mb-3 font-semibold">Edit details</h2>
        <form action={saveClient} className="space-y-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <input type="hidden" name="id" value={client.id} />
          <ClientFormFields client={client} />
          <button className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700">
            Save Changes
          </button>
        </form>
      </section>

      {client.documents.length === 0 && (
        <form action={deleteClient}>
          <input type="hidden" name="id" value={client.id} />
          <button className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
            Delete client
          </button>
        </form>
      )}
    </div>
  );
}
