"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, requireAuth } from "@/lib/auth";
import { nextDocNumber, refreshInvoiceStatus } from "@/lib/docs";

// ---------- helpers ----------

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function num(fd: FormData, key: string, fallback = 0): number {
  const n = parseFloat(str(fd, key));
  return Number.isFinite(n) ? n : fallback;
}

function dateOrNull(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

// ---------- auth ----------

export async function login(formData: FormData) {
  const password = str(formData, "password");
  if (password && password === (process.env.APP_PASSWORD || "akara2026")) {
    await createSession();
    redirect("/");
  }
  redirect("/login?error=1");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

// ---------- services ----------

export async function saveService(formData: FormData) {
  await requireAuth();
  const id = str(formData, "id");
  const data = {
    name: str(formData, "name"),
    category: str(formData, "category") || "WEBSITE",
    description: str(formData, "description"),
    price: num(formData, "price"),
    priceType: str(formData, "priceType") || "FIXED",
    unitLabel: str(formData, "unitLabel"),
    active: formData.get("active") === "on",
  };
  if (!data.name) redirect(id ? `/services/${id}` : "/services/new");
  if (id) {
    await prisma.service.update({ where: { id: Number(id) }, data });
  } else {
    const max = await prisma.service.aggregate({ _max: { sortOrder: true } });
    await prisma.service.create({ data: { ...data, sortOrder: (max._max.sortOrder ?? 0) + 1 } });
  }
  revalidatePath("/services");
  redirect("/services");
}

export async function deleteService(formData: FormData) {
  await requireAuth();
  await prisma.service.delete({ where: { id: Number(str(formData, "id")) } });
  revalidatePath("/services");
  redirect("/services");
}

// ---------- clients ----------

export async function saveClient(formData: FormData) {
  await requireAuth();
  const id = str(formData, "id");
  const data = {
    name: str(formData, "name"),
    company: str(formData, "company"),
    phone: str(formData, "phone"),
    email: str(formData, "email"),
    notes: str(formData, "notes"),
  };
  if (!data.name) redirect(id ? `/clients/${id}` : "/clients/new");
  let clientId: number;
  if (id) {
    await prisma.client.update({ where: { id: Number(id) }, data });
    clientId = Number(id);
  } else {
    const created = await prisma.client.create({ data });
    clientId = created.id;
  }
  revalidatePath("/clients");
  redirect(`/clients/${clientId}`);
}

export async function deleteClient(formData: FormData) {
  await requireAuth();
  const id = Number(str(formData, "id"));
  const docCount = await prisma.document.count({ where: { clientId: id } });
  if (docCount > 0) redirect(`/clients/${id}?error=has-documents`);
  await prisma.client.delete({ where: { id } });
  revalidatePath("/clients");
  redirect("/clients");
}

// ---------- quotes & invoices ----------

export type DocPayload = {
  id?: number;
  type: "QUOTE" | "INVOICE";
  clientId: number;
  issueDate: string;
  dueDate: string;
  discount: number;
  notes: string;
  items: { name: string; detail: string; qty: number; unitPrice: number }[];
};

export async function saveDocument(payload: DocPayload) {
  await requireAuth();
  const items = payload.items
    .filter((i) => i.name.trim())
    .map((i) => ({
      name: i.name.trim(),
      detail: i.detail.trim(),
      qty: Number.isFinite(i.qty) && i.qty > 0 ? i.qty : 1,
      unitPrice: Number.isFinite(i.unitPrice) ? i.unitPrice : 0,
    }));
  if (!payload.clientId || items.length === 0) {
    return { error: "Please choose a client and add at least one item." };
  }
  const base = {
    clientId: payload.clientId,
    issueDate: dateOrNull(payload.issueDate) ?? new Date(),
    dueDate: dateOrNull(payload.dueDate),
    discount: Number.isFinite(payload.discount) && payload.discount > 0 ? payload.discount : 0,
    notes: payload.notes.trim(),
  };
  let id = payload.id;
  if (id) {
    await prisma.$transaction([
      prisma.lineItem.deleteMany({ where: { documentId: id } }),
      prisma.document.update({
        where: { id },
        data: { ...base, items: { create: items } },
      }),
    ]);
    if (payload.type === "INVOICE") await refreshInvoiceStatus(id);
  } else {
    const number = await nextDocNumber(payload.type);
    const created = await prisma.document.create({
      data: {
        ...base,
        number,
        type: payload.type,
        status: payload.type === "QUOTE" ? "DRAFT" : "UNPAID",
        items: { create: items },
      },
    });
    id = created.id;
  }
  revalidatePath("/quotes");
  revalidatePath("/invoices");
  redirect(payload.type === "QUOTE" ? `/quotes/${id}` : `/invoices/${id}`);
}

export async function setDocumentStatus(formData: FormData) {
  await requireAuth();
  const id = Number(str(formData, "id"));
  const status = str(formData, "status");
  const allowed = ["DRAFT", "SENT", "ACCEPTED", "DECLINED", "UNPAID", "VOID"];
  if (!allowed.includes(status)) return;
  await prisma.document.update({ where: { id }, data: { status } });
  if (status === "UNPAID") await refreshInvoiceStatus(id);
  const doc = await prisma.document.findUnique({ where: { id } });
  revalidatePath("/quotes");
  revalidatePath("/invoices");
  redirect(doc?.type === "QUOTE" ? `/quotes/${id}` : `/invoices/${id}`);
}

export async function convertQuoteToInvoice(formData: FormData) {
  await requireAuth();
  const id = Number(str(formData, "id"));
  const quote = await prisma.document.findUnique({ where: { id }, include: { items: true } });
  if (!quote || quote.type !== "QUOTE") redirect("/quotes");
  const number = await nextDocNumber("INVOICE");
  const invoice = await prisma.document.create({
    data: {
      number,
      type: "INVOICE",
      status: "UNPAID",
      clientId: quote.clientId,
      issueDate: new Date(),
      discount: quote.discount,
      notes: quote.notes,
      quoteId: quote.id,
      items: {
        create: quote.items.map((i) => ({
          name: i.name,
          detail: i.detail,
          qty: i.qty,
          unitPrice: i.unitPrice,
        })),
      },
    },
  });
  await prisma.document.update({ where: { id }, data: { status: "CONVERTED" } });
  revalidatePath("/quotes");
  revalidatePath("/invoices");
  redirect(`/invoices/${invoice.id}`);
}

export async function deleteDocument(formData: FormData) {
  await requireAuth();
  const id = Number(str(formData, "id"));
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) redirect("/");
  await prisma.document.delete({ where: { id } });
  revalidatePath("/quotes");
  revalidatePath("/invoices");
  redirect(doc!.type === "QUOTE" ? "/quotes" : "/invoices");
}

// ---------- payments ----------

export async function recordPayment(formData: FormData) {
  await requireAuth();
  const documentId = Number(str(formData, "documentId"));
  const amount = num(formData, "amount");
  if (amount > 0) {
    await prisma.payment.create({
      data: {
        documentId,
        amount,
        method: str(formData, "method") || "CASH",
        reference: str(formData, "reference"),
        note: str(formData, "note"),
        paidAt: dateOrNull(str(formData, "paidAt")) ?? new Date(),
      },
    });
    await refreshInvoiceStatus(documentId);
  }
  revalidatePath("/invoices");
  redirect(`/invoices/${documentId}`);
}

export async function deletePayment(formData: FormData) {
  await requireAuth();
  const id = Number(str(formData, "id"));
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (payment) {
    await prisma.payment.delete({ where: { id } });
    await refreshInvoiceStatus(payment.documentId);
    revalidatePath("/invoices");
    redirect(`/invoices/${payment.documentId}`);
  }
  redirect("/invoices");
}

// ---------- settings ----------

export async function saveSettings(formData: FormData) {
  await requireAuth();
  const data = {
    businessName: str(formData, "businessName") || "Akara Media",
    tagline: str(formData, "tagline"),
    phone: str(formData, "phone"),
    email: str(formData, "email"),
    address: str(formData, "address"),
    paymentInfo: str(formData, "paymentInfo"),
    invoiceNote: str(formData, "invoiceNote"),
    quoteNote: str(formData, "quoteNote"),
  };
  await prisma.setting.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  revalidatePath("/settings");
  redirect("/settings?saved=1");
}
