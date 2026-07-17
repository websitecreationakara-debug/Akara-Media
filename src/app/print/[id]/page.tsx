import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { docTotals } from "@/lib/docs";
import { money, fmtDate, unitSuffix, PAYMENT_METHODS } from "@/lib/format";
import PrintButton from "@/components/PrintButton";

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth();
  const { id } = await params;
  const [doc, settings] = await Promise.all([
    prisma.document.findUnique({
      where: { id: Number(id) },
      include: { client: true, items: true, payments: { orderBy: { paidAt: "asc" } } },
    }),
    prisma.setting.findUnique({ where: { id: 1 } }),
  ]);
  if (!doc) notFound();

  const t = docTotals(doc);
  const isInvoice = doc.type === "INVOICE";
  const title = isInvoice ? "INVOICE" : "QUOTATION";
  const backHref = isInvoice ? `/invoices/${doc.id}` : `/quotes/${doc.id}`;
  const note = isInvoice ? settings?.invoiceNote : settings?.quoteNote;

  return (
    <div className="min-h-screen bg-slate-200 py-8 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-3xl items-center justify-between px-4 print:hidden">
        <Link href={backHref} className="text-sm text-slate-600 hover:underline">← Back</Link>
        <PrintButton />
      </div>

      <div className="mx-auto max-w-3xl bg-white p-10 text-slate-900 shadow-lg print:max-w-none print:p-0 print:shadow-none">
        <header className="flex items-start justify-between border-b-4 border-[#2cc9bd] pb-6">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt={settings?.businessName || "Akara Media"} className="mb-3 h-14 w-auto" />
            {settings?.tagline && <div className="text-sm text-[#0d9488]">{settings.tagline}</div>}
            <div className="mt-2 space-y-0.5 text-xs text-slate-500">
              {settings?.address && <div>{settings.address}</div>}
              {settings?.phone && <div>Tel: {settings.phone}</div>}
              {settings?.email && <div>{settings.email}</div>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold tracking-wide text-[#0d9488]">{title}</div>
            <div className="mt-2 text-sm font-semibold">{doc.number}</div>
            <div className="text-xs text-slate-500">Date: {fmtDate(doc.issueDate)}</div>
            {doc.dueDate && (
              <div className="text-xs text-slate-500">
                {isInvoice ? "Due" : "Valid until"}: {fmtDate(doc.dueDate)}
              </div>
            )}
          </div>
        </header>

        <section className="mt-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-[#0d9488]">
            {isInvoice ? "Bill to" : "Prepared for"}
          </div>
          <div className="mt-1 font-semibold">{doc.client.name}</div>
          {doc.client.company && <div className="text-sm text-slate-600">{doc.client.company}</div>}
          <div className="text-xs text-slate-500">
            {[doc.client.phone, doc.client.email].filter(Boolean).join(" · ")}
          </div>
        </section>

        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="print-exact bg-[#0d9488] text-left text-xs uppercase tracking-wide text-white">
              <th className="rounded-l px-3 py-2.5">Description</th>
              <th className="w-20 px-2 py-2.5 text-right">Qty / Time</th>
              <th className="w-28 px-2 py-2.5 text-right">Unit Price</th>
              <th className="w-28 rounded-r px-3 py-2.5 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {doc.items.map((i) => (
              <tr key={i.id}>
                <td className="px-3 py-2.5">
                  <div className="font-medium">{i.name}</div>
                  {i.detail && <div className="text-xs text-slate-500">{i.detail}</div>}
                </td>
                <td className="whitespace-nowrap px-2 py-2.5 text-right align-top">{i.qty}{unitSuffix(i.unit)}</td>
                <td className="px-2 py-2.5 text-right align-top">{money(i.unitPrice)}</td>
                <td className="px-3 py-2.5 text-right align-top font-medium">{money(i.qty * i.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal</span>
              <span>{money(t.subtotal)}</span>
            </div>
            {doc.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Discount</span>
                <span>−{money(doc.discount)}</span>
              </div>
            )}
            <div className="print-exact mt-1 flex justify-between rounded bg-[#e6faf8] px-3 py-2 text-base font-bold text-[#0d9488]">
              <span>Total</span>
              <span>{money(t.total)}</span>
            </div>
            {isInvoice && doc.payments.length > 0 && (
              <>
                <div className="flex justify-between px-3 text-green-700">
                  <span>Paid</span>
                  <span>−{money(t.paid)}</span>
                </div>
                <div className="flex justify-between px-3 font-bold text-[#0d9488]">
                  <span>Balance Due</span>
                  <span>{money(t.balance)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {isInvoice && doc.payments.length > 0 && (
          <section className="mt-6 text-xs text-slate-500">
            <div className="font-semibold uppercase tracking-wide text-[#0d9488]">Payment history</div>
            <ul className="mt-1 space-y-0.5">
              {doc.payments.map((p) => (
                <li key={p.id}>
                  {fmtDate(p.paidAt)} — {money(p.amount)} via {PAYMENT_METHODS[p.method] ?? p.method}
                  {p.reference && ` (ref: ${p.reference})`}
                </li>
              ))}
            </ul>
          </section>
        )}

        {(settings?.paymentInfo || doc.notes || note) && (
          <footer className="mt-8 space-y-3 border-t border-slate-200 pt-4 text-xs text-slate-600">
            {isInvoice && settings?.paymentInfo && (
              <div>
                <div className="font-semibold uppercase tracking-wide text-[#0d9488]">How to pay</div>
                <div className="mt-1 whitespace-pre-line">{settings.paymentInfo}</div>
              </div>
            )}
            {doc.notes && (
              <div>
                <div className="font-semibold uppercase tracking-wide text-[#0d9488]">Notes</div>
                <div className="mt-1 whitespace-pre-line">{doc.notes}</div>
              </div>
            )}
            {note && <div className="pt-2 text-center text-slate-500">{note}</div>}
          </footer>
        )}
      </div>
    </div>
  );
}
