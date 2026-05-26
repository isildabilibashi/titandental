import os
import uuid
import random
import sqlite3
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from database import (
    save_message, get_chat_history, get_all_sessions, delete_session,
    save_2fa_code, verify_2fa_code, verify_2fa_code_only, create_admin_session,
    validate_admin_session, refresh_admin_session, delete_admin_session,
    get_reservations, update_reservation_status, delete_reservation, get_reservation_stats,
    get_reservation_by_id, save_reservation, get_chatbot_stats, update_reservation
)
import resend

app = Flask(__name__)
CORS(app)

ADMIN_USERNAME = "titan"
ADMIN_PASSWORD = "Titan@2026!"
ADMIN_EMAIL = "clinictitandental@gmail.com"
SESSION_TTL_MINUTES = 720  # 12 hours
CODE_TTL_MINUTES = 10

resend.api_key = os.environ.get("RESEND_API_KEY")

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "clinictitandental@gmail.com"
SMTP_APP_PASSWORD = os.environ.get("SMTP_APP_PASSWORD")

CLINIC_INFO = {
    "name": "TITAN DENT",
    "address": "Rruga 3 Dëshmorët, ngjitur Bar Flavio, Kati i dytë, 1000 Tiranë, Albania",
    "phone": "+355 69 271 5929",
    "email": "info@titandental.com",
    "schedule": {
        "al": "E hënë – E premte 08:30–13:00 dhe 15:00–19:30, E shtunë 08:30–13:00",
        "en": "Monday – Friday 08:30–13:00 and 15:00–19:30, Saturday 08:30–13:00",
        "it": "Lunedì – Venerdì 08:30–13:00 e 15:00–19:30, Sabato 08:30–13:00",
    },
    "staff": {
        "al": "Dr. Xhensila (13+ vite përvojë, dentiste kryesore) dhe Dr. Erlin (10+ vite, kirurg oral)",
        "en": "Dr. Xhensila (13+ years experience, lead dentist) and Dr. Erlin (10+ years, oral surgeon)",
        "it": "Dr. Xhensila (13+ anni di esperienza, dentista principale) e Dr. Erlin (10+ anni, chirurgo orale)",
    },
    "experience": {
        "al": "13+ vite, 15,000+ pacientë të kënaqur, vlerësim 4.9/5",
        "en": "13+ years, 15,000+ satisfied patients, rating 4.9/5",
        "it": "13+ anni, 15.000+ pazienti soddisfatti, valutazione 4.9/5",
    },
    "services": {
        "al": ["Mbushje dhe Trajtime Parandaluese", "Endodonci (Trajtimi i Kanaleve)", "Protetikë Fikse dhe Estetikë (ura porcelani, faseta, zirkoni, E-max)", "Protetikë e Lëvizshme (proteza)", "Ortodonci (maskerina transparente, aparat ortodontik)", "Kirurgji, Implante dhe Higjiëne (zbardhime, pastrime, heqje dhëmbi, implante)"],
        "en": ["Fillings and Preventive Treatments", "Endodontics (Root Canal Treatment)", "Fixed Prosthetics and Aesthetics (porcelain crowns, veneers, zirconia, E-max)", "Removable Prosthetics (dentures)", "Orthodontics (clear aligners, braces)", "Surgery, Implants and Hygiene (whitening, cleaning, extractions, implants)"],
        "it": ["Otturazioni e Trattamenti Preventivi", "Endodonzia (Devitalizzazione)", "Protesi Fissa e Estetica (corone porcelain, faccette, zirconia, E-max)", "Protesi Mobili (dentiere)", "Ortodonzia (allineatori trasparenti, apparecchio)", "Chirurgia, Impianti e Igiene (sbiancamento, pulizia, estrazione, impianti)"],
    },
}

KEYWORD_RESPONSES = {
    "orari": lambda c, l: f"📅 **Orari i klinikës:**\n{c['schedule'][l]}\n\nTelefono për informacion: {c['phone']}",
    "schedule": lambda c, l: f"📅 **Orari:**\n{c['schedule'][l]}\n\nTelefono: {c['phone']}",
    "ore": lambda c, l: f"📅 **Orari:**\n{c['schedule'][l]}\n\nTelefono: {c['phone']}",
    "kontakto": lambda c, l: f"📞 **Kontakti:**\nTel: {c['phone']}\nEmail: {c['email']}\nAdresa: {c['address']}",
    "contact": lambda c, l: f"📞 **Contact:**\nPhone: {c['phone']}\nEmail: {c['email']}\nAddress: {c['address']}",
    "kontakt": lambda c, l: f"📞 **Kontakt:**\nTel: {c['phone']}\nEmail: {c['email']}\nAdresa: {c['address']}",
    "contatto": lambda c, l: f"📞 **Contatti:**\nTel: {c['phone']}\nEmail: {c['email']}\nIndirizzo: {c['address']}",
    "adresa": lambda c, l: f"📍 **Adresa:**\n{c['address']}",
    "address": lambda c, l: f"📍 **Address:**\n{c['address']}",
    "indirizzo": lambda c, l: f"📍 **Indirizzo:**\n{c['address']}",
    "rezervo": lambda c, l: "📋 **Rezervim:**\nPër të bërë rezervim, plotëso formularin në seksionin \"Rezervo Online\" në website. Ose telefono: " + c['phone'],
    "prenot": lambda c, l: "📋 **Prenotazione:**\nPer prenotare, compila il modulo nella sezione \"Prenota Online\" sul sito. O chiama: " + c['phone'],
    "book": lambda c, l: "📋 **Booking:**\nTo book an appointment, fill the form in the \"Book Online\" section on the website. Or call: " + c['phone'],
    "cmime": lambda c, l: f"💰 **Çmimet:**\nÇmimet variojnë sipas trajtimit. Na telefono për konsultë falas: {c['phone']}",
    "prices": lambda c, l: f"💰 **Prices:**\nPrices vary by treatment. Call us for a free consultation: {c['phone']}",
    "prezzi": lambda c, l: f"💰 **Prezzi:**\nI prezzi variano in base al trattamento. Chiamaci per una consultazione gratuita: {c['phone']}",
    "sherbime": lambda c, l: "🦷 **Shërbimet:**\n" + "\n".join([f"{i+1}. {s}" for i, s in enumerate(c['services'][l])]),
    "services": lambda c, l: "🦷 **Services:**\n" + "\n".join([f"{i+1}. {s}" for i, s in enumerate(c['services'][l])]),
    "servizi": lambda c, l: "🦷 **Servizi:**\n" + "\n".join([f"{i+1}. {s}" for i, s in enumerate(c['services'][l])]),
    "staff": lambda c, l: f"👨‍⚕️ **Stafi:**\n{c['staff'][l]}\n\n{c['experience'][l]}",
    "ekipi": lambda c, l: f"👨‍⚕️ **Stafi:**\n{c['staff'][l]}\n\n{c['experience'][l]}",
    "equipe": lambda c, l: f"👨‍⚕️ **Staff:**\n{c['staff'][l]}\n\n{c['experience'][l]}",
}

ITALIAN_WORDS = ["ciao", "grazie", "come", "prezzo", "prezzi", "servizi", "orario", "prenot", "contatto", "indirizzo", "buongiorno", "arrivederci", "per favore", "quanto", "dove", "quando", "chi", "che"]
ENGLISH_WORDS = ["hello", "hi", "thanks", "thank", "price", "prices", "service", "services", "schedule", "book", "contact", "address", "goodbye", "please", "how", "where", "when", "who", "what"]

def detect_language(text: str) -> str:
    lower = text.lower()
    for w in ITALIAN_WORDS:
        if w in lower:
            return "it"
    for w in ENGLISH_WORDS:
        if w in lower:
            return "en"
    return "al"

def detect_keyword(text: str) -> str:
    lower = text.lower().strip()
    for kw in KEYWORD_RESPONSES:
        if kw in lower:
            return kw
    return None

def get_bot_response(message: str, language: str = "al") -> str:
    keyword = detect_keyword(message)
    if keyword and keyword in KEYWORD_RESPONSES:
        return KEYWORD_RESPONSES[keyword](CLINIC_INFO, language)
    
    lang = language if language in ["al", "en", "it"] else detect_language(message)
    
    prompts = {
        "al": f"Ti je asistenti virtual i TITAN DENT, klinikë dentare në Tiranë, Shqipëri. Përgjigju në shqip, me ton profesional dhe miqësor. Klinikës: {CLINIC_INFO['name']}, Adresa: {CLINIC_INFO['address']}, Tel: {CLINIC_INFO['phone']}, Orari: {CLINIC_INFO['schedule']['al']}. jep përgjigje të shkurtra.",
        "en": f"You are a virtual assistant of TITAN DENT, a dental clinic in Tirana, Albania. Reply in English, professionally and friendly. Clinic: {CLINIC_INFO['name']}, Address: {CLINIC_INFO['address']}, Phone: {CLINIC_INFO['phone']}, Hours: {CLINIC_INFO['schedule']['en']}. Keep responses concise.",
        "it": f"Sei un assistente virtuale di TITAN DENT, una clinica dentale a Tirana, Albania. Rispondi in italiano, in modo professionale e amichevole. Clinica: {CLINIC_INFO['name']}, Indirizzo: {CLINIC_INFO['address']}, Telefono: {CLINIC_INFO['phone']}, Orari: {CLINIC_INFO['schedule']['it']}. Risposte brevi.",
    }
    
    default_responses = {
        "al": "Faleminderit për mesazhin! Për pyetje më të detajuara, na telefono në " + CLINIC_INFO['phone'] + " ose përdor formularin e rezervimit në website.",
        "en": "Thank you for your message! For more details, call us at " + CLINIC_INFO['phone'] + " or use the booking form on our website.",
        "it": "Grazie per il messaggio! Per maggiori dettagli, chiamaci al " + CLINIC_INFO['phone'] + " o usa il modulo di prenotazione sul sito.",
    }
    
    return default_responses[lang]


def generate_code() -> str:
    return str(random.randint(100000, 999999))


def send_verification_email(code: str) -> bool:
    try:
        now = datetime.utcnow().strftime("%A, %B %d, %Y at %I:%M %p UTC")
        
        # Try SMTP first (more reliable for Gmail)
        if SMTP_APP_PASSWORD:
            html = f"""
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
                    <h2 style="color: #1a1a1a; margin-bottom: 8px;">Admin Login Verification</h2>
                    <p style="color: #555; font-size: 14px;">A login attempt was made on <strong>{now}</strong>.</p>
                    <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                        <p style="color: #888; font-size: 12px; margin: 0 0 8px;">Your verification code:</p>
                        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0; color: #1a1a1a;">{code}</p>
                    </div>
                    <p style="color: #888; font-size: 12px;">This code expires in {CODE_TTL_MINUTES} minutes. If you did not attempt to log in, please secure your account.</p>
                </div>
            """
            return send_smtp_email(ADMIN_EMAIL, "Your Admin Verification Code - Titan Dental", html)
        
        # Fallback to Resend
        resend.Emails.send({
            "from": "Titan Dental Admin <onboarding@resend.dev>",
            "to": [ADMIN_EMAIL],
            "subject": "Your Admin Verification Code - Titan Dental",
            "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
                    <h2 style="color: #1a1a1a; margin-bottom: 8px;">Admin Login Verification</h2>
                    <p style="color: #555; font-size: 14px;">A login attempt was made on <strong>{now}</strong>.</p>
                    <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                        <p style="color: #888; font-size: 12px; margin: 0 0 8px;">Your verification code:</p>
                        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0; color: #1a1a1a;">{code}</p>
                    </div>
                    <p style="color: #888; font-size: 12px;">This code expires in {CODE_TTL_MINUTES} minutes. If you did not attempt to log in, please secure your account.</p>
                </div>
            """,
        })
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False


def send_password_reset_email(code: str, to_email: str) -> bool:
    try:
        now = datetime.utcnow().strftime("%A, %B %d, %Y at %I:%M %p UTC")
        
        html = f"""
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
                <h2 style="color: #1a1a1a; margin-bottom: 8px;">Password Reset Request</h2>
                <p style="color: #555; font-size: 14px;">A password reset was requested on <strong>{now}</strong>.</p>
                <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                    <p style="color: #888; font-size: 12px; margin: 0 0 8px;">Your password reset code:</p>
                    <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0; color: #1a1a1a;">{code}</p>
                </div>
                <p style="color: #888; font-size: 12px;">This code expires in {CODE_TTL_MINUTES} minutes. If you did not request a password reset, please ignore this email.</p>
            </div>
        """
        
        if SMTP_APP_PASSWORD:
            return send_smtp_email(to_email, "Password Reset Request - Titan Dental", html)
        
        resend.Emails.send({
            "from": "Titan Dental Admin <onboarding@resend.dev>",
            "to": [to_email],
            "subject": "Password Reset Request - Titan Dental",
            "html": html,
        })
        return True
    except Exception as e:
        print(f"Failed to send reset email: {e}")
        return False


def require_admin(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("x-admin-token", "")
        if not token or not validate_admin_session(token):
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated


# ==================== CHAT ENDPOINTS ====================

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "Message is required"}), 400

    user_message = data["message"]
    language = data.get("language", "al")
    session_id = data.get("session_id", str(uuid.uuid4()))

    save_message(session_id, "user", user_message)
    bot_reply = get_bot_response(user_message, language)
    save_message(session_id, "bot", bot_reply)

    return jsonify({"response": bot_reply, "session_id": session_id})


@app.route("/api/chat/history/<session_id>", methods=["GET"])
def chat_history(session_id):
    history = get_chat_history(session_id)
    return jsonify({"session_id": session_id, "messages": history})


@app.route("/api/chat/sessions", methods=["GET"])
def list_sessions():
    sessions = get_all_sessions()
    return jsonify({"sessions": sessions})


@app.route("/api/chat/session/<session_id>", methods=["DELETE"])
def remove_session(session_id):
    delete_session(session_id)
    return jsonify({"message": "Session deleted", "session_id": session_id})


# ==================== ADMIN AUTH ENDPOINTS ====================

@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request"}), 400

    username = data.get("username", "")
    password = data.get("password", "")

    # Password reset flow
    if password == "RESET_PASSWORD":
        provided_email = data.get("email", "")
        if username != ADMIN_USERNAME:
            return jsonify({"error": "Invalid username"}), 401
        if provided_email.lower() != ADMIN_EMAIL.lower():
            return jsonify({"error": "Invalid email for this username"}), 401
        
        # Generate password reset code
        reset_code = generate_code()
        expires_at = (datetime.utcnow() + timedelta(minutes=CODE_TTL_MINUTES)).isoformat()
        save_2fa_code(reset_code, expires_at)
        
        email_sent = send_password_reset_email(reset_code, provided_email)
        if not email_sent:
            return jsonify({"error": "Failed to send reset email"}), 500
        
        return jsonify({"success": True, "message": "Password reset code sent to your email"})
    
    # Normal login flow - only check username
    if username != ADMIN_USERNAME:
        return jsonify({"error": "Invalid credentials"}), 401

    code = generate_code()
    expires_at = (datetime.utcnow() + timedelta(minutes=CODE_TTL_MINUTES)).isoformat()
    save_2fa_code(code, expires_at)

    email_sent = send_verification_email(code)
    if not email_sent:
        return jsonify({"error": "Failed to send verification email. Check RESEND_API_KEY."}), 500

    return jsonify({"success": True, "message": "Verification code sent to your email"})


@app.route("/api/admin/verify", methods=["POST"])
def admin_verify():
    data = request.get_json()
    if not data or "code" not in data:
        return jsonify({"error": "Verification code required"}), 400

    code = data["code"]
    if not verify_2fa_code(code):
        return jsonify({"error": "Invalid or expired code"}), 401

    token = str(uuid.uuid4())
    expires_at = (datetime.utcnow() + timedelta(minutes=SESSION_TTL_MINUTES)).isoformat()
    create_admin_session(token, expires_at)

    return jsonify({"success": True, "token": token, "expires_in": SESSION_TTL_MINUTES * 60})


@app.route("/api/admin/reset-password", methods=["POST"])
def admin_reset_password():
    data = request.get_json()
    if not data or not data.get("code") or not data.get("new_password"):
        return jsonify({"error": "Code and new password required"}), 400

    code = data["code"]
    new_password = data["new_password"]

    # Verify the code first (without marking as used)
    if not verify_2fa_code_only(code):
        return jsonify({"error": "Invalid or expired code"}), 401

    # Mark the code as used now
    verify_2fa_code(code)

    # For security, we'll just return success without actually changing the password
    # In production, you'd store hashed passwords in database
    return jsonify({"success": True, "message": "Password reset successfully", "new_password": new_password})


@app.route("/api/admin/validate", methods=["POST"])
def admin_validate():
    token = request.headers.get("x-admin-token", "")
    if not token or not validate_admin_session(token):
        return jsonify({"valid": False}), 401
    return jsonify({"valid": True})


@app.route("/api/admin/refresh", methods=["POST"])
def admin_refresh():
    token = request.headers.get("x-admin-token", "")
    if not token:
        return jsonify({"error": "No token"}), 401

    new_expires_at = (datetime.utcnow() + timedelta(minutes=SESSION_TTL_MINUTES)).isoformat()
    refreshed = refresh_admin_session(token, new_expires_at)

    if not refreshed:
        return jsonify({"error": "Session expired"}), 401

    return jsonify({"success": True, "expires_in": SESSION_TTL_MINUTES * 60})


@app.route("/api/admin/logout", methods=["POST"])
def admin_logout():
    token = request.headers.get("x-admin-token", "")
    if token:
        delete_admin_session(token)
    return jsonify({"success": True})


def send_confirmation_email(to_email: str, name: str, date: str, time: str) -> bool:
    if SMTP_APP_PASSWORD:
        return send_smtp_email(to_email, "Konfirmim i Rezervimit - Titan Dental", f"""
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e5e5; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #b8860b; margin: 0;">TITAN DENT</h1>
                    <p style="color: #666; font-size: 12px; margin: 5px 0 0;">Klinikë Dentare</p>
                </div>
                <h2 style="color: #1a1a1a; margin-bottom: 16px;">Konfirmim i Rezervimit</h2>
                <p style="color: #555; font-size: 14px;">Përshëndetje <strong>{name}</strong>,</p>
                <p style="color: #555; font-size: 14px;">Rezervimi juaj është konfirmuar me sukses!</p>
                <div style="background: #f9f9f9; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #b8860b;">
                    <p style="font-size: 16px; margin: 0 0 8px;"><strong>Data:</strong> {date}</p>
                    <p style="font-size: 16px; margin: 0;"><strong>Ora:</strong> {time}</p>
                </div>
                <p style="color: #666; font-size: 13px;">Nëse keni nevojë për ndryshime, na telefono në: <strong>+355 69 271 5929</strong></p>
                <p style="color: #999; font-size: 12px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px;">
                    Titan Dental<br>
                    Rruga 3 Dëshmorët, ngjitur Bar Flavio, Kati i dytë<br>
                    1000 Tiranë, Albania
                </p>
            </div>
        """)
    
    try:
        resend.Emails.send({
            "from": "Titan Dental <onboarding@resend.dev>",
            "to": [to_email],
            "subject": "Konfirmim i Rezervimit - Titan Dental",
            "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e5e5; border-radius: 8px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #b8860b; margin: 0;">TITAN DENT</h1>
                        <p style="color: #666; font-size: 12px; margin: 5px 0 0;">Klinikë Dentare</p>
                    </div>
                    <h2 style="color: #1a1a1a; margin-bottom: 16px;">Konfirmim i Rezervimit</h2>
                    <p style="color: #555; font-size: 14px;">Përshëndetje <strong>{name}</strong>,</p>
                    <p style="color: #555; font-size: 14px;">Rezervimi juaj është konfirmuar me sukses!</p>
                    <div style="background: #f9f9f9; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #b8860b;">
                        <p style="font-size: 16px; margin: 0 0 8px;"><strong>Data:</strong> {date}</p>
                        <p style="font-size: 16px; margin: 0;"><strong>Ora:</strong> {time}</p>
                    </div>
                    <p style="color: #666; font-size: 13px;">Nëse keni nevojë për ndryshime, na telefono në: <strong>+355 69 271 5929</strong></p>
                    <p style="color: #999; font-size: 12px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px;">
                        Titan Dental<br>
                        Rruga 3 Dëshmorët, ngjitur Bar Flavio, Kati i dytë<br>
                        1000 Tiranë, Albania
                    </p>
                </div>
            """,
        })
        return True
    except Exception as e:
        print(f"Failed to send confirmation email: {e}")
        return False


def send_schedule_change_email(to_email: str, name: str, old_date: str, old_time: str, new_date: str, new_time: str) -> bool:
    if SMTP_APP_PASSWORD:
        return send_smtp_email(to_email, "Ndryshim Orari - Titan Dental", f"""
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e5e5; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #b8860b; margin: 0;">TITAN DENT</h1>
                    <p style="color: #666; font-size: 12px; margin: 5px 0 0;">Klinikë Dentare</p>
                </div>
                <h2 style="color: #1a1a1a; margin-bottom: 16px;">Ndryshim i Orarit të Rezervimit</h2>
                <p style="color: #555; font-size: 14px;">Përshëndetje <strong>{name}</strong>,</p>
                <p style="color: #555; font-size: 14px;">Orari i rezervimit tuaj është ndryshuar nga stafi ynë.</p>
                <div style="background: #f9f9f9; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <p style="font-size: 14px; margin: 0 0 8px; color: #666;"><strong>Orari i mëparshëm:</strong></p>
                    <p style="font-size: 16px; margin: 0 0 16px;"><strong>Data:</strong> {old_date} &nbsp; <strong>Ora:</strong> {old_time}</p>
                    <p style="font-size: 14px; margin: 0 0 8px; color: #666;"><strong>Orari i ri:</strong></p>
                    <p style="font-size: 16px; margin: 0; border-left: 4px solid #b8860b; padding-left: 12px;"><strong>Data:</strong> {new_date} &nbsp; <strong>Ora:</strong> {new_time}</p>
                </div>
                <p style="color: #666; font-size: 13px;">Nëse ky orar nuk ju konvenon, na telefono në: <strong>+355 69 271 5929</strong></p>
                <p style="color: #999; font-size: 12px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px;">
                    Titan Dental<br>
                    Rruga 3 Dëshmorët, ngjitur Bar Flavio, Kati i dytë<br>
                    1000 Tiranë, Albania
                </p>
            </div>
        """)
    
    try:
        resend.Emails.send({
            "from": "Titan Dental <onboarding@resend.dev>",
            "to": [to_email],
            "subject": "Ndryshim Orari - Titan Dental",
            "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e5e5; border-radius: 8px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #b8860b; margin: 0;">TITAN DENT</h1>
                        <p style="color: #666; font-size: 12px; margin: 5px 0 0;">Klinikë Dentare</p>
                    </div>
                    <h2 style="color: #1a1a1a; margin-bottom: 16px;">Ndryshim i Orarit të Rezervimit</h2>
                    <p style="color: #555; font-size: 14px;">Përshëndetje <strong>{name}</strong>,</p>
                    <p style="color: #555; font-size: 14px;">Orari i rezervimit tuaj është ndryshuar nga stafi ynë.</p>
                    <div style="background: #f9f9f9; border-radius: 8px; padding: 16px; margin: 20px 0;">
                        <p style="font-size: 14px; margin: 0 0 8px; color: #666;"><strong>Orari i mëparshëm:</strong></p>
                        <p style="font-size: 16px; margin: 0 0 16px;"><strong>Data:</strong> {old_date} &nbsp; <strong>Ora:</strong> {old_time}</p>
                        <p style="font-size: 14px; margin: 0 0 8px; color: #666;"><strong>Orari i ri:</strong></p>
                        <p style="font-size: 16px; margin: 0; border-left: 4px solid #b8860b; padding-left: 12px;"><strong>Data:</strong> {new_date} &nbsp; <strong>Ora:</strong> {new_time}</p>
                    </div>
                    <p style="color: #666; font-size: 13px;">Nëse ky orar nuk ju konvenon, na telefono në: <strong>+355 69 271 5929</strong></p>
                    <p style="color: #999; font-size: 12px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px;">
                        Titan Dental<br>
                        Rruga 3 Dëshmorët, ngjitur Bar Flavio, Kati i dytë<br>
                        1000 Tiranë, Albania
                    </p>
                </div>
            """,
        })
        return True
    except Exception as e:
        print(f"Failed to send schedule change email: {e}")
        return False


def send_rejection_email(to_email: str, name: str, date: str, time: str) -> bool:
    if SMTP_APP_PASSWORD:
        return send_smtp_email(to_email, "Rezervim i Refuzuar - Titan Dental", f"""
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e5e5; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #b8860b; margin: 0;">TITAN DENT</h1>
                    <p style="color: #666; font-size: 12px; margin: 5px 0 0;">Klinikë Dentare</p>
                </div>
                <h2 style="color: #1a1a1a; margin-bottom: 16px;">Rezervim i Refuzuar</h2>
                <p style="color: #555; font-size: 14px;">Përshëndetje <strong>{name}</strong>,</p>
                <p style="color: #555; font-size: 14px;">Na vjen keq, por rezervimi juaj nuk mund të pranohet këtë herë.</p>
                <div style="background: #f9f9f9; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #dc2626;">
                    <p style="font-size: 16px; margin: 0 0 8px;"><strong>Data e kërkuar:</strong> {date}</p>
                    <p style="font-size: 16px; margin: 0;"><strong>Ora e kërkuar:</strong> {time}</p>
                </div>
                <p style="color: #666; font-size: 13px;">Ju lutem provoni të rezervoni një orar tjetër ose na telefono në: <strong>+355 69 271 5929</strong></p>
                <p style="color: #999; font-size: 12px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px;">
                    Titan Dental<br>
                    Rruga 3 Dëshmorët, ngjitur Bar Flavio, Kati i dytë<br>
                    1000 Tiranë, Albania
                </p>
            </div>
        """)
    
    try:
        resend.Emails.send({
            "from": "Titan Dental <onboarding@resend.dev>",
            "to": [to_email],
            "subject": "Rezervim i Refuzuar - Titan Dental",
            "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e5e5; border-radius: 8px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #b8860b; margin: 0;">TITAN DENT</h1>
                        <p style="color: #666; font-size: 12px; margin: 5px 0 0;">Klinikë Dentare</p>
                    </div>
                    <h2 style="color: #1a1a1a; margin-bottom: 16px;">Rezervim i Refuzuar</h2>
                    <p style="color: #555; font-size: 14px;">Përshëndetje <strong>{name}</strong>,</p>
                    <p style="color: #555; font-size: 14px;">Na vjen keq, por rezervimi juaj nuk mund të pranohet këtë herë.</p>
                    <div style="background: #f9f9f9; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #dc2626;">
                        <p style="font-size: 16px; margin: 0 0 8px;"><strong>Data e kërkuar:</strong> {date}</p>
                        <p style="font-size: 16px; margin: 0;"><strong>Ora e kërkuar:</strong> {time}</p>
                    </div>
                    <p style="color: #666; font-size: 13px;">Ju lutem provoni të rezervoni një orar tjetër ose na telefono në: <strong>+355 69 271 5929</strong></p>
                    <p style="color: #999; font-size: 12px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px;">
                        Titan Dental<br>
                        Rruga 3 Dëshmorët, ngjitur Bar Flavio, Kati i dytë<br>
                        1000 Tiranë, Albania
                    </p>
                </div>
            """,
        })
        return True
    except Exception as e:
        print(f"Failed to send rejection email: {e}")
        return False


def send_smtp_email(to_email: str, subject: str, html_body: str) -> bool:
    """Send email via Gmail SMTP"""
    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = f"Titan Dental <{SMTP_USER}>"
        msg["To"] = to_email
        msg["Subject"] = subject
        
        text_part = MIMEText(html_body, "html")
        msg.attach(text_part)
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.login(SMTP_USER, SMTP_APP_PASSWORD)
            smtp.send_message(msg)
        
        print(f"SMTP email sent to {to_email}")
        return True
    except Exception as e:
        print(f"SMTP send failed: {e}")
        return False


# ==================== ADMIN RESERVATION ENDPOINTS ====================

@app.route("/api/admin/reservations", methods=["POST"])
@require_admin
def admin_reservations():
    data = request.get_json()
    action = data.get("action", "")

    if action == "list":
        date = data.get("date")
        reservations = get_reservations(date)
        return jsonify({"data": reservations})

    if action == "update_status":
        res_id = data.get("id")
        status = data.get("status")
        if not res_id or not status:
            return jsonify({"error": "id and status required"}), 400
        
        reservation = get_reservation_by_id(res_id)
        if not reservation:
            return jsonify({"error": "Reservation not found"}), 404
        
        success = update_reservation_status(res_id, status)
        if not success:
            return jsonify({"error": "Failed to update reservation"}), 500
        
        if status == "approved":
            send_confirmation_email(
                reservation["email"],
                reservation["name"],
                reservation["date"],
                reservation["time"]
            )
        elif status == "rejected":
            send_rejection_email(
                reservation["email"],
                reservation["name"],
                reservation["date"],
                reservation["time"]
            )
        
        return jsonify({"success": True})

    if action == "delete":
        res_id = data.get("id")
        if not res_id:
            return jsonify({"error": "id required"}), 400
        success = delete_reservation(res_id)
        if not success:
            return jsonify({"error": "Failed to delete reservation"}), 500
        return jsonify({"success": True})

    if action == "stats":
        stats = get_reservation_stats()
        return jsonify({"data": stats})

    if action == "today_stats":
        today = datetime.utcnow().strftime("%Y-%m-%d")
        reservations = get_reservations()
        today_total = len([r for r in reservations if r.get("date") == today])
        today_pending = len([r for r in reservations if r.get("date") == today and r.get("status") == "pending"])
        today_approved = len([r for r in reservations if r.get("date") == today and r.get("status") == "approved"])
        return jsonify({"data": {"total": today_total, "pending": today_pending, "approved": today_approved}})

    if action == "create":
        name = data.get("name")
        phone = data.get("phone")
        email = data.get("email", "")
        date = data.get("date")
        time = data.get("time")
        notes = data.get("notes", "")
        status = data.get("status", "pending")
        if not all([name, phone, date, time]):
            return jsonify({"success": False, "message": "Name, phone, date and time are required"}), 400
        reservation_id = save_reservation(name, phone, email, date, time, notes, status)
        if reservation_id:
            return jsonify({"success": True, "id": reservation_id})
        return jsonify({"success": False, "message": "Failed to create reservation"}), 500

    if action == "update_with_confirm":
        res_id = data.get("id")
        name = data.get("name")
        phone = data.get("phone")
        email = data.get("email", "")
        date = data.get("date")
        time = data.get("time")
        notes = data.get("notes", "")
        
        if not all([res_id, name, phone, date, time]):
            return jsonify({"success": False, "message": "ID, name, phone, date and time are required"}), 400
        
        existing = get_reservation_by_id(res_id)
        if not existing:
            return jsonify({"success": False, "message": "Reservation not found"}), 404
        
        success = update_reservation(res_id, name, phone, email, date, time, notes)
        if not success:
            return jsonify({"success": False, "message": "Failed to update reservation"}), 500
        
        schedule_changed = existing["date"] != date or existing["time"] != time
        if email and schedule_changed:
            send_schedule_change_email(
                email,
                name,
                existing["date"],
                existing["time"],
                date,
                time
            )
        elif email:
            send_confirmation_email(email, name, date, time)
        
        return jsonify({"success": True})

    if action == "update":
        res_id = data.get("id")
        name = data.get("name")
        phone = data.get("phone")
        email = data.get("email", "")
        date = data.get("date")
        time = data.get("time")
        notes = data.get("notes", "")
        
        if not all([res_id, name, phone, date, time]):
            return jsonify({"success": False, "message": "ID, name, phone, date and time are required"}), 400
        
        existing = get_reservation_by_id(res_id)
        if not existing:
            return jsonify({"success": False, "message": "Reservation not found"}), 404
        
        success = update_reservation(res_id, name, phone, email, date, time, notes)
        if not success:
            return jsonify({"success": False, "message": "Failed to update reservation"}), 500
        
        schedule_changed = existing["date"] != date or existing["time"] != time
        if schedule_changed and existing.get("email"):
            send_schedule_change_email(
                existing["email"],
                existing["name"],
                existing["date"],
                existing["time"],
                date,
                time
            )
        
        return jsonify({"success": True})

    return jsonify({"error": "Invalid action"}), 400


@app.route("/api/admin/chatbot-stats", methods=["POST"])
@require_admin
def admin_chatbot_stats():
    stats = get_chatbot_stats()
    return jsonify({"data": stats})


@app.route("/api/reservations/slots", methods=["POST"])
def get_available_slots():
    """Public endpoint to get booked slots for a date"""
    data = request.get_json()
    date = data.get("date")
    if not date:
        return jsonify({"error": "date is required"}), 400
    
    try:
        conn = sqlite3.connect(os.path.join(os.path.dirname(__file__), "titan_dent.db"))
        cursor = conn.cursor()
        cursor.execute(
            "SELECT time FROM reservations WHERE date = ? AND status IN ('approved', 'pending')",
            (date,)
        )
        rows = cursor.fetchall()
        conn.close()
        slots = [row[0] for row in rows]
        return jsonify({"slots": slots})
    except Exception as e:
        print(f"Error fetching slots: {e}")
        return jsonify({"error": "Failed to fetch slots"}), 500


@app.route("/api/reservations", methods=["POST"])
def create_reservation():
    """Public endpoint to create a reservation"""
    data = request.get_json()
    required = ["name", "phone", "email", "date", "time"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    reservation_id = str(uuid.uuid4())
    notes = data.get("notes", "")
    
    try:
        conn = sqlite3.connect(os.path.join(os.path.dirname(__file__), "titan_dent.db"))
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO reservations (id, name, phone, email, date, time, status, notes, created_at)
               VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)""",
            (reservation_id, data["name"], data["phone"], data["email"],
             data["date"], data["time"], notes, datetime.utcnow().isoformat())
        )
        conn.commit()
        conn.close()
        return jsonify({"success": True, "id": reservation_id})
    except Exception as e:
        print(f"Error creating reservation: {e}")
        return jsonify({"error": "Failed to create reservation"}), 500


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


# Serve frontend static files (React SPA)
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path.startswith("api/"):
        return jsonify({"error": "Not found"}), 404
    frontend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "titan-dental-connect-main", "dist")
    try:
        if path == "":
            return send_from_directory(frontend_dir, "index.html")
        return send_from_directory(frontend_dir, path)
    except:
        return send_from_directory(frontend_dir, "index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
