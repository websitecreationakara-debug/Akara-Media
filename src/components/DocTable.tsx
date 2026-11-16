import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { Avatar, TableCard, th, thRight, thCenter, td } from "@/components/ui";
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
    <TableCard>
      <thead>
        <tr className="border-b border-slate-100 bg-slate-50/60">
          <th className={th}>Number</th>
          <th className={th}>Client</th>
          <th className={th}>Date</th>
          {showBalance && <th className={th}>Due</th>}
          <th className={thRight}>Total</th>
          {showBalance && <th className={thRight}>Balance</th>}
          <th className={thCenter}>Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {docs.map((d) => {
          const t = docTotals(d);
          const href = d.type === "QUOTE" ? `/quotes/${d.id}` : `/invoices/${d.id}`;
          return (
            <tr key={d.id} className="transition-colors hover:bg-slate-50/80">
              <td className={td}>
                <Link href={href} className="font-semibold text-slate-900 hover:text-teal-600">
                  {d.number}
                </Link>
              </td>
              <td className={td}>
                <div className="flex items-center gap-3">
                  <Avatar name={d.client.name} />
                  <div className="min-w-0">
                    <div className="truncate font-medium text-slate-800">{d.client.name}</div>
                    {d.client.company && <div className="truncate text-xs text-slate-400">{d.client.company}</div>}
                  </div>
                </div>
              </td>
              <td className={`${td} text-slate-500`}>{fmtDate(d.issueDate)}</td>
              {showBalance && (
                <td className={td}>
                  {d.dueDate ? (
                    <div>
                      <div className="text-slate-500">{fmtDate(d.dueDate)}</div>
                      {d.dueDate < new Date() && t.balance > 0 && d.status !== "VOID" && (
                        <div className="text-xs font-semibold text-red-600">Overdue</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
              )}
              <td className={`${td} text-right font-semibold tabular-nums`}>{money(t.total)}</td>
              {showBalance && (
                <td className={`${td} text-right font-semibold tabular-nums ${t.balance > 0 ? "text-amber-600" : "text-green-600"}`}>
                  {money(t.balance)}
                </td>
              )}
              <td className={`${td} text-center`}>
                <StatusBadge status={d.status} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </TableCard>
  );
}
