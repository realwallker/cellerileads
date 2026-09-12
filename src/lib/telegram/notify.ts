import { Lead, PipelineStageId } from '../types';
import { PIPELINE_STAGES } from '../constants';

export async function sendTelegramNotification(messageText: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log('[Telegram Notification (Simulated)]:\n' + messageText);
    return true; // Not configured yet, don't fail
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      console.error('[Telegram Error]', await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Telegram Network Error]', err);
    return false;
  }
}

export async function notifyNewLead(lead: Lead, vendorName?: string): Promise<void> {
  const text = `
<b>🚨 NUEVO LEAD DE META ADS — CÉLLERI × OLONESA</b>
━━━━━━━━━━━━━━━━━━━━━
👤 <b>Nombre:</b> ${lead.fullName || 'Lead Anónimo'}
📱 <b>Teléfono:</b> ${lead.phone || 'No provisto'}
📧 <b>Email:</b> ${lead.email || 'No provisto'}
📍 <b>Ciudad:</b> ${lead.city || 'No especificada'}
🏡 <b>Lote de Interés:</b> ${lead.lotInterest || 'Reserva Village'}
💰 <b>Presupuesto:</b> ${lead.budgetRange || 'A consultar'}
🎯 <b>Origen:</b> Meta Instant Form (${lead.campaignName || 'Célleri Pauta'})
👨‍💼 <b>Asignado a:</b> ${vendorName || 'Vendedor Asignado'}
━━━━━━━━━━━━━━━━━━━━━
<i>⚡ Revisa el CRM para iniciar contacto dentro de los primeros 15 minutos.</i>
`.trim();

  await sendTelegramNotification(text);
}

export async function notifyStageChange(
  lead: Lead,
  newStageId: PipelineStageId,
  vendorName?: string
): Promise<void> {
  const stage = PIPELINE_STAGES.find((s) => s.id === newStageId);
  const stageName = stage?.label || newStageId;
  const capiEvent = stage?.metaEvent;

  if (newStageId === 'won') {
    const wonText = `
<b>🎉 ¡VENTA CERRADA! — CÉLLERI × OLONESA</b>
━━━━━━━━━━━━━━━━━━━━━
🏆 <b>Cliente:</b> ${lead.fullName}
💰 <b>Monto Cerrado:</b> $${(lead.dealValue || 0).toLocaleString()} USD
🏡 <b>Lote:</b> ${lead.lotInterest || 'Reserva Village'}
👨‍💼 <b>Cierre por:</b> ${vendorName || 'Vendedor'}
📡 <b>Meta CAPI:</b> Evento <code>Purchase</code> disparado para optimización de valor (VBO)
━━━━━━━━━━━━━━━━━━━━━
<i>¡Felicitaciones al equipo comercial! 🥂</i>
`.trim();
    await sendTelegramNotification(wonText);
    return;
  }

  const text = `
<b>🔄 AVANCE EN PIPELINE — CÉLLERI CRM</b>
━━━━━━━━━━━━━━━━━━━━━
👤 <b>Lead:</b> ${lead.fullName}
📊 <b>Nueva Etapa:</b> <b>${stageName}</b>
${capiEvent ? `📡 <b>Meta CAPI:</b> Disparando evento <code>${capiEvent}</code>` : 'ℹ️ <i>Sin evento CAPI</i>'}
👨‍💼 <b>Gestionado por:</b> ${vendorName || 'Vendedor'}
━━━━━━━━━━━━━━━━━━━━━
`.trim();

  await sendTelegramNotification(text);
}
