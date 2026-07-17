"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { saveDocument, type DocPayload } from "@/lib/actions";
import { money, round2, CATEGORIES, CATEGORY_LABELS } from "@/lib/format";

type ServiceOpt = {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  priceType: string;
  unitLabel: string;
};

type ClientOpt = { id: number; name: string; company: string };

type Item = { key: number; name: string; detail: string; qty: number; unit: string; unitPrice: number };

type Props = {
  type: "QUOTE" | "INVOICE";
  clients: ClientOpt[];
  services: ServiceOpt[];
  defaultClientId?: number;
  initial?: {
    id: number;
    clientId: number;
    issueDate: string;
    dueDate: string;
    discount: number;
    notes: string;
    items: { name: string; detail: string; qty: number; unit: string; unitPrice: number }[];
  };
};

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500";

let keyCounter = 1;

export default function DocumentForm({ type, clients, services, defaultClientId, initial }: Props) {
  const [clientId, setClientId] = useState<number>(initial?.clientId ?? defaultClientId ?? 0);
  const [issueDate, setIssueDate] = useState(initial?.issueDate ?? new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [discount, setDiscount] = useState<string>(initial ? String(initial.discount || "") : "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [items, setItems] = useState<Item[]>(
    (initial?.items ?? []).map((i) => ({ ...i, key: keyCounter++ }))
  );
  const [pickerId, setPickerId] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const subtotal = useMemo(() => round2(items.reduce((s, i) => s + (i.qty || 0) * (i.unitPrice || 0), 0)), [items]);
  const discountNum = parseFloat(discount) || 0;
  const total = round2(Math.max(0, subtotal - discountNum));

  function addService() {
    const s = services.find((x) => x.id === Number(pickerId));
    if (!s) return;
    const unit = s.priceType === "PER_HOUR" ? "hour" : s.priceType === "PER_MONTH" ? "month" : "";
    setItems((prev) => [
      ...prev,
      { key: keyCounter++, name: s.name, detail: s.description, qty: 1, unit, unitPrice: s.price },
    ]);
    setPickerId("");
  }

  function addCustom() {
    setItems((prev) => [...prev, { key: keyCounter++, name: "", detail: "", qty: 1, unit: "", unitPrice: 0 }]);
  }

  function update(key: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }

  function remove(key: number) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function submit() {
    setError("");
    const payload: DocPayload = {
      id: initial?.id,
      type,
      clientId,
      issueDate,
      dueDate,
      discount: discountNum,
      notes,
      items: items.map(({ name, detail, qty, unit, unitPrice }) => ({ name, detail, qty, unit, unitPrice })),
    };
    startTransition(async () => {
      const res = await saveDocument(payload);
      if (res?.error) setError(res.error);
    });
  }

  const label = type === "QUOTE" ? "Quote" : "Invoice";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label className="mb-1 block text-sm font-medium">Client *</label>
          <select value={clientId} onChange={(e) => setClientId(Number(e.target.value))} className={inputCls}>
            <option value={0}>— choose client —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}{c.company ? ` (${c.company})` : ""}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-400">
            New customer? <Link href="/clients/new" className="underline">Add client</Link> first.
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Issue date</label>
          <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{type === "QUOTE" ? "Valid until" : "Due date"}</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-4 font-semibold">Items</h2>

        <div className="mb-4 flex flex-wrap gap-2">
          <select value={pickerId} onChange={(e) => setPickerId(e.target.value)} className={`${inputCls} max-w-md flex-1`}>
            <option value="">— add service from price list —</option>
            {CATEGORIES.map((cat) => {
              const list = services.filter((s) => s.category === cat);
              if (list.length === 0) return null;
              return (
                <optgroup key={cat} label={CATEGORY_LABELS[cat]}>
                  {list.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {money(s.price)}{s.unitLabel ? ` ${s.unitLabel}` : ""}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
          <button type="button" onClick={addService} disabled={!pickerId}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-40">
            Add
          </button>
          <button type="button" onClick={addCustom}
            className="rounded-lg px-4 py-2 text-sm font-medium ring-1 ring-slate-300 hover:bg-slate-50">
            + Custom line
          </button>
        </div>

        {items.length === 0 ? (
          <p className="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-400">
            No items yet — add a service from your price list above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-2 pr-2">Item</th>
                  <th className="w-32 px-2 py-2">Qty / Time</th>
                  <th className="w-32 px-2 py-2">Unit price</th>
                  <th className="w-28 px-2 py-2 text-right">Amount</th>
                  <th className="w-10 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 align-top">
                {items.map((i) => (
                  <tr key={i.key}>
                    <td className="py-2 pr-2">
                      <input value={i.name} placeholder="Item name"
                        onChange={(e) => update(i.key, { name: e.target.value })} className={inputCls} />
                      <input value={i.detail} placeholder="Details (optional)"
                        onChange={(e) => update(i.key, { detail: e.target.value })}
                        className={`${inputCls} mt-1 text-xs text-slate-500`} />
                    </td>
                    <td className="px-2 py-2">
                      <input type="number" min="0" step={i.unit === "hour" ? 0.5 : 1} value={i.qty}
                        placeholder={i.unit === "hour" ? "hours" : ""}
                        onChange={(e) => update(i.key, { qty: parseFloat(e.target.value) || 0 })} className={inputCls} />
                      <select value={i.unit} onChange={(e) => update(i.key, { unit: e.target.value })}
                        className={`${inputCls} mt-1 text-xs text-slate-500`}>
                        <option value="">pieces</option>
                        <option value="hour">hours worked</option>
                        <option value="month">months</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <input type="number" min="0" step="0.01" value={i.unitPrice}
                        onChange={(e) => update(i.key, { unitPrice: parseFloat(e.target.value) || 0 })} className={inputCls} />
                    </td>
                    <td className="px-2 py-3 text-right font-medium">{money((i.qty || 0) * (i.unitPrice || 0))}</td>
                    <td className="py-3 text-right">
                      <button type="button" onClick={() => remove(i.key)} aria-label="Remove item"
                        className="rounded px-2 text-slate-400 hover:bg-red-50 hover:text-red-600">
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex flex-col items-end gap-1 border-t border-slate-200 pt-4 text-sm">
          <div className="flex w-64 justify-between">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-medium">{money(subtotal)}</span>
          </div>
          <div className="flex w-64 items-center justify-between">
            <span className="text-slate-500">Discount ($)</span>
            <input type="number" min="0" step="0.01" value={discount} placeholder="0.00"
              onChange={(e) => setDiscount(e.target.value)}
              className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-right text-sm outline-none focus:border-slate-500" />
          </div>
          <div className="mt-1 flex w-64 justify-between text-base font-bold">
            <span>Total</span>
            <span>{money(total)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <label className="mb-1 block text-sm font-medium">Notes (shown on the {label.toLowerCase()})</label>
        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button onClick={submit} disabled={pending}
          className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50">
          {pending ? "Saving…" : initial ? `Save ${label}` : `Create ${label}`}
        </button>
        <Link href={type === "QUOTE" ? "/quotes" : "/invoices"} className="rounded-lg px-5 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100">
          Cancel
        </Link>
      </div>
    </div>
  );
}
