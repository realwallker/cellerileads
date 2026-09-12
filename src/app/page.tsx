'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { StatsBar } from '@/components/StatsBar';
import { KanbanBoard } from '@/components/KanbanBoard';
import { LeadDetailModal } from '@/components/LeadDetailModal';
import { NewLeadModal } from '@/components/NewLeadModal';
import { TestCapiModal } from '@/components/TestCapiModal';
import { CapiLogsModal } from '@/components/CapiLogsModal';
import { Lead, PipelineStageId, CapiEventLog } from '@/lib/types';
import { DEMO_LEADS, PIPELINE_STAGES } from '@/lib/constants';

export default function CrmDashboard() {
  const [leads, setLeads] = useState<Lead[]>(DEMO_LEADS);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isTestCapiOpen, setIsTestCapiOpen] = useState(false);
  const [isCapiLogsOpen, setIsCapiLogsOpen] = useState(false);
  const [capiLogs, setCapiLogs] = useState<CapiEventLog[]>([]);

  // Filter leads by selected vendor
  const displayedLeads = selectedVendorId
    ? leads.filter((l) => l.assignedTo === selectedVendorId)
    : leads;

  // Handle stage change (drag-and-drop or modal)
  const handleMoveLead = async (leadId: string, newStageId: PipelineStageId) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    const updatedLead: Lead = {
      ...lead,
      stage: newStageId,
      updatedAt: new Date().toISOString(),
      stageUpdatedAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setLeads((prev) => prev.map((l) => (l.id === leadId ? updatedLead : l)));
    if (selectedLead?.id === leadId) {
      setSelectedLead(updatedLead);
    }

    // Trigger Meta CAPI + Telegram
    try {
      const res = await fetch('/api/capi/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead: updatedLead,
          stageId: newStageId,
        }),
      });

      const data = await res.json();
      if (data.log) {
        setCapiLogs((prev) => [data.log, ...prev]);
      }
    } catch (err) {
      console.error('[CAPI Trigger Error]', err);
    }
  };

  // Handle full lead update from detail modal
  const handleUpdateLead = (updated: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    handleMoveLead(updated.id, updated.stage);
  };

  // Handle adding new lead
  const handleAddLead = async (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);

    // Dispatch initial CAPI event
    try {
      const res = await fetch('/api/capi/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead: newLead,
          stageId: newLead.stage,
        }),
      });
      const data = await res.json();
      if (data.log) {
        setCapiLogs((prev) => [data.log, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0d0f] text-[#f7f6f2] flex flex-col selection:bg-[#ceb585] selection:text-[#0c0d0f]">
      {/* 1. Header with brand, vendors, and actions */}
      <Header
        selectedVendorId={selectedVendorId}
        onSelectVendor={setSelectedVendorId}
        onOpenNewLead={() => setIsNewLeadOpen(true)}
        onOpenTestCapi={() => setIsTestCapiOpen(true)}
        onOpenCapiLogs={() => setIsCapiLogsOpen(true)}
        capiEventsCount={capiLogs.length}
      />

      {/* 2. KPI Metrics Bar */}
      <StatsBar leads={displayedLeads} />

      {/* 3. Drag-and-Drop Kanban Board */}
      <main className="flex-1 flex flex-col">
        <KanbanBoard
          leads={displayedLeads}
          onMoveLead={handleMoveLead}
          onSelectLead={setSelectedLead}
        />
      </main>

      {/* 4. Modals */}
      <LeadDetailModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdateLead={handleUpdateLead}
      />

      <NewLeadModal
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
        onAddLead={handleAddLead}
      />

      <TestCapiModal
        isOpen={isTestCapiOpen}
        onClose={() => setIsTestCapiOpen(false)}
        onAddLog={(newLog) => setCapiLogs((prev) => [newLog, ...prev])}
      />

      <CapiLogsModal
        isOpen={isCapiLogsOpen}
        onClose={() => setIsCapiLogsOpen(false)}
        logs={capiLogs}
      />
    </div>
  );
}
