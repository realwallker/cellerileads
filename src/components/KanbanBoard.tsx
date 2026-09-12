'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  TouchSensor,
  DragEndEvent,
  DragStartEvent,
  closestCenter,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import confetti from 'canvas-confetti';
import {
  Phone,
  MessageCircle,
  Clock,
  Sparkles,
  DollarSign,
  ChevronRight,
  User,
  Radio,
} from 'lucide-react';
import { Lead, PipelineStage, PipelineStageId } from '@/lib/types';
import { PIPELINE_STAGES, INITIAL_VENDORS } from '@/lib/constants';

interface KanbanBoardProps {
  leads: Lead[];
  onMoveLead: (leadId: string, newStageId: PipelineStageId) => void;
  onSelectLead: (lead: Lead) => void;
}

export function KanbanBoard({ leads, onMoveLead, onSelectLead }: KanbanBoardProps) {
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveLeadId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLeadId(null);

    if (!over) return;

    const leadId = active.id as string;
    const newStageId = over.id as PipelineStageId;

    const currentLead = leads.find((l) => l.id === leadId);
    if (currentLead && currentLead.stage !== newStageId) {
      // If moving to 'won', celebrate!
      if (newStageId === 'won') {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ceb585', '#34d399', '#f7f6f2', '#e5c07b'],
        });
      }

      onMoveLead(leadId, newStageId);
    }
  };

  const activeLead = leads.find((l) => l.id === activeLeadId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 w-full max-w-[1720px] mx-auto px-4 lg:px-8 pb-12 overflow-x-auto">
        <div className="flex gap-4 min-w-[1550px] pb-6">
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage.id);
            const totalStageValue = stageLeads.reduce(
              (acc, curr) => acc + (curr.dealValue || 0),
              0
            );

            return (
              <StageColumn
                key={stage.id}
                stage={stage}
                leads={stageLeads}
                totalValue={totalStageValue}
                onSelectLead={onSelectLead}
              />
            );
          })}
        </div>
      </div>

      <DragOverlay>
        {activeLead ? (
          <div className="transform rotate-2 scale-105 shadow-2xl shadow-black/80 pointer-events-none">
            <LeadCard lead={activeLead} onSelectLead={() => {}} isOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function StageColumn({
  stage,
  leads,
  totalValue,
  onSelectLead,
}: {
  stage: PipelineStage;
  leads: Lead[];
  totalValue: number;
  onSelectLead: (lead: Lead) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-[290px] flex-shrink-0 flex flex-col rounded-2xl bg-[#141518]/90 border transition-all duration-200 ${
        isOver
          ? 'border-[#ceb585] ring-2 ring-[#ceb585]/30 bg-[#1a1b1f]'
          : 'border-[#24262b]'
      }`}
    >
      {/* Column Header */}
      <div className="p-3.5 border-b border-[#24262b]">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: stage.accentHex }}
            />
            <h3 className="font-semibold text-sm text-[#f7f6f2] tracking-tight">
              {stage.label}
            </h3>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#1a1b1f] text-[#b8b7b2] border border-[#2d3037]">
            {leads.length}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-[#b8b7b2]">
          {/* CAPI Event Mapping Badge */}
          {stage.metaEvent ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              <Radio className="w-2.5 h-2.5 animate-pulse" />
              <span>CAPI: {stage.metaEvent}</span>
            </span>
          ) : (
            <span className="text-[10px] text-[#71737c]">Sin evento CAPI</span>
          )}

          {/* Column value sum */}
          {totalValue > 0 && (
            <span className="text-[#ceb585] font-medium">
              ${(totalValue / 1000).toFixed(0)}k
            </span>
          )}
        </div>
      </div>

      {/* Cards list */}
      <div className="flex-1 p-2.5 space-y-2.5 min-h-[480px] max-h-[calc(100vh-280px)] overflow-y-auto">
        {leads.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center border border-dashed border-[#24262b] rounded-xl text-[#71737c] text-xs">
            <span>Arrastra un lead aquí</span>
          </div>
        ) : (
          leads.map((lead) => (
            <DraggableLeadCard
              key={lead.id}
              lead={lead}
              onSelectLead={onSelectLead}
            />
          ))
        )}
      </div>
    </div>
  );
}

function DraggableLeadCard({
  lead,
  onSelectLead,
}: {
  lead: Lead;
  onSelectLead: (lead: Lead) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`${isDragging ? 'opacity-30' : 'opacity-100'}`}
    >
      <LeadCard lead={lead} onSelectLead={onSelectLead} />
    </div>
  );
}

function LeadCard({
  lead,
  onSelectLead,
  isOverlay = false,
}: {
  lead: Lead;
  onSelectLead: (lead: Lead) => void;
  isOverlay?: boolean;
}) {
  const assignedVendor = INITIAL_VENDORS.find((v) => v.id === lead.assignedTo);

  const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, '') : '';
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Estimado/a ${lead.fullName}, un saludo cordial desde Célleri Real Estate respecto a su consulta sobre Olonesa Reserva Village.`
      )}`
    : '#';

  return (
    <div
      onClick={() => onSelectLead(lead)}
      className="group relative p-3.5 rounded-xl bg-[#1a1b1f] hover:bg-[#202227] border border-[#2d3037] hover:border-[#ceb585]/40 transition-all shadow-sm cursor-grab active:cursor-grabbing text-left"
    >
      {/* Lead Name & Value */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h4 className="font-semibold text-sm text-[#f7f6f2] tracking-tight group-hover:text-[#ceb585] transition-colors line-clamp-1">
          {lead.fullName}
        </h4>
        {lead.dealValue ? (
          <span className="text-xs font-mono font-bold text-[#ceb585] flex-shrink-0">
            ${(lead.dealValue / 1000).toFixed(0)}k
          </span>
        ) : null}
      </div>

      {/* Lot / Real Estate Interest */}
      {lead.lotInterest && (
        <p className="text-xs text-[#b8b7b2] line-clamp-1 mb-2">
          {lead.lotInterest}
        </p>
      )}

      {/* Origin badge + City */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#24262b] text-[#b8b7b2] border border-[#2d3037]">
          Meta Instant Form
        </span>
        {lead.city && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#24262b] text-[#71737c]">
            {lead.city}
          </span>
        )}
      </div>

      {/* Actions & Vendor info */}
      <div className="flex items-center justify-between pt-2 border-t border-[#24262b] text-xs">
        {/* Quick Contact Triggers */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {lead.phone && (
            <>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                title="Abrir WhatsApp con mensaje de bienvenida"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
              <a
                href={`tel:${lead.phone}`}
                className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition-colors"
                title="Llamar al cliente"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            </>
          )}
        </div>

        {/* Assigned Vendor Tag */}
        {assignedVendor && (
          <div className="flex items-center gap-1 text-[11px] text-[#b8b7b2] font-medium">
            <span className="w-4 h-4 rounded-full bg-[#ceb585]/20 text-[#ceb585] flex items-center justify-center text-[9px] font-bold border border-[#ceb585]/30">
              {assignedVendor.fullName.charAt(0)}
            </span>
            <span className="text-[10px] truncate max-w-[70px]">
              {assignedVendor.fullName.split(' ')[0]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
