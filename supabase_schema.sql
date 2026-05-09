-- ════════════════════════════════════════════════
-- BBMh Business Hub — Complete Database Schema
-- Run this ENTIRE block in Supabase SQL Editor
-- New project: bbmh-business-hub
-- ════════════════════════════════════════════════

-- 1. CLIENTS TABLE
CREATE TABLE IF NOT EXISTS clients (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name           TEXT NOT NULL,
  company        TEXT,
  email          TEXT,
  phone          TEXT,
  whatsapp       TEXT,
  city           TEXT,
  industry       TEXT,
  status         TEXT DEFAULT 'active', -- active, inactive, prospect, churned
  source         TEXT,              -- referral, instagram, cold outreach, etc
  avatar_url     TEXT,
  notes          TEXT,
  monthly_retainer NUMERIC(10,2) DEFAULT 0,
  total_billed   NUMERIC(10,2) DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id      UUID REFERENCES clients(id) ON DELETE SET NULL,
  title          TEXT NOT NULL,
  description    TEXT,
  type           TEXT,              -- branding, web design, video, marketing, other
  status         TEXT DEFAULT 'active', -- active, paused, complete, cancelled
  stage          TEXT DEFAULT 'discovery', -- discovery, proposal, active, revision, delivered, invoiced
  value          NUMERIC(10,2) DEFAULT 0,
  paid           NUMERIC(10,2) DEFAULT 0,
  start_date     DATE,
  end_date       DATE,
  deadline       DATE,
  notes          TEXT,
  priority       TEXT DEFAULT 'medium', -- low, medium, high, urgent
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- 3. LEADS / PIPELINE TABLE
CREATE TABLE IF NOT EXISTS leads (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name           TEXT NOT NULL,
  company        TEXT,
  email          TEXT,
  phone          TEXT,
  stage          TEXT DEFAULT 'new', -- new, contacted, proposal_sent, negotiating, won, lost
  source         TEXT,
  estimated_value NUMERIC(10,2) DEFAULT 0,
  service_interest TEXT,
  follow_up_date DATE,
  notes          TEXT,
  converted      BOOLEAN DEFAULT false,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- 4. INVOICES TABLE
CREATE TABLE IF NOT EXISTS invoices (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT UNIQUE,
  client_id      UUID REFERENCES clients(id) ON DELETE SET NULL,
  project_id     UUID REFERENCES projects(id) ON DELETE SET NULL,
  amount         NUMERIC(10,2) NOT NULL,
  tax            NUMERIC(10,2) DEFAULT 0,
  total          NUMERIC(10,2) NOT NULL,
  status         TEXT DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled
  issue_date     DATE DEFAULT CURRENT_DATE,
  due_date       DATE,
  paid_date      DATE,
  payment_method TEXT,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- 5. TRANSACTIONS TABLE (income + expenses)
CREATE TABLE IF NOT EXISTS transactions (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type           TEXT NOT NULL, -- income, expense
  amount         NUMERIC(10,2) NOT NULL,
  category       TEXT,
  description    TEXT NOT NULL,
  date           DATE DEFAULT CURRENT_DATE,
  client_id      UUID REFERENCES clients(id) ON DELETE SET NULL,
  project_id     UUID REFERENCES projects(id) ON DELETE SET NULL,
  invoice_id     UUID REFERENCES invoices(id) ON DELETE SET NULL,
  payment_method TEXT,
  receipt_url    TEXT,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- 6. PEOPLE / TEAM TABLE
CREATE TABLE IF NOT EXISTS people (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name           TEXT NOT NULL,
  role           TEXT,
  department     TEXT,
  email          TEXT,
  phone          TEXT,
  whatsapp       TEXT,
  type           TEXT DEFAULT 'team', -- team, freelancer, vendor, partner
  status         TEXT DEFAULT 'active',
  daily_rate     NUMERIC(10,2),
  avatar_url     TEXT,
  notes          TEXT,
  joined_at      DATE,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- 7. CREDENTIALS VAULT TABLE
CREATE TABLE IF NOT EXISTS credentials (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform       TEXT NOT NULL,
  label          TEXT,
  username       TEXT,
  password_hint  TEXT,     -- store hint or masked version, never plaintext
  url            TEXT,
  category       TEXT,     -- client, tool, social, hosting, other
  client_id      UUID REFERENCES clients(id) ON DELETE SET NULL,
  notes          TEXT,
  last_updated   DATE DEFAULT CURRENT_DATE,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- 8. TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title          TEXT NOT NULL,
  description    TEXT,
  status         TEXT DEFAULT 'todo', -- todo, in_progress, done
  priority       TEXT DEFAULT 'medium',
  due_date       DATE,
  client_id      UUID REFERENCES clients(id) ON DELETE SET NULL,
  project_id     UUID REFERENCES projects(id) ON DELETE SET NULL,
  assignee_id    UUID REFERENCES people(id) ON DELETE SET NULL,
  completed_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- 9. BUSINESS PROFILE TABLE (single row)
CREATE TABLE IF NOT EXISTS business_profile (
  id             TEXT PRIMARY KEY DEFAULT 'bbmh_main',
  business_name  TEXT DEFAULT 'BeanBag Media House',
  email          TEXT,
  phone          TEXT,
  address        TEXT,
  city           TEXT,
  gst_number     TEXT,
  pan_number     TEXT,
  bank_name      TEXT,
  bank_account   TEXT,
  bank_ifsc      TEXT,
  logo_url       TEXT,
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- Insert default business profile row:
INSERT INTO business_profile (id) VALUES ('bbmh_main') ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════════
-- DISABLE RLS ON ALL TABLES (single-team app)
-- ════════════════════════════════════════════════
ALTER TABLE clients          DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects         DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads            DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices         DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions     DISABLE ROW LEVEL SECURITY;
ALTER TABLE people           DISABLE ROW LEVEL SECURITY;
ALTER TABLE credentials      DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks            DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_profile DISABLE ROW LEVEL SECURITY;

-- ════════════════════════════════════════════════
-- STORAGE SETUP
-- Run these in SQL Editor to allow anon access to 'assets' bucket
-- ════════════════════════════════════════════════
-- First, manually create a bucket named 'assets' in the Supabase Dashboard
-- and toggle "Public" to ON.

-- Allow public access to the assets bucket
CREATE POLICY "allow reads" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'assets');
CREATE POLICY "allow uploads" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'assets');
CREATE POLICY "allow updates" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'assets');
CREATE POLICY "allow deletes" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'assets');
