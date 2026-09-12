'use client';

import React, { useState } from 'react';
import { X, Plus, User, Phone, Mail, MapPin, DollarSign, Home } from 'lucide-react';
import { Lead, PipelineStageId } from '@/lib/types';
import { INITIAL_VENDORS } from '@/lib/constants';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (lead: Lead) => void;
}

export function NewLeadModal({ isOpen, onClose, onAddLead }: NewLeadModalProps) {
  if (!isOpen) return null;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [lotInterest, setLotInterest] = useState('Lote Mirador 1,200 m²');
  const [dealValue, setDealValue] = useState(150000);
  const [assignedTo, setAssignedTo] = useState('vendor-1');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const newLead: Lead = {
      id: `manual_${Date.now()}`,
      metaLeadId: Date.now(),
      source: 'manual',
      fullName,
      email: email || undefined,
      phone: phone || undefined,
      city: city || undefined,
      stage: 'new_lead',
      assignedTo,
      lotInterest,
      dealValue,
      currency: 'USD',
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAddLead(newLead);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#141518] border border-[#2d3037] shadow-2xl text-[#f7f6f2] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#24262b]">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded bg-[#ceb585]/15 text-[#ceb585] border border-[#ceb585]/30">
              Ingreso Manual / Offline
            </span>
            <h2 className="text-xl font-bold font-serif text-[#f7f6f2] mt-1">
              Registrar Nuevo Lead
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1a1b1f] hover:bg-[#24262b] text-[#b8b7b2] hover:text-[#f7f6f2] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-mono text-[#b8b7b2] block mb-1">
              NOMBRE Y APELLIDO *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#71737c] absolute left-3 top-3" />
              <input
                required
                type="text"
                placeholder="Ej. Ing. Patricio Baquerizo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#1a1b1f] border border-[#24262b] text-sm text-[#f7f6f2] focus:border-[#ceb585] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-[#b8b7b2] block mb-1">
                TELÉFONO / WHATSAPP
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#71737c] absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="+593 99..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#1a1b1f] border border-[#24262b] text-sm text-[#f7f6f2] focus:border-[#ceb585] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-[#b8b7b2] block mb-1">
                CORREO ELECTRÓNICO
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#71737c] absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="cliente@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#1a1b1f] border border-[#24262b] text-sm text-[#f7f6f2] focus:border-[#ceb585] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-[#b8b7b2] block mb-1">
                CIUDAD
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#71737c] absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Guayaquil / Samborondón"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#1a1b1f] border border-[#24262b] text-sm text-[#f7f6f2] focus:border-[#ceb585] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-[#b8b7b2] block mb-1">
                VALOR ESTIMADO (USD)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-[#71737c] absolute left-3 top-3" />
                <input
                  type="number"
                  placeholder="150000"
                  value={dealValue}
                  onChange={(e) => setDealValue(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#1a1b1f] border border-[#24262b] text-sm text-[#f7f6f2] font-mono focus:border-[#ceb585] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-[#b8b7b2] block mb-1">
              LOTE DE INTERÉS
            </label>
            <div className="relative">
              <Home className="w-4 h-4 text-[#71737c] absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Ej. Macrolote Mirador 1,200 m²"
                value={lotInterest}
                onChange={(e) => setLotInterest(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#1a1b1f] border border-[#24262b] text-sm text-[#f7f6f2] focus:border-[#ceb585] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-[#b8b7b2] block mb-1">
              VENDEDOR ASIGNADO
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#1a1b1f] border border-[#24262b] text-sm text-[#f7f6f2] focus:border-[#ceb585] focus:outline-none"
            >
              {INITIAL_VENDORS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.fullName} ({v.role})
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#24262b]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl text-[#b8b7b2] hover:text-[#f7f6f2] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#ceb585] hover:bg-[#dfc89d] text-[#0c0d0f] shadow-lg shadow-[#ceb585]/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear & Disparar CAPI</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
