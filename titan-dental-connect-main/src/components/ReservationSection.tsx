import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { Clock, CalendarDays, User, Phone, Mail, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const timeSlots = [
  "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"
];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const API_URL = "http://localhost:5000";

const ReservationSection = () => {
  const [date, setDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const { toast } = useToast();

  const dateStr = date?.toISOString().split("T")[0];

  const isToday = useMemo(() => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }, [date]);

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  const isTimePassed = (time: string) => {
    if (!isToday) return false;
    const [h, m] = time.split(":").map(Number);
    if (h < currentHour) return true;
    if (h === currentHour && m <= currentMinutes) return true;
    return false;
  };

  useEffect(() => {
    if (!dateStr) {
      setBookedSlots([]);
      return;
    }

    const fetchBookedSlots = async () => {
      try {
        const res = await fetch(`${API_URL}/api/reservations/slots`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: dateStr }),
        });
        const data = await res.json();
        setBookedSlots(data?.slots || []);
      } catch (error) {
        console.error("Failed to fetch booked slots:", error);
      }
    };

    fetchBookedSlots();
  }, [dateStr]);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value && !isValidEmail(value)) {
      setEmailError("Ju lutem vendosni një email të vlefshëm");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !selectedTime || !name || !phone || !email) return;

    if (!isValidEmail(email)) {
      setEmailError("Ju lutem vendosni një email të vlefshëm");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          date: dateStr,
          time: selectedTime,
          notes: "",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create reservation");
      }

      setSubmitted(true);
    } catch {
      toast({
        title: "Gabim",
        description: "Rezervimi nuk u krijua. Ju lutem provoni përsëri.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="reservation" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-gold uppercase tracking-[0.2em] text-sm mb-3">Rezervo Tani</p>
          <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">
            Rezervo orarin tënd online 
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Zgjidh orarin dhe datën që të përshtatet dhe ne do të kujdesemi për pjesën tjetër. 
          </p>
        </motion.div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center bg-card rounded-xl p-10 border border-gold/30 shadow-gold"
          >
            <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center mx-auto mb-6">
              <CalendarDays className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="font-display text-2xl text-foreground mb-2">Booking Confirmed!</h3>
            <p className="text-muted-foreground mb-4">
              {date?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at {selectedTime}
            </p>
            <p className="text-sm text-muted-foreground">We'll send a confirmation to {email}.</p>
            <button
              onClick={() => { setSubmitted(false); setDate(undefined); setSelectedTime(""); setName(""); setPhone(""); setEmail(""); setEmailError(""); }}
              className="mt-6 text-gold hover:text-gold-dark transition-colors text-sm underline"
            >
              Rezervo një tjetër orar
            </button>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="max-w-4xl mx-auto"
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-gold" />
                  Zgjidh datën 
                </h3>
                <div className="bg-card rounded-xl border border-border p-4 inline-block">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => d < new Date() || d.getDay() === 0}
                    className="pointer-events-auto"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gold" />
                  Oraret e disponueshme
                  {isToday && <span className="text-xs text-muted-foreground ml-2">(Vetëm për sot - oraret e kaluara janë të bllokuara)</span>}
                </h3>
                {date && date.getDay() === 0 ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-600 font-medium text-lg">E diel - Klinika e mbyllur</p>
                    <p className="text-red-500 text-sm mt-1">Ju lutem zgjidhni një datë tjetër</p>
                  </div>
                ) : (
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {timeSlots.map((time) => {
                    const isBooked = bookedSlots.includes(time);
                    const passed = isTimePassed(time);
                    const disabled = isBooked || passed;
                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={disabled}
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "py-3 rounded-lg text-sm font-medium transition-all border",
                          disabled
                            ? "bg-muted text-muted-foreground/50 border-border cursor-not-allowed line-through"
                            : selectedTime === time
                            ? "gradient-gold text-secondary border-gold shadow-gold"
                            : "bg-card text-foreground border-border hover:border-gold hover:bg-accent"
                        )}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
                )}

                <div className="space-y-4">
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
                      onChange={(e) => handleEmailChange(e.target.value)}
                      placeholder="Email *"
                      className={cn(
                        "w-full bg-card border rounded-lg py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors",
                        emailError ? "border-red-500 focus:border-red-500" : "border-border focus:border-gold"
                      )}
                    />
                    {emailError && (
                      <p className="text-red-500 text-xs mt-1 ml-1">{emailError}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!date || !selectedTime || !name || !phone || !email || !!emailError || loading}
                  className="w-full mt-6 gradient-gold text-secondary py-3 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shadow-gold flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Konfirmo rezervimin
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </div>
    </section>
  );
};

export default ReservationSection;