import { requireAuth } from "@/lib/auth";
import { logout } from "@/lib/actions";
import Nav from "@/components/Nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 flex w-60 flex-col bg-gradient-to-b from-slate-900 to-slate-950 p-4 max-md:hidden">
        <div className="mb-8 border-b border-white/10 px-3 pb-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="Akara Media" className="mx-auto h-24 w-24" />
          <div className="mt-2 text-[11px] font-medium uppercase tracking-widest text-slate-500">Point of Sale</div>
        </div>
        <Nav />
        {process.env.DISABLE_LOGIN !== "1" && (
          <form action={logout} className="mt-auto">
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mx-0 w-5 shrink-0">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5M21 12H9" />
              </svg>
              Log out
            </button>
          </form>
        )}
      </aside>
      <div className="min-w-0 flex-1 md:ml-60">
        <div className="border-b border-slate-200 bg-slate-900 p-3 md:hidden">
          <MobileNav />
        </div>
        <main className="mx-auto max-w-6xl p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

function MobileNav() {
  return (
    <div className="flex items-center justify-between">
      <span className="font-bold text-white">Akara Media POS</span>
      <div className="flex gap-3 text-sm">
        <a href="/" className="text-slate-300">Home</a>
        <a href="/quotes" className="text-slate-300">Quotes</a>
        <a href="/invoices" className="text-slate-300">Invoices</a>
        <a href="/clients" className="text-slate-300">Clients</a>
        <a href="/services" className="text-slate-300">Prices</a>
      </div>
    </div>
  );
}
