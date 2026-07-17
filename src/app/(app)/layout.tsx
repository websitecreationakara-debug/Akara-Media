import { requireAuth } from "@/lib/auth";
import { logout } from "@/lib/actions";
import Nav from "@/components/Nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();
  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <aside className="fixed inset-y-0 left-0 flex w-56 flex-col bg-slate-900 p-4 max-md:hidden">
        <div className="mb-6 px-3">
          <div className="text-lg font-bold text-white">Akara Media</div>
          <div className="text-xs text-slate-400">Point of Sale</div>
        </div>
        <Nav />
        <form action={logout} className="mt-auto">
          <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-400 hover:bg-slate-800 hover:text-white">
            ⏻ Log out
          </button>
        </form>
      </aside>
      <div className="min-w-0 flex-1 md:ml-56">
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
