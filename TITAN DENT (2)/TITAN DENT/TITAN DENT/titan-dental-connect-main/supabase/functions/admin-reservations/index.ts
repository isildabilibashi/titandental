import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token",
};

async function validateSession(supabase: ReturnType<typeof createClient>, req: Request): Promise<boolean> {
  const token = req.headers.get("x-admin-token");
  if (!token) return false;
  const { data } = await supabase
    .from("admin_sessions")
    .select("id")
    .eq("token", token)
    .single();
  return !!data;
}

async function sendApprovalEmail(
  resendApiKey: string,
  email: string,
  name: string,
  date: string,
  time: string
): Promise<boolean> {
  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1a1a1a; margin-bottom: 8px;">Reservation Approved</h2>
      <p style="color: #555; font-size: 14px;">Dear ${name},</p>
      <p style="color: #555; font-size: 14px;">Your reservation has been approved and you may arrive at the selected time.</p>
      <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="color: #888; font-size: 12px; margin: 0 0 8px;">Reservation Details:</p>
        <p style="font-size: 16px; font-weight: bold; margin: 4px 0; color: #1a1a1a;">Date: ${formattedDate}</p>
        <p style="font-size: 16px; font-weight: bold; margin: 4px 0; color: #1a1a1a;">Time: ${time}</p>
      </div>
      <p style="color: #888; font-size: 12px;">If you need to cancel or reschedule, please contact us.</p>
      <p style="color: #888; font-size: 12px;">Titan Dental Clinic</p>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: "Titan Dental <onboarding@resend.dev>",
      to: [email],
      subject: "Your Reservation Has Been Approved - Titan Dental",
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Resend API error:", res.status, body);
    return false;
  }

  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const isValid = await validateSession(supabase, req);
  if (!isValid) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { action, id, status, date, email_search } = await req.json();

    if (action === "list") {
      let query = supabase
        .from("reservations")
        .select("*")
        .order("created_at", { ascending: false });

      if (date) {
        query = query.eq("date", date);
      }

      if (email_search) {
        query = query.ilike("email", `%${email_search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return new Response(
        JSON.stringify({ data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "update_status") {
      if (!id || !status) {
        return new Response(
          JSON.stringify({ error: "id and status required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: reservation, error: fetchError } = await supabase
        .from("reservations")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !reservation) {
        return new Response(
          JSON.stringify({ error: "Reservation not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase
        .from("reservations")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      if (status === "approved") {
        const resendApiKey = Deno.env.get("RESEND_API_KEY");
        if (resendApiKey && reservation.email) {
          await sendApprovalEmail(
            resendApiKey,
            reservation.email,
            reservation.name,
            reservation.date,
            reservation.time
          );
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "delete") {
      if (!id) {
        return new Response(
          JSON.stringify({ error: "id required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase
        .from("reservations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "stats") {
      const { data, error } = await supabase
        .from("reservations")
        .select("status");

      if (error) throw error;

      const stats = {
        total: data.length,
        pending: data.filter((r: { status: string }) => r.status === "pending").length,
        approved: data.filter((r: { status: string }) => r.status === "approved").length,
        rejected: data.filter((r: { status: string }) => r.status === "rejected").length,
      };

      return new Response(
        JSON.stringify({ data: stats }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
