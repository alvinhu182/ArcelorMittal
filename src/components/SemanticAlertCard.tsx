/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SemanticAlert, AlertSeverity } from '../types';
import { AlertTriangle, CheckCircle2, ShieldAlert, ArrowUpRight, Clock, MapPin } from 'lucide-react';

interface SemanticAlertCardProps {
  key?: React.Key;
  alert: SemanticAlert;
  onSelectPlant?: (plantId: any) => void;
}

export default function SemanticAlertCard({ alert, onSelectPlant }: SemanticAlertCardProps) {
  const getSeverityStyles = (severity: AlertSeverity) => {
    switch (severity) {
      case 'safe':
        return {
          container: 'border-l-4 border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/10 text-emerald-950 dark:text-emerald-300 border border-gray-150 dark:border-slate-800/80',
          badge: 'bg-emerald-100/80 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200/55 dark:border-emerald-900/30',
          icon: <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />,
          label: 'Meta Atingida',
        };
      case 'warning':
        return {
          container: 'border-l-4 border-amber-500 bg-amber-50/65 dark:bg-amber-950/10 text-amber-950 dark:text-amber-300 border border-gray-150 dark:border-slate-800/80',
          badge: 'bg-amber-100/80 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border border-amber-200/55 dark:border-amber-900/30',
          icon: <AlertTriangle className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />,
          label: 'Atenção Operacional',
        };
      case 'critical':
        return {
          container: 'border-l-4 border-rose-500 bg-rose-50/60 dark:bg-rose-950/10 text-rose-950 dark:text-rose-300 border border-gray-150 dark:border-slate-800/80',
          badge: 'bg-rose-100/80 dark:bg-rose-950/30 text-rose-800 dark:text-rose-400 border border-rose-200/55 dark:border-rose-900/30',
          icon: <ShieldAlert className="h-4.5 w-4.5 text-rose-600 dark:text-rose-400" />,
          label: 'Excedente Crítico',
        };
      default:
        return {
          container: 'border-l-4 border-gray-500 bg-gray-50 dark:bg-[#151D2F] border border-gray-150 dark:border-slate-800',
          badge: 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-300 border-gray-200 dark:border-slate-700',
          icon: <Clock className="h-4.5 w-4.5 text-gray-600 dark:text-slate-400" />,
          label: 'Info',
        };
    }
  };

  const styles = getSeverityStyles(alert.severity);

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'co2_intensity': return 'Intensidade de CO₂';
      case 'renewable_energy': return 'Energia Renovável';
      case 'scrap_percent': return 'Uso de Sucata';
      default: return metric;
    }
  };

  const formattedDate = new Date(alert.timestamp).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div 
      className={`rounded-sm p-3.5 shadow-6xs transition-colors duration-250 ${styles.container} group flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}
      id={`alert-card-${alert.id}`}
    >
      <div className="flex items-start gap-3 justify-start">
        <div className="mt-0.5 shrink-0">
          {styles.icon}
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-xs uppercase tracking-wider text-gray-950 dark:text-white font-mono">
              {alert.plantName}
            </span>
            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${styles.badge}`}>
              {styles.label}
            </span>
            <span className="text-[10px] text-gray-500 dark:text-slate-400 flex items-center gap-1 font-medium font-sans">
              <MapPin className="h-3 w-3 text-gray-400 dark:text-slate-500" />
              {getMetricLabel(alert.metric)}
            </span>
          </div>

          <p className="text-xs text-gray-700 dark:text-slate-300 font-sans leading-relaxed">
            {alert.message}
          </p>

          <span className="text-[9px] text-gray-400 dark:text-slate-500 flex items-center gap-1 font-mono pt-0.5">
            <Clock className="h-2.5 w-2.5" />
            {formattedDate}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end border-t border-gray-150 dark:border-slate-805/80 md:border-t-0 pt-2.5 md:pt-0">
        <div className="text-right">
          <div className="text-[8px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest font-mono">
            Valor Atual
          </div>
          <div className="text-base font-bold font-mono tracking-tight text-gray-900 dark:text-slate-100 flex items-baseline justify-end gap-0.5">
            {alert.value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
            <span className="text-[10px] font-normal text-gray-400 dark:text-slate-500 ml-0.5">{alert.unit}</span>
          </div>
          <div className="text-[9px] text-gray-505 dark:text-slate-450 font-medium">
            Meta: {alert.threshold} {alert.unit}
          </div>
        </div>

        {onSelectPlant && (
          <button
            type="button"
            onClick={() => onSelectPlant(alert.plantId)}
            className="p-1 px-1.5 rounded-sm border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#151D2F] text-gray-550 dark:text-slate-400 hover:text-[#EA580C] dark:hover:text-amber-400 hover:border-gray-300 dark:hover:border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#EA580C] transition-colors shadow-xs cursor-pointer"
            title="Filtrar por esta planta"
            id={`btn-filter-plant-${alert.plantId}`}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
