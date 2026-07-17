import { login } from "@/lib/actions";
import { isLoggedIn } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isLoggedIn()) redirect("/");
  const { error } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Akara Media" className="mx-auto mb-3 h-12 w-auto" />
          <div className="text-sm text-slate-500">Web · Media · Marketing — POS</div>
        </div>
        <form action={login} className="space-y-4">
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoFocus
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              Wrong password, please try again.
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 py-2.5 font-medium text-white hover:bg-slate-700"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
