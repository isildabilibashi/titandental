# Supabase Integration Setup Guide

## Overview
Your Python backend is now configured to use Supabase as the database for your Titan Dental admin panel.

## What's Been Done
1. ✅ Added Supabase dependencies to `requirements.txt`
2. ✅ Created `supabase_client.py` for Supabase connection management
3. ✅ Updated `database.py` to use Supabase instead of SQLite
4. ✅ Created migration file for admin panel tables
5. ✅ Created `.env.example` template

## Setup Steps

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Apply Supabase Migrations
Run the migration in your Supabase dashboard or using the CLI:

```bash
# If using supabase CLI
supabase migration up
```

Or manually execute the SQL from `supabase/migrations/20260417000000_admin_panel_setup.sql` in your Supabase SQL editor.

### 3. Create `.env` File
Copy `.env.example` to `.env` and update with your actual credentials:

```bash
cp .env.example .env
```

**Important**: 
- Keep your `SUPABASE_SERVICE_ROLE_KEY` secure
- Never commit `.env` to version control
- Use environment variables in production

### 4. Tables Created

#### `admin_2fa_codes`
- `id`: Auto-incremented primary key
- `code`: 6-digit verification code
- `created_at`: Timestamp of creation
- `expires_at`: When code expires
- `used`: Boolean flag for whether code was used

#### `admin_sessions`
- `id`: Auto-incremented primary key
- `token`: Unique session token
- `created_at`: Session creation time
- `expires_at`: Session expiration time

#### Existing Tables (Already in Supabase)
- `chat_sessions`: Store user chat sessions
- `chat_messages`: Store chat messages with role and text

## Features
- ✅ 2FA (Two-Factor Authentication) for admin login
- ✅ Admin session management with token-based auth
- ✅ Chat history storage
- ✅ Error handling for all database operations
- ✅ Automatic timestamps for audit trails

## Running the Server
```bash
python app.py
```

The backend will now:
1. Use Supabase for all data storage
2. Support admin panel authentication with 2FA
3. Store chat sessions and messages in Supabase
4. Send verification codes via email for 2FA

## API Endpoints Available
- `POST /chat`: Send a chat message
- `GET /chat/<session_id>`: Get chat history
- `GET /admin/sessions`: Get all chat sessions (requires auth)
- `DELETE /admin/sessions/<session_id>`: Delete a session (requires auth)
- `POST /admin/login`: Admin login with credentials
- `POST /admin/verify-2fa`: Verify 2FA code
- `POST /admin/logout`: Admin logout

## Security Notes
1. All admin operations require valid session tokens
2. 2FA codes expire after 10 minutes
3. Admin sessions expire after 15 minutes
4. Use HTTPS in production
5. Store sensitive credentials in environment variables only

## Troubleshooting

### Connection Issues
If you get connection errors:
1. Verify Supabase URL and keys are correct in `.env`
2. Check your internet connection
3. Ensure Supabase project is active

### Migration Not Applied
If tables don't exist:
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the SQL from the migration file
3. Click "Run" button

### 2FA Code Not Working
- Check if code matches exactly (case-sensitive)
- Verify code hasn't expired (10 minute TTL)
- Ensure code hasn't been used already

## Next Steps
1. Test the admin login flow in your frontend
2. Verify 2FA codes are received via email
3. Test session management
4. Monitor Supabase dashboard for data

---
For more help, check Supabase documentation: https://supabase.com/docs
