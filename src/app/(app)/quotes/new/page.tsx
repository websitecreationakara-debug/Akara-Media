import { prisma } from "@/lib/prisma";
import DocumentForm from "@/components/DocumentForm";

export default async function NewQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const { client } = await searchParams;
  const [clients, services] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.service.findMany({ where: { active: true }, orderBy: [{ category: "asc" }, { sortOrder: "asc" }] }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Quote</h1>
      <DocumentForm
        type="QUOTE"
        clients={clients}
        services={services}
        defaultClientId={client ? Number(client) : undefined}
      />
    </div>
  );
}
