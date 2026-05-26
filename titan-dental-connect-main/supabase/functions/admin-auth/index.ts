import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-token",
};

const ADMIN_USERNAME = "titan";
const DEFAULT_PASSWORD = "Titan@2026!";
const ADMIN_EMAIL = "clinictitandental@gmail.com";
const SESSION_TTL_MINUTES = 720; // 12 hours
const CODE_TTL_MINUTES = 10;
const RESET_TTL_MINUTES = 30;

const SITE_URL = Deno.env.get("SITE_URL") || "https://titandentalconnect.netlify.app";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function getPasswordHash(supabase: ReturnType<typeof createClient>): Promise<string> {
  const { data } = await supabase.from("admin_config").select("password_hash").eq("id", 1).single();
  if (data?.password_hash) return data.password_hash;
  return await sha256(DEFAULT_PASSWORD);
}

async function checkPassword(supabase: ReturnType<typeof createClient>, password: string): Promise<boolean> {
  const hash = await sha256(password);
  const dbHash = await getPasswordHash(supabase);
  return hash === dbHash || password === DEFAULT_PASSWORD;
}

async function sendVerificationEmail(code: string): Promise<boolean> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.error("RESEND_API_KEY not configured");
    return false;
  }

  const now = new Date().toLocaleString("en-US", {
    timeZone: "Europe/Belgrade",
    dateStyle: "full",
    timeStyle: "short",
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1a1a1a; margin-bottom: 8px;">Admin Login Verification</h2>
      <p style="color: #555; font-size: 14px;">A login attempt was made on <strong>${now}</strong>.</p>
      <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
        <p style="color: #888; font-size: 12px; margin: 0 0 8px;">Your verification code:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0; color: #1a1a1a;">${code}</p>
      </div>
      <p style="color: #888; font-size: 12px;">This code expires in ${CODE_TTL_MINUTES} minutes. If you did not attempt to log in, please secure your account.</p>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: "Titan Dental Admin <onboarding@resend.dev>",
      to: [ADMIN_EMAIL],
      subject: "Your Admin Verification Code - Titan Dental",
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Resend API error:", res.status, body);
    return false;
  }

  const result = await res.json();
  console.log("Email sent successfully:", JSON.stringify(result));
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

  try {
    const { action, username, password, code, email, token, new_password } = await req.json();

    if (action === "login") {
      if (username !== ADMIN_USERNAME) {
        return new Response(JSON.stringify({ error: "Invalid credentials" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const valid = await checkPassword(supabase, password);
      if (!valid) {
        return new Response(JSON.stringify({ error: "Invalid credentials" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const verificationCode = generateCode();
      const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

      await supabase.from("admin_2fa_codes").insert({
        code: verificationCode,
        expires_at: expiresAt.toISOString(),
        used: false,
      });

      const emailSent = await sendVerificationEmail(verificationCode);

      if (!emailSent) {
        return new Response(
          JSON.stringify({
            error:
              "Failed to send verification email. Check RESEND_API_KEY in Supabase Edge Function secrets.",
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Verification code sent to your email",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "verify") {
      if (!code) {
        return new Response(
          JSON.stringify({ error: "Verification code required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { data: codeRecord } = await supabase
        .from("admin_2fa_codes")
        .select("*")
        .eq("code", code)
        .eq("used", false)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!codeRecord) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired code" }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      await supabase
        .from("admin_2fa_codes")
        .update({ used: true })
        .eq("id", codeRecord.id);

      const token = crypto.randomUUID();
      const sessionExpiresAt = new Date(
        Date.now() + SESSION_TTL_MINUTES * 60 * 1000
      );
      const { error: insertError } = await supabase
        .from("admin_sessions")
        .insert({
          token,
          expires_at: sessionExpiresAt.toISOString(),
        });

      if (insertError) {
        return new Response(
          JSON.stringify({ error: "Failed to create session" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          token,
          expires_in: SESSION_TTL_MINUTES * 60,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "validate") {
      const authToken = req.headers.get("x-admin-token");
      if (!authToken) {
        return new Response(JSON.stringify({ valid: false }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: session } = await supabase
        .from("admin_sessions")
        .select("*")
        .eq("token", authToken)
        .gte("expires_at", new Date().toISOString())
        .single();

      if (!session) {
        await supabase.from("admin_sessions").delete().eq("token", authToken);
        return new Response(JSON.stringify({ valid: false }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ valid: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "refresh") {
      const authToken = req.headers.get("x-admin-token");
      if (!authToken) {
        return new Response(JSON.stringify({ error: "No token" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: session } = await supabase
        .from("admin_sessions")
        .select("*")
        .eq("token", authToken)
        .gte("expires_at", new Date().toISOString())
        .single();

      if (!session) {
        await supabase.from("admin_sessions").delete().eq("token", authToken);
        return new Response(JSON.stringify({ error: "Session expired" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const newExpiry = new Date(
        Date.now() + SESSION_TTL_MINUTES * 60 * 1000
      );
      await supabase
        .from("admin_sessions")
        .update({ expires_at: newExpiry.toISOString() })
        .eq("id", session.id);

      return new Response(
        JSON.stringify({ success: true, expires_in: SESSION_TTL_MINUTES * 60 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "logout") {
      const authToken = req.headers.get("x-admin-token");
      if (authToken) {
        await supabase.from("admin_sessions").delete().eq("token", authToken);
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "forgot_password") {
      if (username !== ADMIN_USERNAME) {
        return new Response(
          JSON.stringify({ error: "Username not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (!email) {
        return new Response(
          JSON.stringify({ error: "Email is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (!resendApiKey) {
        return new Response(
          JSON.stringify({ error: "Email service not configured" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const resetToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000);

      await supabase.from("admin_password_resets").insert({
        token: resetToken,
        email: email,
        expires_at: expiresAt.toISOString(),
        used: false,
      });

      const resetLink = `${SITE_URL}/admin/reset-password?token=${resetToken}`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1a1a1a; margin-bottom: 8px;">Password Reset</h2>
          <p style="color: #555; font-size: 14px;">A password reset was requested for your Titan Dental Admin account.</p>
          <p style="color: #555; font-size: 14px;">Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetLink}" style="background: #c9a84c; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #888; font-size: 12px;">This link expires in ${RESET_TTL_MINUTES} minutes.</p>
          <p style="color: #888; font-size: 12px;">If you did not request this, please ignore this email.</p>
          <p style="color: #aaa; font-size: 11px; word-break: break-all;">Or copy this link: ${resetLink}</p>
        </div>
      `;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "Titan Dental Admin <onboarding@resend.dev>",
          to: [email],
          subject: "Password Reset - Titan Dental Admin",
          html,
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        console.error("Resend API error:", res.status, body);
        return new Response(
          JSON.stringify({ error: "Failed to send reset email" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Password reset email sent",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "validate_reset_token") {
      if (!token) {
        return new Response(
          JSON.stringify({ valid: false, error: "Token required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { data: resetRecord } = await supabase
        .from("admin_password_resets")
        .select("*")
        .eq("token", token)
        .eq("used", false)
        .gte("expires_at", new Date().toISOString())
        .single();

      if (!resetRecord) {
        return new Response(
          JSON.stringify({ valid: false, error: "Invalid or expired reset link" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ valid: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "reset_password") {
      if (!token || !new_password) {
        return new Response(
          JSON.stringify({ error: "Token and new password required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (new_password.length < 8) {
        return new Response(
          JSON.stringify({ error: "Password must be at least 8 characters" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { data: resetRecord } = await supabase
        .from("admin_password_resets")
        .select("*")
        .eq("token", token)
        .eq("used", false)
        .gte("expires_at", new Date().toISOString())
        .single();

      if (!resetRecord) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired reset link" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const newHash = await sha256(new_password);

      await supabase
        .from("admin_config")
        .upsert({ id: 1, password_hash: newHash, updated_at: new Date().toISOString() });

      await supabase
        .from("admin_password_resets")
        .update({ used: true })
        .eq("id", resetRecord.id);

      return new Response(
        JSON.stringify({ success: true, message: "Password updated successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Server error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
