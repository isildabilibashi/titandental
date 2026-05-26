import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Globe } from "lucide-react";

interface Message {
  role: "user" | "bot";
  text: string;
}

type Language = "al" | "en" | "it";

const translations = {
  al: {
    welcome: "Pershendetje! Mire se vini ne Titan Dent. Si mund t'ju ndihmoj sot?",
    placeholder: "Shkruaj një mesazh...",
    quickReplies: [
      "Cilat sherbime ofroni ju?",
      "Si mund te bej nje rezervim?",
      "Cilat jane oraret e punes?",
      "Ku ndodhet klinika?",
    ],
  },
  en: {
    welcome: "Hello! Welcome to Titan Dent. How can I help you today?",
    placeholder: "Type a message...",
    quickReplies: [
      "What services do you offer?",
      "How can I book an appointment?",
      "What are your working hours?",
      "Where is the clinic located?",
    ],
  },
  it: {
    welcome: "Ciao! Benvenuto da Titan Dent. Come posso aiutarti oggi?",
    placeholder: "Scrivi un messaggio...",
    quickReplies: [
      "Quali servizi offrite?",
      "Come posso prenotare?",
      "Quali sono i vostri orari?",
      "Dov'è la clinica?",
    ],
  },
};

const languages = [
  { code: "al", label: "SQ", name: "Shqip" },
  { code: "en", label: "EN", name: "English" },
  { code: "it", label: "IT", name: "Italiano" },
] as const;

const CLINIC_INFO = {
  name: "TITAN DENT",
  address: "Rruga 3 Dëshmorët, ngjitur Bar Flavio, Kati i dytë, 1000 Tiranë, Albania",
  phone: "+355 69 271 5929",
  schedule: {
    al: "E hënë – E premte 08:30–13:00 dhe 15:00–19:30, E shtunë 08:30–13:00",
    en: "Monday – Friday 08:30–13:00 and 15:00–19:30, Saturday 08:30–13:00",
    it: "Lunedì – Venerdì 08:30–13:00 e 15:00–19:30, Sabato 08:30–13:00",
  },
  services: {
    al: ["Mbushje dhe Trajtime Parandaluese", "Endodonci (Trajtimi i Kanaleve)", "Protetikë Fikse dhe Estetikë (ura porcelani, faseta, zirkoni, E-max)", "Protetikë e Lëvizshme (proteza)", "Ortodonci (maskerina transparente, aparat ortodontik)", "Kirurgji, Implante dhe Higjiëne (zbardhime, pastrime, heqje dhëmbi, implante)"],
    en: ["Fillings and Preventive Treatments", "Endodontics (Root Canal Treatment)", "Fixed Prosthetics and Aesthetics (porcelain crowns, veneers, zirconia, E-max)", "Removable Prosthetics (dentures)", "Orthodontics (clear aligners, braces)", "Surgery, Implants and Hygiene (whitening, cleaning, extractions, implants)"],
    it: ["Otturazioni e Trattamenti Preventivi", "Endodonzia (Devitalizzazione)", "Protesi Fissa e Estetica (corone porcelain, faccette, zirconia, E-max)", "Protesi Mobili (dentiere)", "Ortodonzia (allineatori trasparenti, apparecchio)", "Chirurgia, Impianti e Igiene (sbiancamento, pulizia, estrazione, impianti)"],
  },
};

const KEYWORD_RESPONSES: Record<string, Record<string, (c: typeof CLINIC_INFO) => string>> = {
  orari: {
    al: (c) => `📅 **Orari i klinikës:**\n${c.schedule.al}\n\nTelefono për informacion: ${c.phone}`,
    en: (c) => `📅 **Clinic Hours:**\n${c.schedule.en}\n\nCall for info: ${c.phone}`,
    it: (c) => `📅 **Orari della clinica:**\n${c.schedule.it}\n\nChiama per informazioni: ${c.phone}`,
  },
  schedule: {
    al: (c) => `📅 **Orari i klinikës:**\n${c.schedule.al}\n\nTelefono për informacion: ${c.phone}`,
    en: (c) => `📅 **Clinic Hours:**\n${c.schedule.en}\n\nCall for info: ${c.phone}`,
    it: (c) => `📅 **Orari della clinica:**\n${c.schedule.it}\n\nChiama per informazioni: ${c.phone}`,
  },
  ore: {
    al: (c) => `📅 **Orari i klinikës:**\n${c.schedule.al}\n\nTelefono për informacion: ${c.phone}`,
    en: (c) => `📅 **Clinic Hours:**\n${c.schedule.en}\n\nCall for info: ${c.phone}`,
    it: (c) => `📅 **Orari della clinica:**\n${c.schedule.it}\n\nChiama per informazioni: ${c.phone}`,
  },
  orare: {
    al: (c) => `📅 **Orari i klinikës:**\n${c.schedule.al}\n\nTelefono për informacion: ${c.phone}`,
    en: (c) => `📅 **Clinic Hours:**\n${c.schedule.en}\n\nCall for info: ${c.phone}`,
    it: (c) => `📅 **Orari della clinica:**\n${c.schedule.it}\n\nChiama per informazioni: ${c.phone}`,
  },
  oraret: {
    al: (c) => `📅 **Orari i klinikës:**\n${c.schedule.al}\n\nTelefono për informacion: ${c.phone}`,
    en: (c) => `📅 **Clinic Hours:**\n${c.schedule.en}\n\nCall for info: ${c.phone}`,
    it: (c) => `📅 **Orari della clinica:**\n${c.schedule.it}\n\nChiama per informazioni: ${c.phone}`,
  },
  punes: {
    al: (c) => `📅 **Orari i klinikës:**\n${c.schedule.al}\n\nTelefono për informacion: ${c.phone}`,
    en: (c) => `📅 **Clinic Hours:**\n${c.schedule.en}\n\nCall for info: ${c.phone}`,
    it: (c) => `📅 **Orari della clinica:**\n${c.schedule.it}\n\nChiama per informazioni: ${c.phone}`,
  },
  ndodhet: {
    al: (c) => `📍 **Adresa:**\n${c.address}`,
    en: (c) => `📍 **Address:**\n${c.address}`,
    it: (c) => `📍 **Indirizzo:**\n${c.address}`,
  },
  klinika: {
    al: (c) => `📍 **Adresa:**\n${c.address}`,
    en: (c) => `📍 **Address:**\n${c.address}`,
    it: (c) => `📍 **Indirizzo:**\n${c.address}`,
  },
  hours: {
    al: (c) => `📅 **Orari i klinikës:**\n${c.schedule.al}\n\nTelefono për informacion: ${c.phone}`,
    en: (c) => `📅 **Clinic Hours:**\n${c.schedule.en}\n\nCall for info: ${c.phone}`,
    it: (c) => `📅 **Orari della clinica:**\n${c.schedule.it}\n\nChiama per informazioni: ${c.phone}`,
  },
  located: {
    al: (c) => `📍 **Adresa:**\n${c.address}`,
    en: (c) => `📍 **Address:**\n${c.address}`,
    it: (c) => `📍 **Indirizzo:**\n${c.address}`,
  },
  clinica: {
    al: (c) => `📍 **Adresa:**\n${c.address}`,
    en: (c) => `📍 **Address:**\n${c.address}`,
    it: (c) => `📍 **Indirizzo:**\n${c.address}`,
  },
  clinic: {
    al: (c) => `📍 **Adresa:**\n${c.address}`,
    en: (c) => `📍 **Address:**\n${c.address}`,
    it: (c) => `📍 **Indirizzo:**\n${c.address}`,
  },
  prenotare: {
    al: (c) => `📋 **Rezervim:**\nPër të bërë rezervim, plotëso formularin në seksionin "Rezervo Online" në website. Ose telefono: ${c.phone}`,
    en: (c) => `📋 **Booking:**\nTo book an appointment, fill the form in the "Book Online" section on the website. Or call: ${c.phone}`,
    it: (c) => `📋 **Prenotazione:**\nPer prenotare, compila il modulo nella sezione "Prenota Online" sul sito. O chiama: ${c.phone}`,
  },
  vostri: {
    al: (c) => `📅 **Orari i klinikës:**\n${c.schedule.al}\n\nTelefono për informacion: ${c.phone}`,
    en: (c) => `📅 **Clinic Hours:**\n${c.schedule.en}\n\nCall for info: ${c.phone}`,
    it: (c) => `📅 **Orari della clinica:**\n${c.schedule.it}\n\nChiama per informazioni: ${c.phone}`,
  },
  kontakto: {
    al: (c) => `📞 **Kontakti:**\nTel: ${c.phone}\nEmail: info@titandental.com\nAdresa: ${c.address}`,
    en: (c) => `📞 **Contact:**\nPhone: ${c.phone}\nEmail: info@titandental.com\nAddress: ${c.address}`,
    it: (c) => `📞 **Contatti:**\nTel: ${c.phone}\nEmail: info@titandental.com\nIndirizzo: ${c.address}`,
  },
  contact: {
    al: (c) => `📞 **Kontakti:**\nTel: ${c.phone}\nEmail: info@titandental.com\nAdresa: ${c.address}`,
    en: (c) => `📞 **Contact:**\nPhone: ${c.phone}\nEmail: info@titandental.com\nAddress: ${c.address}`,
    it: (c) => `📞 **Contatti:**\nTel: ${c.phone}\nEmail: info@titandental.com\nIndirizzo: ${c.address}`,
  },
  kontakt: {
    al: (c) => `📞 **Kontakti:**\nTel: ${c.phone}\nEmail: info@titandental.com\nAdresa: ${c.address}`,
    en: (c) => `📞 **Contact:**\nPhone: ${c.phone}\nEmail: info@titandental.com\nAddress: ${c.address}`,
    it: (c) => `📞 **Contatti:**\nTel: ${c.phone}\nEmail: info@titandental.com\nIndirizzo: ${c.address}`,
  },
  adresa: {
    al: (c) => `📍 **Adresa:**\n${c.address}`,
    en: (c) => `📍 **Address:**\n${c.address}`,
    it: (c) => `📍 **Indirizzo:**\n${c.address}`,
  },
  address: {
    al: (c) => `📍 **Adresa:**\n${c.address}`,
    en: (c) => `📍 **Address:**\n${c.address}`,
    it: (c) => `📍 **Indirizzo:**\n${c.address}`,
  },
  indirizzo: {
    al: (c) => `📍 **Adresa:**\n${c.address}`,
    en: (c) => `📍 **Address:**\n${c.address}`,
    it: (c) => `📍 **Indirizzo:**\n${c.address}`,
  },
   rezervo: {
    al: (c) => `📋 **Rezervim:**\nPër të bërë rezervim, plotëso formularin në seksionin "Rezervo Online" në website. Ose telefono: ${c.phone}`,
    en: (c) => `📋 **Booking:**\nTo book an appointment, fill the form in the "Book Online" section on the website. Or call: ${c.phone}`,
    it: (c) => `📋 **Prenotazione:**\nPer prenotare, compila il modulo nella sezione "Prenota Online" sul sito. O chiama: ${c.phone}`,
  },
  rezerv: {
    al: (c) => `📋 **Rezervim:**\nPër të bërë rezervim, plotëso formularin në seksionin "Rezervo Online" në website. Ose telefono: ${c.phone}`,
    en: (c) => `📋 **Booking:**\nTo book an appointment, fill the form in the "Book Online" section on the website. Or call: ${c.phone}`,
    it: (c) => `📋 **Prenotazione:**\nPer prenotare, compila il modulo nella sezione "Prenota Online" sul sito. O chiama: ${c.phone}`,
  },
  prenot: {
    al: (c) => `📋 **Rezervim:**\nPër të bërë rezervim, plotëso formularin në seksionin "Rezervo Online" në website. Ose telefono: ${c.phone}`,
    en: (c) => `📋 **Booking:**\nTo book an appointment, fill the form in the "Book Online" section on the website. Or call: ${c.phone}`,
    it: (c) => `📋 **Prenotazione:**\nPer prenotare, compila il modulo nella sezione "Prenota Online" sul sito. O chiama: ${c.phone}`,
  },
  book: {
    al: (c) => `📋 **Rezervim:**\nPër të bërë rezervim, plotëso formularin në seksionin "Rezervo Online" në website. Ose telefono: ${c.phone}`,
    en: (c) => `📋 **Booking:**\nTo book an appointment, fill the form in the "Book Online" section on the website. Or call: ${c.phone}`,
    it: (c) => `📋 **Prenotazione:**\nPer prenotare, compila il modulo nella sezione "Prenota Online" sul sito. O chiama: ${c.phone}`,
  },
  cmime: {
    al: (c) => `💰 **Çmimet:**\nÇmimet variojnë sipas trajtimit. Na telefono për konsultë falas: ${c.phone}`,
    en: (c) => `💰 **Prices:**\nPrices vary by treatment. Call us for a free consultation: ${c.phone}`,
    it: (c) => `💰 **Prezzi:**\nI prezzi variano in base al trattamento. Chiamaci per una consultazione gratuita: ${c.phone}`,
  },
  prices: {
    al: (c) => `💰 **Çmimet:**\nÇmimet variojnë sipas trajtimit. Na telefono për konsultë falas: ${c.phone}`,
    en: (c) => `💰 **Prices:**\nPrices vary by treatment. Call us for a free consultation: ${c.phone}`,
    it: (c) => `💰 **Prezzi:**\nI prezzi variano in base al trattamento. Chiamaci per una consultazione gratuita: ${c.phone}`,
  },
  prezzi: {
    al: (c) => `💰 **Çmimet:**\nÇmimet variojnë sipas trajtimit. Na telefono për konsultë falas: ${c.phone}`,
    en: (c) => `💰 **Prices:**\nPrices vary by treatment. Call us for a free consultation: ${c.phone}`,
    it: (c) => `💰 **Prezzi:**\nI prezzi variano in base al trattamento. Chiamaci per una consultazione gratuita: ${c.phone}`,
  },
  sherbime: {
    al: (c) => `🦷 **Shërbimet:**\n${c.services.al.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    en: (c) => `🦷 **Services:**\n${c.services.en.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    it: (c) => `🦷 **Servizi:**\n${c.services.it.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
  },
  ofroni: {
    al: (c) => `🦷 **Shërbimet:**\n${c.services.al.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    en: (c) => `🦷 **Services:**\n${c.services.en.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    it: (c) => `🦷 **Servizi:**\n${c.services.it.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
  },
  services: {
    al: (c) => `🦷 **Shërbimet:**\n${c.services.al.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    en: (c) => `🦷 **Services:**\n${c.services.en.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    it: (c) => `🦷 **Servizi:**\n${c.services.it.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
  },
servizi: {
    al: (c) => `🦷 **Shërbimet:**\n${c.services.al.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    en: (c) => `🦷 **Services:**\n${c.services.en.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    it: (c) => `🦷 **Servizi:**\n${c.services.it.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
  },
  offer: {
    al: (c) => `🦷 **Shërbimet:**\n${c.services.al.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    en: (c) => `🦷 **Services:**\n${c.services.en.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    it: (c) => `🦷 **Servizi:**\n${c.services.it.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
  },
  offrite: {
    al: (c) => `🦷 **Shërbimet:**\n${c.services.al.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    en: (c) => `🦷 **Services:**\n${c.services.en.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    it: (c) => `🦷 **Servizi:**\n${c.services.it.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
  },
};

function detectKeyword(text: string): string | null {
  const lower = text.toLowerCase().trim();
  for (const kw of Object.keys(KEYWORD_RESPONSES)) {
    if (lower.includes(kw)) return kw;
  }
  return null;
}

function getLocalResponse(text: string, language: string): string {
  const lang = language as "al" | "en" | "it";
  const keyword = detectKeyword(text);
  if (keyword && KEYWORD_RESPONSES[keyword]?.[lang]) {
    return KEYWORD_RESPONSES[keyword][lang](CLINIC_INFO);
  }
  return language === "it" 
    ? "Grazie per il messaggio! Per maggiori dettagli, chiamaci al " + CLINIC_INFO.phone + " o usa il modulo di prenotazione sul sito."
    : language === "en"
    ? "Thank you for your message! For more details, call us at " + CLINIC_INFO.phone + " or use the booking form on our website."
    : "Faleminderit për mesazhin! Për pyetje më të detajuara, na telefono në " + CLINIC_INFO.phone + " ose përdor formularin e rezervimit në website.";
}

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("al");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ role: "bot", text: translations[language].welcome }]);
  }, [language]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

const API_URL = import.meta.env.VITE_API_URL || "https://titandent.onrender.com/api/chat";

   const send = async (text: string) => {
     if (!text.trim() || isLoading) return;
     const userMsg = { role: "user" as const, text };
     setMessages((prev) => [...prev, userMsg]);
     setInput("");
     setIsLoading(true);
     try {
       const res = await fetch(API_URL, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ message: text, language }),
       });
       
       if (!res.ok) {
         const errData = await res.json().catch(() => ({}));
         throw new Error(errData.error || "Request failed");
       }
       const data = await res.json();
       const botText = data.response || getLocalResponse(text, language);
       setMessages((prev) => [...prev, { role: "bot", text: botText }]);
     } catch {
       setMessages((prev) => [
         ...prev,
         {
           role: "bot",
           text: getLocalResponse(text, language),
         },
       ]);
     } finally {
       setIsLoading(false);
     }
   };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-gold shadow-gold flex items-center justify-center"
      >
        {isOpen ? <X className="w-6 h-6 text-secondary" /> : <MessageCircle className="w-6 h-6 text-secondary" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-background rounded-2xl shadow-2xl border border-border overflow-hidden"
          >
            <div className="gradient-brown p-4 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-lg text-primary-foreground">Titan Dental</p>
                  <p className="text-primary-foreground/60 text-xs">Typically replies instantly</p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowLangMenu(!showLangMenu)}
                    className="flex items-center gap-1 text-primary-foreground hover:text-white transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-xs font-medium">{languages.find(l => l.code === language)?.label}</span>
                  </button>
                  <AnimatePresence>
                    {showLangMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-10"
                      >
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setLanguage(lang.code);
                              setShowLangMenu(false);
                            }}
                            className={`block w-full px-4 py-2 text-left text-sm hover:bg-gold/10 transition-colors ${
                              language === lang.code ? "text-gold font-medium" : "text-foreground"
                            }`}
                          >
                            {lang.label} - {lang.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="h-72 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                      msg.role === "user"
                        ? "gradient-gold text-secondary rounded-br-sm"
                        : "bg-card text-foreground border border-border rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {translations[language].quickReplies.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="text-xs border border-gold/30 text-foreground px-3 py-1.5 rounded-full hover:bg-gold/10 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div className="p-3 border-t border-border flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                placeholder={translations[language].placeholder}
                disabled={isLoading}
                className="flex-1 bg-card border border-border rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
              />
              <button
                onClick={() => send(input)}
                aria-label="Send message"
                disabled={isLoading}
                className="w-9 h-9 rounded-full gradient-gold flex items-center justify-center flex-shrink-0 disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-secondary" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget;
