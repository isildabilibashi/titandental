-- Admin 2FA Codes Table
CREATE TABLE IF NOT EXISTS admin_2fa_codes (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE
);

-- Admin Sessions Table
CREATE TABLE IF NOT EXISTS admin_sessions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX idx_admin_2fa_codes_code ON admin_2fa_codes(code);
CREATE INDEX idx_admin_2fa_codes_expires_at ON admin_2fa_codes(expires_at);
CREATE INDEX idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX idx_admin_sessions_expires_at ON admin_sessions(expires_at);
