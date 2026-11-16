import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { money, CATEGORIES, CATEGORY_LABELS, PRICE_SUFFIX } from "@/lib/format";
import { PageHeader, EmptyState, FilterTabs, TableCard, th, thRight, thCenter, td } from "@/components/ui";

const CAT_STYLE: Record<string, { dot: string; chip: string; icon: React.ReactNode }> = {
  WEBSITE: {
    dot: "bg-blue-500",
    chip: "bg-blue-50 text-blue-600",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18M7 6.5h.01M10 6.5h.01" />
      </>
    ),
  },
  MEDIA: {
    dot: "bg-purple-500",
    chip: "bg-purple-50 text-purple-600",
    icon: (
      <>
        <rect x="3" y="6" width="14" height="12" rx="2" />
        <path d="M17 10l4-2v8l-4-2" />
      </>
    ),
  },
  MARKETING: {
    dot: "bg-amber-500",
    chip: "bg-amber-50 text-amber-600",
    icon: <path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1zM16 9a4 4 0 0 1 0 6" />,
  },
};

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.cat) ? sp.cat[0] : sp.cat;
  const active = (CATEGORIES as readonly string[]).includes(raw ?? "") ? (raw as string) : "all";

  const services = await prisma.service.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] });

  const tabs = [
    { key: "all", label: "All", count: services.length },
    ...CATEGORIES.map((c) => ({
      key: c,
      label: CATEGORY_LABELS[c],
      count: services.filter((s) => s.category === c).length,
    })),
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Services & Prices"
        subtitle="Your price list — used when building quotes and invoices."
        action={{ href: "/services/new", label: "Add Service" }}
      />

      {services.length === 0 ? (
        <EmptyState
          icon={
            <>
              <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z" />
              <circle cx="8" cy="8" r="1.3" />
            </>
          }
          title="No services yet"
          text="Add the services you sell and their prices, then pick them with one click when building quotes and invoices."
          action={{ href: "/services/new", label: "Add your first service" }}
        />
      ) : (
        <>
          <FilterTabs tabs={tabs} active={active} basePath="/services" param="cat" />

          {CATEGORIES.filter((c) => active === "all" || active === c).map((cat) => {
            const list = services.filter((s) => s.category === cat);
            if (list.length === 0) return null;
            const st = CAT_STYLE[cat];
            return (
              <section key={cat} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${st.chip}`}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      {st.icon}
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">{CATEGORY_LABELS[cat]}</h2>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                    {list.length}
                  </span>
                </div>

                <TableCard>
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      <th className={th}>Service</th>
                      <th className={thRight}>Price</th>
                      <th className={thCenter}>Status</th>
                      <th className={th}></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {list.map((s) => (
                      <tr key={s.id} className={`transition-colors hover:bg-slate-50/80 ${s.active ? "" : "opacity-50"}`}>
                        <td className={td}>
                          <div className="font-semibold text-slate-900">{s.name}</div>
                          {s.description && (
                            <div className="mt-0.5 max-w-xl text-xs leading-relaxed text-slate-500">{s.description}</div>
                          )}
                        </td>
                        <td className={`${td} whitespace-nowrap text-right`}>
                          <span className="font-semibold tabular-nums text-slate-900">{money(s.price)}</span>
                          <span className="text-slate-400">{PRICE_SUFFIX[s.priceType] ?? ""}</span>
                          {s.unitLabel && <div className="text-xs text-slate-400">{s.unitLabel}</div>}
                        </td>
                        <td className={`${td} text-center`}>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              s.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                            {s.active ? "Active" : "Hidden"}
                          </span>
                        </td>
                        <td className={`${td} text-right`}>
                          <Link
                            href={`/services/${s.id}`}
                            className="inline-flex rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-teal-600 hover:ring-teal-200"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </TableCard>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
