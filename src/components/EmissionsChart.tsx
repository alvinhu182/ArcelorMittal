/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { MonthlyDataRecord, Plant } from '../types';

interface EmissionsChartProps {
  records: MonthlyDataRecord[];
  selectedPlant: Plant | null;
  metric: 'co2' | 'energy' | 'scrap';
}

export default function EmissionsChart({ records, selectedPlant, metric }: EmissionsChartProps) {
  // Organizar dados por ordem cronológica (ano, mês)
  const sortedRecords = [...records].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  // Agrupar dados por período se "Todas" estiver selecionado,
  // ou filtrar para a unidade selecionada de forma polida.
  const chartData = React.useMemo(() => {
    const monthsName = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    if (selectedPlant) {
      // Filtrar para a usina
      const plantRecords = sortedRecords.filter(r => r.plantId === selectedPlant.id);
      return plantRecords.map(r => ({
        id: r.id,
        period: `${monthsName[r.month - 1]}/${String(r.year).slice(-2)}`,
        co2Intensity: Number(r.co2Intensity.toFixed(3)),
        co2Target: selectedPlant.targetIntensity2030,
        energyMWh: r.energyConsumption,
        renewablePercent: r.renewableEnergyPercent,
        scrapPercent: r.scrapPercent,
        scrapWeight: r.scrapRecycled,
        production: r.production,
      }));
    } else {
      // Consolidar todos (valores médios ponderados pela produção para intensidades)
      const periodMap = new Map<string, {
        co2Total: number;
        prodTotal: number;
        energyTotal: number;
        renewableWeighted: number;
        scrapTotalWeight: number;
        targetWeightSum: number;
        count: number;
      }>();

      sortedRecords.forEach(r => {
        const key = `${r.year}-${r.month}`;
        const current = periodMap.get(key) || {
          co2Total: 0,
          prodTotal: 0,
          energyTotal: 0,
          renewableWeighted: 0,
          scrapTotalWeight: 0,
          targetWeightSum: 0,
          count: 0
        };

        const targetForRecord = 1.45; // Meta média industrial consolidada

        periodMap.set(key, {
          co2Total: current.co2Total + r.co2EmissionsTotal,
          prodTotal: current.prodTotal + r.production,
          energyTotal: current.energyTotal + r.energyConsumption,
          renewableWeighted: current.renewableWeighted + (r.renewableEnergyPercent * r.production),
          scrapTotalWeight: current.scrapTotalWeight + r.scrapRecycled,
          targetWeightSum: current.targetWeightSum + (targetForRecord * r.production),
          count: current.count + 1
        });
      });

      // Converter map em lista ordenada
      const periods = Array.from(periodMap.keys()).sort((a, b) => {
        const [yA, mA] = a.split('-').map(Number);
        const [yB, mB] = b.split('-').map(Number);
        return yA !== yB ? yA - yB : mA - mB;
      });

      return periods.map(p => {
        const val = periodMap.get(p)!;
        const [year, month] = p.split('-').map(Number);
        const intensity = val.prodTotal > 0 ? (val.co2Total / val.prodTotal) : 0;
        const avgRenewable = val.prodTotal > 0 ? (val.renewableWeighted / val.prodTotal) : 0;
        const scrapPercentAvg = val.prodTotal > 0 ? ((val.scrapTotalWeight / val.prodTotal) * 100) : 0;

        return {
          id: p,
          period: `${monthsName[month - 1]}/${String(year).slice(-2)}`,
          co2Intensity: Number(intensity.toFixed(3)),
          co2Target: 1.52, // Média ponderada das usinas da frota
          energyMWh: val.energyTotal,
          renewablePercent: Number(avgRenewable.toFixed(1)),
          scrapPercent: Number(scrapPercentAvg.toFixed(1)),
          scrapWeight: val.scrapTotalWeight,
          production: val.prodTotal
        };
      });
    }
  }, [sortedRecords, selectedPlant]);

  // Se não houver dados, exibir um estado placeholder polido
  if (chartData.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl bg-slate-50 border border-dashed border-slate-200 p-8 text-center" id="chart-no-data">
        <div>
          <p className="text-sm font-medium text-slate-500">Nenhum dado industrial registrado para o período selecionado.</p>
          <p className="text-xs text-slate-400 mt-1">Insira dados operacionais no formulário mensal para ativar os gráficos.</p>
        </div>
      </div>
    );
  }

  // Configuração de Estilo e Escalas conforme Métrica ativa
  const getMetricConfig = () => {
    switch (metric) {
      case 'co2':
        return {
          yLabel: 'tCO₂ / tonelada de aço',
          mainKey: 'co2Intensity',
          mainName: 'Intensidade Atual (tCO₂/t)',
          mainColor: '#E03A11', // Laranja fogo industrial
          hasArea: true,
          areaColor: 'rgba(224, 58, 17, 0.08)',
          hasTarget: true,
          targetKey: 'co2Target',
          targetName: 'Meta Limite de Descarbonização',
          targetColor: '#10B981', // Verde ESG
          tooltipFormatter: (v: number) => [`${v} tCO₂/t`, 'Intensidade'],
        };
      case 'energy':
        return {
          yLabel: '% de Energia Renovável / Total Consumido',
          mainKey: 'renewablePercent',
          mainName: 'Matriz Limpa (%)',
          mainColor: '#0ea5e9', // Azul Elétrico Industrial
          hasArea: true,
          areaColor: 'rgba(14, 165, 233, 0.08)',
          hasTarget: true,
          targetKey: null,
          targetName: 'Alvo Mínimo Renovável (85%)',
          targetColor: '#059669',
          tooltipFormatter: (v: number) => [`${v}%`, 'Matriz de Fontes Renováveis'],
        };
      case 'scrap':
        return {
          yLabel: '% de Sucata na Carga Metálica',
          mainKey: 'scrapPercent',
          mainName: 'Percentual de Reciclagem (%)',
          mainColor: '#f59e0b', // Amarelo/Dourado Ouro
          hasArea: true,
          areaColor: 'rgba(245, 158, 11, 0.08)',
          hasTarget: true,
          targetKey: null,
          targetName: 'Fração ideal metal líquido',
          targetColor: '#dc2626',
          tooltipFormatter: (v: number) => [`${v}%`, 'Percentual de Sucata'],
        };
    }
  };

  const config = getMetricConfig();

  return (
    <div className="w-full h-80 min-h-[320px] pt-4" id="industrial-emissions-chart">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={config.mainColor} stopOpacity={0.15}/>
              <stop offset="95%" stopColor={config.mainColor} stopOpacity={0.0}/>
            </linearGradient>
          </defs>

          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="rgba(148, 163, 184, 0.12)" 
          />

          <XAxis 
            dataKey="period" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'monospace' }}
          />

          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'monospace' }}
            domain={metric === 'co2' ? [0, 'auto'] : [0, 100]}
          />

          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              borderRadius: '8px', 
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            labelStyle={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold' }}
            itemStyle={{ color: '#f8fafc', fontSize: '12px' }}
          />

          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', fontFamily: 'sans-serif', paddingBottom: '10px' }}
          />

          {/* Gráfico de Área para a métrica principal */}
          <Area 
            type="monotone" 
            dataKey={config.mainKey} 
            name={config.mainName}
            stroke={config.mainColor} 
            strokeWidth={2.5}
            fillOpacity={1} 
            fill="url(#metricGradient)" 
          />

          {/* Linha Dinâmica de Meta ou Dotted Line fixa */}
          {metric === 'co2' && config.targetKey && (
            <Line 
              type="step" 
              dataKey={config.targetKey} 
              name={config.targetName}
              stroke={config.targetColor} 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={false}
            />
          )}

          {metric === 'energy' && (
            <ReferenceLine 
              y={85} 
              label={{ 
                value: 'Meta ESG: 85%', 
                fill: '#059669', 
                position: 'top', 
                fontSize: 10,
                fontFamily: 'monospace' 
              }} 
              stroke="#059669" 
              strokeWidth={1.5}
              strokeDasharray="4 4" 
            />
          )}

          {metric === 'scrap' && selectedPlant?.id === 'tubarao' && (
            <ReferenceLine 
              y={20} 
              label={{ 
                value: 'Alvo Sucata: 20%', 
                fill: '#92400e', 
                position: 'top', 
                fontSize: 10,
                fontFamily: 'monospace' 
              }} 
              stroke="#b45309" 
              strokeWidth={1.5}
              strokeDasharray="4 4" 
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
