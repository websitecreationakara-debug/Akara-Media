export const round2 = (n: number) => Math.round(n * 100) / 100;

export const money = (n: number) =>
  "$" +
  round2(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const CATEGORIES = ["WEBSITE", "MEDIA", "MARKETING"] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  WEBSITE: "Website Creation",
  MEDIA: "Media Creation",
  MARKETING: "Marketing Services",
};

export const PRICE_TYPES: Record<string, string> = {
  FIXED: "Fixed price",
  FROM: "Starting from",
  PER_HOUR: "Per hour",
  PER_MONTH: "Per month",
  PER_ITEM: "Per item",
};

export const PRICE_SUFFIX: Record<string, string> = {
  FIXED: "",
  FROM: "+",
  PER_HOUR: "/hr",
  PER_MONTH: "/mo",
  PER_ITEM: "/item",
};

export const PAYMENT_METHODS: Record<string, string> = {
  CASH: "Cash",
  ABA: "ABA Transfer",
  WING: "Wing",
  BANK: "Bank Transfer / QR",
  OTHER: "Other",
};

export const QUOTE_STATUSES = ["DRAFT", "SENT", "ACCEPTED", "DECLINED", "CONVERTED"];
export const INVOICE_STATUSES = ["UNPAID", "PARTIAL", "PAID", "VOID"];

export const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  ACCEPTED: "bg-green-100 text-green-700",
  DECLINED: "bg-red-100 text-red-600",
  CONVERTED: "bg-purple-100 text-purple-700",
  UNPAID: "bg-amber-100 text-amber-700",
  PARTIAL: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700",
  VOID: "bg-gray-200 text-gray-500",
};

export const unitSuffix = (unit: string) =>
  unit === "hour" ? " hrs" : unit === "month" ? " mo" : "";

export function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function dateInputValue(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}
