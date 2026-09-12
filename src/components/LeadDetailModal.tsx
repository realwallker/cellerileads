'use client';

import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Radio,
  Send,
  MessageCircle,
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Lead, PipelineStageId } from '@/lib/types';
import { PIPELINE_STAGES, INITIAL_VENDORS } from '@/lib/constants';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateLead: (updatedLead: Lead) => void;
}

export function LeadDetailModal({
  lead,
  onClose,
  onUpdateLead,
}: LeadDetailModalProps) {
  if (!lead) return null;

  const [stage, setStage] = useState<PipelineStageId>(lead.stage);
  const [assignedTo, setAssignedTo] = useState<string>(lead.assignedTo || 'vendor-1');
  const [dealValue, setDealValue] = useState<number>(lead.dealValue || 0);
  const [notes, setNotes] = useState<string>(lead.notes || '');
  const [isSaved, setIsSaved] = useState(false);

  const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, '') : '';
  const currentStageInfo = PIPELINE_STAGES.find((s) => s.id === stage);

  const handleSave = () => {
    const updated: Lead = {
      ...lead,
      stage,
      assignedTo,
      dealValue,
      notes,
      updatedAt: new Date().toISOString(),
    };
    onUpdateLead(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const whatsappTemplates = [
    {
      title: 'Saludo Inicial Olonesa',
      text: `Estimado/a ${lead.fullName}, le saluda ${
        INITIAL_VENDORS.find((v) => v.id === assignedTo)?.fullName || 'el equipo de Célleri'
      }. Nos ponemos en contacto respecto a su interés en los lotes de Olonesa Reserva Village. ¿Tendría unos minutos hoy para una breve llamada?`,
    },
    {
      title: 'Agendamiento de Visita',
      text: `Hola ${lead.fullName}, ¿cómo se encuentra? Me gustaría coordinar con usted una visita exclusiva para recorrer los macro-lotes de Olonesa Reserva Village en Chongón-Colonche y mostrarle la vista panorámica al Pacífico. ¿Le vendría bien este fin de semana?`,
    },
    {
      title: 'Envío de Cotización 40/60',
      text: `Estimado/a ${lead.fullName}, le comparto la propuesta personalizada para el ${lead.lotInterest || 'lote seleccionado'}, incluyendo la estructura de inversión fiduciaria 40/60 directo sin intereses bancarios. Quedo atento a sus inquietudes.`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#141518] border border-[#2d3037] shadow-2xl text-[#f7f6f2] flex flex-col">
        
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-[#24262b] bg-[#141518]/95 backdrop-blur">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded bg-[#ceb585]/15 text-[#ceb585] border border-[#ceb585]/30">
                Meta Instant Form • {lead.metaLeadId ? `ID: ${lead.metaLeadId}` : 'Web Lead'}
              </span>
              {lead.city && (
                <span className="text-[10px] font-mono text-[#b8b7b2] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#ceb585]" />
                  {lead.city}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold font-serif text-[#f7f6f2] tracking-tight">
              {lead.fullName}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1a1b1f] hover:bg-[#24262b] text-[#b8b7b2] hover:text-[#f7f6f2] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1">
          
          {/* Quick contact strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lead.phone && (
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-between text-emerald-400 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4" />
                  <div>
                    <div className="text-[10px] text-emerald-500/80 font-mono">WHATSAPP DIRECTO</div>
                    <div className="text-sm font-semibold">{lead.phone}</div>
                  </div>
                </div>
                <Send className="w-4 h-4" />
              </a>
            )}

            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="p-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 flex items-center justify-between text-sky-400 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4" />
                  <div>
                    <div className="text-[10px] text-sky-500/80 font-mono">CORREO ELECTRÓNICO</div>
                    <div className="text-sm font-semibold truncate max-w-[180px]">{lead.email}</div>
                  </div>
                </div>
                <Send className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Stage & CAPI Mapping */}
          <div className="p-4 rounded-2xl bg-[#1a1b1f] border border-[#2d3037] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-[#b8b7b2] flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#ceb585]" />
                <span>ETAPA DEL FUNNEL & META CAPI</span>
              </label>
              {currentStageInfo?.metaEvent && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Dispara CAPI: <b>{currentStageInfo.metaEvent}</b>
                </span>
              )}
            </div>

            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as PipelineStageId)}
              className="w-full p-2.5 rounded-xl bg-[#141518] border border-[#24262b] text-sm text-[#f7f6f2] focus:border-[#ceb585] focus:outline-none font-medium"
            >
              {PIPELINE_STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} {s.metaEvent ? `➔ CAPI: ${s.metaEvent}` : '(Sin evento)'}
                </option>
              ))}
            </select>
            <p className="text-xs text-[#b8b7b2]">
              {currentStageInfo?.description}
            </p>
          </div>

          {/* Vendor Assignment & Deal Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#1a1b1f] border border-[#2d3037] space-y-2">
              <label className="text-xs font-mono text-[#b8b7b2] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#ceb585]" />
                <span>VENDEDOR ASIGNADO</span>
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#141518] border border-[#24262b] text-sm text-[#f7f6f2] focus:border-[#ceb585] focus:outline-none"
              >
                {INITIAL_VENDORS.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.fullName} ({v.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-[#1a1b1f] border border-[#2d3037] space-y-2">
              <label className="text-xs font-mono text-[#b8b7b2] flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#ceb585]" />
                <span>VALOR ESTIMADO / CERRADO (USD)</span>
              </label>
              <input
                type="number"
                value={dealValue}
                onChange={(e) => setDealValue(Number(e.target.value))}
                placeholder="150000"
                className="w-full p-2.5 rounded-xl bg-[#141518] border border-[#24262b] text-sm text-[#f7f6f2] font-mono focus:border-[#ceb585] focus:outline-none"
              />
            </div>
          </div>

          {/* Real estate specs */}
          <div className="p-4 rounded-2xl bg-[#1a1b1f] border border-[#2d3037] space-y-2 text-xs">
            <div className="text-xs font-mono text-[#b8b7b2]">DATOS DE LA PROPIEDAD</div>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
              <div className="p-2 rounded-lg bg-[#141518] border border-[#24262b]">
                <span className="text-[#71737c]">Lote de Interés:</span>{' '}
                <span className="text-[#f7f6f2]">{lead.lotInterest || 'Olonesa Village'}</span>
              </div>
              <div className="p-2 rounded-lg bg-[#141518] border border-[#24262b]">
                <span className="text-[#71737c]">Presupuesto:</span>{' '}
                <span className="text-[#f7f6f2]">{lead.budgetRange || 'A consultar'}</span>
              </div>
            </div>
          </div>

          {/* Quick WhatsApp Copypaste Templates */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-[#b8b7b2] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#ceb585]" />
              <span>PLANTILLAS RÁPIDAS DE WHATSAPP</span>
            </label>
            <div className="space-y-2">
              {whatsappTemplates.map((t, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#1a1b1f] border border-[#24262b] flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-medium text-[#f7f6f2]">{t.title}</div>
                    <div className="text-[#b8b7b2] line-clamp-1 mt-0.5">{t.text}</div>
                  </div>
                  {cleanPhone ? (
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(t.text)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 flex-shrink-0 transition-colors"
                    >
                      <span>Enviar</span>
                      <Send className="w-3 h-3" />
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-[#b8b7b2] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#ceb585]" />
              <span>BITÁCORA / NOTAS DEL VENDEDOR</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Añade detalles de la conversación, objeciones o acuerdos..."
              className="w-full p-3 rounded-xl bg-[#141518] border border-[#24262b] text-sm text-[#f7f6f2] focus:border-[#ceb585] focus:outline-none"
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 z-10 flex items-center justify-between p-6 border-t border-[#24262b] bg-[#141518]/95 backdrop-blur">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl text-[#b8b7b2] hover:text-[#f7f6f2] hover:bg-[#1a1b1f] transition-colors cursor-pointer"
          >
            Cerrar
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#ceb585] hover:bg-[#dfc89d] text-[#0c0d0f] shadow-lg shadow-[#ceb585]/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-900" />
                <span>¡Guardado & CAPI Disparado!</span>
              </>
            ) : (
              <span>Guardar Cambios</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
