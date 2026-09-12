-- ==============================================================================
-- CÉLLERI × OLONESA CRM — RESET LIMPIO Y RECONSTRUCCIÓN TOTAL
-- ==============================================================================

-- 1. ELIMINAR TABLAS PREVIAS EN CONFLICTO (LIMPIEZA TOTAL)
DROP TABLE IF EXISTS public.capi_events_log CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.pipeline_stages CASCADE;
DROP TABLE IF EXISTS public.vendors CASCADE;

-- 2. TABLA DE VENDEDORES (Vendors & Admins)
CREATE TABLE public.vendors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  phone       TEXT,
  role        TEXT NOT NULL DEFAULT 'vendor', -- 'admin' | 'vendor'
  avatar_url  TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Pre-cargar los 2 vendedores del equipo
INSERT INTO public.vendors (id, full_name, email, phone, role)
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Karina Célleri', 'karina@celleri.com', '+593998765432', 'admin'),
  ('c2222222-2222-2222-2222-222222222222', 'Roberto Mendoza', 'roberto@celleri.com', '+593987654321', 'vendor');

-- 3. ETAPAS DEL PIPELINE & MAPEO CAPI
CREATE TABLE public.pipeline_stages (
  id            TEXT PRIMARY KEY,
  label         TEXT NOT NULL,
  meta_event    TEXT,
  tiktok_event  TEXT,
  color         TEXT NOT NULL,
  accent_hex    TEXT NOT NULL,
  sort_order    INT NOT NULL,
  is_terminal   BOOLEAN DEFAULT false
);

INSERT INTO public.pipeline_stages (id, label, meta_event, tiktok_event, color, accent_hex, sort_order, is_terminal)
VALUES
  ('new_lead',    'Lead Nuevo',        'Lead',              'SubmitForm',            'blue',    '#3b82f6', 1, false),
  ('contacted',   'Contactado',        'Contact',           'Contact',               'sky',     '#0ea5e9', 2, false),
  ('qualified',   'Calificado',        'QualifiedLead',     'CompleteRegistration',   'emerald', '#10b981', 3, false),
  ('visit',       'Visita Agendada',   'Schedule',          'Subscribe',             'violet',  '#8b5cf6', 4, false),
  ('proposal',    'Propuesta Enviada', 'SubmitApplication', 'InitiateCheckout',      'amber',   '#f59e0b', 5, false),
  ('negotiation', 'Negociación',       'InitiateCheckout',  'AddToCart',             'orange',  '#f97316', 6, false),
  ('won',         'Venta Cerrada',     'Purchase',          'Purchase',              'green',   '#34d399', 7, true),
  ('lost',        'Perdido',           NULL,                NULL,                    'rose',    '#f43f5e', 8, true);

-- 4. TABLA PRINCIPAL DE LEADS
CREATE TABLE public.leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_lead_id    BIGINT,
  tiktok_lead_id  TEXT,
  source          TEXT NOT NULL DEFAULT 'meta',
  
  -- Atribución publicitaria
  campaign_name   TEXT,
  campaign_id     TEXT,
  adset_name      TEXT,
  ad_name         TEXT,
  form_name       TEXT,
  
  -- Datos de contacto
  full_name       TEXT NOT NULL,
  first_name      TEXT,
  last_name       TEXT,
  email           TEXT,
  phone           TEXT,
  city            TEXT,
  
  -- Pipeline & Asignación
  stage           TEXT NOT NULL REFERENCES public.pipeline_stages(id) DEFAULT 'new_lead',
  assigned_to     UUID REFERENCES public.vendors(id),
  
  -- Datos comerciales Olonesa
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

-- Índices de velocidad
CREATE INDEX idx_leads_stage ON public.leads(stage);
CREATE INDEX idx_leads_assigned ON public.leads(assigned_to);
CREATE INDEX idx_leads_meta_lead_id ON public.leads(meta_lead_id);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);

-- 5. AUDITORÍA DE CONVERSIONS API (CAPI)
CREATE TABLE public.capi_events_log (
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

CREATE INDEX idx_capi_lead_id ON public.capi_events_log(lead_id);
CREATE INDEX idx_capi_sent_at ON public.capi_events_log(sent_at DESC);

-- 6. SEGURIDAD ROW LEVEL SECURITY (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capi_events_log ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura y escritura
CREATE POLICY "Permitir lectura general de vendors" ON public.vendors
  FOR SELECT USING (true);

CREATE POLICY "Lectura de leads para autenticados o service_role" ON public.leads
  FOR SELECT USING (true);

CREATE POLICY "Actualizacion de leads para autenticados o service_role" ON public.leads
  FOR ALL USING (true);

CREATE POLICY "Gestion de logs de CAPI" ON public.capi_events_log
  FOR ALL USING (true);

-- 7. HABILITAR TIEMPO REAL (Supabase Realtime)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'leads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'capi_events_log'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.capi_events_log;
  END IF;
END $$;
