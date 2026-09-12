'use client';

import React from 'react';
import { Users, Calendar, Trophy, DollarSign, TrendingUp, Sparkles } from 'lucide-react';
import { Lead } from '@/lib/types';

interface StatsBarProps {
  leads: Lead[];
}

export function StatsBar({ leads }: StatsBarProps) {
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.stage === 'new_lead').length;
  const scheduledVisits = leads.filter((l) => l.stage === 'visit').length;
  const wonDeals = leads.filter((l) => l.stage === 'won');
  const wonCount = wonDeals.length;
  const totalWonValue = wonDeals.reduce((acc, curr) => acc + (curr.dealValue || 0), 0);
  const totalPipelineValue = leads
    .filter((l) => l.stage !== 'lost')
    .reduce((acc, curr) => acc + (curr.dealValue || 0), 0);

  const stats = [
    {
      label: 'Total Leads Activos',
      value: totalLeads,
      icon: Users,
      trend: '+12% esta semana',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Nuevos por Contactar',
      value: newLeads,
      icon: Sparkles,
      trend: 'Meta Instant Forms',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Visitas en Terreno',
      value: scheduledVisits,
      icon: Calendar,
      trend: 'Olonesa Reserva Village',
      color: 'text-violet-400',
      bg: 'bg-violet-500/10 border-violet-500/20',
    },
    {
      label: 'Ventas Cerradas',
      value: `${wonCount} ($${(totalWonValue / 1000).toFixed(0)}k)`,
      icon: Trophy,
      trend: 'CAPI: Purchase disparado',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Valor Pipeline',
      value: `$${(totalPipelineValue / 1000).toFixed(0)}k USD`,
      icon: DollarSign,
      trend: 'Valor total ponderado',
      color: 'text-[#ceb585]',
      bg: 'bg-[#ceb585]/10 border-[#ceb585]/25',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-[1720px] mx-auto px-4 lg:px-8 py-4">
      {stats.map((s, idx) => {
        const Icon = s.icon;
        return (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-[#141518]/80 border border-[#24262b] hover:border-[#383a42] transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#b8b7b2] font-medium tracking-wide">
                {s.label}
              </span>
              <div className={`p-1.5 rounded-xl border ${s.bg}`}>
                <Icon className={`w-3.5 h-3.5 ${s.color}`} />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold tracking-tight text-[#f7f6f2] font-mono">
                {s.value}
              </span>
              <span className="text-[10px] text-[#b8b7b2] font-mono truncate max-w-[110px]">
                {s.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
