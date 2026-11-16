import { prisma } from "@/lib/prisma";
import { saveSettings } from "@/lib/actions";
import { PageHeader, Field, FormSection, inputCls } from "@/components/ui";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const s = await prisma.setting.findUnique({ where: { id: 1 } });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader title="Settings" subtitle="Your business details, shown on every quote and invoice." />

      {saved && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
            <circle cx="12" cy="12" r="9" />
            <path d="M8 12.5l3 3 5-6" />
          </svg>
          Settings saved.
        </div>
      )}

      <form action={saveSettings} className="space-y-6">
        <FormSection
          title="Business profile"
          description="Appears in the header of printed quotes and invoices."
          icon={
            <>
              <path d="M3 21h18M5 21V7l7-4 7 4v14" />
              <path d="M9 21v-6h6v6M9 10h.01M15 10h.01" />
            </>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Business name">
              <input name="businessName" defaultValue={s?.businessName ?? "Akara Media"} className={inputCls} />
            </Field>
            <Field label="Tagline">
              <input name="tagline" defaultValue={s?.tagline ?? ""} className={inputCls} />
            </Field>
            <Field label="Phone">
              <input name="phone" defaultValue={s?.phone ?? ""} placeholder="012 345 678" className={inputCls} />
            </Field>
            <Field label="Email">
              <input name="email" type="email" defaultValue={s?.email ?? ""} className={inputCls} />
            </Field>
          </div>
          <Field label="Address">
            <input name="address" defaultValue={s?.address ?? ""} placeholder="Street, city" className={inputCls} />
          </Field>
        </FormSection>

        <FormSection
          title="Payment instructions"
          description="Printed on invoices so clients know how to pay you."
          icon={
            <>
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20M6 15h4" />
            </>
          }
        >
          <Field label="How clients can pay">
            <textarea
              name="paymentInfo"
              rows={4}
              placeholder={"e.g.\nABA Bank: 000 111 222 (AKARA MEDIA)\nWing: 012 345 678\nOr scan our KHQR at the office"}
              defaultValue={s?.paymentInfo ?? ""}
              className={inputCls}
            />
          </Field>
        </FormSection>

        <FormSection
          title="Document notes"
          description="Short messages shown at the bottom of each document."
          icon={
            <>
              <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
              <path d="M14 3v5h5M9 13h6M9 17h4" />
            </>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Invoice footer note">
              <input name="invoiceNote" defaultValue={s?.invoiceNote ?? ""} className={inputCls} />
            </Field>
            <Field label="Quote footer note">
              <input name="quoteNote" defaultValue={s?.quoteNote ?? ""} className={inputCls} />
            </Field>
          </div>
        </FormSection>

        <div className="sticky bottom-4 flex items-center justify-between gap-4 rounded-2xl bg-white/90 p-4 shadow-lg ring-1 ring-slate-200/70 backdrop-blur">
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-slate-400">
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            The login password is set by the <code className="rounded bg-slate-100 px-1 py-0.5">APP_PASSWORD</code> environment variable.
          </p>
          <button className="shrink-0 rounded-xl bg-teal-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-teal-500/30 transition hover:bg-teal-600">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
