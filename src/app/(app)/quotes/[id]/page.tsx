import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setDocumentStatus, convertQuoteToInvoice, deleteDocument } from "@/lib/actions";
import { fmtDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import DocItemsCard from "@/components/DocItemsCard";

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await prisma.document.findUnique({
    where: { id: Number(id) },
    include: { client: true, items: true, payments: true },
  });
  if (!doc || doc.type !== "QUOTE") notFound();

  const invoice = doc.status === "CONVERTED"
    ? await prisma.document.findFirst({ where: { quoteId: doc.id } })
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{doc.number}</h1>
            <StatusBadge status={doc.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            <Link href={`/clients/${doc.clientId}`} className="font-medium text-blue-600 hover:underline">
              {doc.client.name}
            </Link>
            {" · "}Issued {fmtDate(doc.issueDate)}
            {doc.dueDate && <> · Valid until {fmtDate(doc.dueDate)}</>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/print/${doc.id}`} className="rounded-lg bg-white px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
            🖨 Print / PDF
          </Link>
          {doc.status !== "CONVERTED" && (
            <Link href={`/quotes/${doc.id}/edit`} className="rounded-lg bg-white px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
              ✎ Edit
            </Link>
          )}
        </div>
      </div>

      <DocItemsCard doc={doc} />

      {doc.notes && (
        <div className="rounded-xl bg-white p-5 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
          <span className="font-medium text-slate-700">Notes: </span>{doc.notes}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        {doc.status === "CONVERTED" && invoice ? (
          <p className="text-sm text-slate-600">
            Converted to invoice{" "}
            <Link href={`/invoices/${invoice.id}`} className="font-medium text-blue-600 hover:underline">
              {invoice.number}
            </Link>
          </p>
        ) : (
          <>
            {doc.status === "DRAFT" && <StatusButton id={doc.id} status="SENT" label="Mark as Sent" />}
            {(doc.status === "DRAFT" || doc.status === "SENT") && (
              <StatusButton id={doc.id} status="ACCEPTED" label="Mark as Accepted" />
            )}
            {doc.status !== "DECLINED" && <StatusButton id={doc.id} status="DECLINED" label="Mark as Declined" subtle />}
            {doc.status === "DECLINED" && <StatusButton id={doc.id} status="DRAFT" label="Reopen as Draft" subtle />}
            <form action={convertQuoteToInvoice} className="ml-auto">
              <input type="hidden" name="id" value={doc.id} />
              <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500">
                → Convert to Invoice
              </button>
            </form>
          </>
        )}
      </div>

      <form action={deleteDocument}>
        <input type="hidden" name="id" value={doc.id} />
        <button className="text-sm text-red-500 hover:underline">Delete this quote</button>
      </form>
    </div>
  );
}

function StatusButton({ id, status, label, subtle }: { id: number; status: string; label: string; subtle?: boolean }) {
  return (
    <form action={setDocumentStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button
        className={
          subtle
            ? "rounded-lg px-4 py-2 text-sm font-medium text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50"
            : "rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        }
      >
        {label}
      </button>
    </form>
  );
}
