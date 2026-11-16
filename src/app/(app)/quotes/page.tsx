import { prisma } from "@/lib/prisma";
import DocTable from "@/components/DocTable";
import { PageHeader, EmptyState } from "@/components/ui";

export default async function QuotesPage() {
  const quotes = await prisma.document.findMany({
    where: { type: "QUOTE" },
    include: { client: true, items: true, payments: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Quotes"
        subtitle={`${quotes.length} quote${quotes.length === 1 ? "" : "s"}`}
        action={{ href: "/quotes/new", label: "New Quote" }}
      />
      {quotes.length === 0 ? (
        <EmptyState
          icon={
            <>
              <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
              <path d="M14 3v5h5M9 13h6M9 17h4" />
            </>
          }
          title="No quotes yet"
          text="Create a quote to send a price to a client. Once they accept, convert it into an invoice."
          action={{ href: "/quotes/new", label: "Create your first quote" }}
        />
      ) : (
        <DocTable docs={quotes} />
      )}
    </div>
  );
}
