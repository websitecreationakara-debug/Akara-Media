import { prisma } from "@/lib/prisma";
import { saveSettings } from "@/lib/actions";

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const s = await prisma.setting.findUnique({ where: { id: 1 } });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      {saved && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">Settings saved.</p>
      )}
      <form action={saveSettings} className="space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Business name</label>
            <input name="businessName" defaultValue={s?.businessName ?? "Akara Media"} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Tagline</label>
            <input name="tagline" defaultValue={s?.tagline ?? ""} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Phone</label>
            <input name="phone" defaultValue={s?.phone ?? ""} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input name="email" defaultValue={s?.email ?? ""} className={inputCls} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Address</label>
          <input name="address" defaultValue={s?.address ?? ""} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Payment instructions (printed on invoices)</label>
          <textarea
            name="paymentInfo"
            rows={4}
            placeholder={"e.g.\nABA Bank: 000 111 222 (AKARA MEDIA)\nWing: 012 345 678\nOr scan our KHQR at the office"}
            defaultValue={s?.paymentInfo ?? ""}
            className={inputCls}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Invoice footer note</label>
            <input name="invoiceNote" defaultValue={s?.invoiceNote ?? ""} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Quote footer note</label>
            <input name="quoteNote" defaultValue={s?.quoteNote ?? ""} className={inputCls} />
          </div>
        </div>
        <button className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700">
          Save Settings
        </button>
      </form>
      <p className="text-xs text-slate-400">
        The login password is set by the APP_PASSWORD environment variable on the server.
      </p>
    </div>
  );
}
