import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, User, ArrowRight, Loader2, KeyRound, Check, Mail, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";


const API_BASE = "";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"login" | "verify" | "forgot" | "reset">("login");
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();
   const { toast } = useToast();
   const { refreshAuth } = useAuth();

   const isTokenExpired = useCallback((expiresAt: string): boolean => {
     try {
       const expirationTime = new Date(expiresAt).getTime();
       const currentTime = new Date().getTime();
       return currentTime > expirationTime;
     } catch {
       return true;
     }
   }, []);

   useEffect(() => {
    // Auto-login if token exists on mount
    const token = localStorage.getItem("admin_token");
    const expiresAt = localStorage.getItem("admin_token_expires");
    if (token && expiresAt) {
      // Quick local expiry check before making network call
      if (isTokenExpired(expiresAt)) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_token_expires");
        return;
      }
      refreshAuth().then((valid) => {
        if (valid) {
          navigate("/admin");
        } else {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_token_expires");
        }
      });
    }
  }, [refreshAuth, navigate, isTokenExpired]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok || data?.error) {
        toast({
          title: "Login Failed",
          description: data?.error || "Server error",
          variant: "destructive",
        });
        return;
      }

      if (data?.success) {
        setStep("verify");
        toast({ title: "Code Sent", description: "Check your email for the verification code" });
      }
    } catch {
      toast({
        title: "Error",
        description: "Could not connect to server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

   const handleVerify = async (e: React.FormEvent) => {
     e.preventDefault();
     setLoading(true);

     try {
       const res = await fetch(`${API_BASE}/api/admin/verify`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ code: verificationCode }),
       });
       const data = await res.json();

       if (!res.ok || data?.error) {
         toast({
           title: "Verification Failed",
           description: data?.error || "Server error",
           variant: "destructive",
         });
         return;
       }

       if (!data?.token) {
         toast({
           title: "Verification Failed",
           description: "No token received",
           variant: "destructive",
         });
         return;
       }

       // Calculate expiration time (12 hours from now)
       const expiresAt = new Date(new Date().getTime() + 12 * 60 * 60 * 1000).toISOString();
       localStorage.setItem("admin_token", data.token);
       localStorage.setItem("admin_token_expires", expiresAt);

       // Validate token with server and sync auth state via context
       const isValid = await refreshAuth();
       if (!isValid) {
         toast({
           title: "Session Error",
           description: "Could not establish session. Please try again.",
           variant: "destructive",
         });
         localStorage.removeItem("admin_token");
         localStorage.removeItem("admin_token_expires");
         setLoading(false);
         return;
       }

       toast({ title: "Welcome", description: "Access granted for 12 hours" });
       navigate("/admin");
     } catch {
       toast({
         title: "Error",
         description: "Could not connect to server",
         variant: "destructive",
       });
     } finally {
       setLoading(false);
     }
   };

  const handleBack = () => {
    if (step === "reset") {
      setStep("forgot");
    } else {
      setStep("login");
    }
    setVerificationCode("");
    setNewPassword("");
  };

  const handleResetPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode, new_password: newPassword }),
      });
      const data = await res.json();

      if (!res.ok || data?.error) {
        toast({
          title: "Error",
          description: data?.error || "Failed to reset password",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      toast({ title: "Success", description: "Password has been reset successfully" });
      setStep("login");
      setVerificationCode("");
      setNewPassword("");
    } catch {
      toast({
        title: "Error",
        description: "Could not connect to server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: forgotUsername, password: "RESET_PASSWORD", email: forgotEmail }),
      });
      const data = await res.json();

      if (!res.ok || data?.error) {
        toast({
          title: "Error",
          description: data?.error || "Something went wrong",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Email Sent", description: `Password reset instructions sent to ${forgotEmail}` });
      setStep("reset");
      setForgotUsername("");
      setForgotEmail("");
    } catch {
      toast({
        title: "Error",
        description: "Could not connect to server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-muted-foreground mt-1 text-sm">Secure Access Portal</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-gold">
          {step === "login" ? (
            <motion.form
              key="login-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleLogin}
              className="space-y-5"
            >
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full bg-background border border-border rounded-lg py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-background border border-border rounded-lg py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !username || !password}
                className="w-full gradient-gold text-secondary py-3 rounded-lg font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Login
              </button>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to Website
              </button>

              <button
                type="button"
                onClick={() => { setStep("forgot"); setForgotUsername(username); }}
                className="w-full text-sm text-gold/80 hover:text-gold transition-colors"
              >
                Forgot Password?
              </button>
            </motion.form>
          ) : step === "verify" ? (
            <motion.form
              key="verify-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleVerify}
              className="space-y-5"
            >
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Verification Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full bg-background border border-border rounded-lg py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors font-mono text-lg tracking-widest text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || verificationCode.length < 6}
                className="w-full gradient-gold text-secondary py-3 rounded-lg font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Verify
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to login
              </button>
            </motion.form>
          ) : step === "reset" ? (
            <motion.form
              key="reset-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Verification Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full bg-background border border-border rounded-lg py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors font-mono text-lg tracking-widest text-center"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-background border border-border rounded-lg py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={loading || verificationCode.length < 6 || !newPassword}
                className="w-full gradient-gold text-secondary py-3 rounded-lg font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                onClick={handleResetPassword}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Reset Password
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to forgot
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="forgot-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleForgotPassword}
              className="space-y-5"
            >
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={forgotUsername}
                    onChange={(e) => setForgotUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full bg-background border border-border rounded-lg py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-background border border-border rounded-lg py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Enter your username and email. We'll send the password to your email.
              </p>

              <button
                type="submit"
                disabled={loading || !forgotUsername || !forgotEmail}
                className="w-full gradient-gold text-secondary py-3 rounded-lg font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                Send Recovery Email
              </button>

              <button
                type="button"
                onClick={() => { setStep("login"); setForgotUsername(""); setForgotEmail(""); }}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to login
              </button>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
