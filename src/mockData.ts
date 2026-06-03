/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Plant, MonthlyDataRecord, SemanticAlert } from './types';

// Cadastro de Unidades da ArcelorMittal Brasil
export const PLANTS: Plant[] = [
  {
    id: 'tubarao',
    name: 'ArcelorMittal Tubarão',
    location: 'Serra, ES',
    type: 'Integrada (Alto-Forno)',
    capacity: 7.5,
    targetIntensity2030: 1.62, // tCO₂/t aço (Meta arrojada Descarbonização)
  },
  {
    id: 'pecem',
    name: 'ArcelorMittal Pecém',
    location: 'São Gonçalo do Amarante, CE',
    type: 'Integrada (Alto-Forno)',
    capacity: 3.0,
    targetIntensity2030: 1.70,
  },
  {
    id: 'monlevade',
    name: 'ArcelorMittal João Monlevade',
    location: 'João Monlevade, MG',
    type: 'Integrada (Alto-Forno)',
    capacity: 1.2,
    targetIntensity2030: 1.55,
  },
  {
    id: 'cariacica',
    name: 'ArcelorMittal Cariacica',
    location: 'Cariacica, ES',
    type: 'Semi-integrada (Aciaria Elétrica)',
    capacity: 0.6,
    targetIntensity2030: 0.30, // EAF naturalmente mais baio em CO₂ direto
  },
  {
    id: 'barra_mansa',
    name: 'ArcelorMittal Barra Mansa',
    location: 'Barra Mansa, RJ',
    type: 'Semi-integrada (Aciaria Elétrica)',
    capacity: 0.8,
    targetIntensity2030: 0.32,
  },
];

// Gerador de Histórico Mensal de 2025 a Maio de 2026 (Inicialmente vazio para um sistema real e persistente)
export const INITIAL_MONTHLY_RECORDS: MonthlyDataRecord[] = [];

// Gerador compacto de demonstração para testes rápidos (opcional)
export const getDemoRecords = (): MonthlyDataRecord[] => {
  return [
    {
      id: 'demo-tubarao-01',
      plantId: 'tubarao',
      year: 2026,
      month: 5,
      production: 642000,
      co2EmissionsTotal: 1001500,
      co2Intensity: 1.56,
      energyConsumption: 1284000,
      renewableEnergyPercent: 86,
      scrapRecycled: 166920,
      scrapPercent: 26,
      operatorName: 'Eng. Roberto Silva',
      updatedAt: '2026-06-02T15:45:00Z'
    },
    {
      id: 'demo-pecem-01',
      plantId: 'pecem',
      year: 2026,
      month: 5,
      production: 260000,
      co2EmissionsTotal: 457600,
      co2Intensity: 1.76,
      energyConsumption: 520000,
      renewableEnergyPercent: 58,
      scrapRecycled: 39000,
      scrapPercent: 15,
      operatorName: 'Jane Lima (Coord.)',
      updatedAt: '2026-06-02T16:00:00Z'
    },
    {
      id: 'demo-monlevade-01',
      plantId: 'monlevade',
      year: 2026,
      month: 5,
      production: 104000,
      co2EmissionsTotal: 159120,
      co2Intensity: 1.53,
      energyConsumption: 208000,
      renewableEnergyPercent: 65,
      scrapRecycled: 16640,
      scrapPercent: 16,
      operatorName: 'Sofia Mendes',
      updatedAt: '2026-06-02T09:12:00Z'
    },
    {
      id: 'demo-cariacica-01',
      plantId: 'cariacica',
      year: 2026,
      month: 5,
      production: 56000,
      co2EmissionsTotal: 16240,
      co2Intensity: 0.29,
      energyConsumption: 34720,
      renewableEnergyPercent: 95,
      scrapRecycled: 52640,
      scrapPercent: 94,
      operatorName: 'Técnico Marcos Dias',
      updatedAt: '2026-06-02T13:40:00Z'
    },
    {
      id: 'demo-barra_mansa-01',
      plantId: 'barra_mansa',
      year: 2026,
      month: 5,
      production: 58000,
      co2EmissionsTotal: 17980,
      co2Intensity: 0.31,
      energyConsumption: 35960,
      renewableEnergyPercent: 93,
      scrapRecycled: 52785,
      scrapPercent: 91,
      operatorName: 'Supervisor Nelson Rezende',
      updatedAt: '2026-06-02T11:50:00Z'
    }
  ];
};

// Gerador Estático de Alertas com base nos registros
export const GENERATE_ALERTS = (records: MonthlyDataRecord[]): SemanticAlert[] => {
  const alerts: SemanticAlert[] = [];

  records.forEach((rec) => {
    const plant = PLANTS.find(p => p.id === rec.plantId);
    if (!plant) return;

    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const periodStr = `${monthNames[rec.month - 1]} / ${rec.year}`;

    // Alerta 1: Intensidade de CO₂ acima da Meta de Descarbonização 2030 (Crítico)
    if (rec.co2Intensity > plant.targetIntensity2030) {
      alerts.push({
        id: `alert-co2-${rec.id}`,
        plantId: rec.plantId,
        plantName: plant.name,
        metric: 'co2_intensity',
        value: rec.co2Intensity,
        threshold: plant.targetIntensity2030,
        unit: 'tCO₂/t',
        severity: 'critical',
        message: `A intensidade de carbono (${rec.co2Intensity.toFixed(3)} tCO₂/t) excedeu a meta limite de ${plant.targetIntensity2030} tCO₂/t para ${periodStr}.`,
        timestamp: rec.updatedAt || new Date().toISOString(),
      });
    }

    // Alerta 2: Queda na matriz de Energia Renovável (Atenção / Warning)
    const targetRenewable = plant.type.includes('Elétrica') ? 90 : 85;
    if (rec.renewableEnergyPercent < targetRenewable) {
      alerts.push({
        id: `alert-ren-${rec.id}`,
        plantId: rec.plantId,
        plantName: plant.name,
        metric: 'renewable_energy',
        value: rec.renewableEnergyPercent,
        threshold: targetRenewable,
        unit: '%',
        severity: 'warning',
        message: `Fração renovável de ${rec.renewableEnergyPercent.toFixed(1)}% está abaixo do objetivo central de ${targetRenewable}% estabelecido para ${periodStr}.`,
        timestamp: rec.updatedAt || new Date().toISOString(),
      });
    }

    // Alerta 3: Alta injeção de Sucata / Reciclagem Notável (Incentivo / Safe)
    const targetScrapReward = plant.type.includes('Elétrica') ? 90 : 20;
    if (rec.scrapPercent >= targetScrapReward) {
      alerts.push({
        id: `alert-scrap-${rec.id}`,
        plantId: rec.plantId,
        plantName: plant.name,
        metric: 'scrap_percent',
        value: rec.scrapPercent,
        threshold: targetScrapReward,
        unit: '%',
        severity: 'safe',
        message: `Excelente economia circular: Injeção de sucata obteve ${rec.scrapPercent.toFixed(1)}% no refino em ${periodStr}. Siderurgia circular otimizada.`,
        timestamp: rec.updatedAt || new Date().toISOString(),
      });
    }
  });

  // Ordenar alertas: Críticos primeiro, depois Avisos, depois Conformes
  return alerts.sort((a, b) => {
    const severityWeight: Record<string, number> = { critical: 0, warning: 1, safe: 2 };
    return severityWeight[a.severity] - severityWeight[b.severity];
  });
};
