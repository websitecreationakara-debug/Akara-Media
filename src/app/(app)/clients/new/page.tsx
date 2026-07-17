import Link from "next/link";
import { saveClient } from "@/lib/actions";
import ClientFormFields from "@/components/ClientFormFields";

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Add Client</h1>
      <form action={saveClient} className="space-y-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <ClientFormFields />
        <div className="flex gap-3">
          <button className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700">
            Save Client
          </button>
          <Link href="/clients" className="rounded-lg px-5 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
