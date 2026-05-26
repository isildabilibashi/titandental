import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, Loader2, Check, AlertTriangle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const AUTH_FN = `${SUPABASE_URL}/functions/v1/admin-auth`;

const AdminResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setValidating(false);
      return;
    }

    fetch(AUTH_FN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ action: "validate_reset_token", token }),
    })
      .then((res) => res.json())
      .then((data) => {
        setTokenValid(data?.valid === true);
      })
      .catch(() => {
        setTokenValid(false);
      })
      .finally(() => {
        setValidating(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    if (password.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(AUTH_FN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ action: "reset_password", token, new_password: password }),
      });
      const data = await res.json();

      if (!res.ok || data?.error) {
        toast({ title: "Error", description: data?.error || "Something went wrong", variant: "destructive" });
        return;
      }

      setDone(true);
      toast({ title: "Success", description: "Password updated successfully" });
    } catch {
      toast({ title: "Error", description: "Could not connect to server", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!token || !tokenValid) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-card border border-border rounded-2xl p-8 shadow-gold">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="font-display text-2xl text-foreground mb-2">Invalid Link</h2>
            <p className="text-muted-foreground mb-6">
              This reset link is invalid or has expired. Please request a new one.
            </p>
            <button
              onClick={() => navigate("/admin-login")}
              className="w-full gradient-gold text-secondary py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-card border border-border rounded-2xl p-8 shadow-gold">
            <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-secondary" />
            </div>
            <h2 className="font-display text-2xl text-foreground mb-2">Password Updated</h2>
            <p className="text-muted-foreground mb-6">
              Your password has been changed successfully. You can now log in with your new password.
            </p>
            <button
              onClick={() => navigate("/admin-login")}
              className="w-full gradient-gold text-secondary py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Go to Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full gradient-gold flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-secondary" />
          </div>
          <h1 className="font-display text-3xl text-primary-foreground">
            TITAN <span className="text-gold">ADMIN</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Set New Password</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-gold">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password (min 8 characters)"
                  className="w-full bg-background border border-border rounded-lg py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-background border border-border rounded-lg py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-400 text-xs mt-1 ml-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword || password !== confirmPassword}
              className="w-full gradient-gold text-secondary py-3 rounded-lg font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Update Password
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminResetPassword;
