'use client';

import React from 'react';
import { Sparkles, Radio, Send, Plus, ShieldCheck, Activity } from 'lucide-react';
import { INITIAL_VENDORS } from '@/lib/constants';

interface HeaderProps {
  selectedVendorId: string | null;
  onSelectVendor: (id: string | null) => void;
  onOpenNewLead: () => void;
  onOpenTestCapi: () => void;
  onOpenCapiLogs: () => void;
  capiEventsCount: number;
}

export function Header({
  selectedVendorId,
  onSelectVendor,
  onOpenNewLead,
  onOpenTestCapi,
  onOpenCapiLogs,
  capiEventsCount,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#24262b] bg-[#0c0d0f]/90 backdrop-blur-xl px-4 lg:px-8 py-3.5">
      <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand identity */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#ceb585] to-[#967d4f] flex items-center justify-center shadow-lg shadow-[#ceb585]/10 border border-[#ceb585]/30">
            <span className="font-serif text-lg font-bold text-[#0c0d0f] tracking-tighter">C</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl font-bold tracking-tight text-[#f7f6f2]">
                CÉLLERI
              </h1>
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-[#ceb585]/15 text-[#ceb585] border border-[#ceb585]/30">
                Olonesa Reserva
              </span>
            </div>
            <p className="text-xs text-[#b8b7b2] flex items-center gap-1.5 font-mono">
              <span>LEADS CRM</span>
              <span className="text-[#ceb585]">•</span>
              <span>Dataset ID: 3352860518219838</span>
            </p>
          </div>
        </div>

        {/* Live telemetry indicators */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Meta CAPI v21/v26</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Send className="w-3 h-3" />
            <span>Telegram Bot Activo</span>
          </div>
          <button
            onClick={onOpenCapiLogs}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1a1b1f] hover:bg-[#24262b] text-[#b8b7b2] hover:text-[#f7f6f2] border border-[#24262b] transition-colors cursor-pointer"
          >
            <Activity className="w-3 h-3 text-[#ceb585]" />
            <span>Audit Logs ({capiEventsCount})</span>
          </button>
        </div>

        {/* Vendor Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Vendor Filter */}
          <div className="flex items-center p-1 rounded-xl bg-[#141518] border border-[#24262b]">
            <button
              onClick={() => onSelectVendor(null)}
              className={`px-3 py-1 text-xs rounded-lg transition-all font-medium cursor-pointer ${
                selectedVendorId === null
                  ? 'bg-[#ceb585] text-[#0c0d0f] font-semibold shadow-sm'
                  : 'text-[#b8b7b2] hover:text-[#f7f6f2]'
              }`}
            >
              Todos
            </button>
            {INITIAL_VENDORS.map((v) => (
              <button
                key={v.id}
                onClick={() => onSelectVendor(v.id)}
                className={`px-3 py-1 text-xs rounded-lg transition-all font-medium flex items-center gap-1.5 cursor-pointer ${
                  selectedVendorId === v.id
                    ? 'bg-[#ceb585] text-[#0c0d0f] font-semibold shadow-sm'
                    : 'text-[#b8b7b2] hover:text-[#f7f6f2]'
                }`}
              >
                <span>{v.fullName.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Test CAPI Button */}
          <button
            onClick={onOpenTestCapi}
            className="px-3 py-1.5 text-xs font-mono rounded-xl bg-[#1a1b1f] hover:bg-[#24262b] text-[#ceb585] border border-[#ceb585]/30 hover:border-[#ceb585] transition-all flex items-center gap-1.5 cursor-pointer"
            title="Probar evento en Meta Events Manager con test_event_code"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Test CAPI</span>
          </button>

          {/* New Lead Button */}
          <button
            onClick={onOpenNewLead}
            className="px-3.5 py-1.5 text-xs font-medium rounded-xl bg-[#ceb585] hover:bg-[#dfc89d] text-[#0c0d0f] font-semibold shadow-md shadow-[#ceb585]/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Lead</span>
          </button>
        </div>

      </div>
    </header>
  );
}
