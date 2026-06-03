/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { MonthlyDataRecord, Plant, PlantId } from '../types';
import { PLANTS } from '../mockData';
import { getCarbonStatus, checkXCarbEligibility, calculateCarbonAvoided, calculateEnergyIntensity } from '../utils/converters';
import { 
  Building2, 
  Layers, 
  Leaf, 
  Zap, 
  Recycle, 
  User, 
  Calendar, 
  PlusCircle, 
  AlertTriangle, 
  CheckCircle, 
  Sparkles,
  RefreshCw,
  Info
} from 'lucide-react';

interface DataEntryFormProps {
  onAddRecord: (record: MonthlyDataRecord) => void;
  onNavigateToDashboard: () => void;
}

export default function DataEntryForm({ onAddRecord, onNavigateToDashboard }: DataEntryFormProps) {
  // Estados dos Campos do Formulário
  const [plantId, setPlantId] = useState<PlantId>('tubarao');
  const [year, setYear] = useState<number>(2026);
  const [month, setMonth] = useState<number>(6); // Default para o próximo mês do histórico
  const [production, setProduction] = useState<string>('600000');
  const [co2Emissions, setCo2Emissions] = useState<string>('930000');
  const [energyCons, setEnergyCons] = useState<string>('1200000');
  const [renewablePercent, setRenewablePercent] = useState<string>('85');
  const [scrapRecycled, setScrapRecycled] = useState<string>('150000');
  const [operatorName, setOperatorName] = useState<string>('Eng. Marcos Dias');

  // Estados de controle da interface
  const [successInfo, setSuccessInfo] = useState<{
    show: boolean;
    recordId: string;
    intensity: number;
    co2Avoided: number;
  } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Buscar dados da usina selecionada
  const selectedPlant = useMemo(() => {
    return PLANTS.find(p => p.id === plantId)!;
  }, [plantId]);

  // Conversões Numéricas Seguras
  const numProduction = parseFloat(production) || 0;
  const numCo2Emissions = parseFloat(co2Emissions) || 0;
  const numRenewablePercent = parseFloat(renewablePercent) || 0;
  const numScrapRecycled = parseFloat(scrapRecycled) || 0;
  const numEnergyCons = parseFloat(energyCons) || 0;

  // Cálculos reativos instantâneos em tempo de digitação (UX primorosa!)
  const computedIntensity = useMemo(() => {
    if (numProduction <= 0) return 0;
    return Number((numCo2Emissions / numProduction).toFixed(3));
  }, [numProduction, numCo2Emissions]);

  const computedScrapPercent = useMemo(() => {
    if (numProduction <= 0) return 0;
    // Sucata sobre produção total aproximada
    return Number(((numScrapRecycled / numProduction) * 100).toFixed(1));
  }, [numProduction, numScrapRecycled]);

  const computedCO2Avoided = useMemo(() => {
    return calculateCarbonAvoided(numScrapRecycled);
  }, [numScrapRecycled]);

  // Validação dinâmica de metas em tempo de inserção
  const carbonStatus = useMemo(() => {
    return getCarbonStatus(computedIntensity, selectedPlant.targetIntensity2030);
  }, [computedIntensity, selectedPlant.targetIntensity2030]);

  const yearRange = [2025, 2026, 2027];
  const months = [
    { value: 1, name: 'Janeiro' },
    { value: 2, name: 'Fevereiro' },
    { value: 3, name: 'Março' },
    { value: 4, name: 'Abril' },
    { value: 5, name: 'Maio' },
    { value: 6, name: 'Junho' },
    { value: 7, name: 'Julho' },
    { value: 8, name: 'Agosto' },
    { value: 9, name: 'Setembro' },
    { value: 10, name: 'Outubro' },
    { value: 11, name: 'Novembro' },
    { value: 12, name: 'Dezembro' },
  ];

  // Acelerar dados de preenchimento padrão para testes
  const handleLoadDefaults = () => {
    if (plantId === 'tubarao') {
      setProduction('615000');
      setCo2Emissions('953250'); // 1.55 t/t
      setEnergyCons('1230000');
      setRenewablePercent('87');
      setScrapRecycled('159900'); // 26%
    } else if (plantId === 'cariacica') {
      setProduction('54000');
      setCo2Emissions('15660'); // 0.29 t/t
      setEnergyCons('33400');
      setRenewablePercent('94');
      setScrapRecycled('50220'); // 93%
    } else if (plantId === 'pecem') {
      setProduction('250000');
      setCo2Emissions('445000'); // 1.78 t/t
      setEnergyCons('500000');
      setRenewablePercent('60');
      setScrapRecycled('35000'); // 14%
    } else {
      setProduction('102000');
      setCo2Emissions('158100'); // 1.55 t/t
      setEnergyCons('204000');
      setRenewablePercent('64');
      setScrapRecycled('15300'); // 15%
    }
    setValidationError(null);
  };

  // Submissão do Formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validações de Consistência Industrial
    if (numProduction <= 0) {
      setValidationError('A produção física de aço líquido deve ser maior que zero.');
      return;
    }
    if (numCo2Emissions < 0 || numEnergyCons < 0 || numScrapRecycled < 0) {
      setValidationError('Os valores de CO₂, energia ou sucata não podem ser negativos.');
      return;
    }
    if (numRenewablePercent < 0 || numRenewablePercent > 100) {
      setValidationError('O percentual de energia de fontes renováveis deve estar entre 0% e 100%.');
      return;
    }
    if (numScrapRecycled > numProduction * 1.5) {
      setValidationError('O volume de sucata ultrapassa o limite físico plausível da carga metálica (máx 150% da capacidade produzida).');
      return;
    }
    if (!operatorName.trim()) {
      setValidationError('O nome do engenheiro/operador responsável pelo relatório é obrigatório.');
      return;
    }

    const newRecordId = `${plantId}-${year}-${month}-${Date.now().toString().slice(-4)}`;

    const newRecord: MonthlyDataRecord = {
      id: newRecordId,
      plantId,
      year,
      month,
      production: numProduction,
      co2EmissionsTotal: numCo2Emissions,
      co2Intensity: computedIntensity,
      energyConsumption: numEnergyCons,
      renewableEnergyPercent: numRenewablePercent,
      scrapRecycled: numScrapRecycled,
      scrapPercent: computedScrapPercent,
      operatorName: operatorName.trim(),
      updatedAt: new Date().toISOString()
    };

    // Chamar Callback de adição de estado global
    onAddRecord(newRecord);

    // Ativar sucesso
    setSuccessInfo({
      show: true,
      recordId: newRecordId,
      intensity: computedIntensity,
      co2Avoided: computedCO2Avoided,
    });

    // Reset de estado secundário de sucesso após scroll, etc.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4" id="data-entry-form-root">
      
      {/* CARD DE SUCESSO DE AUDITORIA - HIGH DENSITY */}
      {successInfo?.show && (
        <div className="bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-250 dark:border-emerald-900/30 p-4 rounded-sm shadow-6xs text-emerald-950 dark:text-emerald-300 space-y-3 transition-colors" id="form-success-alert">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider leading-none">Dados Enviados com Sucesso!</h4>
              <p className="text-[10px] text-emerald-800 dark:text-emerald-400 mt-1 font-medium">
                Os registros do mês foram catalogados na blockchain interna de metas para auditoria de ESG.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-white dark:bg-[#151D2F] p-3 rounded-sm border border-emerald-100 dark:border-slate-850 text-[11px] text-gray-700 dark:text-slate-300 transition-colors">
            <div>
              <span className="text-[8px] text-gray-400 dark:text-slate-500 block uppercase font-mono font-bold">ID de Auditoria</span>
              <span className="font-mono font-semibold break-all text-gray-900 dark:text-slate-100">{successInfo.recordId}</span>
            </div>
            <div>
              <span className="text-[8px] text-gray-400 dark:text-slate-500 block uppercase font-mono font-bold">Intensidade de Carbono</span>
              <span className="font-semibold text-gray-950 dark:text-white font-mono">
                {successInfo.intensity} tCO₂/t
              </span>
              <span className="ml-1 text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest pl-1">
                {successInfo.intensity <= 0.60 ? 'Certificado XCarb™' : 'Ok'}
              </span>
            </div>
            <div>
              <span className="text-[8px] text-gray-400 dark:text-slate-500 block uppercase font-mono font-bold">CO₂ Evitado por Reciclagem</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                -{successInfo.co2Avoided.toLocaleString('pt-BR')} tCO₂e
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center gap-4 pt-1">
            <button
              type="button"
              onClick={() => {
                setSuccessInfo(null);
              }}
              className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-sm transition-colors shadow-xs cursor-pointer"
              id="btn-dismiss-success-form"
            >
              Inserir Outra Medição
            </button>
            <button
              type="button"
              onClick={onNavigateToDashboard}
              className="text-[10px] text-emerald-755 dark:text-emerald-450 hover:underline font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              Ir ao Painel de Gráficos →
            </button>
          </div>
        </div>
      )}

      {/* DETECTER ERRO DE VALIDACAO */}
      {validationError && (
        <div className="bg-rose-55/70 dark:bg-rose-950/15 border border-rose-250 dark:border-rose-900/30 p-3 rounded-sm text-rose-950 dark:text-rose-300 flex items-start gap-2 text-[11px] transition-colors" id="form-validation-error">
          <AlertTriangle className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold uppercase tracking-wider text-[10px] block">Inconsistência de Medição Detectada:</strong>
            <p className="mt-0.5 font-medium">{validationError}</p>
          </div>
        </div>
      )}

      {/* FORMULÁRIO DE ENTRADA INDUSTRIAL */}
      <div className="bg-white dark:bg-[#0E1524] border border-gray-200 dark:border-slate-800 rounded-sm p-4 shadow-xs transition-colors duration-200">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* CABEÇALHO DO FORMULÁRIO */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-xs font-bold text-gray-950 dark:text-white uppercase tracking-widest flex items-center gap-1.5 leading-none">
                <PlusCircle className="h-4.5 w-4.5 text-[#EA580C]" />
                Lançamento Mensal de Desempenho ESG
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 font-medium">
                Ambiente seguro para operadores registrarem os dados consolidados das usinas de aço.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLoadDefaults}
              className="text-[9px] font-bold font-mono text-[#EA580C] dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/40 px-2.5 py-1.5 rounded-sm flex items-center gap-1 transition-colors self-start sm:self-auto cursor-pointer uppercase tracking-wider animate-pulse hover:animate-none"
              title="Carrega dados pré-calculados típicos da planta para facilitar testes rápidos"
              id="btn-load-defaults"
            >
              <RefreshCw className="h-3 w-3" />
              Simular Valores Típicos de Planta
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* COLUNA ESQUERDA: PARÂMETROS DE CONTROLE & DATA */}
            <div className="md:col-span-4 space-y-3 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-800 md:pr-4 pb-4 md:pb-0">
              <h3 className="text-[9px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <Building2 className="h-3.5 w-3.5" />
                Origem & Período
              </h3>

              {/* Usina */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Planta Siderúrgica ArcelorMittal
                </label>
                <select
                  value={plantId}
                  onChange={(e) => setPlantId(e.target.value as PlantId)}
                  className="w-full text-xs font-mono font-medium rounded-sm border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#151D2F] p-2 text-gray-850 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#EA580C] transition-colors"
                  id="form-select-plant"
                >
                  {PLANTS.map(p => (
                    <option key={p.id} value={p.id} className="dark:bg-[#0E1524]">{p.name.toUpperCase()}</option>
                  ))}
                </select>
                <p className="text-[9px] text-gray-400 dark:text-slate-450 mt-1 font-mono font-medium">
                  Meta 2030 para esta usina: <span className="font-bold text-gray-700 dark:text-slate-300">{selectedPlant.targetIntensity2030} tCO₂/t</span>
                </p>
              </div>

              {/* Período: Ano e Mês */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Ano Fiscal
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full text-xs font-mono rounded-sm border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#151D2F] p-2 text-gray-850 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#EA580C] transition-colors"
                    id="form-select-year"
                  >
                    {yearRange.map(y => (
                      <option key={y} value={y} className="dark:bg-[#0E1524]">{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Mês Fiscal
                  </label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="w-full text-xs font-mono rounded-sm border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#151D2F] p-2 text-gray-855 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#EA580C] transition-colors"
                    id="form-select-month"
                  >
                    {months.map(m => (
                      <option key={m.value} value={m.value} className="dark:bg-[#0E1524]">{m.name.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Operador / Engenheiro Responsável */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Encarregado Técnico (Emitente)
                </label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    placeholder="Nome completo do engenheiro"
                    className="w-full text-xs rounded-sm border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#151D2F] py-2 pl-8 pr-2.5 text-gray-855 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#EA580C] font-semibold transition-colors"
                    id="form-input-operator"
                  />
                </div>
              </div>

            </div>

            {/* COLUNA DIREITA: KPIs E LEITURAS DE PROCESSO FÍSICO */}
            <div className="md:col-span-8 space-y-3.5">
              <h3 className="text-[9px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <Layers className="h-3.5 w-3.5" />
                Dados Físicos de Processo (Mensal)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* 1. Produção de Aço Líquido (t) */}
                <div className="relative p-3 bg-gray-50/50 dark:bg-[#151D2F]/20 border border-gray-200 dark:border-slate-800 rounded-sm space-y-1 transition-colors">
                  <label className="block text-[10px] font-bold text-gray-755 dark:text-slate-300 uppercase tracking-wider">
                    Produção Física (t)
                  </label>
                  <input
                    type="number"
                    value={production}
                    onChange={(e) => setProduction(e.target.value)}
                    className="w-full text-xs font-mono font-medium rounded-sm border border-gray-200 dark:border-slate-805 bg-white dark:bg-[#151D2F] p-2 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#EA580C] transition-colors"
                    id="form-input-production"
                  />
                  <p className="text-[9px] text-gray-400 dark:text-slate-500 font-medium">Ex: 600.000t para integradas, 50.000t para mini-mill.</p>
                </div>

                {/* 2. Emissões CO2 Totais (tCO2e) */}
                <div className="relative p-3 bg-gray-50/50 dark:bg-[#151D2F]/20 border border-gray-200 dark:border-slate-800 rounded-sm space-y-1 transition-colors">
                  <div className="flex justify-between items-center h-3.5">
                    <label className="block text-[10px] font-bold text-gray-755 dark:text-slate-300 uppercase tracking-wider">
                      Emissões de CO₂e (t)
                    </label>
                    {computedIntensity > 0 && (
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${carbonStatus.color} border ${carbonStatus.border}`}>
                        {computedIntensity} t/t
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    value={co2Emissions}
                    onChange={(e) => setCo2Emissions(e.target.value)}
                    className="w-full text-xs font-mono font-medium rounded-sm border border-gray-200 dark:border-slate-805 bg-white dark:bg-[#151D2F] p-2 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#EA580C] transition-colors"
                    id="form-input-co2"
                  />
                  <p className="text-[9px] text-gray-400 dark:text-slate-500 font-medium">Soma de Escopo 1 (Forno) com Escopo 2 (Energia).</p>
                </div>

                {/* 3. Consumo Elétrico Total (MWh) */}
                <div className="relative p-3 bg-gray-50/50 dark:bg-[#151D2F]/20 border border-gray-200 dark:border-slate-800 rounded-sm space-y-1 transition-colors">
                  <label className="block text-[10px] font-bold text-gray-755 dark:text-slate-300 uppercase tracking-wider">
                    Consumo de Energia (MWh)
                  </label>
                  <input
                    type="number"
                    value={energyCons}
                    onChange={(e) => setEnergyCons(e.target.value)}
                    className="w-full text-xs font-mono font-medium rounded-sm border border-gray-200 dark:border-slate-805 bg-white dark:bg-[#151D2F] p-2 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#EA580C] transition-colors"
                    id="form-input-energy"
                  />
                  <p className="text-[9px] text-gray-400 dark:text-slate-500 font-mono font-medium">
                    Índice: {production ? `${calculateEnergyIntensity(numEnergyCons, numProduction)} MWh/t` : '0 MWh/t'}
                  </p>
                </div>

                {/* 4. Energia Renovável Consumida (%) */}
                <div className="relative p-3 bg-gray-50/50 dark:bg-[#151D2F]/20 border border-gray-200 dark:border-slate-800 rounded-sm space-y-1 transition-colors">
                  <div className="flex justify-between items-center h-4">
                    <label className="block text-[10px] font-bold text-gray-755 dark:text-slate-300 uppercase tracking-wider">
                      Fração Renovável (%)
                    </label>
                    <span className={`text-[8px] uppercase tracking-wider font-bold ${numRenewablePercent >= 85 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {numRenewablePercent >= 85 ? 'Meta Okay' : 'Abaixo'}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={renewablePercent}
                    onChange={(e) => setRenewablePercent(e.target.value)}
                    max="100"
                    min="0"
                    className="w-full text-xs font-mono font-medium rounded-sm border border-gray-200 dark:border-slate-805 bg-white dark:bg-[#151D2F] p-2 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#EA580C] transition-colors"
                    id="form-input-renewable"
                  />
                  <p className="text-[9px] text-gray-400 dark:text-slate-500 font-medium">Certificados I-REC ou PPAs auditados.</p>
                </div>

                {/* 5. Sucata Metálica Reciclada (t) */}
                <div className="relative p-3 bg-gray-50/50 dark:bg-[#151D2F]/20 border border-gray-200 dark:border-slate-800 rounded-sm space-y-1 sm:col-span-2 transition-colors">
                  <div className="flex justify-between items-center h-4">
                    <label className="block text-[10px] font-bold text-gray-755 dark:text-slate-300 uppercase tracking-wider">
                      Injeção de Sucata Reciclada (t)
                    </label>
                    {computedScrapPercent > 0 && (
                      <span className="text-[9px] font-mono font-bold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-[#151D2F] px-1.5 py-0.5 rounded-sm uppercase tracking-wider border border-gray-200 dark:border-slate-800">
                        {computedScrapPercent}% carga sucata
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    value={scrapRecycled}
                    onChange={(e) => setScrapRecycled(e.target.value)}
                    className="w-full text-xs font-mono font-medium rounded-sm border border-gray-200 dark:border-slate-805 bg-white dark:bg-[#151D2F] p-2 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#EA580C] transition-colors"
                    id="form-input-scrap"
                  />
                  <p className="text-[9px] text-gray-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                    Evita estimadamente <strong className="text-emerald-600 dark:text-emerald-400 font-mono">-{computedCO2Avoided.toLocaleString('pt-BR')} tCO₂e</strong> por meio de economia circular baseada em refugo metálico.
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* PAINEL DE SÍNTESE DA INTENSIDADE DE EMISSÕES */}
          {numProduction > 0 && (
            <div className={`p-3 rounded-sm border border-dashed text-xs space-y-1.5 mt-3 transition-colors ${
              carbonStatus.status === 'safe' 
                ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-300 dark:border-emerald-900/30' 
                : carbonStatus.status === 'warning' 
                ? 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-300 dark:border-amber-900/30' 
                : 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-300 dark:border-rose-900/30'
            }`}>
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-gray-950 dark:text-white text-[10px]">
                <Leaf className="h-4 w-4 text-[#EA580C]" />
                Diagnóstico de Metas de Descarbonização em Tempo Real (UX Real)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-gray-400 dark:text-slate-500 block text-[9px] uppercase font-mono font-semibold">Pegada Operacional Calculada</span>
                  <span className="text-xs font-bold font-mono text-gray-900 dark:text-slate-100">{computedIntensity} tCO₂ / t de aço</span>
                </div>
                <div>
                  <span className="text-gray-400 dark:text-slate-500 block text-[9px] uppercase font-mono font-semibold">Meta da Planta (2030)</span>
                  <span className="text-xs font-bold font-mono text-gray-900 dark:text-slate-100">{selectedPlant.targetIntensity2030} tCO₂ / t de aço</span>
                </div>
                <div>
                  <span className="text-gray-400 dark:text-slate-500 block text-[9px] uppercase font-mono font-semibold">Desvio versus Objetivo</span>
                  <span className={`text-xs font-bold font-mono ${computedIntensity <= selectedPlant.targetIntensity2030 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {computedIntensity <= selectedPlant.targetIntensity2030 
                      ? 'CONFORME (META ALCANÇADA)' 
                      : `+${(((computedIntensity - selectedPlant.targetIntensity2030)/selectedPlant.targetIntensity2030)*100).toFixed(1)}% ADICIONAL`
                    }
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* BOTÕES DE SUBMISSÃO E ENTRADA */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-gray-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onNavigateToDashboard}
              className="w-full sm:w-auto text-[10px] font-bold text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white py-2 px-4 rounded-sm border border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 transition-colors cursor-pointer uppercase tracking-wider"
            >
              Cancelar e Ver Gráficos
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto text-[10px] font-extrabold text-white bg-[#EA580C] hover:bg-orange-700 focus:outline-none focus:ring-1 focus:ring-orange-500 py-2 px-5 rounded-sm transition-all active:transform active:scale-95 flex items-center justify-center gap-1 cursor-pointer uppercase tracking-wider shadow-xs"
              id="btn-submit-medição"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Sincronizar Relatório Siderúrgico
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
