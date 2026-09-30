import type { APIContext, APIRoute } from "astro";
import { DOBRO_LEADS_URL, DOBRO_WEBHOOK_SECRET } from "astro:env/server";
import { createHmac, randomUUID } from "node:crypto";

// Körs on-demand som Vercel-funktion; resten av sajten är statisk.
export const prerender = false;

const DEFAULT_LEADS_URL = "https://www.dobro-leads.se/api/leads/inbound";
const DIVISIONS = ["renovering", "badrum", "annat"] as const;
const MAX_LENGTH = 5000;

type Division = (typeof DIVISIONS)[number];

interface LeadPayload {
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  submittedAt: string;
  division: Division | null;
  address: string | null;
  city: string | null;
  timeline: string | null;
  budget: number | null;
  consent: boolean;
  website: string;
  formVersion: "v2";
  clientIp: string | null;
  userAgent: string | null;
}

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

/** Läser JSON eller FormData till ett platt objekt med strängvärden. */
async function readFields(request: Request): Promise<Record<string, unknown> | null> {
  const type = request.headers.get("content-type") ?? "";
  try {
    if (type.includes("application/json")) {
      const data: unknown = await request.json();
      return data && typeof data === "object" && !Array.isArray(data)
        ? (data as Record<string, unknown>)
        : null;
    }
    if (
      type.includes("multipart/form-data") ||
      type.includes("application/x-www-form-urlencoded")
    ) {
      return Object.fromEntries(await request.formData());
    }
  } catch {
    return null;
  }
  return null;
}

function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, MAX_LENGTH);
  return trimmed || null;
}

function isConsent(value: unknown): boolean {
  return value === true || value === "true" || value === "on" || value === "1";
}

/** "250 000 kr" → 250000. Tomt eller orimligt → null. */
function parseBudget(value: unknown): number | null {
  if (typeof value === "number") return Number.isSafeInteger(value) && value >= 0 ? value : null;
  if (typeof value !== "string") return null;
  const digits = value.replace(/\D/g, "");
  if (!digits || digits.length > 12) return null;
  return Number.parseInt(digits, 10);
}

function clientIp({ clientAddress, request }: APIContext): string | null {
  try {
    if (clientAddress) return clientAddress;
  } catch {
    // clientAddress kastar om adaptern inte kan avgöra adressen.
  }
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
}

export const POST: APIRoute = async (context) => {
  const fields = await readFields(context.request);
  if (!fields) return json({ ok: false, error: "invalid_body" }, 400);

  const name = text(fields.name);
  const email = text(fields.email);
  const phone = text(fields.phone);
  const message = text(fields.message);
  const consent = isConsent(fields.consent);
  const division = text(fields.division);

  const errors: string[] = [];
  if (!name) errors.push("name");
  if (!message) errors.push("message");
  if (!email && !phone) errors.push("contact");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("email");
  if (!consent) errors.push("consent");
  if (division && !DIVISIONS.includes(division as Division)) errors.push("division");
  if (errors.length) return json({ ok: false, errors }, 400);

  const payload: LeadPayload = {
    name: name!,
    email,
    phone,
    message: message!,
    submittedAt: new Date().toISOString(),
    division: division as Division | null,
    address: text(fields.address),
    city: text(fields.city),
    timeline: text(fields.timeline),
    budget: parseBudget(fields.budget),
    consent,
    // Honeypot – skickas vidare oförändrad så att Lead Hub kan filtrera spam.
    website: typeof fields.website === "string" ? fields.website : "",
    formVersion: "v2",
    clientIp: clientIp(context),
    userAgent: context.request.headers.get("user-agent"),
  };

  if (!DOBRO_WEBHOOK_SECRET) {
    console.error("[lead] DOBRO_WEBHOOK_SECRET saknas – leadet kunde inte skickas.");
    return json({ ok: false }, 500);
  }

  // Signaturen gäller exakt den här strängen – skicka samma sträng som body.
  const body = JSON.stringify(payload);
  const signature =
    "sha256=" + createHmac("sha256", DOBRO_WEBHOOK_SECRET).update(body).digest("hex");

  try {
    const response = await fetch(DOBRO_LEADS_URL ?? DEFAULT_LEADS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Dobro-Signature": signature,
        "Idempotency-Key": randomUUID(),
      },
      body,
      signal: AbortSignal.timeout(10_000),
    });
    if (response.ok) return json({ ok: true }, 200);

    const detail = await response.text().catch(() => "");
    console.error(`[lead] Lead Hub svarade ${response.status}: ${detail.slice(0, 1000)}`);
    return json({ ok: false }, 502);
  } catch (error) {
    console.error("[lead] Kunde inte nå Lead Hub:", error);
    return json({ ok: false }, 504);
  }
};
