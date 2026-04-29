import { NextResponse } from "next/server";
import { checkEligibility } from "@/lib/eligibility";
import { createClient } from "@/lib/supabase/server";
import { limit } from "@/lib/ratelimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "local";
    const ok = await limit(ip, "check");
    if (!ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    const body = await req.json();
    const result = checkEligibility(body);

    let claimId: string | undefined;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user && result.eligible) {
        const { data } = await supabase.from("claims").insert({
          user_id: user.id,
          flight_number: body.flightNumber ?? null,
          depart: body.depIata,
          arrive: body.arrIata,
          flight_date: body.flightDate ?? null,
          delay_hours: body.arrivalDelayHours ?? null,
          reason: body.eventType === "DELAYED" ? "delay"
            : body.eventType === "CANCELLED" ? "cancellation"
            : "denied_boarding",
          extraordinary: false,
          eligible: result.eligible,
          amount_eur: result.currency === "EUR" ? result.amount : null,
          amount_gbp: result.currency === "GBP" ? result.amount : null,
          regulation: result.jurisdiction,
          status: "draft",
        }).select("id").single();
        claimId = data?.id;
      }
    } catch {
      // Never fail the check if saving fails
    }

    return NextResponse.json({ ...result, ...(claimId ? { claimId } : {}) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Bad request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
