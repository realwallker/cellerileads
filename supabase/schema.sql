-- ==============================================================================
-- CÉLLERI × OLONESA CRM — SUPABASE POSTGRESQL SCHEMA & RLS
-- Meta Conversions API (CAPI) + TikTok Events API Integration
-- ==============================================================================

-- 1. Vendors table (Sellers & Admins)
CREATE TABLE IF NOT EXISTS public.vendors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  phone       TEXT,
  role        TEXT NOT NULL DEFAULT 'vendor', -- 'admin' | 'vendor'
  avatar_url  TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. Pipeline stages configuration
CREATE TABLE IF NOT EXISTS public.pipeline_stages (
  id            TEXT PRIMARY KEY,
  label         TEXT NOT NULL,
  meta_event    TEXT,
  tiktok_event  TEXT,
  color         TEXT NOT NULL,
  accent_hex    TEXT NOT NULL,
  sort_order    INT NOT NULL,
  is_terminal   BOOLEAN DEFAULT false
);

-- Seed pipeline stages
INSERT INTO public.pipeline_stages (id, label, meta_event, tiktok_event, color, accent_hex, sort_order, is_terminal)
VALUES
  ('new_lead',    'Lead Nuevo',        'Lead',              'SubmitForm',            'blue',    '#3b82f6', 1, false),
  ('contacted',   'Contactado',        'Contact',           'Contact',               'sky',     '#0ea5e9', 2, false),
  ('qualified',   'Calificado',        'QualifiedLead',     'CompleteRegistration',   'emerald', '#10b981', 3, false),
  ('visit',       'Visita Agendada',   'Schedule',          'Subscribe',             'violet',  '#8b5cf6', 4, false),
  ('proposal',    'Propuesta Enviada', 'SubmitApplication', 'InitiateCheckout',      'amber',   '#f59e0b', 5, false),
  ('negotiation', 'Negociación',       'InitiateCheckout',  'AddToCart',             'orange',  '#f97316', 6, false),
  ('won',         'Venta Cerrada',     'Purchase',          'Purchase',              'green',   '#34d399', 7, true),
  ('lost',        'Perdido',           NULL,                NULL,                    'rose',    '#f43f5e', 8, true)
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  meta_event = EXCLUDED.meta_event,
  tiktok_event = EXCLUDED.tiktok_event;

-- 3. Leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_lead_id    BIGINT,
  tiktok_lead_id  TEXT,
  source          TEXT NOT NULL DEFAULT 'meta',
  
  -- Ad Attribution
  campaign_name   TEXT,
  campaign_id     TEXT,
  adset_name      TEXT,
  ad_name         TEXT,
  form_name       TEXT,
  
  -- PII Contact Info (Normalized)
  full_name       TEXT NOT NULL,
  first_name      TEXT,
  last_name       TEXT,
  email           TEXT,
  phone           TEXT,
  city            TEXT,
  
  -- Pipeline & Assignment
  stage           TEXT NOT NULL REFERENCES public.pipeline_stages(id) DEFAULT 'new_lead',
  assigned_to     UUID REFERENCES public.vendors(id),
  
  -- Qualification & Real Estate Data
  lot_interest    TEXT,
  budget_range    TEXT,
  notes           TEXT,
  deal_value      NUMERIC(14,2) DEFAULT 0,
  currency        TEXT DEFAULT 'USD',
  
  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  stage_updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for high-frequency queries
CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_meta_lead_id ON public.leads(meta_lead_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- 4. Conversions API Audit Log
CREATE TABLE IF NOT EXISTS public.capi_events_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  platform        TEXT NOT NULL DEFAULT 'meta',
  event_name      TEXT NOT NULL,
  event_id        TEXT NOT NULL,
  action_source   TEXT NOT NULL DEFAULT 'system_generated',
  status          TEXT NOT NULL DEFAULT 'sent',
  status_code     INT,
  fbtrace_id      TEXT,
  payload         JSONB NOT NULL,
  response_message TEXT,
  sent_at         TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_capi_lead_id ON public.capi_events_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_capi_sent_at ON public.capi_events_log(sent_at DESC);

-- 5. Row Level Security (RLS) Setup
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capi_events_log ENABLE ROW LEVEL SECURITY;

-- Allow read of vendors for authenticated or service role
CREATE POLICY "Allow read vendors" ON public.vendors
  FOR SELECT USING (true);

-- Allow admins full access, vendors only their assigned leads
CREATE POLICY "Vendors view assigned leads" ON public.leads
  FOR SELECT
  USING (
    auth.uid() IS NULL -- Fallback for service role / API key
    OR assigned_to = auth.uid()
    OR EXISTS (SELECT 1 FROM public.vendors WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Vendors update assigned leads" ON public.leads
  FOR UPDATE
  USING (
    auth.uid() IS NULL
    OR assigned_to = auth.uid()
    OR EXISTS (SELECT 1 FROM public.vendors WHERE id = auth.uid() AND role = 'admin')
  );

-- 6. Enable Realtime Replication
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.capi_events_log;
