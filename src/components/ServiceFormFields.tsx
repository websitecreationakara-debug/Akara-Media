import { CATEGORIES, CATEGORY_LABELS, PRICE_TYPES } from "@/lib/format";

type ServiceLike = {
  name: string;
  category: string;
  description: string;
  price: number;
  priceType: string;
  unitLabel: string;
  active: boolean;
};

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500";

export default function ServiceFormFields({ service }: { service?: ServiceLike }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Service name *</label>
        <input name="name" required defaultValue={service?.name ?? ""} className={inputCls} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <select name="category" defaultValue={service?.category ?? "WEBSITE"} className={inputCls}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Price type</label>
          <select name="priceType" defaultValue={service?.priceType ?? "FIXED"} className={inputCls}>
            {Object.entries(PRICE_TYPES).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Price (USD) *</label>
          <input name="price" type="number" step="0.01" min="0" required defaultValue={service?.price ?? ""} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Unit label (optional)</label>
          <input name="unitLabel" placeholder="e.g. per post, per month" defaultValue={service?.unitLabel ?? ""} className={inputCls} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Description (shown on quotes)</label>
        <textarea name="description" rows={3} defaultValue={service?.description ?? ""} className={inputCls} />
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="active" defaultChecked={service?.active ?? true} className="h-4 w-4" />
        Active (show in service picker)
      </label>
    </div>
  );
}
