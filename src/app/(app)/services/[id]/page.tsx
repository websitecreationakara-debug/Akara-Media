import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveService, deleteService } from "@/lib/actions";
import ServiceFormFields from "@/components/ServiceFormFields";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await prisma.service.findUnique({ where: { id: Number(id) } });
  if (!service) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Edit Service</h1>
      <form action={saveService} className="space-y-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <input type="hidden" name="id" value={service.id} />
        <ServiceFormFields service={service} />
        <div className="flex gap-3">
          <button className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700">
            Save Changes
          </button>
          <Link href="/services" className="rounded-lg px-5 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100">
            Cancel
          </Link>
        </div>
      </form>
      <form action={deleteService} className="rounded-xl border border-red-200 bg-red-50 p-4">
        <input type="hidden" name="id" value={service.id} />
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-red-700">
            Delete this service from the price list. Existing quotes/invoices keep their copied prices.
          </p>
          <button className="shrink-0 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100">
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}
