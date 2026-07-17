import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { dateInputValue } from "@/lib/format";
import DocumentForm from "@/components/DocumentForm";

export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await prisma.document.findUnique({
    where: { id: Number(id) },
    include: { items: true },
  });
  if (!doc || doc.type !== "QUOTE") notFound();

  const [clients, services] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.service.findMany({ where: { active: true }, orderBy: [{ category: "asc" }, { sortOrder: "asc" }] }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Quote {doc.number}</h1>
      <DocumentForm
        type="QUOTE"
        clients={clients}
        services={services}
        initial={{
          id: doc.id,
          clientId: doc.clientId,
          issueDate: dateInputValue(doc.issueDate),
          dueDate: dateInputValue(doc.dueDate),
          discount: doc.discount,
          notes: doc.notes,
          items: doc.items.map((i) => ({ name: i.name, detail: i.detail, qty: i.qty, unit: i.unit, unitPrice: i.unitPrice })),
        }}
      />
    </div>
  );
}
