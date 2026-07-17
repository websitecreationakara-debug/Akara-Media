import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { recordPayment, deletePayment, setDocumentStatus, deleteDocument } from "@/lib/actions";
import { docTotals } from "@/lib/docs";
import { money, fmtDate, dateInputValue, PAYMENT_METHODS } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import DocItemsCard from "@/components/DocItemsCard";

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await prisma.document.findUnique({
    where: { id: Number(id) },
    include: { client: true, items: true, payments: { orderBy: { paidAt: "desc" } } },
  });
  if (!doc || doc.type !== "INVOICE") notFound();

  const t = docTotals(doc);

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
            {doc.dueDate && <> · Due {fmtDate(doc.dueDate)}</>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/print/${doc.id}`} className="rounded-lg bg-white px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
            🖨 Print / PDF
          </Link>
          <Link href={`/invoices/${doc.id}/edit`} className="rounded-lg bg-white px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
            ✎ Edit
          </Link>
        </div>
      </div>

      <DocItemsCard doc={doc} showPaid />

      {doc.notes && (
        <div className="rounded-xl bg-white p-5 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
          <span className="font-medium text-slate-700">Notes: </span>{doc.notes}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 font-semibold">Payments</h2>
          {doc.payments.length === 0 ? (
            <p className="text-sm text-slate-500">No payments recorded yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {doc.payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <div>
                    <span className="font-semibold text-green-600">{money(p.amount)}</span>
                    <span className="text-slate-500"> · {PAYMENT_METHODS[p.method] ?? p.method}</span>
                    <div className="text-xs text-slate-400">
                      {fmtDate(p.paidAt)}
                      {p.reference && <> · Ref: {p.reference}</>}
                      {p.note && <> · {p.note}</>}
                    </div>
                  </div>
                  <form action={deletePayment}>
                    <input type="hidden" name="id" value={p.id} />
                    <button aria-label="Delete payment" className="rounded px-2 text-slate-300 hover:bg-red-50 hover:text-red-600">✕</button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>

        {doc.status !== "VOID" && t.balance > 0 && (
          <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-3 font-semibold">Record a payment</h2>
            <form action={recordPayment} className="space-y-3">
              <input type="hidden" name="documentId" value={doc.id} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Amount (USD)</label>
                  <input name="amount" type="number" step="0.01" min="0.01" required defaultValue={t.balance} className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Method</label>
                  <select name="method" className={inputCls}>
                    {Object.entries(PAYMENT_METHODS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Date</label>
                  <input name="paidAt" type="date" defaultValue={dateInputValue(new Date())} className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Reference (optional)</label>
                  <input name="reference" placeholder="e.g. ABA trx ID" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Note (optional)</label>
                <input name="note" placeholder="e.g. 50% deposit" className={inputCls} />
              </div>
              <button className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-medium text-white hover:bg-green-500">
                ✓ Record Payment
              </button>
            </form>
          </section>
        )}
      </div>

      <div className="flex items-center gap-4">
        {doc.status !== "VOID" ? (
          <form action={setDocumentStatus}>
            <input type="hidden" name="id" value={doc.id} />
            <input type="hidden" name="status" value="VOID" />
            <button className="text-sm text-slate-500 hover:underline">Void this invoice</button>
          </form>
        ) : (
          <form action={setDocumentStatus}>
            <input type="hidden" name="id" value={doc.id} />
            <input type="hidden" name="status" value="UNPAID" />
            <button className="text-sm text-slate-500 hover:underline">Re-activate invoice</button>
          </form>
        )}
        <form action={deleteDocument}>
          <input type="hidden" name="id" value={doc.id} />
          <button className="text-sm text-red-500 hover:underline">Delete this invoice</button>
        </form>
      </div>
    </div>
  );
}
