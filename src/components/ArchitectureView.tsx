/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Folder, File, Code, Network, Database, ShieldCheck, HeartPulse, Sparkles } from 'lucide-react';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  description: string;
  codeSnippet?: string;
  children?: FileNode[];
}

export default function ArchitectureView() {
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);

  const architectureData: FileNode = {
    name: "arcelormittal-esg-dashboard",
    type: "folder",
    description: "Raiz do projeto MVP de Descarbonização e Monitoramento ESG.",
    children: [
      {
        name: "src",
        type: "folder",
        description: "Diretório de código fonte TypeScript principal.",
        children: [
          {
            name: "components",
            type: "folder",
            description: "Componentes encapsulados de alta fidelidade visual.",
            children: [
              {
                name: "EmissionsChart.tsx",
                type: "file",
                description: "Componente Recharts composto. Lida com escalas fluidas de intensidade de CO₂ vs meta limite regional, além das frações de sucata e energia renovável.",
              },
              {
                name: "SemanticAlertCard.tsx",
                type: "file",
                description: "Card de alerta orientado por status (Estável, Alerta, Crítico) com suporte a tags semânticas baseadas em limites de emissões industriais.",
              },
              {
                name: "DashboardView.tsx",
                type: "file",
                description: "Tela principal de monitoramento corporativo, contendo filtros globais de unidades e relatórios rápidos por período.",
              },
              {
                name: "DataEntryForm.tsx",
                type: "file",
                description: "Formulário de lançamento operacional com persistência em estado reativo para alimentar a base de dados de metas do Aço Verde.",
              },
              {
                name: "ArchitectureView.tsx",
                type: "file",
                description: "Este componente. Um visualizador de arquitetura interativo e auto-explicativo do MVP de Engenharia de Software.",
              }
            ]
          },
          {
            name: "utils",
            type: "folder",
            description: "Fórmulas de conversão e lógicas de crédito de carbono de usinas.",
            children: [
              {
                name: "converters.ts",
                type: "file",
                description: "Conversões físicas de emissões de aço. Calcula toneladas de CO₂ evitadas via reciclagem de sucata (1t sucata = 1.54t CO₂ evitada) e valida o selo XCarb™.",
              }
            ]
          },
          {
            name: "types.ts",
            type: "file",
            description: "Contratos de interface estritos em TypeScript para registros mensais, severidade de alertas, IDs de filiais e filtros globais.",
          },
          {
            name: "mockData.ts",
            type: "file",
            description: "Histórico consolidado prévio realístico de 2025 a 2026 para as usinas brasileiras Tubarão, Pecém, Monlevade e Mini-mills Cariacica e Barra Mansa.",
          },
          {
            name: "App.tsx",
            type: "file",
            description: "Ponto de entrada de layout e estado global do aplicativo. Orquestra as visões e a sincronização reativa dos dados.",
          },
          {
            name: "main.tsx",
            type: "file",
            description: "Inicializador e renderizador React 19.",
          },
          {
            name: "index.css",
            type: "file",
            description: "Folha de estilo global integrando as extensões de marca de cores industriais via Tailwind v4.",
          }
        ]
      },
      {
        name: "metadata.json",
        type: "file",
        description: "Controle de permissões e metadados lidos pela infraestrutura de Cloud do AI Studio.",
      },
      {
        name: "package.json",
        type: "file",
        description: "Manifesto de dependências do Node.js, incluindo react, recharts, motion e lucide-react.",
      }
    ]
  };

  // Renderizador recursivo para árvore
  const renderTree = (node: FileNode, depth = 0) => {
    const isFolder = node.type === 'folder';
    return (
      <div key={node.name} style={{ paddingLeft: `${depth * 12}px` }} className="select-none">
        <button
          onClick={() => setSelectedNode(node)}
          className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs font-mono transition-colors text-left w-full ${
            selectedNode?.name === node.name 
              ? 'bg-orange-50 text-orange-900 border-l-2 border-orange-600 dark:bg-orange-950/20 dark:text-orange-200' 
              : 'hover:bg-slate-50 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/40'
          }`}
          id={`arch-node-${node.name.replace('.', '-')}`}
        >
          {isFolder ? (
            <Folder className="h-4 w-4 text-orange-500 shrink-0" />
          ) : (
            <File className="h-4 w-4 text-slate-400 shrink-0" />
          )}
          <span className={isFolder ? 'font-semibold' : ''}>{node.name}</span>
        </button>
        {isFolder && node.children && (
          <div className="border-l border-slate-100 dark:border-slate-800 ml-3.5 my-0.5 space-y-0.5">
            {node.children.map(child => renderTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm p-6" id="architecture-viewer-comp">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Network className="h-5 w-5 text-orange-600" />
            Arquitetura de Pastas & Decisões Técnicas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Explore a estrutura modular do MVP de descarbonização ArcelorMittal.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/10 px-2.5 py-1 rounded-md border border-emerald-100 dark:border-emerald-900/30">
          <ShieldCheck className="h-3 w-3" />
          Clean Industrial Code
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lado Esquerdo: Árvore Interativa */}
        <div className="lg:col-span-5 bg-slate-50/60 dark:bg-slate-950/20 rounded-xl p-4 border border-slate-100 dark:border-slate-800 max-h-[420px] overflow-y-auto">
          <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-3 ml-2">
            Navegador de Arquivos
          </div>
          {renderTree(architectureData)}
        </div>

        {/* Lado Direito: Detalhes da Arquitetura / Arquivo Selecionado */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="bg-slate-50/20 dark:bg-slate-900/10 rounded-xl p-5 border border-slate-100 dark:border-slate-800 flex-1 min-h-[220px]">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {selectedNode.type === 'folder' ? (
                    <Folder className="h-5 w-5 text-orange-500" />
                  ) : (
                    <File className="h-5 w-5 text-slate-400" />
                  )}
                  <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">
                    {selectedNode.name}
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">Resumo Técnico</div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedNode.description}
                  </p>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3 mt-4">
                  <span className="text-[10px] font-mono font-medium text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-100 dark:border-amber-900/20">
                    {selectedNode.type === 'folder' ? 'DIRETÓRIO CONCEITUAL' : 'CÓDIGO INTEGRADO TSX/TS'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <Code className="h-10 w-10 text-orange-400/80 mb-3 animate-pulse" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Estrutura de Grande Escala</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                  Selecione um arquivo ou diretório no menu à esquerda para visualizar sua responsabilidade técnica e papel no monitoramento ESG corporativo.
                </p>
              </div>
            )}
          </div>

          {/* Diretrizes Industriais Gerais em Bento Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div className="p-3 bg-gradient-to-br from-orange-50/40 to-slate-50/20 dark:from-slate-950/20 dark:to-slate-900/15 rounded-xl border border-slate-100 dark:border-slate-800 text-left">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider mb-1">
                <Database className="h-3.5 w-3.5" />
                Durable Local State
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Os dados inseridos no form populam um estado corporativo central em tempo de execução, permitindo ver simulações realistas e imediatas.
              </p>
            </div>

            <div className="p-3 bg-gradient-to-br from-emerald-50/40 to-slate-50/20 dark:from-slate-950/20 dark:to-slate-900/15 rounded-xl border border-slate-100 dark:border-slate-800 text-left">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
                <HeartPulse className="h-3.5 w-3.5" />
                Foco em UI Decarbonização
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Adere aos KPIs do Pacto Global da ArcelorMittal: Redução de emissões, fomento ao uso de sucata (circularidade) e transição de energia limpa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
