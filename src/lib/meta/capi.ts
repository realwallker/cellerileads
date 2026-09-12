import crypto from 'crypto';
import { Lead, PipelineStageId, CapiEventLog } from '../types';
import { PIPELINE_STAGES } from '../constants';

export function hashSha256(value: string): string {
  return crypto.createHash('sha256').update(value.trim()).digest('hex');
}

export function normalizeEmail(email?: string): string | null {
  if (!email) return null;
  const cleaned = email.trim().toLowerCase();
  return cleaned ? hashSha256(cleaned) : null;
}

export function normalizePhone(phone?: string): string | null {
  if (!phone) return null;
  // Remove non-digits
  const cleaned = phone.replace(/\D/g, '');
  return cleaned ? hashSha256(cleaned) : null;
}

export interface SendCapiParams {
  lead: Lead;
  stageId: PipelineStageId;
  testEventCode?: string;
  customValue?: number;
}

export interface CapiResponse {
  success: boolean;
  eventsReceived?: number;
  fbtraceId?: string;
  errorMessage?: string;
  rawResponse?: unknown;
  log: CapiEventLog;
}

export async function dispatchMetaCapiEvent({
  lead,
  stageId,
  testEventCode,
  customValue,
}: SendCapiParams): Promise<CapiResponse> {
  const stage = PIPELINE_STAGES.find((s) => s.id === stageId);
  const eventName = stage?.metaEvent;

  const datasetId = process.env.META_DATASET_ID || '3352860518219838';
  const accessToken = process.env.META_ACCESS_TOKEN;
  const apiVersion = process.env.META_API_VERSION || 'v21.0';

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const eventId = `crm_${lead.id}_${stageId}_${currentTimestamp}`;

  // If stage has no Meta event (e.g. 'lost'), return early
  if (!eventName) {
    const skippedLog: CapiEventLog = {
      id: crypto.randomUUID(),
      leadId: lead.id,
      platform: 'meta',
      eventName: 'SKIPPED (No mapped event)',
      eventId,
      actionSource: 'system_generated',
      status: 'simulated',
      payloadSanitized: {},
      responseMessage: 'Stage does not trigger Meta CAPI event',
      sentAt: new Date().toISOString(),
    };
    return { success: true, log: skippedLog };
  }

  // Build User Data with SHA-256 hashes
  const hashedEmail = normalizeEmail(lead.email);
  const hashedPhone = normalizePhone(lead.phone);

  const userData: Record<string, unknown> = {};
  if (lead.metaLeadId) {
    userData.lead_id = Number(lead.metaLeadId) || lead.metaLeadId;
  }
  if (hashedEmail) {
    userData.em = [hashedEmail];
  }
  if (hashedPhone) {
    userData.ph = [hashedPhone];
  }
  if (lead.firstName) {
    userData.fn = [hashSha256(lead.firstName.trim().toLowerCase())];
  }
  if (lead.lastName) {
    userData.ln = [hashSha256(lead.lastName.trim().toLowerCase())];
  }
  if (lead.city) {
    userData.ct = [hashSha256(lead.city.trim().toLowerCase())];
  }

  // Build Custom Data
  const dealValue = customValue ?? lead.dealValue ?? 0;
  const customData: Record<string, unknown> = {
    event_source: 'crm',
    lead_event_source: 'Célleri CRM',
    lot_interest: lead.lotInterest || 'Reserva Village',
  };

  if (dealValue > 0) {
    customData.value = dealValue;
    customData.currency = lead.currency || 'USD';
  }

  const serverEvent: Record<string, unknown> = {
    event_name: eventName,
    event_time: currentTimestamp,
    action_source: 'system_generated',
    event_id: eventId,
    user_data: userData,
    custom_data: customData,
  };

  const payload: Record<string, unknown> = {
    data: [serverEvent],
  };

  const effectiveTestCode = testEventCode || process.env.META_TEST_EVENT_CODE;
  if (effectiveTestCode) {
    payload.test_event_code = effectiveTestCode;
  }

  // If no Access Token is configured yet, run in simulated mode with high-fidelity logging
  if (!accessToken) {
    console.warn('[Meta CAPI] META_ACCESS_TOKEN not set in env. Simulating CAPI dispatch.');
    const simulatedLog: CapiEventLog = {
      id: crypto.randomUUID(),
      leadId: lead.id,
      platform: 'meta',
      eventName,
      eventId,
      actionSource: 'system_generated',
      status: 'simulated',
      payloadSanitized: payload,
      responseMessage: 'Simulated locally (Set META_ACCESS_TOKEN in .env.local to send live)',
      sentAt: new Date().toISOString(),
    };
    return {
      success: true,
      eventsReceived: 1,
      fbtraceId: 'simulated_' + Math.random().toString(36).substring(2, 10),
      log: simulatedLog,
    };
  }

  // Live Dispatch to Meta Graph API
  const endpoint = `https://graph.facebook.com/${apiVersion}/${datasetId}/events?access_token=${accessToken}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMsg = result?.error?.message || response.statusText;
      const failedLog: CapiEventLog = {
        id: crypto.randomUUID(),
        leadId: lead.id,
        platform: 'meta',
        eventName,
        eventId,
        actionSource: 'system_generated',
        status: 'failed',
        statusCode: response.status,
        fbtraceId: result?.error?.fbtrace_id,
        payloadSanitized: payload,
        responseMessage: errorMsg,
        sentAt: new Date().toISOString(),
      };
      return {
        success: false,
        errorMessage: errorMsg,
        fbtraceId: result?.error?.fbtrace_id,
        rawResponse: result,
        log: failedLog,
      };
    }

    const successLog: CapiEventLog = {
      id: crypto.randomUUID(),
      leadId: lead.id,
      platform: 'meta',
      eventName,
      eventId,
      actionSource: 'system_generated',
      status: 'sent',
      statusCode: 200,
      fbtraceId: result.fbtrace_id,
      payloadSanitized: payload,
      responseMessage: `Meta received ${result.events_received || 1} event(s)`,
      sentAt: new Date().toISOString(),
    };

    return {
      success: true,
      eventsReceived: result.events_received || 1,
      fbtraceId: result.fbtrace_id,
      rawResponse: result,
      log: successLog,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const networkFailLog: CapiEventLog = {
      id: crypto.randomUUID(),
      leadId: lead.id,
      platform: 'meta',
      eventName,
      eventId,
      actionSource: 'system_generated',
      status: 'failed',
      payloadSanitized: payload,
      responseMessage: `Network error: ${errorMsg}`,
      sentAt: new Date().toISOString(),
    };

    return {
      success: false,
      errorMessage: errorMsg,
      log: networkFailLog,
    };
  }
}
