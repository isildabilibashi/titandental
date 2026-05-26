import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Clock, User, Phone, Mail, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const API_URL = "http://localhost:5000";

const timeSlots = [
  "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"
];

const getMinEmergencyHour = () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  let minHour = currentHour + 2;
  if (currentMinutes > 0) minHour += 1;
  if (minHour > 19) minHour = 19;
  return minHour;
};

const severityLevels = [
  { id: "high", label: "E lartë", color: "bg-red-500", text: "text-white", border: "border-red-500" },
  { id: "medium", label: "Mesatare", color: "bg-yellow-500", text: "text-white", border: "border-yellow-500" },
  { id: "low", label: "E ulët", color: "bg-green-500", text: "text-white", border: "border-green-500" },
];

const EmergencySection = () => {
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [severity, setSeverity] = useState("high");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const today = new Date();
  const dayName = today.toLocaleDateString("sq-AL", { weekday: "long" });
  const dateStr = today.toLocaleDateString("sq-AL", { day: "numeric", month: "long" });

  const minHour = useMemo(() => getMinEmergencyHour(), []);

  const availableSlots = useMemo(() => {
    if (minHour >= 19) return [];
    return timeSlots.filter((slot) => {
      const [h, m] = slot.split(":").map(Number);
      return h >= minHour && h < 20;
    });
  }, [minHour]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime || !name || !phone || !email || !comments.trim()) return;

    setLoading(true);
    try {
      const todayStr = today.toISOString().split("T")[0];
      const res = await fetch(`${API_URL}/api/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          date: todayStr,
          time: selectedTime,
          notes: `URGJENCË - Shkalla: ${severity.toUpperCase()}${comments ? ` - ${comments.trim()}` : ""}`,
        }),
      });
      
      if (!res.ok) throw new Error("Failed");
      
      setSubmitted(true);
      toast({ title: "Urgjenca u regjistrua!", description: "Do t'ju kontaktojmë sa më shpejt." });
    } catch {
      toast({ title: "Gabim", description: "Nuk mund të dërgohet. Ju lutem telefononi direkt.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section id="emergency" className="py-20 bg-cream-dark">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center bg-background rounded-xl p-10 border border-gold/30 shadow-gold">
            <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="font-display text-2xl text-foreground mb-2">Urgjenca u regjistrua!</h3>
            <p className="text-muted-foreground">Do t'ju kontaktojmë brenda disa minutave.</p>
            <p className="text-sm text-muted-foreground mt-2">Një email do t'ju dërgohet për konfirmim ose refuzim.</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="emergency" className="py-20 bg-cream-dark">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <AlertTriangle className="w-4 h-4" />
            URGJENCË
          </span>
          <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">
            Rezervim për Urgjencë
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Dhëmbje të forta ose emergjencë dentare? Rezervo një orar brenda 2 orësh të ardhshme. Ekipi ynë është i disponueshëm për t'ju ndihmuar menjëherë.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto bg-background rounded-2xl border border-border shadow-lg overflow-hidden"
        >
          <div className="bg-destructive/10 border-b border-destructive/20 px-6 py-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-semibold text-foreground">Oraret e disponueshme</p>
                <p className="text-sm text-muted-foreground">Data: e {dayName}, {dateStr}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
<div>
                <h3 className="font-display text-lg text-foreground mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gold" />
                  Oraret e disponueshme
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {availableSlots.length === 0 
                    ? "Nuk ka orare të disponueshme për sot. Telefononi direkt." 
                    : `Vetëm orare pas orës ${minHour.toString().padStart(2, "0")}:00 (2 orë nga tani)`}
                </p>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "px-3 py-2 rounded-lg text-sm font-medium border transition-all",
                          selectedTime === time
                            ? "gradient-gold text-secondary border-gold shadow-gold"
                            : "bg-background text-foreground border-border hover:border-gold/40"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <textarea
                    required
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Përshkrimi i problematikës *"
                    rows={3}
                    className="w-full bg-card border border-border rounded-lg py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors resize-none"
                  />
                </div>

                <div>
                  <h3 className="font-display text-lg text-foreground mb-3">Niveli i urgjencës</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {severityLevels.map((level) => (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => setSeverity(level.id)}
                        className={cn(
                          "py-2 rounded-lg text-sm font-medium border transition-all",
                          severity === level.id
                            ? `${level.color} ${level.text} ${level.border}`
                            : "bg-background text-foreground border-border hover:border-gold/40"
                        )}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                  <p className="text-sm text-destructive font-medium">
                    Shënim: Në rast urgjence jashtë orarit të punës, ju lutem na telefononi direkt.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-display text-lg text-foreground mb-1 flex items-center gap-2">
                  <User className="w-4 h-4 text-gold" />
                  Të dhënat e kontaktit
                </h3>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Emri i plotë"
                    className="w-full bg-card border border-border rounded-lg py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Numër telefoni"
                    className="w-full bg-card border border-border rounded-lg py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email *"
                    className="w-full bg-card border border-border rounded-lg py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!selectedTime || !name || !phone || !email || !comments.trim() || loading}
                  className="w-full mt-4 bg-destructive text-destructive-foreground py-3 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Rezervo Urgjencën
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default EmergencySection;