# CÉLLERI LEADS CRM — Meta Conversions API (CAPI) & TikTok Lead Management

Sistema de gestión comercial y atribución publicitaria de alta precisión para **Célleri Real Estate × Olonesa Reserva Village**. 

Diseñado específicamente para campañas de **Meta Ads (Instagram y Facebook Instant Forms)** y preparado para **TikTok Lead Ads (Events API v1.3)**.

---

## 💎 Características Principales

1. **Atribución Determinística con Meta Conversions API (CAPI)**:
   - Envío de eventos en tiempo real al **Dataset ID `3352860518219838`**.
   - Matching del 100% con `lead_id` de Meta Lead Ads + fallback multicanal con hashes **SHA-256** de email, teléfono y nombre.
   - Disparo automático de eventos estándar por cambio de etapa en el funnel:
     - 🔵 **Lead Nuevo** ➔ `Lead`
     - 📞 **Contactado** ➔ `Contact`
     - ✅ **Calificado** ➔ `QualifiedLead`
     - 📅 **Visita Agendada** ➔ `Schedule`
     - 📋 **Propuesta Enviada** ➔ `SubmitApplication`
     - 🤝 **Negociación** ➔ `InitiateCheckout`
     - 🏆 **Venta Cerrada** ➔ `Purchase` (con valor en USD para optimización de valor VBO)
   - Trazabilidad y auditoría completa con `fbtrace_id` y payload inspector.

2. **Pipeline Kanban Interactivo**:
   - Drag-and-drop suave construido con `@dnd-kit`.
   - Contacto rápido con un clic: enlace directo a WhatsApp con plantilla de saludo personalizado y llamada telefónica.
   - Filtro por vendedor asignado (Karina Célleri / Roberto Mendoza).
   - Animación de confeti al cerrar ventas.

3. **Notificaciones Automáticas vía Telegram**:
   - Alertas instantáneas al equipo comercial cuando entra un lead de Meta Ads.
   - Avisos en tiempo real cuando un vendedor avanza un lead de etapa.
   - Celebración grupal con monto cerrado al confirmar una venta.

4. **Webhook Ingestion Engine**:
   - Receptor para webhooks de Meta Graph API (`/api/webhooks/meta`).
   - Reparto equitativo (round-robin) automático entre los 2 vendedores.

5. **Base de Datos Supabase (PostgreSQL + RLS)**:
   - Esquema listo en `supabase/schema.sql` con Row Level Security para aislar datos.
   - Suscripción en tiempo real (`supabase_realtime`).

---

## 🚀 Despliegue Rápido en Vercel

1. Sube este repositorio a GitHub con el nombre `cellerileads`.
2. Entra a [Vercel](https://vercel.com) y selecciona **Import Git Repository**.
3. Selecciona el repositorio `cellerileads`.
4. En la sección **Environment Variables**, agrega las variables de tu archivo `.env.local` (ver plantilla en `.env.example`).
5. Haz clic en **Deploy**. ¡Tu CRM estará en vivo con URL SSL gratuita en menos de 2 minutos!

---

## ⚙️ Configuración Paso a Paso

### 1. Base de Datos en Supabase (Gratis)
1. Crea un proyecto en [Supabase](https://supabase.com).
2. Ve al **SQL Editor** y pega el contenido de `supabase/schema.sql`.
3. Haz clic en **Run**. Esto creará todas las tablas, índices, etapas del pipeline y políticas de seguridad RLS.
4. En **Project Settings > API**, copia la `URL`, `anon key` y `service_role key`.

### 2. Token de Meta Conversions API
1. Entra a [Meta Business Manager](https://business.facebook.com/).
2. Ve a **Configuración del Negocio > Usuarios del Sistema**.
3. Crea un usuario del sistema (ej. `CAPI-CRM-Olonesa`) con rol de empleado o administrador.
4. Asígnale activos: tu página de Facebook y el **Dataset `3352860518219838`** con control total.
5. Genera un nuevo token con los permisos:
   - `ads_management`
   - `leads_retrieval`
6. Copia el token generado y colócalo en `META_ACCESS_TOKEN`.

### 3. Webhook de Meta Instant Forms
1. Entra a [Meta for Developers](https://developers.facebook.com/).
2. En tu app, ve a **Webhooks > Page**.
3. Configura la URL de Callback:
   ```
   https://tu-crm.vercel.app/api/webhooks/meta
   ```
4. Token de verificación: El mismo valor configurado en `META_WEBHOOK_VERIFY_TOKEN` (por defecto: `celleri_secret_token_2026`).
5. Suscríbete al campo `leadgen`.

### 4. Bot de Telegram para Alertas
1. En Telegram, busca a `@BotFather` y envía `/newbot`.
2. Sigue las instrucciones para asignarle nombre y usuario (ej. `CelleriLeadsBot`).
3. Copia el **HTTP API Token** y colócalo en `TELEGRAM_BOT_TOKEN`.
4. Crea un grupo en Telegram con tus 2 vendedores y agrega a tu bot.
5. Obtén el ID del grupo (puedes agregar temporalmente a `@userinfobot` o reenviar un mensaje al bot) y colócalo en `TELEGRAM_CHAT_ID`.

---

## 🛠️ Desarrollo en Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Abrir en el navegador
http://localhost:3000
```

---

## 📐 Estructura del Código

```
cellerileads/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── webhooks/meta/route.ts   # Ingestión de Meta Instant Forms
│   │   │   ├── capi/trigger/route.ts    # Envío de eventos a Meta CAPI
│   │   │   └── test-capi/route.ts       # Tester con test_event_code
│   │   ├── globals.css                  # Tokens visuales Célleri Luxury
│   │   ├── layout.tsx
│   │   └── page.tsx                     # Dashboard principal
│   ├── components/
│   │   ├── Header.tsx                   # Cabecera, estados y selectores
│   │   ├── StatsBar.tsx                 # KPIs de conversión y volumen
│   │   ├── KanbanBoard.tsx              # Drag & drop de etapas (@dnd-kit)
│   │   ├── LeadDetailModal.tsx          # Ficha del lead y plantillas WhatsApp
│   │   ├── NewLeadModal.tsx             # Registro manual de prospectos
│   │   ├── TestCapiModal.tsx            # Test en vivo contra Events Manager
│   │   └── CapiLogsModal.tsx            # Auditoría de payloads y hashes
│   └── lib/
│       ├── constants.ts                 # 8 etapas y vendedores iniciales
│       ├── types.ts                     # Interfaces TypeScript
│       ├── meta/capi.ts                 # Motor CAPI con hashing SHA-256
│       ├── telegram/notify.ts           # Notificaciones formateadas
│       └── supabase/client.ts           # Cliente Supabase
└── supabase/
    └── schema.sql                       # Esquema PostgreSQL + RLS
```

---
*Diseñado bajo estándares de ingeniería y dirección de arte para Célleri Real Estate.*
