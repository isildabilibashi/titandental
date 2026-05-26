import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

  const API_URL = `${supabase.supabaseUrl}/functions/v1/dental-chat`;

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg = { role: "user" as const, text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    try {
      const messageHistory = messages.map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text
      }));
      messageHistory.push({ role: "user", content: text });
      
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ messages: messageHistory, language }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Request failed");
      }
      const data = await res.json();
      const botText = data.choices?.[0]?.message?.content || "Nuk mora një përgjigje.";
      setMessages((prev) => [...prev, { role: "bot", text: botText }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: language === "it" ? "Spiacente, ho problemi di connessione. Riprova più tardi." : language === "en" ? "Sorry, I'm having trouble connecting. Please try again later." : "Nuk kam lidhje. Provo përsëri më vonë.",
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
