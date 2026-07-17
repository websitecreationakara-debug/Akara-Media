import { prisma } from "@/lib/prisma";
import { round2 } from "@/lib/format";

export type Totals = { subtotal: number; total: number; paid: number; balance: number };

export function docTotals(doc: {
  discount: number;
  items: { qty: number; unitPrice: number }[];
  payments?: { amount: number }[];
}): Totals {
  const subtotal = round2(doc.items.reduce((s, i) => s + i.qty * i.unitPrice, 0));
  const total = round2(Math.max(0, subtotal - doc.discount));
  const paid = round2((doc.payments ?? []).reduce((s, p) => s + p.amount, 0));
  return { subtotal, total, paid, balance: round2(total - paid) };
}

export async function nextDocNumber(type: "QUOTE" | "INVOICE"): Promise<string> {
  const prefix = type === "QUOTE" ? "Q" : "INV";
  const last = await prisma.document.findFirst({
    where: { type },
    orderBy: { id: "desc" },
    select: { number: true },
  });
  let n = 1;
  if (last) {
    const parsed = parseInt(last.number.split("-").pop() ?? "0", 10);
    if (Number.isFinite(parsed)) n = parsed + 1;
  }
  return `${prefix}-${String(n).padStart(4, "0")}`;
}

/** Recompute an invoice's status from its payments (unless VOID). */
export async function refreshInvoiceStatus(documentId: number): Promise<void> {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    include: { items: true, payments: true },
  });
  if (!doc || doc.type !== "INVOICE" || doc.status === "VOID") return;
  const { total, paid } = docTotals(doc);
  const status = paid <= 0 ? "UNPAID" : paid >= total ? "PAID" : "PARTIAL";
  await prisma.document.update({ where: { id: documentId }, data: { status } });
}
