/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utilitários de Cálculo Industrial e Ambiental (ESG / Aço Verde)
 */

/**
 * Calcula a quantidade estimada de CO₂ evitada (em toneladas) ao usar sucata reciclada
 * em vez de minério de ferro primário e carvão pulverizado em alto-forno.
 * Referência industrial: Cada tonelada de sucata de aço reciclada evita em média 1.5 tCO₂e.
 * 
 * @param scrapWeight Toneladas de sucata reciclada reinseridas
 * @returns Toneladas de CO₂ evitadas
 */
export function calculateCarbonAvoided(scrapWeight: number): number {
  return scrapWeight * 1.54;
}

/**
 * Calcula o custo estimativo de intensidade de energia elétrica por tonelada produzida.
 * 
 * @param energyMWh Consumo de energia em Megawatt-hora
 * @param production Toneladas de aço produzidas
 * @returns MWh/t de aço líquido (Intensidade Energética)
 */
export function calculateEnergyIntensity(energyMWh: number, production: number): number {
  if (production <= 0) return 0;
  return Number((energyMWh / production).toFixed(3));
}

/**
 * Verifica se um lote ou operação se enquadra na classificação XCarb™ da ArcelorMittal.
 * Sistemas com emissão de intensidade reduzida (< 0.60 tCO₂/t) qualificam-se como Aço Verde XCarb™.
 * 
 * @param co2Intensity Intensidade atual de CO₂ (tCO₂/t)
 * @returns boolean elegibilidade
 */
export function checkXCarbEligibility(co2Intensity: number): boolean {
  return co2Intensity <= 0.60;
}

/**
 * Obtém a economia financeira teórica em Créditos de Carbono ou Taxação da UE (CBAM)
 * estimando 85 EUR (ou R$ 480) por tonelada de CO₂ evitada por reciclagem / eficiência.
 * 
 * @param co2AvoidedTonnes Toneladas de CO₂ evitadas
 * @returns Valor estimado em Reais (BRL)
 */
export function calculateCarbonCreditSavings(co2AvoidedTonnes: number): number {
  const euroToBrl = 6.20;
  const carbonPriceEuro = 80; // Preço médio do crédito de carbono na Europa (ETS)
  return co2AvoidedTonnes * carbonPriceEuro * euroToBrl;
}

/**
 * Retorna as cores semânticas para a intensidade de carbono com base na planta
 * e se ela atingiu os limites recomendados ou globais.
 * 
 * @param intensity Intensidade de carbono atual (tCO2/t)
 * @param target Meta de descarbonização da planta (tCO2/t)
 * @returns Objeto com a classe CSS e texto curto de status
 */
export function getCarbonStatus(intensity: number, target: number) {
  const diffPercent = ((intensity - target) / target) * 100;

  if (intensity <= 0.6) {
    return {
      color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20',
      border: 'border-emerald-200 dark:border-emerald-800/40',
      label: 'Ultra Verde (XCarb™)',
      status: 'safe' as const
    };
  }

  if (diffPercent <= 0) {
    return {
      color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/20',
      border: 'border-green-200 dark:border-green-800/30',
      label: 'Dentro da Meta ESG',
      status: 'safe' as const
    };
  } else if (diffPercent <= 10) {
    return {
      color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20',
      border: 'border-amber-200 dark:border-amber-800/30',
      label: 'Esforço de Redução (Alerta)',
      status: 'warning' as const
    };
  } else {
    return {
      color: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/20',
      border: 'border-rose-200 dark:border-rose-800/30',
      label: 'Limite Crítico Excedido',
      status: 'critical' as const
    };
  }
}
