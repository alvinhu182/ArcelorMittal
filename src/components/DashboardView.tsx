/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { MonthlyDataRecord, Plant, DashboardFilters, SemanticAlert } from '../types';
import { PLANTS, GENERATE_ALERTS } from '../mockData';
import { 
  getCarbonStatus, 
  calculateCarbonAvoided, 
  calculateCarbonCreditSavings, 
  calculateEnergyIntensity, 
  checkXCarbEligibility 
} from '../utils/converters';
import SemanticAlertCard from './SemanticAlertCard';
import EmissionsChart from './EmissionsChart';
import { 
  Building2, 
  Leaf, 
  Percent, 
  Zap, 
  Recycle, 
  Calendar, 
  Filter, 
  Layers, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle,
  PiggyBank,
  FileDown
} from 'lucide-react';
import { generateESGReportPDF } from '../utils/pdfGenerator';

interface DashboardViewProps {
  records: MonthlyDataRecord[];
  filters: DashboardFilters;
  setFilters: React.Dispatch<React.SetStateAction<DashboardFilters>>;
  onFilterPlantDirectly: (plantId: any) => void;
  onNavigateToForm: () => void;
}

export default function DashboardView({ records, filters, setFilters, onFilterPlantDirectly, onNavigateToForm }: DashboardViewProps) {
  // Handler para exportar o relatório de conformidade em PDF
  const handleExportPDF = () => {
    generateESGReportPDF(filteredRecords, stats, filters, activeAlerts);
  };

  // Se não houver dados em todo o banco, exibir um estado vazio amigável e explicativo
  if (records.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-sm p-8 text-center max-w-xl mx-auto my-12 shadow-xs space-y-6" id="dashboard-empty-state">
        <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-[#EA580C]/10 text-[#EA580C]">
          <Leaf className="h-6 w-6 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-tight">SISTEMA APRESENTA ZERO MEDIÇÕES ATIVAS</h2>
          <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
            Bem-vindo à plataforma de compliance ESG ArcelorMittal. O banco de dados física está limpo em modo de produção real. Registre agora os relatórios mensais de aço, CO₂ e energia limpa para habilitar a auditoria e análise de tendência.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 p-4 rounded-sm text-left space-y-2.5 max-w-md mx-auto">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">Como inicializar o monitoramento:</h4>
          <ul className="text-[11px] leading-relaxed text-gray-650 space-y-1.5 list-decimal pl-4 font-medium">
            <li>Navegue até a aba <b className="text-gray-950 font-bold">Inserir Dados</b> no cabeçalho;</li>
            <li>Escolha a usina responsável (ex: <span className="font-mono text-xs">Tubarão, Pecém, Cariacica</span>);</li>
            <li>Insira a produção nacional de aço líquido, as emissões agregadas reais calculadas e o percentual de energia limpa consumido;</li>
            <li>Sincronize o relatório operacional para carregar os gráficos e análises automatizadas de descarbonização do CBAM.</li>
          </ul>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onNavigateToForm}
            className="text-xs font-bold text-white bg-[#EA580C] hover:bg-orange-700 py-2.5 px-6 rounded-sm cursor-pointer uppercase tracking-wider transition-all shadow-xs"
          >
            Cadastrar Primeira Medição
          </button>
        </div>
      </div>
    );
  }

  // Obter planta selecionada ou null para todas
  const selectedPlant = useMemo(() => {
    if (filters.plantId === 'all') return null;
    return PLANTS.find(p => p.id === filters.plantId) || null;
  }, [filters.plantId]);

  // Filtrar registros reais com base nas escolhas
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchPlant = filters.plantId === 'all' || r.plantId === filters.plantId;
      const matchYear = filters.year === 'all' || r.year === filters.year;
      return matchPlant && matchYear;
    });
  }, [records, filters.plantId, filters.year]);

  // Gerar e Filtrar os Alertas
  const activeAlerts = useMemo(() => {
    const allAlerts = GENERATE_ALERTS(records);
    return allAlerts.filter(a => {
      const matchPlant = filters.plantId === 'all' || a.plantId === filters.plantId;
      return matchPlant;
    });
  }, [records, filters.plantId]);

  // Cálculos consolidados para exibição nos KPICards
  const stats = useMemo(() => {
    let totalProd = 0;
    let totalCO2 = 0;
    let totalEnergyMWh = 0;
    let weightedRenewableSum = 0;
    let totalScrapWeight = 0;

    filteredRecords.forEach(r => {
      totalProd += r.production;
      totalCO2 += r.co2EmissionsTotal;
      totalEnergyMWh += r.energyConsumption;
      weightedRenewableSum += (r.renewableEnergyPercent * r.production);
      totalScrapWeight += r.scrapRecycled;
    });

    const averageIntensity = totalProd > 0 ? (totalCO2 / totalProd) : 0;
    const averageRenewable = totalProd > 0 ? (weightedRenewableSum / totalProd) : 0;
    const averageScrapPercent = totalProd > 0 ? ((totalScrapWeight / totalProd) * 100) : 0;

    const co2Avoided = calculateCarbonAvoided(totalScrapWeight);
    const carbonSavings = calculateCarbonCreditSavings(co2Avoided);

    return {
      totalProd,
      totalCO2,
      averageIntensity,
      totalEnergyMWh,
      averageRenewable,
      totalScrapWeight,
      averageScrapPercent,
      co2Avoided,
      carbonSavings
    };
  }, [filteredRecords]);

  return (
    <div className="space-y-4" id="dashboard-view-root">
      
      {/* SEÇÃO 1: FILTROS DE CONTROLE GLOBAL COM DESIGN INDUSTRIAL COMPACTO */}
      <div className="bg-white p-4 rounded-sm border border-gray-200 shadow-xs transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-sm bg-[#EA580C]/10 text-[#EA580C]">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest leading-none">
                Filtros Corporativos
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                Segmentação em tempo real para análises de ESG e auditoria.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full lg:w-auto">
            {/* Filtro Usina */}
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Unidade Produtiva
              </label>
              <select
                value={filters.plantId}
                onChange={(e) => setFilters(prev => ({ ...prev, plantId: e.target.value as any }))}
                className="w-full text-xs font-mono font-medium rounded-sm border border-gray-200 bg-white p-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                id="filter-select-plant"
              >
                <option value="all">FROTAS CONSOLIDADAS (Todas)</option>
                {PLANTS.map(p => (
                  <option key={p.id} value={p.id}>{p.name.toUpperCase()} ({p.location.toUpperCase()})</option>
                ))}
              </select>
            </div>

            {/* Filtro Ano */}
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Exercício Fiscal
              </label>
              <select
                value={filters.year}
                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value === 'all' ? 'all' : Number(e.target.value) }))}
                className="w-full text-xs font-mono font-medium rounded-sm border border-gray-200 bg-white p-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                id="filter-select-year"
              >
                <option value="all">Série Histórica (Todos)</option>
                <option value="2025">Ano Corrente 2025</option>
                <option value="2026">Previsões Meta 2026</option>
              </select>
            </div>

            {/* Selector de Grandeza / Métrica Principal para Gráficos */}
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Grandeza Analítica
              </label>
              <div className="flex bg-gray-100 p-1 rounded-sm border border-gray-200">
                <button
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, metric: 'co2' }))}
                  className={`flex-1 text-[9px] py-1 rounded-sm text-center font-bold tracking-tight transition-colors uppercase ${
                    filters.metric === 'co2' 
                      ? 'bg-[#EA580C] text-white shadow-xs' 
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                  id="btn-metric-co2"
                >
                  CO₂
                </button>
                <button
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, metric: 'energy' }))}
                  className={`flex-1 text-[9px] py-1 rounded-sm text-center font-bold tracking-tight transition-colors uppercase ${
                    filters.metric === 'energy' 
                      ? 'bg-[#EA580C] text-white shadow-xs' 
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                  id="btn-metric-energy"
                >
                  ENERGIA
                </button>
                <button
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, metric: 'scrap' }))}
                  className={`flex-1 text-[9px] py-1 rounded-sm text-center font-bold tracking-tight transition-colors uppercase ${
                    filters.metric === 'scrap' 
                      ? 'bg-[#EA580C] text-white shadow-xs' 
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                  id="btn-metric-scrap"
                >
                  SUCATA
                </button>
              </div>
            </div>

            {/* Ação Industrial: Exportação PDF */}
            <div className="flex flex-col justify-end">
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1 hidden sm:block">
                Controle Externo
              </label>
              <button
                type="button"
                onClick={handleExportPDF}
                className="w-full text-xs font-bold rounded-sm border border-orange-200 bg-orange-50 hover:bg-orange-100 text-[#EA580C] p-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer uppercase tracking-wider shadow-6xs"
                id="btn-export-pdf"
                title="Gera relatório de auditoria ESG em PDF para as usinas e período selecionados"
              >
                <FileDown className="h-4 w-4 shrink-0 text-[#EA580C]" />
                Salvar em PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO 2: CARD DE APRESENTAÇÃO DA USINA FILTRADA - HIGH DENSITY WHITE CARD WITH LEFT ORANGE STRIPE */}
      {selectedPlant && (
        <div className="p-4 bg-white border border-gray-200 border-l-4 border-l-[#EA580C] rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs" id="dashboard-plant-summary">
          <div>
            <div className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-[#EA580C]" />
              <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-bold">Unidade Ativa</span>
            </div>
            <h2 className="text-base font-bold tracking-tight text-gray-950 mt-0.5 uppercase">{selectedPlant.name}</h2>
            <p className="text-xs text-gray-600 mt-0.5 font-medium">
              Planta {selectedPlant.type} — Localizada em <span className="font-semibold text-gray-900">{selectedPlant.location}</span>.
            </p>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-sm border border-gray-200 flex flex-col text-right">
            <span className="text-[9px] uppercase font-mono tracking-widest text-gray-400 font-bold">Capacidade Nominal</span>
            <span className="text-sm font-bold font-mono text-[#EA580C] mt-0.5">{selectedPlant.capacity} Mt/ano</span>
            <span className="text-[9px] text-gray-500 mt-0.5 font-mono">Target 2030: <b className="text-gray-800">{selectedPlant.targetIntensity2030}</b> tCO₂/t</span>
          </div>
        </div>
      )}

      {/* SEÇÃO 3: KPIS - ALTA DENSIDADE / HIGH CONTRAST BENTO BLOCKS  */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-kpis-grid">
        {/* KPI 1: Produção de Aço Líquido */}
        <div className="bg-white p-4 border border-gray-200 rounded-sm shadow-xs flex flex-col justify-between hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Aço Líquido Produzido</span>
            <span className="p-1 rounded-sm bg-gray-100 text-gray-600">
              <Layers className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold font-mono tracking-tight text-gray-900">
              {stats.totalProd.toLocaleString('pt-BR')} 
              <span className="text-xs font-normal text-gray-400 ml-1">t</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              Volume integral registrado
            </p>
          </div>
        </div>

        {/* KPI 2: Intensidade Média de Carbono */}
        <div className="bg-white p-4 border border-gray-200 rounded-sm shadow-xs flex flex-col justify-between hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Carbono por Tonelada</span>
            <span className="p-1 rounded-sm bg-[#EA580C]/10 text-[#EA580C]">
              <Leaf className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold font-mono tracking-tight text-gray-900 flex items-baseline gap-1">
              {stats.averageIntensity.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
              <span className="text-xs font-normal text-gray-400">tCO₂/t</span>
            </div>
            <div className="mt-1">
              {(() => {
                const target = selectedPlant ? selectedPlant.targetIntensity2030 : 1.52;
                const status = getCarbonStatus(stats.averageIntensity, target);
                const isGreenSteel = checkXCarbEligibility(stats.averageIntensity);
                return (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide ${status.color} border ${status.border} shadow-6xs`}>
                      {status.label}
                    </span>
                    {isGreenSteel && (
                      <span className="text-[9px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded-sm border border-sky-100 uppercase tracking-wide">
                        XCarb™ Green
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* KPI 3: Energia Renovável Consumida */}
        <div className="bg-white p-4 border border-gray-200 rounded-sm shadow-xs flex flex-col justify-between hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Matriz de Fonte Limpa</span>
            <span className="p-1 rounded-sm bg-sky-100 text-sky-600">
              <Zap className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold font-mono tracking-tight text-gray-900 flex items-baseline gap-1">
              {stats.averageRenewable.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              <span className="text-xs font-normal text-gray-400">%</span>
            </div>
            <div className="mt-1.5 text-[9px] text-gray-500 flex items-center justify-between">
              <span>Alvo ESG: 85%</span>
              <span className={`font-bold uppercase tracking-wider ${stats.averageRenewable >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {stats.averageRenewable >= 85 ? 'Meta Okay' : 'Abaixo da Meta'}
              </span>
            </div>
            <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden mt-1">
              <div 
                className={`h-full transition-all duration-500 ${
                  stats.averageRenewable >= 85 ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
                style={{ width: `${Math.min(stats.averageRenewable, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 4: Reciclagem de Sucata de Aço */}
        <div className="bg-white p-4 border border-gray-200 rounded-sm shadow-xs flex flex-col justify-between hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fração Metal Reciclado</span>
            <span className="p-1 rounded-sm bg-amber-100 text-amber-600">
              <Recycle className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold font-mono tracking-tight text-gray-900 flex items-baseline gap-1">
              {stats.averageScrapPercent.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              <span className="text-xs font-normal text-gray-400">%</span>
            </div>
            <p className="text-[9px] text-gray-500 mt-0.5 flex flex-wrap items-center gap-x-1.5">
              <span>{stats.totalScrapWeight.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} t recicla.</span>
            </p>
            <div className="mt-1 flex items-center justify-between border-t border-gray-100 pt-1.5 text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
              <span className="flex items-center gap-0.5">
                <CheckCircle className="h-3 w-3" />
                -{stats.co2Avoided.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} tCO₂ evitado
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO 4: GRÁFICO E DETALHES DE EFICIÊNCIA DE ESG */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" id="dashboard-graphics-row">
        {/* Gráfico de Emissões Principal */}
        <div className="lg:col-span-8 bg-white rounded-sm border border-gray-200 p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-150 pb-2.5">
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-1.5 font-sans">
                  <Layers className="h-4 w-4 text-[#EA580C]" />
                  Evolução do Histórico Operacional
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Evolução de {filters.metric === 'co2' ? 'intensidade de carbono' : filters.metric === 'energy' ? 'matriz de fornecimento eólico/solar' : 'taxa de sucata'} nos últimos meses.
                </p>
              </div>

              {/* Informações rápidos do gráfico */}
              <div className="text-[9px] font-mono bg-gray-50 text-gray-500 px-2 py-1 rounded-sm border border-gray-200 flex items-center gap-1 shrink-0 font-bold uppercase">
                <Calendar className="h-3.5 w-3.5 text-[#EA580C]" />
                {filteredRecords.length} medições carregadas
              </div>
            </div>

            {/* Inclusão do EmissionsChart Recharts */}
            <EmissionsChart 
              records={filteredRecords}
              selectedPlant={selectedPlant}
              metric={filters.metric}
            />
          </div>

          {/* Rodapé de Informação do gráfico */}
          <div className="bg-gray-50 p-3 rounded-sm border border-gray-200 text-[10px] leading-relaxed text-gray-600 mt-4 flex items-start gap-2">
            <span className="font-bold text-gray-950 uppercase tracking-wider">Nota:</span>
            <span>
              {filters.metric === 'co2' 
                ? 'Os limites máximos são ponderados para cada planta utilizando a carga térmica real e os combustíveis ativos. A injeção de sucata e hidrogênio aceleram os planos rumo ao Aço Verde.'
                : filters.metric === 'energy' 
                ? 'Os volumes de energia renovável medem o consumo ativo de usinas eólicas contratadas em regime de PPA ou autoprodução solar em Minas Gerais e no Ceará.'
                : 'O refino em Aciarias Elétricas (Cariacica e BM) conta com cargas metálicas acima de 90% compostas de sucata reciclada.'}
            </span>
          </div>
        </div>

        {/* Bloco Lateral de Métricas de Finanças de Carbono (Carbon Price / ESG Impact) - HIGH DENSITY WHITE THEME */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          <div className="p-4 bg-white border border-gray-200 rounded-sm shadow-xs flex-1 flex flex-col justify-between relative overflow-hidden group">
            
            <div className="space-y-3.5">
              <div className="flex items-center gap-1.5">
                <PiggyBank className="h-4 w-4 text-[#EA580C]" />
                <span className="text-[9px] tracking-widest uppercase font-mono text-gray-400 font-bold">Investimentos & Retorno</span>
              </div>
              <h4 className="text-xs font-bold uppercase text-gray-950 tracking-wider">Retorno de Descarbonização</h4>
              <p className="text-[11px] text-gray-600 leading-relaxed font-sans">
                Mensuração teórica de taxas de carbono evitadas graças aos processos otimizados de economia circular nas usinas ArcelorMittal selecionadas.
              </p>

              <div className="space-y-2.5 pt-1">
                <div className="bg-gray-50 p-3 rounded-sm border border-gray-200">
                  <span className="text-[8px] uppercase font-mono tracking-widest text-gray-400 font-bold block">Total de Emissões Evitadas</span>
                  <span className="text-lg font-bold font-mono text-emerald-600 block">{stats.co2Avoided.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} tCO₂e</span>
                </div>

                <div className="bg-gray-50 p-3 rounded-sm border border-gray-200">
                  <span className="text-[8px] uppercase font-mono tracking-widest text-gray-400 font-bold block">Crédito Estimado CBAM / ETS</span>
                  <span className="text-lg font-bold font-mono text-[#EA580C] block">R$ {stats.carbonSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="text-[9px] text-gray-400 font-mono pt-3 mt-3 border-t border-gray-150 leading-snug">
              * Baseado em 80 EUR/ton (EU-ETS / CBAM) estimando taxas futuras sobre a exportação de ferro e aço plano.
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO 5: ALERTAS CRÍTICOS / ATENÇÃO DA DIRETORIA */}
      <div className="bg-white rounded-sm border border-gray-200 p-4 shadow-xs" id="dashboard-alerts-section">
        <div className="flex items-center justify-between border-b border-gray-150 pb-2.5 mb-3">
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-1.5 font-sans">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
              </span>
              Alertas ESG e Desvios Ativos ({activeAlerts.length})
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Notificações geradas automaticamente por inconformidade com os limites globais de metas de emissões.
            </p>
          </div>
        </div>

        {activeAlerts.length > 0 ? (
          <div className="space-y-2.5" id="alerts-mapping-list">
            {activeAlerts.map(alert => (
              <SemanticAlertCard 
                key={alert.id} 
                alert={alert} 
                onSelectPlant={onFilterPlantDirectly}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center bg-gray-50 border border-dashed border-gray-200 rounded-sm" id="no-alerts-placeholder">
            <CheckCircle className="h-6 w-6 text-emerald-500 mb-1.5" />
            <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Unidades Sem Desvios Ativos</h4>
            <p className="text-[11px] text-gray-500 mt-0.5 max-w-sm font-medium">
              Todas as usinas selecionadas encontram-se operando integralmente dentro das conformidades estabelecidas pelo Comitê de Sustentabilidade.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
