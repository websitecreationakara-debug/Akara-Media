import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { docTotals } from "@/lib/docs";
import { money, fmtDate } from "@/lib/format";

type Doc = {
  id: number;
  number: string;
  type: string;
  status: string;
  issueDate: Date;
  dueDate: Date | null;
  discount: number;
  client: { name: string; company: string };
  items: { qty: number; unitPrice: number }[];
  payments: { amount: number }[];
};

export default function DocTable({ docs, showBalance }: { docs: Doc[]; showBalance?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
            <th className="px-4 py-3">Number</th>
            <th className="px-4 py-3">Client</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3 text-right">Total</th>
            {showBalance && <th className="px-4 py-3 text-right">Balance</th>}
            <th className="px-4 py-3 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {docs.map((d) => {
            const t = docTotals(d);
            const href = d.type === "QUOTE" ? `/quotes/${d.id}` : `/invoices/${d.id}`;
            return (
              <tr key={d.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={href} className="font-medium text-blue-600 hover:underline">
                    {d.number}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {d.client.name}
                  {d.client.company && <span className="text-slate-400"> · {d.client.company}</span>}
                </td>
                <td className="px-4 py-3 text-slate-500">{fmtDate(d.issueDate)}</td>
                <td className="px-4 py-3 text-right font-medium">{money(t.total)}</td>
                {showBalance && (
                  <td className={`px-4 py-3 text-right font-medium ${t.balance > 0 ? "text-amber-600" : "text-green-600"}`}>
                    {money(t.balance)}
                  </td>
                )}
                <td className="px-4 py-3 text-center">
                  <StatusBadge status={d.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
