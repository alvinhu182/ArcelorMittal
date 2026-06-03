/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Tipos das Usinas da ArcelorMittal Brasil
export type PlantId = 'tubarao' | 'monlevade' | 'pecem' | 'cariacica' | 'barra_mansa';

export interface Plant {
  id: PlantId;
  name: string;
  location: string;
  type: 'Integrada (Alto-Forno)' | 'Semi-integrada (Aciaria Elétrica)';
  capacity: number; // Mt/ano (Milhões de toneladas por ano)
  targetIntensity2030: number; // tCO₂/t aço
}

// Registro Mensal de Dados Operacionais e ESG
export interface MonthlyDataRecord {
  id: string;
  plantId: PlantId;
  year: number;
  month: number; // 1 to 12
  production: number; // t (Toneladas de aço líquido produzidas)
  co2EmissionsTotal: number; // tCO₂e (Escopo 1 + Escopo 2)
  co2Intensity: number; // tCO₂/t aço (Calculado: co2EmissionsTotal / production)
  energyConsumption: number; // MWh (Consumo total de energia elétrica/combustíveis)
  renewableEnergyPercent: number; // % de energia de fontes renováveis
  scrapRecycled: number; // t (Sucata de metal reciclada reinserida no processo)
  scrapPercent: number; // % de sucata na carga metálica
  operatorName: string;
  updatedAt: string;
}

// Filtros do Painel
export interface DashboardFilters {
  plantId: PlantId | 'all';
  year: number | 'all';
  metric: 'co2' | 'energy' | 'scrap';
}

// Alertas Semânticos do Sistema (ESG Guardrails)
export type AlertSeverity = 'safe' | 'warning' | 'critical';

export interface SemanticAlert {
  id: string;
  plantId: PlantId;
  plantName: string;
  metric: 'co2_intensity' | 'renewable_energy' | 'scrap_percent';
  value: number;
  threshold: number;
  unit: string;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
}
