type ClientLike = {
  name: string;
  company: string;
  phone: string;
  email: string;
  notes: string;
};

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500";

export default function ClientFormFields({ client }: { client?: ClientLike }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Name *</label>
          <input name="name" required defaultValue={client?.name ?? ""} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Company</label>
          <input name="company" defaultValue={client?.company ?? ""} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Phone</label>
          <input name="phone" defaultValue={client?.phone ?? ""} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input name="email" type="email" defaultValue={client?.email ?? ""} className={inputCls} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Notes</label>
        <textarea name="notes" rows={3} defaultValue={client?.notes ?? ""} className={inputCls} />
      </div>
    </div>
  );
}
