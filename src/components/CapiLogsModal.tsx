'use client';

import React, { useState } from 'react';
import { X, Activity, Radio, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { CapiEventLog } from '@/lib/types';

interface CapiLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: CapiEventLog[];
}

export function CapiLogsModal({ isOpen, onClose, logs }: CapiLogsModalProps) {
  if (!isOpen) return null;

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[85vh] rounded-3xl bg-[#141518] border border-[#2d3037] shadow-2xl text-[#f7f6f2] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#24262b] bg-[#141518]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#ceb585]/10 border border-[#ceb585]/20 text-[#ceb585]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-[#f7f6f2]">
                Audit Logs — Meta Conversions API
              </h2>
              <p className="text-xs text-[#b8b7b2] font-mono mt-0.5">
                Dataset ID: 3352860518219838 • Trazabilidad de Eventos & Hashes SHA-256
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1a1b1f] hover:bg-[#24262b] text-[#b8b7b2] hover:text-[#f7f6f2] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logs List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-[#71737c] text-xs font-mono">
              Aún no se han registrado eventos CAPI en esta sesión.
            </div>
          ) : (
            logs.map((log) => {
              const isExpanded = expandedId === log.id;
              return (
                <div
                  key={log.id}
                  className="rounded-2xl bg-[#1a1b1f] border border-[#24262b] hover:border-[#383a42] transition-all overflow-hidden text-xs"
                >
                  <div
                    onClick={() => toggleExpand(log.id)}
                    className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      {log.status === 'sent' ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      ) : log.status === 'simulated' ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      )}

                      <span className="font-mono font-bold text-sm text-[#f7f6f2]">
                        {log.eventName}
                      </span>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#24262b] text-[#b8b7b2]">
                        {log.actionSource}
                      </span>

                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                          log.status === 'sent'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : log.status === 'simulated'
                            ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[#b8b7b2]">
                      <span className="text-[11px]">
                        {new Date(log.sentAt).toLocaleTimeString()}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#71737c]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#71737c]" />
                      )}
                    </div>
                  </div>

                  {/* Expanded JSON payload details */}
                  {isExpanded && (
                    <div className="p-4 border-t border-[#24262b] bg-[#141518] space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-[#b8b7b2]">
                        <div>
                          <b>Event ID:</b> {log.eventId}
                        </div>
                        {log.fbtraceId && (
                          <div className="text-[#ceb585]">
                            <b>fbtrace_id:</b> {log.fbtraceId}
                          </div>
                        )}
                      </div>

                      {log.responseMessage && (
                        <div className="text-[11px] text-emerald-400/90 font-mono">
                          <b>Respuesta:</b> {log.responseMessage}
                        </div>
                      )}

                      <div className="text-[11px] font-mono text-[#71737c] pt-1">
                        PAYLOAD NORMALIZADO & HASHEADO (SHA-256):
                      </div>
                      <pre className="p-3 rounded-xl bg-[#0c0d0f] border border-[#24262b] text-[11px] font-mono text-[#b8b7b2] overflow-x-auto max-h-48">
                        {JSON.stringify(log.payloadSanitized, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#24262b] bg-[#141518] flex items-center justify-between text-xs text-[#b8b7b2]">
          <span>Total de eventos registrados: {logs.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#1a1b1f] hover:bg-[#24262b] text-[#f7f6f2] transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
