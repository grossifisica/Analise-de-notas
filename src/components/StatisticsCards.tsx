import React from 'react';
import { TargetComparisonStats } from '../types';
import { formatNumberDisplay } from '../utils/statistics';
import {
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Equal,
  Layers,
  Maximize2,
  Minimize2,
  Sliders,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface StatisticsCardsProps {
  comparison: TargetComparisonStats;
  targetValueInput: string;
  onTargetValueInputChange: (value: string) => void;
  columnName: string;
}

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({
  comparison,
  targetValueInput,
  onTargetValueInputChange,
  columnName,
}) => {
  const hasData = comparison.totalValid > 0;
  const isTargetValid = comparison.targetValue !== null && !isNaN(comparison.targetValue);

  return (
    <div id="statistics-overview" className="space-y-4">
      {/* Target Value Input & Direct Comparison Hero */}
      <div
        id="target-value-hero-card"
        className="rounded-xl bg-[#161b22] border border-cyan-500/30 p-5 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Header & Description */}
          <div className="space-y-1.5 max-w-md">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-700/60">
                <Target className="w-3 h-3 text-cyan-400" />
                Análise do Rol de Valores
              </span>
              <span className="text-xs text-slate-400 font-medium truncate">
                {columnName}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Valor de Interesse
            </h2>
            <p className="text-xs text-slate-400">
              Defina o valor de corte para calcular quantos itens do rol estão acima/igual ou abaixo.
            </p>
          </div>

          {/* Editable Target Value Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[#0d1117] p-3 rounded-xl border border-cyan-500/40 shadow-inner">
            <div className="flex items-center gap-2 px-2">
              <Sliders className="w-4 h-4 text-cyan-400 shrink-0" />
              <label
                htmlFor="target-value-input"
                className="text-xs font-semibold uppercase tracking-wider text-slate-300 whitespace-nowrap"
              >
                Valor Alvo:
              </label>
            </div>

            <div className="relative flex items-center">
              <input
                id="target-value-input"
                type="text"
                value={targetValueInput}
                onChange={e => onTargetValueInputChange(e.target.value)}
                placeholder="Ex: 10 ou 7,5"
                className="w-36 sm:w-40 bg-[#161b22] border border-cyan-500/60 rounded-lg px-3 py-2 text-lg font-bold font-mono text-cyan-300 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-xs text-center"
              />
            </div>

            {/* Quick Helper Buttons if dataset has values */}
            {hasData && comparison.min !== null && comparison.max !== null && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onTargetValueInputChange(String(comparison.min))}
                  title="Usar valor mínimo do rol"
                  className="px-2 py-1 text-[11px] font-mono bg-[#161b22] hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-700 rounded transition-colors"
                >
                  Mín ({comparison.min})
                </button>
                <button
                  type="button"
                  onClick={() => onTargetValueInputChange(String(comparison.max))}
                  title="Usar valor máximo do rol"
                  className="px-2 py-1 text-[11px] font-mono bg-[#161b22] hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-700 rounded transition-colors"
                >
                  Máx ({comparison.max})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Visual Progress Proportion Bar */}
        {hasData && isTargetValid && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <ArrowDownRight className="w-3.5 h-3.5" /> Abaixo (&lt; {formatNumberDisplay(comparison.targetValue)}): {comparison.percentageLess}%
              </span>
              <span className="text-cyan-400 font-semibold flex items-center gap-1">
                Acima ou Igual (≥ {formatNumberDisplay(comparison.targetValue)}): {comparison.percentageGreaterOrEqual}% <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="h-3 w-full bg-slate-800/80 rounded-full overflow-hidden flex border border-slate-700/60 p-0.5">
              <div
                style={{ width: `${comparison.percentageLess}%` }}
                className="bg-amber-500/90 rounded-l-full transition-all duration-300 relative group"
                title={`Abaixo: ${comparison.countLess} (${comparison.percentageLess}%)`}
              />
              <div
                style={{ width: `${comparison.percentageGreaterOrEqual}%` }}
                className="bg-cyan-400 rounded-r-full transition-all duration-300 relative group"
                title={`Acima ou Igual: ${comparison.countGreaterOrEqual} (${comparison.percentageGreaterOrEqual}%)`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Primary Results: Above/Equal vs Below */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CARD: VALORES ACIMA OU IGUAL AO VALOR DE INTERESSE */}
        <div
          id="stat-greater-equal-card"
          className="relative rounded-xl bg-[#161b22] border border-cyan-500/40 p-5 shadow-lg flex flex-col justify-between overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-950/90 border border-cyan-700/80 text-cyan-300 flex items-center justify-center font-bold">
                ≥
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Rol de Valores
                </span>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  Acima ou Igual (≥ {isTargetValid ? formatNumberDisplay(comparison.targetValue) : '...'})
                </h3>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono font-bold">
              {hasData && isTargetValid ? `${comparison.percentageGreaterOrEqual}%` : '-'}
            </span>
          </div>

          <div className="my-4 flex items-baseline justify-between bg-[#0d1117] p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-xs text-slate-400 font-medium block">
                Total de Ocorrências:
              </span>
              <span
                id="count-greater-equal-value"
                className="text-3xl sm:text-4xl font-bold font-mono text-cyan-400"
              >
                {hasData && isTargetValid ? comparison.countGreaterOrEqual : 0}
              </span>
              <span className="text-xs text-slate-400 font-mono ml-2">
                / {comparison.totalValid} {comparison.totalValid === 1 ? 'valor' : 'valores'}
              </span>
            </div>

            {hasData && isTargetValid && (
              <div className="text-right text-xs font-mono space-y-0.5 text-slate-400 border-l border-slate-800 pl-4">
                <div className="text-cyan-300 font-medium flex items-center justify-end gap-1">
                  <ArrowUpRight className="w-3 h-3 text-cyan-400" />
                  <span>&gt; {formatNumberDisplay(comparison.targetValue)}: <strong>{comparison.countStrictlyGreater}</strong></span>
                </div>
                <div className="text-cyan-300 font-medium flex items-center justify-end gap-1">
                  <Equal className="w-3 h-3 text-cyan-400" />
                  <span>= {formatNumberDisplay(comparison.targetValue)}: <strong>{comparison.countEqual}</strong></span>
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Valores que atingiram ou superaram o valor de interesse.</span>
          </p>
        </div>

        {/* CARD: VALORES ABAIXO DO VALOR DE INTERESSE */}
        <div
          id="stat-less-card"
          className="relative rounded-xl bg-[#161b22] border border-amber-500/40 p-5 shadow-lg flex flex-col justify-between overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-950/90 border border-amber-700/80 text-amber-300 flex items-center justify-center font-bold">
                &lt;
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Rol de Valores
                </span>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  Abaixo (&lt; {isTargetValid ? formatNumberDisplay(comparison.targetValue) : '...'})
                </h3>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-950 border border-amber-800 text-amber-300 font-mono font-bold">
              {hasData && isTargetValid ? `${comparison.percentageLess}%` : '-'}
            </span>
          </div>

          <div className="my-4 flex items-baseline justify-between bg-[#0d1117] p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-xs text-slate-400 font-medium block">
                Total de Ocorrências:
              </span>
              <span
                id="count-less-value"
                className="text-3xl sm:text-4xl font-bold font-mono text-amber-400"
              >
                {hasData && isTargetValid ? comparison.countLess : 0}
              </span>
              <span className="text-xs text-slate-400 font-mono ml-2">
                / {comparison.totalValid} {comparison.totalValid === 1 ? 'valor' : 'valores'}
              </span>
            </div>

            {hasData && isTargetValid && (
              <div className="text-right text-xs font-mono text-slate-400 border-l border-slate-800 pl-4">
                <span className="text-amber-300 font-medium block">
                  Déficit / Restante:
                </span>
                <span className="text-slate-300">
                  {comparison.totalValid - comparison.countLess} restantes
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Valores que ficaram estritamente abaixo do valor de corte.</span>
          </p>
        </div>
      </div>

      {/* Dataset Rol Scope Indicators (Samples, Min, Max, Range) */}
      <div className="grid grid-cols-3 gap-3">
        {/* Total no Rol (N) */}
        <div
          id="stat-count-card"
          className="rounded-lg bg-[#161b22] p-3.5 border border-slate-800 shadow-sm flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Total no Rol (N)
            </span>
            <div className="text-lg sm:text-xl font-bold font-mono text-white mt-0.5">
              {comparison.totalValid} {comparison.totalValid === 1 ? 'amostra' : 'amostras'}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#0d1117] border border-slate-800 flex items-center justify-center text-slate-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        {/* Mínimo do Rol */}
        <div
          id="stat-min-card"
          className="rounded-lg bg-[#161b22] p-3.5 border border-slate-800 shadow-sm flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Menor Valor (Mín)
            </span>
            <div className="text-lg sm:text-xl font-bold font-mono text-white mt-0.5">
              {hasData ? formatNumberDisplay(comparison.min) : '-'}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#0d1117] border border-slate-800 flex items-center justify-center text-slate-400">
            <Minimize2 className="w-4 h-4" />
          </div>
        </div>

        {/* Máximo do Rol */}
        <div
          id="stat-max-card"
          className="rounded-lg bg-[#161b22] p-3.5 border border-slate-800 shadow-sm flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Maior Valor (Máx)
            </span>
            <div className="text-lg sm:text-xl font-bold font-mono text-white mt-0.5">
              {hasData ? formatNumberDisplay(comparison.max) : '-'}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#0d1117] border border-slate-800 flex items-center justify-center text-slate-400">
            <Maximize2 className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
