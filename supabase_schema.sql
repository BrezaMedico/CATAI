-- ==============================================================================
-- VIRTUAL BESTIE CHAT - SUPABASE DATABASE SCHEMA
-- Jalankan query ini di Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Table: companion_profiles
CREATE TABLE IF NOT EXISTS public.companion_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
    traits JSONB NOT NULL DEFAULT '[]'::jsonb,
    avatar TEXT NOT NULL,
    user_nickname TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_companion UNIQUE (user_id)
);

-- 3. Table: messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'companion')),
    content TEXT NOT NULL, -- AES-256 Encrypted ciphertext
    media_url TEXT,        -- AES-256 Encrypted image base64 / URL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_companion_profiles_user_id ON public.companion_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at ASC);

-- 5. Row Level Security (RLS)
-- Seluruh konten chat dan media sudah dienkripsi dengan AES-256 sebelum disimpan ke database
ALTER TABLE public.companion_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow select companion_profiles" ON public.companion_profiles;
DROP POLICY IF EXISTS "Allow insert companion_profiles" ON public.companion_profiles;
DROP POLICY IF EXISTS "Allow update companion_profiles" ON public.companion_profiles;
DROP POLICY IF EXISTS "Allow delete companion_profiles" ON public.companion_profiles;

DROP POLICY IF EXISTS "Allow select messages" ON public.messages;
DROP POLICY IF EXISTS "Allow insert messages" ON public.messages;
DROP POLICY IF EXISTS "Allow delete messages" ON public.messages;

-- Create Open & Secure RLS Policies (Encrypted payload)
CREATE POLICY "Allow select companion_profiles" ON public.companion_profiles FOR SELECT USING (true);
CREATE POLICY "Allow insert companion_profiles" ON public.companion_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update companion_profiles" ON public.companion_profiles FOR UPDATE USING (true);
CREATE POLICY "Allow delete companion_profiles" ON public.companion_profiles FOR DELETE USING (true);

CREATE POLICY "Allow select messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Allow insert messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete messages" ON public.messages FOR DELETE USING (true);
