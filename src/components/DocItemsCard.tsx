import { docTotals } from "@/lib/docs";
import { money } from "@/lib/format";

type Doc = {
  discount: number;
  items: { id: number; name: string; detail: string; qty: number; unitPrice: number }[];
  payments?: { amount: number }[];
};

export default function DocItemsCard({ doc, showPaid }: { doc: Doc; showPaid?: boolean }) {
  const t = docTotals(doc);
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
            <th className="py-2 pr-2">Item</th>
            <th className="w-16 px-2 py-2 text-right">Qty</th>
            <th className="w-28 px-2 py-2 text-right">Unit price</th>
            <th className="w-28 py-2 pl-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {doc.items.map((i) => (
            <tr key={i.id}>
              <td className="py-2.5 pr-2">
                <div className="font-medium">{i.name}</div>
                {i.detail && <div className="text-xs text-slate-500">{i.detail}</div>}
              </td>
              <td className="px-2 py-2.5 text-right">{i.qty}</td>
              <td className="px-2 py-2.5 text-right">{money(i.unitPrice)}</td>
              <td className="py-2.5 pl-2 text-right font-medium">{money(i.qty * i.unitPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex flex-col items-end gap-1 border-t border-slate-200 pt-4 text-sm">
        <Row label="Subtotal" value={money(t.subtotal)} />
        {doc.discount > 0 && <Row label="Discount" value={`−${money(doc.discount)}`} />}
        <div className="flex w-60 justify-between text-base font-bold">
          <span>Total</span>
          <span>{money(t.total)}</span>
        </div>
        {showPaid && (
          <>
            <Row label="Paid" value={money(t.paid)} valueClass="text-green-600" />
            <div className={`flex w-60 justify-between font-semibold ${t.balance > 0 ? "text-amber-600" : "text-green-600"}`}>
              <span>Balance due</span>
              <span>{money(t.balance)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex w-60 justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={`font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}
