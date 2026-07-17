import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { money, CATEGORIES, CATEGORY_LABELS, PRICE_SUFFIX } from "@/lib/format";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Services & Prices</h1>
          <p className="text-sm text-slate-500">Your price list — used when building quotes and invoices.</p>
        </div>
        <Link href="/services/new" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
          + Add Service
        </Link>
      </div>

      {CATEGORIES.map((cat) => {
        const list = services.filter((s) => s.category === cat);
        if (list.length === 0) return null;
        return (
          <section key={cat}>
            <h2 className="mb-3 text-lg font-semibold">{CATEGORY_LABELS[cat]}</h2>
            <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {list.map((s) => (
                    <tr key={s.id} className={s.active ? "" : "opacity-45"}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{s.name}</div>
                        {s.description && <div className="mt-0.5 max-w-xl text-xs text-slate-500">{s.description}</div>}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                        {money(s.price)}
                        <span className="font-normal text-slate-400">{PRICE_SUFFIX[s.priceType] ?? ""}</span>
                        {s.unitLabel && <div className="text-xs font-normal text-slate-400">{s.unitLabel}</div>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {s.active ? "Active" : "Hidden"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/services/${s.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
