import { sendQuoteEmails } from "@/lib/email";
import { serviceList } from "@/lib/site-data";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

const validServices = new Set(["general", ...serviceList.map((service) => service.slug)]);
const validKinds = new Set(["enquiry", "booking", "quote"]);

function text(value: unknown, max = 5000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    if (body.website) return Response.json({ ok: true });

    const payload = {
      request_kind: text(body.request_kind, 20),
      service_slug: text(body.service_slug, 40),
      inventory_sku: text(body.inventory_sku, 100) || null,
      first_name: text(body.first_name, 80),
      last_name: text(body.last_name, 80),
      email: text(body.email, 254).toLowerCase(),
      phone: text(body.phone, 40),
      street_address: text(body.street_address, 240) || null,
      address_line_2: text(body.address_line_2, 240) || null,
      city: text(body.city, 120) || null,
      postcode: text(body.postcode, 20) || null,
      preferred_date: text(body.preferred_date, 10) || null,
      preferred_time: text(body.preferred_time, 40) || null,
      message: text(body.message, 5000) || null,
      details: typeof body.details === "object" && body.details !== null ? body.details : {},
      consent_terms: body.consent_terms === true,
    };

    if (!validKinds.has(payload.request_kind) || !validServices.has(payload.service_slug)) {
      return Response.json({ error: "Please choose a valid service." }, { status: 400 });
    }
    if (!payload.first_name || !payload.last_name || !payload.email.includes("@") || payload.phone.length < 6 || !payload.consent_terms) {
      return Response.json({ error: "Please complete all required fields and accept the terms." }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    if (payload.inventory_sku) {
      const { data: item } = await supabase.from("inventory_items").select("sku,service_slug,active,stock_quantity").eq("sku", payload.inventory_sku).eq("service_slug", payload.service_slug).eq("active", true).gt("stock_quantity", 0).maybeSingle();
      if (!item) return Response.json({ error: "That option is no longer available. Please choose another." }, { status: 409 });
    }

    const { data: savedRequest, error } = await supabase
      .from("customer_requests")
      .insert(payload)
      .select("id")
      .single();
    if (error || !savedRequest) {
      console.error("Supabase request insert failed", error?.code || "missing_row");
      return Response.json({ error: "We could not send your request. Please call 022 183 1176." }, { status: 500 });
    }

    if (payload.request_kind === "quote") {
      const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://hib.gdn").replace(/\/$/, "");
      try {
        await sendQuoteEmails(savedRequest.id, {
          customerName: `${payload.first_name} ${payload.last_name}`.trim(),
          reference: savedRequest.id.slice(0, 8).toUpperCase(),
          serviceName: serviceList.find((service) => service.slug === payload.service_slug)?.shortName || payload.service_slug,
          email: payload.email,
          phone: payload.phone,
          address: [payload.street_address, payload.address_line_2, payload.city, payload.postcode].filter(Boolean).join(", ") || "Not provided",
          preferredTime: [payload.preferred_date, payload.preferred_time].filter(Boolean).join(" · ") || "Not specified",
          notes: payload.message,
          adminUrl: `${siteUrl}/admin`,
        });
      } catch (emailError) {
        console.error("Quote email delivery failed", emailError instanceof Error ? emailError.message : "unknown");
      }
    }

    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
}
