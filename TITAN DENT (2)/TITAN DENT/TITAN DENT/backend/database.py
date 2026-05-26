import sqlite3
import os
from datetime import datetime
from typing import Optional, List, Dict, Any

DATABASE_PATH = os.path.join(os.path.dirname(__file__), "titan_dent.db")


def get_connection():
    """Get a database connection with row factory"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize all tables"""
    conn = get_connection()
    cursor = conn.cursor()

    # Chat sessions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_sessions (
            session_id TEXT PRIMARY KEY,
            created_at TEXT NOT NULL
        )
    """)

    # Chat messages table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            text TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id) ON DELETE CASCADE
        )
    """)

    # Admin 2FA codes table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS admin_2fa_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            used INTEGER DEFAULT 0,
            created_at TEXT NOT NULL
        )
    """)

    # Admin sessions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS admin_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            token TEXT NOT NULL UNIQUE,
            expires_at TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    # Reservations table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reservations (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            notes TEXT,
            created_at TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()
    print("Database initialized successfully")


# ========== CHAT FUNCTIONS ==========

def create_session(session_id: str):
    """Create a new chat session"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT OR IGNORE INTO chat_sessions (session_id, created_at) VALUES (?, ?)",
            (session_id, datetime.utcnow().isoformat())
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error creating session: {e}")


def save_message(session_id: str, role: str, text: str):
    """Save a chat message"""
    try:
        create_session(session_id)
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO chat_messages (session_id, role, text, created_at) VALUES (?, ?, ?, ?)",
            (session_id, role, text, datetime.utcnow().isoformat())
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error saving message: {e}")


def get_chat_history(session_id: str):
    """Get chat history for a session"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT role, text, created_at FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC",
            (session_id,)
        )
        rows = cursor.fetchall()
        conn.close()
        return [{"role": row["role"], "text": row["text"], "created_at": row["created_at"]} for row in rows]
    except Exception as e:
        print(f"Error getting chat history: {e}")
        return []


def get_all_sessions():
    """Get all chat sessions with message counts"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT session_id, created_at FROM chat_sessions ORDER BY created_at DESC")
        sessions = cursor.fetchall()

        result = []
        for session in sessions:
            cursor.execute(
                "SELECT COUNT(*) as count FROM chat_messages WHERE session_id = ?",
                (session["session_id"],)
            )
            count = cursor.fetchone()["count"]
            result.append({
                "session_id": session["session_id"],
                "created_at": session["created_at"],
                "message_count": count
            })
        conn.close()
        return result
    except Exception as e:
        print(f"Error getting all sessions: {e}")
        return []


def delete_session(session_id: str):
    """Delete a chat session and its messages"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM chat_messages WHERE session_id = ?", (session_id,))
        cursor.execute("DELETE FROM chat_sessions WHERE session_id = ?", (session_id,))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error deleting session: {e}")


# ========== ADMIN 2FA FUNCTIONS ==========

def save_2fa_code(code: str, expires_at: str):
    """Save a 2FA code"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO admin_2fa_codes (code, expires_at, used, created_at) VALUES (?, ?, 0, ?)",
            (code, expires_at, datetime.utcnow().isoformat())
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error saving 2FA code: {e}")


def verify_2fa_code(code: str):
    """Verify a 2FA code"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        now = datetime.utcnow().isoformat()
        cursor.execute(
            "SELECT id FROM admin_2fa_codes WHERE code = ? AND used = 0 AND expires_at >= ? ORDER BY created_at DESC LIMIT 1",
            (code, now)
        )
        row = cursor.fetchone()
        if row:
            cursor.execute("UPDATE admin_2fa_codes SET used = 1 WHERE id = ?", (row["id"],))
            conn.commit()
            conn.close()
            return True
        conn.close()
        return False
    except Exception as e:
        print(f"Error verifying 2FA code: {e}")
        return False


def verify_2fa_code_only(code: str):
    """Verify a 2FA code WITHOUT marking it as used"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        now = datetime.utcnow().isoformat()
        cursor.execute(
            "SELECT id FROM admin_2fa_codes WHERE code = ? AND expires_at >= ? ORDER BY created_at DESC LIMIT 1",
            (code, now)
        )
        row = cursor.fetchone()
        conn.close()
        return row is not None
    except Exception as e:
        print(f"Error verifying 2FA code: {e}")
        return False


# ========== ADMIN SESSION FUNCTIONS ==========

def create_admin_session(token: str, expires_at: str):
    """Create an admin session"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO admin_sessions (token, expires_at, created_at) VALUES (?, ?, ?)",
            (token, expires_at, datetime.utcnow().isoformat())
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error creating admin session: {e}")


def validate_admin_session(token: str):
    """Validate an admin session token"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        now = datetime.utcnow().isoformat()
        cursor.execute(
            "SELECT 1 FROM admin_sessions WHERE token = ? AND expires_at >= ?",
            (token, now)
        )
        valid = cursor.fetchone() is not None
        conn.close()
        return valid
    except Exception as e:
        print(f"Error validating admin session: {e}")
        return False


def refresh_admin_session(token: str, new_expires_at: str):
    """Refresh an admin session"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        now = datetime.utcnow().isoformat()
        cursor.execute(
            "UPDATE admin_sessions SET expires_at = ? WHERE token = ? AND expires_at >= ?",
            (new_expires_at, token, now)
        )
        updated = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return updated
    except Exception as e:
        print(f"Error refreshing admin session: {e}")
        return False


def delete_admin_session(token: str):
    """Delete an admin session"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM admin_sessions WHERE token = ?", (token,))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error deleting admin session: {e}")


# ========== RESERVATION FUNCTIONS ==========

def get_reservations(date: Optional[str] = None):
    """Get all reservations, optionally filtered by date"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        if date:
            cursor.execute(
                "SELECT * FROM reservations WHERE date = ? ORDER BY created_at DESC",
                (date,)
            )
        else:
            cursor.execute("SELECT * FROM reservations ORDER BY created_at DESC")
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    except Exception as e:
        print(f"Error getting reservations: {e}")
        return []


def update_reservation_status(res_id: str, status: str):
    """Update reservation status"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE reservations SET status = ? WHERE id = ?",
            (status, res_id)
        )
        success = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return success
    except Exception as e:
        print(f"Error updating reservation: {e}")
        return False


def delete_reservation(res_id: str):
    """Delete a reservation"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM reservations WHERE id = ?", (res_id,))
        success = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return success
    except Exception as e:
        print(f"Error deleting reservation: {e}")
        return False


def get_reservation_stats():
    """Get reservation statistics"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT status, COUNT(*) as count FROM reservations GROUP BY status")
        rows = cursor.fetchall()
        conn.close()

        stats = {"total": 0, "pending": 0, "approved": 0, "rejected": 0}
        for row in rows:
            stats["total"] += row["count"]
            if row["status"] == "pending":
                stats["pending"] = row["count"]
            elif row["status"] == "approved":
                stats["approved"] = row["count"]
            elif row["status"] == "rejected":
                stats["rejected"] = row["count"]
        return stats
    except Exception as e:
        print(f"Error getting stats: {e}")
        return {"total": 0, "pending": 0, "approved": 0, "rejected": 0}


def get_reservation_by_id(res_id: str):
    """Get a single reservation by ID"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM reservations WHERE id = ?", (res_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None
    except Exception as e:
        print(f"Error getting reservation: {e}")
        return None


def update_reservation(res_id: str, name: str, phone: str, email: str, date: str, time: str, notes: str):
    """Update an existing reservation"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE reservations SET name = ?, phone = ?, email = ?, date = ?, time = ?, notes = ? WHERE id = ?",
            (name, phone, email, date, time, notes, res_id)
        )
        success = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return success
    except Exception as e:
        print(f"Error updating reservation: {e}")
        return False


def save_reservation(name: str, phone: str, email: str, date: str, time: str, notes: str = "", status: str = "pending"):
    """Create a new reservation from admin"""
    import uuid
    try:
        conn = get_connection()
        cursor = conn.cursor()
        reservation_id = str(uuid.uuid4())
        cursor.execute(
            """INSERT INTO reservations (id, name, phone, email, date, time, status, notes, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (reservation_id, name, phone, email, date, time, status, notes, datetime.utcnow().isoformat())
        )
        conn.commit()
        conn.close()
        return reservation_id
    except Exception as e:
        print(f"Error saving reservation: {e}")
        return None


def get_chatbot_stats():
    """Get chatbot statistics"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(DISTINCT session_id) as total_sessions FROM chat_sessions")
        total_sessions = cursor.fetchone()["total_sessions"]
        
        cursor.execute("SELECT COUNT(*) as total_messages FROM chat_messages")
        total_messages = cursor.fetchone()["total_messages"]
        
        avg_messages = round(total_messages / total_sessions, 1) if total_sessions > 0 else 0
        
        conn.close()
        return {
            "totalChats": total_sessions,
            "avgMessages": avg_messages,
            "satisfaction": 85
        }
    except Exception as e:
        print(f"Error getting chatbot stats: {e}")
        return {"totalChats": 0, "avgMessages": 0, "satisfaction": 0}


# Initialize on import
init_db()
