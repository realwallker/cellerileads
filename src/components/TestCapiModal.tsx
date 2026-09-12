'use client';

import React, { useState } from 'react';
import { X, Sparkles, Send, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { CapiResponse } from '@/lib/meta/capi';

interface TestCapiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLog: (log: any) => void;
}

export function TestCapiModal({ isOpen, onClose, onAddLog }: TestCapiModalProps) {
  if (!isOpen) return null;

  const [testCode, setTestCode] = useState('TEST12345');
  const [eventName, setEventName] = useState('Lead');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CapiResponse | null>(null);

  const handleFireTest = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/test-capi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testEventCode: testCode,
          eventName,
        }),
      });

      const data = await res.json();
      setResult(data);
      if (data.log) {
        onAddLog(data.log);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#141518] border border-[#2d3037] shadow-2xl text-[#f7f6f2] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#24262b]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Meta Events Manager Tester
              </span>
            </div>
            <h2 className="text-xl font-bold font-serif text-[#f7f6f2] mt-1">
              Probar Conversions API (CAPI)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1a1b1f] hover:bg-[#24262b] text-[#b8b7b2] hover:text-[#f7f6f2] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-[#b8b7b2] leading-relaxed">
            Ingresa el <b>test_event_code</b> generado en la pestaña <i>Probar Eventos (Test Events)</i> de tu Events Manager de Meta para validar que el Dataset ID <code className="text-[#ceb585]">3352860518219838</code> recibe eventos en tiempo real sin alterar las estadísticas de producción.
          </p>

          <div>
            <label className="text-xs font-mono text-[#b8b7b2] block mb-1">
              TEST_EVENT_CODE DE META *
            </label>
            <input
              type="text"
              placeholder="Ej. TEST78234"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1b1f] border border-[#24262b] text-sm text-[#f7f6f2] font-mono focus:border-[#ceb585] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-[#b8b7b2] block mb-1">
              EVENTO A SIMULAR
            </label>
            <select
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#1a1b1f] border border-[#24262b] text-sm text-[#f7f6f2] focus:border-[#ceb585] focus:outline-none"
            >
              <option value="Lead">Lead (Formulario Inicial)</option>
              <option value="Contact">Contact (Contacto WhatsApp)</option>
              <option value="QualifiedLead">QualifiedLead (Calificado)</option>
              <option value="Schedule">Schedule (Visita Agendada en Terreno)</option>
              <option value="SubmitApplication">SubmitApplication (Propuesta Enviada)</option>
              <option value="Purchase">Purchase (Venta Cerrada de Lote)</option>
            </select>
          </div>

          {/* Test Link to Events Manager */}
          <div className="p-3 rounded-xl bg-[#1a1b1f] border border-[#24262b] flex items-center justify-between text-xs">
            <span className="text-[#b8b7b2]">Abrir Meta Events Manager</span>
            <a
              href="https://eventsmanager.facebook.com/events_manager2/crm_implementation_guide/3352860518219838"
              target="_blank"
              rel="noreferrer"
              className="text-[#ceb585] hover:underline flex items-center gap-1 font-mono"
            >
              <span>Ir al Dataset</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Result view */}
          {result && (
            <div
              className={`p-4 rounded-2xl border text-xs space-y-2 ${
                result.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {result.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
                <span>
                  {result.success ? 'Evento Transmitido con Éxito' : 'Fallo en la Transmisión'}
                </span>
              </div>
              <div className="font-mono text-[11px] space-y-1">
                <div>
                  <b>Status:</b> {result.log?.status}
                </div>
                {result.fbtraceId && (
                  <div>
                    <b>fbtrace_id:</b> {result.fbtraceId}
                  </div>
                )}
                <div>
                  <b>Mensaje:</b> {result.log?.responseMessage}
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#24262b]">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl text-[#b8b7b2] hover:text-[#f7f6f2] transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              disabled={isLoading}
              onClick={handleFireTest}
              className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#ceb585] hover:bg-[#dfc89d] text-[#0c0d0f] shadow-lg shadow-[#ceb585]/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Transmitiendo...' : 'Disparar Evento Test'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
