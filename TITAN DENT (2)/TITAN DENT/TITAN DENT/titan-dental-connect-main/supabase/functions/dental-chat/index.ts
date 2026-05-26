import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CLINIC_INFO = {
  name: "TITAN DENT",
  address: "Rruga 3 Dëshmorët, ngjitur Bar Flavio, Kati i dytë, 1000 Tiranë, Albania",
  phone: "+355 69 271 5929",
  email: "info@titandental.com",
  schedule: {
    al: "E hënë – E premte 08:30–13:00 dhe 15:00–19:30, E shtunë 08:30–13:00",
    en: "Monday – Friday 08:30–13:00 and 15:00–19:30, Saturday 08:30–13:00",
    it: "Lunedì – Venerdì 08:30–13:00 e 15:00–19:30, Sabato 08:30–13:00",
  },
  staff: {
    al: "Dr. Xhensila (13+ vite përvojë, dentiste kryesore) dhe Dr. Erlin (10+ vite, kirurg oral)",
    en: "Dr. Xhensila (13+ years experience, lead dentist) and Dr. Erlin (10+ years, oral surgeon)",
    it: "Dr. Xhensila (13+ anni di esperienza, dentista principale) e Dr. Erlin (10+ anni, chirurgo orale",
  },
  experience: {
    al: "13+ vite, 15,000+ pacientë të kënaqur, vlerësim 4.9/5",
    en: "13+ years, 15,000+ satisfied patients, rating 4.9/5",
    it: "13+ anni, 15.000+ pazienti soddisfatti, valutazione 4.9/5",
  },
  services: {
    al: ["Mbushje dhe Trajtime Parandaluese", "Endodonci (Trajtimi i Kanaleve)", "Protetikë Fikse dhe Estetikë (ura porcelani, faseta, zirkoni, E-max)", "Protetikë e Lëvizshme (proteza)", "Ortodonci (maskerina transparente, aparat ortodontik)", "Kirurgji, Implante dhe Higjiëne (zbardhime, pastrime, heqje dhëmbi, implante)"],
    en: ["Fillings and Preventive Treatments", "Endodontics (Root Canal Treatment)", "Fixed Prosthetics and Aesthetics (porcelain crowns, veneers, zirconia, E-max)", "Removable Prosthetics (dentures)", "Orthodontics (clear aligners, braces)", "Surgery, Implants and Hygiene (whitening, cleaning, extractions, implants)"],
    it: ["Otturazioni e Trattamenti Preventivi", "Endodonzia (Devitalizzazione)", "Protesi Fissa e Estetica (corone porcelain, faccette, zirconia, E-max)", "Protesi Mobili (dentiere)", "Ortodonzia (allineatori trasparenti, apparecchio)", "Chirurgia, Impianti e Igiene (sbiancamento, pulizia, estrazione, impianti)"],
  },
};

const KEYWORD_RESPONSES = {
  orari: {
    al: (c: typeof CLINIC_INFO) => `📅 **Orari i klinikës:**\n${c.schedule.al}\n\nTelefono për informacion: ${c.phone}`,
    en: (c: typeof CLINIC_INFO) => `📅 **Clinic Hours:**\n${c.schedule.en}\n\nCall for info: ${c.phone}`,
    it: (c: typeof CLINIC_INFO) => `📅 **Orari della clinica:**\n${c.schedule.it}\n\nChiama per informazioni: ${c.phone}`,
  },
  schedule: {
    al: (c: typeof CLINIC_INFO) => `📅 **Orari i klinikës:**\n${c.schedule.al}\n\nTelefono për informacion: ${c.phone}`,
    en: (c: typeof CLINIC_INFO) => `📅 **Clinic Hours:**\n${c.schedule.en}\n\nCall for info: ${c.phone}`,
    it: (c: typeof CLINIC_INFO) => `📅 **Orario della clinica:**\n${c.schedule.it}\n\nChiama per informazioni: ${c.phone}`,
  },
  ore: {
    al: (c: typeof CLINIC_INFO) => `📅 **Orari i klinikës:**\n${c.schedule.al}\n\nTelefono për informacion: ${c.phone}`,
    en: (c: typeof CLINIC_INFO) => `📅 **Clinic Hours:**\n${c.schedule.en}\n\nCall for info: ${c.phone}`,
    it: (c: typeof CLINIC_INFO) => `📅 **Orari della clinica:**\n${c.schedule.it}\n\nChiama per informazioni: ${c.phone}`,
  },
  kontakto: {
    al: (c: typeof CLINIC_INFO) => `📞 **Kontakti:**\nTel: ${c.phone}\nEmail: ${c.email}\nAdresa: ${c.address}`,
    en: (c: typeof CLINIC_INFO) => `📞 **Contact:**\nPhone: ${c.phone}\nEmail: ${c.email}\nAddress: ${c.address}`,
    it: (c: typeof CLINIC_INFO) => `📞 **Contatti:**\nTel: ${c.phone}\nEmail: ${c.email}\nIndirizzo: ${c.address}`,
  },
  contact: {
    al: (c: typeof CLINIC_INFO) => `📞 **Kontakti:**\nTel: ${c.phone}\nEmail: ${c.email}\nAdresa: ${c.address}`,
    en: (c: typeof CLINIC_INFO) => `📞 **Contact:**\nPhone: ${c.phone}\nEmail: ${c.email}\nAddress: ${c.address}`,
    it: (c: typeof CLINIC_INFO) => `📞 **Contatti:**\nTel: ${c.phone}\nEmail: ${c.email}\nIndirizzo: ${c.address}`,
  },
  kontakt: {
    al: (c: typeof CLINIC_INFO) => `📞 **Kontakti:**\nTel: ${c.phone}\nEmail: ${c.email}\nAdresa: ${c.address}`,
    en: (c: typeof CLINIC_INFO) => `📞 **Contact:**\nPhone: ${c.phone}\nEmail: ${c.email}\nAddress: ${c.address}`,
    it: (c: typeof CLINIC_INFO) => `📞 **Contatti:**\nTel: ${c.phone}\nEmail: ${c.email}\nIndirizzo: ${c.address}`,
  },
  adresa: {
    al: (c: typeof CLINIC_INFO) => `📍 **Adresa:**\n${c.address}`,
    en: (c: typeof CLINIC_INFO) => `📍 **Address:**\n${c.address}`,
    it: (c: typeof CLINIC_INFO) => `📍 **Indirizzo:**\n${c.address}`,
  },
  address: {
    al: (c: typeof CLINIC_INFO) => `📍 **Adresa:**\n${c.address}`,
    en: (c: typeof CLINIC_INFO) => `📍 **Address:**\n${c.address}`,
    it: (c: typeof CLINIC_INFO) => `📍 **Indirizzo:**\n${c.address}`,
  },
  indirizzo: {
    al: (c: typeof CLINIC_INFO) => `📍 **Adresa:**\n${c.address}`,
    en: (c: typeof CLINIC_INFO) => `📍 **Address:**\n${c.address}`,
    it: (c: typeof CLINIC_INFO) => `📍 **Indirizzo:**\n${c.address}`,
  },
  rezervo: {
    al: (c: typeof CLINIC_INFO) => `📋 **Rezervim:**\nPër të bërë rezervim, plotëso formularin në seksionin "Rezervo Online" në website. Ose telefono: ${c.phone}`,
    en: (c: typeof CLINIC_INFO) => `📋 **Booking:**\nTo book an appointment, fill the form in the "Book Online" section on the website. Or call: ${c.phone}`,
    it: (c: typeof CLINIC_INFO) => `📋 **Prenotazione:**\nPer prenotare, compila il modulo nella sezione "Prenota Online" sul sito. O chiama: ${c.phone}`,
  },
  prenot: {
    al: (c: typeof CLINIC_INFO) => `📋 **Rezervim:**\nPër të bërë rezervim, plotëso formularin në seksionin "Rezervo Online" në website. Ose telefono: ${c.phone}`,
    en: (c: typeof CLINIC_INFO) => `📋 **Booking:**\nTo book an appointment, fill the form in the "Book Online" section on the website. Or call: ${c.phone}`,
    it: (c: typeof CLINIC_INFO) => `📋 **Prenotazione:**\nPer prenotare, compila il modulo nella sezione "Prenota Online" sul sito. O chiama: ${c.phone}`,
  },
  book: {
    al: (c: typeof CLINIC_INFO) => `📋 **Rezervim:**\nPër të bërë rezervim, plotëso formularin në seksionin "Rezervo Online" në website. Ose telefono: ${c.phone}`,
    en: (c: typeof CLINIC_INFO) => `📋 **Booking:**\nTo book an appointment, fill the form in the "Book Online" section on the website. Or call: ${c.phone}`,
    it: (c: typeof CLINIC_INFO) => `📋 **Prenotazione:**\nPer prenotare, compila il modulo nella sezione "Prenota Online" sul sito. O chiama: ${c.phone}`,
  },
  ceno: {
    al: (c: typeof CLINIC_INFO) => `📋 **Rezervim:**\nPër të bërë rezervim, plotëso formularin në seksionin "Rezervo Online" në website. Ose telefono: ${c.phone}`,
    en: (c: typeof CLINIC_INFO) => `📋 **Booking:**\nTo book an appointment, fill the form in the "Book Online" section on the website. Or call: ${c.phone}`,
    it: (c: typeof CLINIC_INFO) => `📋 **Prenotazione:**\nPer prenotare, compila il modulo nella sezione "Prenota Online" sul sito. O chiama: ${c.phone}`,
  },
  cmime: {
    al: (c: typeof CLINIC_INFO) => `💰 **Çmimet:**\nÇmimet variojnë sipas trajtimit. Na telefono për konsultë falas: ${c.phone}`,
    en: (c: typeof CLINIC_INFO) => `💰 **Prices:**\nPrices vary by treatment. Call us for a free consultation: ${c.phone}`,
    it: (c: typeof CLINIC_INFO) => `💰 **Prezzi:**\nI prezzi variano in base al trattamento. Chiamaci per una consultazione gratuita: ${c.phone}`,
  },
  prices: {
    al: (c: typeof CLINIC_INFO) => `💰 **Çmimet:**\nÇmimet variojnë sipas trajtimit. Na telefono për konsultë falas: ${c.phone}`,
    en: (c: typeof CLINIC_INFO) => `💰 **Prices:**\nPrices vary by treatment. Call us for a free consultation: ${c.phone}`,
    it: (c: typeof CLINIC_INFO) => `💰 **Prezzi:**\nI prezzi variano in base al trattamento. Chiamaci per una consultazione gratuita: ${c.phone}`,
  },
  prezzi: {
    al: (c: typeof CLINIC_INFO) => `💰 **Çmimet:**\nÇmimet variojnë sipas trajtimit. Na telefono për konsultë falas: ${c.phone}`,
    en: (c: typeof CLINIC_INFO) => `💰 **Prices:**\nPrices vary by treatment. Call us for a free consultation: ${c.phone}`,
    it: (c: typeof CLINIC_INFO) => `💰 **Prezzi:**\nI prezzi variano in base al trattamento. Chiamaci per una consultazione gratuita: ${c.phone}`,
  },
  sherbime: {
    al: (c: typeof CLINIC_INFO) => `🦷 **Shërbimet:**\n${c.services.al.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    en: (c: typeof CLINIC_INFO) => `🦷 **Services:**\n${c.services.en.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    it: (c: typeof CLINIC_INFO) => `🦷 **Servizi:**\n${c.services.it.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
  },
  services: {
    al: (c: typeof CLINIC_INFO) => `🦷 **Shërbimet:**\n${c.services.al.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    en: (c: typeof CLINIC_INFO) => `🦷 **Services:**\n${c.services.en.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    it: (c: typeof CLINIC_INFO) => `🦷 **Servizi:**\n${c.services.it.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
  },
  servizi: {
    al: (c: typeof CLINIC_INFO) => `🦷 **Shërbimet:**\n${c.services.al.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    en: (c: typeof CLINIC_INFO) => `🦷 **Services:**\n${c.services.en.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    it: (c: typeof CLINIC_INFO) => `🦷 **Servizi:**\n${c.services.it.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
  },
  staff: {
    al: (c: typeof CLINIC_INFO) => `👨‍⚕️ **Stafi:**\n${c.staff.al}\n\n${c.experience.al}`,
    en: (c: typeof CLINIC_INFO) => `👨‍⚕️ **Staff:**\n${c.staff.en}\n\n${c.experience.en}`,
    it: (c: typeof CLINIC_INFO) => `👨‍⚕️ **Staff:**\n${c.staff.it}\n\n${c.experience.it}`,
  },
  ekipi: {
    al: (c: typeof CLINIC_INFO) => `👨‍⚕️ **Stafi:**\n${c.staff.al}\n\n${c.experience.al}`,
    en: (c: typeof CLINIC_INFO) => `👨‍⚕️ **Staff:**\n${c.staff.en}\n\n${c.experience.en}`,
    it: (c: typeof CLINIC_INFO) => `👨‍⚕️ **Staff:**\n${c.staff.it}\n\n${c.experience.it}`,
  },
  equipe: {
    al: (c: typeof CLINIC_INFO) => `👨‍⚕️ **Stafi:**\n${c.staff.al}\n\n${c.experience.al}`,
    en: (c: typeof CLINIC_INFO) => `👨‍⚕️ **Staff:**\n${c.staff.en}\n\n${c.experience.en}`,
    it: (c: typeof CLINIC_INFO) => `👨‍⚕️ **Staff:**\n${c.staff.it}\n\n${c.experience.it}`,
  },
};

function detectLanguage(text: string): "al" | "en" | "it" {
  const lower = text.toLowerCase();
  const italianWords = ["ciao", "grazie", "come", "prezzo", "prezzi", "servizi", "orario", "giretto", " prenot", "contatto", "indirizzo", "buongiorno", "arrivederci", "per favore", " Quanto", "dove", "quando", "chi", "che"];
  const englishWords = ["hello", "hi", "thanks", "thank", "price", "prices", "service", "services", "schedule", "book", "contact", "address", "goodbye", "please", "how", "where", "when", "who", "what"];
  for (const w of italianWords) if (lower.includes(w)) return "it";
  for (const w of englishWords) if (lower.includes(w)) return "en";
  return "al";
}

function detectKeyword(text: string): string | null {
  const lower = text.toLowerCase().trim();
  for (const kw of Object.keys(KEYWORD_RESPONSES)) {
    if (lower === kw || lower.includes(kw)) return kw;
  }
  return null;
}

function buildSystemPrompt(lang: "al" | "en" | "it"): string {
  const c = CLINIC_INFO;
  const prefixes = {
    al: "Ti je asistenti virtual i TITAN DENT, klinikë dentare në Tiranë, Shqipëri. ",
    en: "You are a virtual assistant of TITAN DENT, a dental clinic in Tirana, Albania. ",
    it: "Sei un assistente virtuale di TITAN DENT, una clinica dentale a Tirana, Albania. ",
  };
  return `${prefixes[lang]}Përgjigju GJITHMONË në ${lang === "al" ? "shqip" : lang === "en" ? "english" : "italiano"}, me ton profesional dhe miqësor.

📋 **Informacione rreth klinikës:** ${lang === "al" ? "" : lang === "en" ? "Clinic Information:" : "Informazioni sulla clinica:"}
- ${lang === "al" ? "Emri" : lang === "en" ? "Name" : "Nome"}: ${c.name}
- ${lang === "al" ? "Adresa" : lang === "en" ? "Address" : "Indirizzo"}: ${c.address}
- ${lang === "al" ? "Telefon" : lang === "en" ? "Phone" : "Telefono"}: ${c.phone}
- ${lang === "al" ? "Email" : "Email"}: ${c.email}
- ${lang === "al" ? "Orari" : lang === "en" ? "Schedule" : "Orario"}: ${c.schedule[lang]}
- ${lang === "al" ? "Stafi" : lang === "en" ? "Staff" : "Staff"}: ${c.staff[lang]}
- ${lang === "al" ? "Përvojë" : lang === "en" ? "Experience" : "Esperienza"}: ${c.experience[lang]}

🦷 **${lang === "al" ? "Shërbimet" : lang === "en" ? "Services" : "Servizi"}:**
${c.services[lang].map((s, i) => `${i + 1}. ${s}`).join("\n")}

⚠️ **${lang === "al" ? "Rregulla të rëndësishme:" : lang === "en" ? "Important rules:" : "Regole importanti:"}**
- ${lang === "al" ? "Për pyetje mjekësore, jep këshilla të përgjithshme dhe rekomando vizitë në klinikë" : lang === "en" ? "For medical questions, give general advice and recommend a clinic visit" : "Per domande mediche, dai consigli generali e raccomanda una visita in clinica"}
- ${lang === "al" ? "Mos diagnostiko kurrë - sugjero gjithmonë konsultë me doktorin" : lang === "en" ? "Never diagnose - always recommend a doctor consultation" : "Non diagnosticare mai - raccomanda sempre una consultazione con il medico"}
- ${lang === "al" ? "Për urgjenca, rekomando të telefonojnë" : lang === "en" ? "For emergencies, recommend calling" : "Per le emergenze, raccomanda di chiamare"} ${c.phone} ${lang === "al" ? "ose të përdorin seksionin e urgjencës në website" : lang === "en" ? "or use the emergency section on the website" : "o usare la sezione emergenze sul sito"}
- ${lang === "al" ? "Për rezervime, drejtoji në seksionin e rezervimit në website" : lang === "en" ? "For bookings, direct them to the booking section on the website" : "Per le prenotazioni, indirizzarli alla sezione prenotazione sul sito"}
- ${lang === "al" ? "Mbaj përgjigjet koncize dhe të qarta" : lang === "en" ? "Keep responses concise and clear" : "Mantieni le risposte concise e chiare"}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, language } = await req.json();
    let LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      LOVABLE_API_KEY = "lovable_placeholder_key_for_testing";
    }

    const userLang = language && ["al", "en", "it"].includes(language) ? language as "al" | "en" | "it" : "al";
    const lastUserMessage = messages && messages.length > 0 ? messages[messages.length - 1]?.content?.toString() || "" : "";
    const autoLang = detectLanguage(lastUserMessage);
    const lang = userLang !== "al" ? userLang : autoLang;
    const keyword = detectKeyword(lastUserMessage);

    if (keyword && KEYWORD_RESPONSES[keyword as keyof typeof KEYWORD_RESPONSES]) {
      const responseFn = KEYWORD_RESPONSES[keyword as keyof typeof KEYWORD_RESPONSES][lang];
      return new Response(JSON.stringify({ choices: [{ message: { content: responseFn(CLINIC_INFO) } }] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = buildSystemPrompt(lang);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...(messages || []),
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Shumë kërkesa. Provoni përsëri pas disa sekondash." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Shërbimi nuk është i disponueshëm momentalisht." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Gabim në shërbim" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    return new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Gabim i papritur" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
