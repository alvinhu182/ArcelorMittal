/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MonthlyDataRecord, DashboardFilters } from './types';
import { INITIAL_MONTHLY_RECORDS, GENERATE_ALERTS, getDemoRecords } from './mockData';
import DashboardView from './components/DashboardView';
import DataEntryForm from './components/DataEntryForm';
import ArchitectureView from './components/ArchitectureView';
import { 
  Flame, 
  Leaf, 
  BarChart3, 
  PlusCircle, 
  Settings, 
  Network, 
  Info,
  Calendar,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';

export default function App() {
  // Estado do Modo Escuro (Dark Mode)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('arcelormittal_esg_darkmode');
    return saved === 'true';
  });

  // Toggle do dark mode no HTML e salvamento local
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('arcelormittal_esg_darkmode', String(darkMode));
  }, [darkMode]);

  // Estado database central carregado inicialmente a partir de localStorage
  const [records, setRecords] = useState<MonthlyDataRecord[]>(() => {
    const saved = localStorage.getItem('arcelormittal_esg_records');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Falha ao ler registros do localStorage:', e);
      }
    }
    return INITIAL_MONTHLY_RECORDS; // Começa limpo (vazio)
  });

  // Salvar alterações no localStorage reativamente
  useEffect(() => {
    localStorage.setItem('arcelormittal_esg_records', JSON.stringify(records));
  }, [records]);

  // Filtros Globais do Sistema
  const [filters, setFilters] = useState<DashboardFilters>({
    plantId: 'all',
    year: 'all',
    metric: 'co2'
  });

  // Tabulação Ativa
  const [activeTab, setActiveTab] = useState<'dashboard' | 'form' | 'architecture'>('dashboard');

  // Callback de Adição de Mensuração
  const handleAddRecord = (newRecord: MonthlyDataRecord) => {
    setRecords(prev => [newRecord, ...prev]);
  };

  // Callback de Filtragem rápida a partir de Alertas
  const handleFilterPlantDirectly = (plantId: string) => {
    setFilters(prev => ({ ...prev, plantId: plantId as any }));
    setActiveTab('dashboard');
  };

  // Contar alertas gerados ativos
  const alertCount = GENERATE_ALERTS(records).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070A11] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200" id="root-layout-app">
      
      {/* 1. TOP NAVBAR: IDENTIDADE ARCELORMITTAL + DESIGN DE ALTA DENSIDADE */}
      <header className="sticky top-0 z-50 bg-white dark:bg-[#0E1524] border-b border-gray-200 dark:border-slate-800 shadow-xs h-16 flex items-center shrink-0 transition-colors duration-200">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Lado Esquerdo: Identidade Corporativa ArcelorMittal Aço Verde */}
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-8 h-8 bg-[#EA580C] rounded-sm shadow-sm shrink-0">
                <Flame className="h-4 w-4 text-white" />
                <Leaf className="absolute -bottom-0.5 -right-0.5 h-3 w-3 text-emerald-400 bg-[#111827] rounded-full p-0.5 animate-pulse" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">ArcelorMittal</span>
                  <span className="text-[9px] bg-[#EA580C]/10 text-[#EA580C] dark:bg-[#EA580C]/20 dark:text-orange-400 font-extrabold px-1.5 py-0.5 rounded-xs uppercase tracking-widest font-mono">
                    Plataforma ESG
                  </span>
                </div>
                <p className="text-[9px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                  Descarbonização & Guardrails
                </p>
              </div>
            </div>

            {/* Centro / Direita: Tabs de Ação Estilizados Compactos (High Density) */}
            <div className="flex items-center gap-3">
              <nav className="flex space-x-1 bg-gray-100 dark:bg-[#151D2F] p-1 rounded-sm border border-gray-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-sm transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-[#EA580C] text-white shadow-sm'
                      : 'text-gray-650 dark:text-slate-400 hover:text-gray-950 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-slate-800'
                  }`}
                  id="tab-btn-dashboard"
                >
                  <BarChart3 className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden leading-none sm:inline">Dashboard Geral</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-sm transition-all ${
                    activeTab === 'form'
                      ? 'bg-[#EA580C] text-white shadow-sm'
                      : 'text-gray-655 dark:text-slate-400 hover:text-gray-950 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-slate-800'
                  }`}
                  id="tab-btn-form"
                >
                  <PlusCircle className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden leading-none sm:inline">Inserir Dados</span>
                  <span className="h-1 w-1 bg-sky-500 rounded-full animate-pulse" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('architecture')}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-sm transition-all ${
                    activeTab === 'architecture'
                      ? 'bg-[#EA580C] text-white shadow-sm'
                      : 'text-gray-655 dark:text-slate-400 hover:text-gray-950 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-slate-800'
                  }`}
                  id="tab-btn-architecture"
                >
                  <Network className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden leading-none sm:inline">Estrutura SaaS</span>
                </button>
              </nav>

              {/* Botão Seletor de Modo Escuro (Dark Mode Toggle) */}
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 bg-gray-50 dark:bg-[#151D2F] hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-sm border border-gray-200 dark:border-slate-800 cursor-pointer transition-colors"
                title={darkMode ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
                id="theme-toggle-btn"
              >
                {darkMode ? (
                  <Sun className="h-4 w-4 text-amber-500 hover:rotate-45 transition-transform" />
                ) : (
                  <Moon className="h-4 w-4 text-indigo-500" />
                )}
              </button>

              {/* Botões Auxiliares Rápidos / Alerta Geral Badge */}
              <div className="relative p-2 bg-gray-50 dark:bg-[#151D2F] text-gray-500 dark:text-slate-400 rounded-sm border border-gray-200 dark:border-slate-800 hidden sm:block">
                <AlertCircle className="h-4 w-4 text-[#EA580C]" />
                {alertCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[8px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center font-mono shadow-xs">
                    {alertCount}
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* 2. BODY CONTENT AREA */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {/* BANNER INFORMATIVO CORPORATIVO - COMPACTO E RETANGULAR */}
        <div className="mb-4 p-4 bg-white dark:bg-[#0E1524] border border-gray-200 dark:border-slate-800 border-l-4 border-l-[#EA580C] rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-gray-800 dark:text-slate-300 shadow-xs transition-colors duration-200" id="corporate-intro-banner">
          <div className="flex items-start gap-2.5">
            <Info className="h-4 w-4 text-[#EA580C] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase text-[9px] tracking-wider text-gray-400 dark:text-slate-400 block font-mono">Diretriz de Sustentabilidade ArcelorMittal</span>
              <p className="text-gray-700 dark:text-slate-300 mt-0.5 leading-relaxed font-sans">
                Este console monitora os Escopos de Emissões de CO₂ e metas de descarbonização da ArcelorMittal Brasil. Os dados subsidiam relatórios de créditos de carbono, compliance CBAM/EU-ETS e o monitoramento voluntário das metas de <strong>Siderurgia Circular</strong>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#151D2F] p-2 rounded-sm border border-gray-200 dark:border-slate-800 shrink-0 self-start md:self-auto font-mono text-[9px] text-gray-600 dark:text-slate-400 font-bold uppercase tracking-wider">
            <Calendar className="h-3.5 w-3.5 text-[#EA580C]" />
            Ativo — Exercício 2026
          </div>
        </div>

        {/* BARRA DE CONTROLE DE BANCO DE DADOS EM TEMPO DE EXECUÇÃO */}
        <div className="mb-4 px-4 py-2.5 bg-white dark:bg-[#0E1524] border border-gray-200 dark:border-slate-800 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[10px] font-mono shadow-6xs transition-colors duration-200" id="database-manager-bar">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-450 dark:text-slate-400 uppercase tracking-widest text-[9px]">Banco de Dados:</span>
            <span className={`font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide text-[9px] ${
              records.length > 0 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-950/20' 
                : 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-950/20'
            }`}>
              {records.length} {records.length === 1 ? 'REGISTRO ATIVO' : 'REGISTROS ATIVOS'} (PERSISTÊNCIA LOCAL)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Deseja realmente carregar as medições de exemplo? Seus relatórios atuais serão preservados e os dados de exemplo serão adicionados.')) {
                  setRecords(prev => [...getDemoRecords(), ...prev]);
                }
              }}
              className="text-[#EA580C] hover:text-orange-700 dark:hover:text-amber-400 hover:underline font-bold uppercase cursor-pointer"
              title="Anexa 5 registros mensais reais de referência (Maio/2026) para simular o comportamento completo dos gráficos e alertas."
            >
              [+] Carregar Medições Exemplo
            </button>
            <span className="text-gray-300 dark:text-slate-700 hidden sm:inline">|</span>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Tem certeza de que deseja apagar permanentemente TODAS as medições físicas cadastradas? Esta ação limpará todo o seu histórico.')) {
                  setRecords([]);
                }
              }}
              className="text-rose-650 hover:text-rose-800 dark:hover:text-red-400 hover:underline font-bold uppercase cursor-pointer"
              title="Limpa completamente o banco de dados local do seu navegador."
            >
              [-] Limpar Todo o Histórico
            </button>
          </div>
        </div>

        {/* INTERPOLADOR DE VISÕES PRINCIPAIS DE ACORDO COM O TAB SELECIONADO */}
        {activeTab === 'dashboard' && (
          <DashboardView 
            records={records}
            filters={filters}
            setFilters={setFilters}
            onFilterPlantDirectly={handleFilterPlantDirectly}
            onNavigateToForm={() => setActiveTab('form')}
          />
        )}

        {activeTab === 'form' && (
          <DataEntryForm 
            onAddRecord={handleAddRecord}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureView />
        )}

      </main>

      {/* 3. CORE FOOTER - BRANCO COM DETALHE COMPACTO E LIMPO */}
      <footer className="bg-white dark:bg-[#0E1524] text-gray-600 dark:text-slate-400 py-4 border-t border-gray-200 dark:border-slate-800 text-xs mt-6 select-none transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-gray-100 dark:bg-[#151D2F] rounded-sm border border-gray-200 dark:border-slate-800">
              <Flame className="h-3.5 w-3.5 text-[#EA580C]" />
            </div>
            <div>
              <span className="font-bold text-gray-900">ArcelorMittal ESG Center</span>
              <span className="text-[9px] text-gray-400 block">© 2026 ArcelorMittal. Todos os direitos reservados. Auditoria de Alta Densidade.</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono">
            <span className="text-gray-400">Padrão:</span>
            <span className="text-gray-900 font-bold uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded-sm">XCarb™ ESG Framework</span>
            <span className="text-gray-300">|</span>
            <a 
              href="#tab-btn-architecture" 
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('architecture');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-[#EA580C] hover:underline hover:text-orange-700 font-bold uppercase tracking-wide"
            >
              Documentação SaaS
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
