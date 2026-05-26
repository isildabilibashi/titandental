import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon, Clock, User, Phone, Mail, LogOut, Check, X,
  Printer, Download, ChevronRight, Loader2, AlertCircle, Trash2, Filter, Radio,
  Plus, MessageSquare, BarChart3, Send, CalendarDays
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
 
 
const timeSlots = [
  "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"
];
 
interface Reservation {
  id: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  status: string;
  notes: string | null;
  created_at: string;
}
 
const statusStyles: Record<string, string> = {
  approved: "bg-emerald-500 text-emerald-400 border-emerald-500",
  pending: "bg-amber-500 text-amber-400 border-amber-500",
  rejected: "bg-red-500 text-red-400 border-red-500",
};
 
type TimeFilter = "all" | "past" | "today" | "upcoming";
type StatusFilter = "all" | "pending" | "approved" | "rejected";
 
const API_BASE = import.meta.env.VITE_API_URL || "https://titandent-backend.onrender.com";

const Admin = () => {
   const [reservations, setReservations] = useState<Reservation[]>([]);
   const [selectedDate, setSelectedDate] = useState<Date>(new Date());
   const [reservationsDate, setReservationsDate] = useState<string>(new Date().toISOString().split("T")[0]);
   const [scheduleDate, setScheduleDate] = useState<string>(new Date().toISOString().split("T")[0]);
   const [scheduleView, setScheduleView] = useState<"list" | "schedule">("schedule");
   const [activeTab, setActiveTab] = useState<"home" | "reservations" | "add" | "today">("home");
   const [loading, setLoading] = useState(true);
   const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
   const [todayStats, setTodayStats] = useState({ total: 0, pending: 0, approved: 0 });

  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [live, setLive] = useState(true);
  const [newReservation, setNewReservation] = useState({ name: "", phone: "", email: "", date: "", time: "", notes: "" });
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fromSchedule, setFromSchedule] = useState(false);
  const [downloadPeriod, setDownloadPeriod] = useState<"day" | "month" | "year">("day");
  const [downloadDate, setDownloadDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const { toast } = useToast();
  const { logout } = useAuth();
  const sessionErrorToastShown = useRef(false);

  const token = localStorage.getItem("admin_token");

  const adminHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      "x-admin-token": token || "",
    }),
    [token],
  );

  const showSessionError = () => {
    if (!sessionErrorToastShown.current) {
      toast({ title: "Sesioni ka skaduar", description: "Ju lutem hyni perseri.", variant: "destructive" });
      sessionErrorToastShown.current = true;
    }
  };
 
  const fetchReservations = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/reservations`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({ action: "list" }),
      });
      if (res.status === 401) {
        logout();
        showSessionError();
        return;
      }
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      if (data?.data) setReservations(data.data);
    } catch {
      return;
    } finally {
      setLoading(false);
    }
  }, [token, logout, adminHeaders]);
 
  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/reservations`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({ action: "stats" }),
      });
      if (res.status === 401) {
        logout();
        showSessionError();
        return;
      }
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      if (data?.data) setStats(data.data);
    } catch {
      return;
    }
  }, [token, logout, adminHeaders]);
 
  const fetchTodayStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/reservations`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({ action: "today_stats" }),
      });
      if (res.status === 401) {
        logout();
        showSessionError();
        return;
      }
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      if (data?.data) setTodayStats(data.data);
    } catch {
      return;
    }
  }, [token, logout, adminHeaders]);
 
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const validateSession = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/validate`, {
          method: "POST",
          headers: adminHeaders,
        });

        if (res.status === 401) {
          logout();
          showSessionError();
          return;
        }

        if (!res.ok) {
          setLoading(false);
          return;
        }

        const data = await res.json();
        if (!data?.valid) {
          logout();
          showSessionError();
          return;
        }

        fetchReservations();
        fetchStats();
        fetchTodayStats();
      } catch {
        return;
      } finally {
        setLoading(false);
      }
    };

    validateSession();

    const refreshInterval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/refresh`, {
          method: "POST",
          headers: adminHeaders,
        });

        if (res.status === 401) {
          logout();
          showSessionError();
          return;
        }

        if (!res.ok) {
          return;
        }

        const data = await res.json();
        if (!data?.success) {
          logout();
          showSessionError();
          return;
        }

        const newExpiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
        localStorage.setItem("admin_token_expires", newExpiresAt);
      } catch {
        return;
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [token, fetchReservations, fetchStats, fetchTodayStats, logout, adminHeaders]);
 
  useEffect(() => {
    if (!token) return;
    const pollInterval = setInterval(() => {
      fetchReservations();
      fetchStats();
      fetchTodayStats();
    }, 5000);
    return () => clearInterval(pollInterval);
  }, [token, fetchReservations, fetchStats]);
 
  const handleStatusChange = async (id: string, status: "approved" | "rejected") => {
    setProcessingId(id);
    toast({ title: status === "approved" ? "Duke konfirmuar..." : "Duke refuzuar...", description: "Duke dërguar email..." });
    try {
      const res = await fetch(`${API_BASE}/api/admin/reservations`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({ action: "update_status", id, status }),
      });
      if (!res.ok) {
        logout();
        toast({ title: "Sesioni ka skaduar", description: "Ju lutem hyni perseri.", variant: "destructive" });
        return;
      }
      toast({
        title: status === "approved" ? "Konfirmuar" : "Refuzuar",
        description: status === "approved" ? "Rezervimi u konfirmua dhe email-i u dërgua." : "Rezervimi u refuzua.",
      });
    } catch {
      toast({ title: "Error", description: "Could not update reservation", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };
 
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reservation? This action cannot be undone.")) return;
    setDeletingId(id);
    try {
      await fetch(`${API_BASE}/api/admin/reservations`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({ action: "delete", id }),
      });
      toast({ title: "Fshirë", description: "Reservation deleted successfully" });
      fetchReservations();
      fetchStats();
    } catch {
      toast({ title: "Error", description: "Could not delete reservation", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };
 
  const handleUpdateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReservation) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/reservations`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({
          action: "update",
          id: editingReservation.id,
          name: editingReservation.name,
          phone: editingReservation.phone,
          email: editingReservation.email,
          date: editingReservation.date,
          time: editingReservation.time,
          notes: editingReservation.notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Sukses", description: "Rezervimi u përditësua me sukses" });
        setEditingReservation(null);
        fetchReservations();
      } else {
        toast({ title: "Error", description: data.message || "Failed to update reservation", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Could not update reservation", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };
 
const handleLogout = async () => {
     try {
       await fetch(`${API_BASE}/api/admin/logout`, {
         method: "POST",
         headers: adminHeaders,
       });
    } catch {
      // Logout anyway even if API call fails
    }
    logout();
  };
 
  const handleCreateReservation = async (e?: React.FormEvent, fromSchedule?: boolean) => {
    if (e) e.preventDefault();
    if (!newReservation.name || !newReservation.phone || !newReservation.date || !newReservation.time) {
      toast({ title: "Gabim", description: "Ju lutem plotësoni të gjitha fushat e kërkuara", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/reservations`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({ action: "create", ...newReservation, status: "approved" }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Sukses", description: "Rezervimi u krijua me sukses" });
        setNewReservation({ name: "", phone: "", email: "", date: "", time: "", notes: "" });
        fetchReservations();
        fetchStats();
        fetchTodayStats();
        if (fromSchedule) {
          setActiveTab("reservations");
          setScheduleView("schedule");
        }
      } else {
        toast({ title: "Gabim", description: data.message || "Dështoi krijimi i rezervimit", variant: "destructive" });
      }
    } catch {
      toast({ title: "Gabim", description: "Nuk mund të krijohet rezervimi", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };
 
  const handlePrint = () => window.print();
 
  const handleDownload = () => {
    let filtered = reservations.filter((r) => r.status === "approved");
    const downloadDateObj = new Date(downloadDate + "T00:00:00");
  
    if (downloadPeriod === "day") {
      filtered = filtered.filter((r) => r.date === downloadDate);
    } else if (downloadPeriod === "month") {
      filtered = filtered.filter((r) => {
        const d = new Date(r.date);
        return d.getMonth() === downloadDateObj.getMonth() && d.getFullYear() === downloadDateObj.getFullYear();
      });
    } else {
      filtered = filtered.filter((r) => new Date(r.date).getFullYear() === downloadDateObj.getFullYear());
    }
  
    const csv = [
      "Name,Phone,Email,Date,Time,Status",
      ...filtered.map((r) => `"${r.name}","${r.phone}","${r.email}","${r.date}","${r.time}","${r.status}"`),
    ].join("\n");
  
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const label = downloadPeriod === "day" ? downloadDate : downloadPeriod === "month" ? `${downloadDateObj.getFullYear()}-${String(downloadDateObj.getMonth() + 1).padStart(2, "0")}` : String(downloadDateObj.getFullYear());
    a.download = `reservations-${label}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Sukses", description: `U shkarkuan ${filtered.length} rezervime` });
  };
 
  const todayStr = new Date().toISOString().split("T")[0];
 
  const getFilteredReservations = () => {
    let filtered = [...reservations];
 
    if (timeFilter !== "all") {
      filtered = filtered.filter((r) => {
        if (timeFilter === "past") return r.date < todayStr;
        if (timeFilter === "today") return r.date === todayStr;
        if (timeFilter === "upcoming") return r.date > todayStr;
        return true;
      });
    }
 
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }
 
    return filtered.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  };
 
  const dateStr = selectedDate.toISOString().split("T")[0];
  const pendingReservations = reservations.filter((r) => r.status === "pending");
  const confirmedForDate = reservations.filter((r) => r.status === "approved" && r.date === dateStr);
  const emergencyReservations = pendingReservations.filter((r) => r.notes && r.notes.includes("URGJENCË"));
  const regularReservations = pendingReservations.filter((r) => !r.notes || !r.notes.includes("URGJENCË"));
 
  const filteredList = getFilteredReservations();
 
  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-background print:bg-white">
      {/* Header */}
      <header className="bg-secondary border-b border-gold print:hidden">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-display text-2xl text-primary-foreground">
                TITAN <span className="text-gold">ADMIN</span>
              </h1>
              <p className="text-sm text-muted-foreground">Reservation Management</p>
            </div>
            <div className="flex items-center gap-6">
              <div className={cn("flex items-center gap-2 text-sm", live ? "text-emerald-400" : "text-amber-400")}>
                <Radio className={cn("w-4 h-4", live && "animate-pulse")} />
                {live ? "Live" : "Connecting..."}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="w-4 h-4 text-gold" />
                {new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-400 transition-colors px-3 py-2 rounded-lg border border-border hover:border-red-400"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </div>
 
          <div className="flex flex-wrap gap-2">
            {[
              { key: "home" as const, label: "Urgjencat", count: emergencyReservations.length },
              { key: "reservations" as const, label: "Rezervimet", count: pendingReservations.length },
              { key: "add" as const, label: "Add New", count: 0 },
              { key: "today" as const, label: "Today", count: todayStats.total },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); if (tab.key === "add") setFromSchedule(false); }}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                  activeTab === tab.key
                    ? "gradient-gold text-secondary border-gold"
                    : "bg-card text-muted-foreground border-border hover:border-gold"
                )}
              >
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </button>
            ))}
          </div>
        </div>
      </header>
 
      <div className="container mx-auto px-6 py-6">
        {/* Print / Download toolbar — hidden on home tab */}
        {activeTab !== "home" && (
          <div className="flex flex-wrap items-center gap-3 mb-6 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-border bg-card text-foreground hover:border-gold transition-colors"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Shkarko:</span>
              <select
                title="Periudha e shkarkimit"
                value={downloadPeriod}
                onChange={(e) => setDownloadPeriod(e.target.value as "day" | "month" | "year")}
                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
              >
                <option value="day">Ditë</option>
                <option value="month">Muaj</option>
                <option value="year">Vit</option>
              </select>
              <input
                type="date"
                title="Data e shkarkimit"
                value={downloadDate}
                onChange={(e) => setDownloadDate(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
              />
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg gradient-gold text-secondary hover:opacity-90 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Shkarko
              </button>
            </div>
          </div>
        )}
 
        {/* ── HOME TAB ── */}
        {activeTab === "home" && (
          <div className="space-y-6">
            {/* Emergency reservations */}
            {emergencyReservations.length > 0 ? (
              <div className="bg-red-500/10 border-2 border-red-500 rounded-xl p-5">
                <h3 className="font-display text-lg text-red-400 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Urgjencat ({emergencyReservations.length})
                </h3>
                <div className="space-y-3">
                  {emergencyReservations
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((r) => {
                      const severityMatch = r.notes?.match(/Shkalla:\s*(\w+)/i);
                      const severity = severityMatch ? severityMatch[1].toUpperCase() : "N/A";
                      const severityColor =
                        severity === "HIGH"
                          ? "bg-red-500"
                          : severity === "MEDIUM"
                          ? "bg-yellow-500"
                          : "bg-green-500";
                      return (
                        <div key={r.id} className="bg-card border border-red-500 rounded-lg p-4 flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                              {r.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate">{r.name}</p>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{r.phone}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold text-white ${severityColor}`}>
                                  {severity}
                                </span>
                              </div>
                              {r.notes && (
                                <p className="text-sm text-muted-foreground mt-2 italic">
                                  "{r.notes.replace("URGJENCË - ", "").replace(/Shkalla:\s*\w+\s*-?\s*/i, "").trim()}"
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-sm">
                                <span className="flex items-center gap-1 text-red-400">
                                  <CalendarIcon className="w-3 h-3" />
                                  {new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                                <span className="flex items-center gap-1 text-foreground font-medium">
                                  <Clock className="w-3 h-3" />{r.time}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => handleStatusChange(r.id, "approved")}
                              disabled={processingId === r.id}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500 hover:bg-emerald-500/40 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" /> Konfirmo
                            </button>
                            <button
                              onClick={() => handleStatusChange(r.id, "rejected")}
                              disabled={processingId === r.id}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500 hover:bg-red-500/40 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                              <X className="w-4 h-4" /> Refuzo
                            </button>
                            <button
                              onClick={() => setEditingReservation(r)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500 hover:bg-blue-500/40 transition-colors text-sm font-medium"
                            >
                              <MessageSquare className="w-4 h-4" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(r.id)}
                              disabled={deletingId === r.id}
                              aria-label="Fshij rezervimin"
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-500/20 text-gray-400 border border-gray-500 hover:bg-gray-500/40 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-5">
                <p className="text-muted-foreground text-center">Nuk ka urgjenca të reja.</p>
              </div>
            )}
 
            {/* Regular pending reservations */}
            {regularReservations.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gold" /> Rezervimet e Penduara ({regularReservations.length})
                </h3>
                <div className="space-y-3">
                  {regularReservations
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((r) => (
                      <div key={r.id} className="bg-background border border-border rounded-lg p-4 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold text-sm shrink-0">
                            {r.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{r.name}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{r.phone}</span>
                              <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{r.email}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-sm">
                              <span className="flex items-center gap-1 text-gold">
                                <CalendarIcon className="w-3 h-3" />
                                {new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                              <span className="flex items-center gap-1 text-foreground font-medium">
                                <Clock className="w-3 h-3" />{r.time}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleStatusChange(r.id, "approved")}
                            disabled={processingId === r.id}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500 hover:bg-emerald-500/40 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" /> Konfirmo
                          </button>
                          <button
                            onClick={() => handleStatusChange(r.id, "rejected")}
                            disabled={processingId === r.id}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500 hover:bg-red-500/40 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            <X className="w-4 h-4" /> Refuzo
                          </button>
                          <button
                            onClick={() => setEditingReservation(r)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500 hover:bg-blue-500/40 transition-colors text-sm font-medium"
                          >
                            <MessageSquare className="w-4 h-4" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            disabled={deletingId === r.id}
                            aria-label="Fshij rezervimin"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-500/20 text-gray-400 border border-gray-500 hover:bg-gray-500/40 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
 
        {/* ── RESERVATIONS TAB ── */}
        {activeTab === "reservations" && (
          <div className="space-y-6">
            {/* View Toggle & Date Picker */}
            <div className="flex flex-wrap items-center gap-4 bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gold" />
                <span className="text-sm font-medium text-foreground">Pamja:</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setScheduleView("schedule")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                    scheduleView === "schedule"
                      ? "gradient-gold text-secondary border-gold"
                      : "bg-background text-muted-foreground border-border hover:border-gold"
                  )}
                >
                  Oraret
                </button>
                <button
                  onClick={() => setScheduleView("list")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                    scheduleView === "list"
                      ? "gradient-gold text-secondary border-gold"
                      : "bg-background text-muted-foreground border-border hover:border-gold"
                  )}
                >
                  Lista
                </button>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <CalendarIcon className="w-4 h-4 text-gold" />
                <input
                  type="date"
                  title="Data e orarit"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                />
              </div>
            </div>

            {scheduleView === "schedule" ? (
              /* ── SCHEDULE VIEW ── */
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gold" />
                  Oraret për {new Date(scheduleDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {timeSlots.map((slot) => {
                    const reservation = reservations.find(
                      (r) => r.date === scheduleDate && r.time === slot && r.status === "approved"
                    );
                    const pendingReservation = reservations.find(
                      (r) => r.date === scheduleDate && r.time === slot && r.status === "pending"
                    );
                    const displayReservation = reservation || pendingReservation;
                    const isAvailable = !displayReservation;

                    return (
                      <div
                        key={slot}
                        className={cn(
                          "rounded-lg p-3 border-2 transition-all",
                          isAvailable
                            ? "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500 cursor-pointer"
                            : displayReservation?.status === "pending"
                            ? "bg-amber-500/10 border-amber-500/50 hover:border-amber-500 cursor-pointer"
                            : "bg-background border-border hover:border-gold cursor-pointer"
                        )}
                        onClick={() => {
                          if (displayReservation) {
                            setEditingReservation(displayReservation);
                          } else {
                            setNewReservation({ name: "", phone: "", email: "", date: scheduleDate, time: slot, notes: "" });
                            setFromSchedule(true);
                            setActiveTab("add");
                          }
                        }}
                      >
                        <div className="text-center">
                          <p className={cn(
                            "text-lg font-bold",
                            isAvailable ? "text-emerald-400" : "text-foreground"
                          )}>
                            {slot}
                          </p>
                          {displayReservation ? (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-foreground truncate">{displayReservation.name}</p>
                              <p className="text-xs text-muted-foreground">{displayReservation.phone}</p>
                              <Badge className={cn("mt-1 text-xs", statusStyles[displayReservation.status])}>
                                {displayReservation.status}
                              </Badge>
                            </div>
                          ) : (
                            <p className="text-xs text-emerald-400 mt-1">I lirë</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/30"></div>
                    <span className="text-muted-foreground">I lirë</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-background border border-border"></div>
                    <span className="text-muted-foreground">I zënë (i konfirmuar)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/50"></div>
                    <span className="text-muted-foreground">Në pritje</span>
                  </div>
                </div>
              </div>
            ) : (
              /* ── LIST VIEW ── */
              <>
                {/* Filters */}
                <div className="flex flex-wrap gap-3 bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gold" />
                    <span className="text-sm font-medium text-foreground">Filter:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(["all", "past", "today", "upcoming"] as TimeFilter[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => setTimeFilter(f)}
                        className={cn(
                          "px-3 py-1 rounded-lg text-xs font-medium border transition-colors capitalize",
                          timeFilter === f
                            ? "gradient-gold text-secondary border-gold"
                            : "bg-background text-muted-foreground border-border hover:border-gold"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 ml-auto">
                    {(["all", "pending", "approved", "rejected"] as StatusFilter[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => setStatusFilter(f)}
                        className={cn(
                          "px-3 py-1 rounded-lg text-xs font-medium border transition-colors capitalize",
                          statusFilter === f
                            ? "gradient-gold text-secondary border-gold"
                            : "bg-background text-muted-foreground border-border hover:border-gold"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reservation list */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="font-display text-lg text-foreground mb-4">
                    Rezervimet ({filteredList.length})
                  </h3>
                  {filteredList.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No reservations found</p>
                  ) : (
                    <div className="space-y-3">
                      {filteredList.map((r) => (
                        <div key={r.id} className="bg-background border border-border rounded-lg p-4 flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold text-sm shrink-0">
                              {r.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-foreground truncate">{r.name}</p>
                                <Badge className={statusStyles[r.status]}>{r.status}</Badge>
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{r.phone}</span>
                                <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{r.email}</span>
                              </div>
                              <div className="flex items-center gap-3 mt-2 text-sm">
                                <span className="flex items-center gap-1 text-gold">
                                  <CalendarIcon className="w-3 h-3" />
                                  {new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                                <span className="flex items-center gap-1 text-foreground font-medium">
                                  <Clock className="w-3 h-3" />{r.time}
                                </span>
                              </div>
                              {r.notes && (
                                <p className="text-xs text-muted-foreground mt-1 italic">"{r.notes}"</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            {r.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(r.id, "approved")}
                                  disabled={processingId === r.id}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500 hover:bg-emerald-500/40 transition-colors text-sm font-medium disabled:opacity-50"
                                >
                                  <Check className="w-4 h-4" /> Konfirmo
                                </button>
                                <button
                                  onClick={() => handleStatusChange(r.id, "rejected")}
                                  disabled={processingId === r.id}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500 hover:bg-red-500/40 transition-colors text-sm font-medium disabled:opacity-50"
                                >
                                  <X className="w-4 h-4" /> Refuzo
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setEditingReservation(r)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500 hover:bg-blue-500/40 transition-colors text-sm font-medium"
                            >
                              <MessageSquare className="w-4 h-4" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(r.id)}
                              disabled={deletingId === r.id}
                              aria-label="Fshij rezervimin"
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-500/20 text-gray-400 border border-gray-500 hover:bg-gray-500/40 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
 
        {/* ── ADD TAB ── */}
        {activeTab === "add" && (
          <div className="max-w-lg">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-gold" /> Shto Rezervim të Ri
              </h3>
              <form onSubmit={(e) => { handleCreateReservation(e, fromSchedule); setFromSchedule(false); }} className="space-y-4">
                <div>
                  <label htmlFor="add-name" className="block text-sm font-medium text-foreground mb-1">Emri *</label>
                  <input
                    id="add-name"
                    type="text"
                    value={newReservation.name}
                    onChange={(e) => setNewReservation({ ...newReservation, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="add-phone" className="block text-sm font-medium text-foreground mb-1">Telefoni *</label>
                  <input
                    id="add-phone"
                    type="tel"
                    value={newReservation.phone}
                    onChange={(e) => setNewReservation({ ...newReservation, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="add-email" className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <input
                    id="add-email"
                    type="email"
                    value={newReservation.email}
                    onChange={(e) => setNewReservation({ ...newReservation, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="add-date" className="block text-sm font-medium text-foreground mb-1">Data *</label>
                    <input
                      id="add-date"
                      type="date"
                      value={newReservation.date}
                      onChange={(e) => setNewReservation({ ...newReservation, date: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="add-time" className="block text-sm font-medium text-foreground mb-1">Ora *</label>
                    <select
                      id="add-time"
                      value={newReservation.time}
                      onChange={(e) => setNewReservation({ ...newReservation, time: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                      required
                    >
                      <option value="">Zgjidh orën</option>
                      {timeSlots.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="add-notes" className="block text-sm font-medium text-foreground mb-1">Shënime</label>
                  <textarea
                    id="add-notes"
                    value={newReservation.notes}
                    onChange={(e) => setNewReservation({ ...newReservation, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    rows={3}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2 rounded-lg bg-gold text-secondary font-medium hover:bg-gold/90 transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Krijo Rezervimin"}
                </button>
              </form>
            </div>
          </div>
        )}
 
        {/* ── TODAY TAB ── */}
        {activeTab === "today" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <p className="text-sm text-muted-foreground">Total Today</p>
                <p className="text-3xl font-display text-gold">{todayStats.total}</p>
              </div>
              <div className="bg-card border border-amber-500 rounded-xl p-5">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-display text-amber-500">{todayStats.pending}</p>
              </div>
              <div className="bg-card border border-emerald-500 rounded-xl p-5">
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-3xl font-display text-emerald-500">{todayStats.approved}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <p className="text-sm text-muted-foreground">All Time</p>
                <p className="text-3xl font-display text-gold">{stats.total}</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-gold" /> Rezervimet e Sotme
              </h3>
              {confirmedForDate.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No reservations for today</p>
              ) : (
                <div className="space-y-3">
                  {confirmedForDate
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((r) => (
                      <div key={r.id} className="bg-background border border-border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-semibold text-sm">
                            {r.time}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{r.name}</p>
                            <p className="text-sm text-muted-foreground">{r.phone}</p>
                          </div>
                        </div>
                        <Badge className={statusStyles[r.status]}>{r.status}</Badge>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
 
      {/* ── EDIT MODAL ── */}
      {editingReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-xl p-6 max-w-lg w-full">
            <h3 className="font-display text-xl text-foreground mb-4">Edit Reservation</h3>
            <form onSubmit={handleUpdateReservation} className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-foreground mb-1">Emri</label>
                <input
                  id="edit-name"
                  type="text"
                  value={editingReservation.name}
                  onChange={(e) => setEditingReservation({ ...editingReservation, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-phone" className="block text-sm font-medium text-foreground mb-1">Telefoni</label>
                <input
                  id="edit-phone"
                  type="tel"
                  value={editingReservation.phone}
                  onChange={(e) => setEditingReservation({ ...editingReservation, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-email" className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input
                  id="edit-email"
                  type="email"
                  value={editingReservation.email}
                  onChange={(e) => setEditingReservation({ ...editingReservation, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-date" className="block text-sm font-medium text-foreground mb-1">Data</label>
                  <input
                    id="edit-date"
                    type="date"
                    value={editingReservation.date}
                    onChange={(e) => setEditingReservation({ ...editingReservation, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="edit-time" className="block text-sm font-medium text-foreground mb-1">Ora</label>
                  <select
                    id="edit-time"
                    value={editingReservation.time}
                    onChange={(e) => setEditingReservation({ ...editingReservation, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    required
                  >
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="edit-notes" className="block text-sm font-medium text-foreground mb-1">Shënime</label>
                <textarea
                  id="edit-notes"
                  value={editingReservation.notes || ""}
                  onChange={(e) => setEditingReservation({ ...editingReservation, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Ruaj pa dërguar email"}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={async () => {
                    if (!editingReservation) return;
                    setSubmitting(true);
                    try {
                      const res = await fetch(`${API_BASE}/api/admin/reservations`, {
                        method: "POST",
                        headers: adminHeaders,
                        body: JSON.stringify({
                          action: "update_with_confirm",
                          id: editingReservation.id,
                          name: editingReservation.name,
                          phone: editingReservation.phone,
                          email: editingReservation.email,
                          date: editingReservation.date,
                          time: editingReservation.time,
                          notes: editingReservation.notes,
                        }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        toast({ title: "Sukses", description: "Rezervimi u përditësua dhe email-i u dërgua" });
                        setEditingReservation(null);
                        fetchReservations();
                      } else {
                        toast({ title: "Error", description: data.message || "Failed to update reservation", variant: "destructive" });
                      }
                    } catch {
                      toast({ title: "Error", description: "Could not update reservation", variant: "destructive" });
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  className="flex-1 py-2 rounded-lg bg-gold text-secondary font-medium hover:bg-gold/90 transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Konfirmo & Dërgo Email"}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingReservation(null); setFromSchedule(false); }}
                  className="flex-1 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                >
                  Anulo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default Admin;
