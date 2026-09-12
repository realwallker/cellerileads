import { NextRequest, NextResponse } from 'next/server';
import { dispatchMetaCapiEvent } from '@/lib/meta/capi';
import { notifyNewLead } from '@/lib/telegram/notify';
import { Lead } from '@/lib/types';
import { INITIAL_VENDORS } from '@/lib/constants';

// 1. GET: Webhook Handshake Verification for Meta Developer Portal
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const expectedToken = process.env.META_WEBHOOK_VERIFY_TOKEN || 'celleri_secret_token_2026';

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('[Meta Webhook] Verification successful');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Verification token mismatch', { status: 403 });
}

// In-memory counter for round-robin assignment between the 2 vendors
let vendorAssignmentCounter = 0;

// 2. POST: Ingest real-time leads from Meta Lead Ads Instant Forms
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[Meta Webhook Received]', JSON.stringify(body, null, 2));

    // Meta wraps lead events in entry[].changes[]
    const entries = body?.entry || [];

    for (const entry of entries) {
      const changes = entry?.changes || [];
      for (const change of changes) {
        if (change.field === 'leadgen') {
          const leadgenId = change.value?.leadgen_id;
          const formId = change.value?.form_id;
          const adId = change.value?.ad_id;

          // Round-robin between our 2 vendors
          const vendor = INITIAL_VENDORS[vendorAssignmentCounter % INITIAL_VENDORS.length];
          vendorAssignmentCounter++;

          let leadData: Lead = {
            id: `meta_${leadgenId || Date.now()}`,
            metaLeadId: leadgenId,
            source: 'meta',
            fullName: 'Nuevo Prospecto Meta Ads',
            stage: 'new_lead',
            assignedTo: vendor.id,
            lotInterest: 'Olonesa Reserva Village',
            budgetRange: 'A consultar',
            currency: 'USD',
            dealValue: 0,
            formName: `Form #${formId || 'Instant'}`,
            campaignName: `Ad #${adId || 'Pauta Meta'}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // If we have an access token, query Graph API for the actual lead form fields
          const accessToken = process.env.META_ACCESS_TOKEN;
          if (accessToken && leadgenId) {
            try {
              const graphRes = await fetch(
                `https://graph.facebook.com/v21.0/${leadgenId}?access_token=${accessToken}`
              );
              if (graphRes.ok) {
                const graphData = await graphRes.json();
                const fieldData = graphData.field_data || [];

                let fullName = '';
                let email = '';
                let phone = '';
                let city = '';

                for (const field of fieldData) {
                  const name = field.name;
                  const val = field.values?.[0] || '';
                  if (name === 'full_name' || name === 'nombre_completo') fullName = val;
                  if (name === 'email' || name === 'correo') email = val;
                  if (name === 'phone_number' || name === 'telefono') phone = val;
                  if (name === 'city' || name === 'ciudad') city = val;
                }

                leadData = {
                  ...leadData,
                  fullName: fullName || leadData.fullName,
                  email: email || undefined,
                  phone: phone || undefined,
                  city: city || undefined,
                };
              }
            } catch (graphErr) {
              console.error('[Meta Graph Fetch Error]', graphErr);
            }
          }

          // 1. Dispatch initial 'Lead' CAPI event
          await dispatchMetaCapiEvent({
            lead: leadData,
            stageId: 'new_lead',
          });

          // 2. Dispatch Telegram alert
          await notifyNewLead(leadData, vendor.fullName);
        }
      }
    }

    return NextResponse.json({ success: true, received: true }, { status: 200 });
  } catch (err: unknown) {
    console.error('[Webhook Error]', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
