import React, { useState } from 'react';
import { FrequencyItem, ChartType, GroupingMode, SortOrder } from '../types';
import { formatNumberDisplay } from '../utils/statistics';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  BarChart2,
  LineChart as LineChartIcon,
  TrendingUp,
  SlidersHorizontal,
  Download,
  Layers,
} from 'lucide-react';

interface FrequencyChartProps {
  data: FrequencyItem[];
  columnName: string;
  targetValue: number | null;
  modeValues: number[];
  groupingMode: GroupingMode;
  onGroupingModeChange: (mode: GroupingMode) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (order: SortOrder) => void;
  totalValidCount: number;
}

export const FrequencyChart: React.FC<FrequencyChartProps> = ({
  data,
  columnName,
  targetValue,
  modeValues,
  groupingMode,
  onGroupingModeChange,
  sortOrder,
  onSortOrderChange,
  totalValidCount,
}) => {
  const [chartType, setChartType] = useState<ChartType>('bar');

  const hasData = data.length > 0;
  const isTargetValid = targetValue !== null && !isNaN(targetValue);

  // Custom tooltip styled for Elegant Dark theme
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item: FrequencyItem = payload[0].payload;
      const isMode = modeValues.includes(item.value);
      const isGreaterOrEqual = isTargetValid ? item.value >= (targetValue as number) : null;

      return (
        <div className="bg-[#161b22] p-3 rounded-lg border border-slate-700 shadow-2xl text-xs space-y-1.5 min-w-52 z-50">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-slate-400 font-medium">Valor (Eixo X):</span>
            <span className="font-bold text-white font-mono text-sm">
              {item.label}
            </span>
          </div>

          <div className="flex items-center justify-between text-cyan-400 font-semibold">
            <span>Ocorrências (Eixo Y):</span>
            <span className="font-mono text-sm bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800 text-cyan-300">
              {item.count} {item.count === 1 ? 'vez' : 'vezes'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span>Frequência Relativa:</span>
            <span className="font-mono font-medium">{item.percentage}%</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span>Frequência Acumulada:</span>
            <span className="font-mono font-medium">
              {item.cumulativeCount} ({item.cumulativePercentage}%)
            </span>
          </div>

          {isTargetValid && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
              <span className="text-slate-400">Posição vs Alvo ({formatNumberDisplay(targetValue)}):</span>
              <span
                className={`font-semibold font-mono px-1.5 py-0.5 rounded ${
                  isGreaterOrEqual
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}
              >
                {isGreaterOrEqual ? '≥ Alvo' : '< Alvo'}
              </span>
            </div>
          )}

          {isMode && (
            <div className="pt-1 text-[11px] text-indigo-300 bg-indigo-950/60 rounded px-1.5 py-0.5 font-medium text-center border border-indigo-800">
              ★ Valor Modal (Maior Frequência)
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const handleExportCSV = () => {
    if (!hasData) return;
    const header = 'Valor,Ocorrencias,Freq_Relativa_Percent,Freq_Acumulada,Posicao_Alvo\n';
    const rows = data
      .map(d => {
        const pos = isTargetValid ? (d.value >= (targetValue as number) ? 'Acima/Igual' : 'Abaixo') : 'N/A';
        return `"${d.label}",${d.count},${d.percentage}%,${d.cumulativeCount},"${pos}"`;
      })
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `distribuicao_frequencia_${columnName.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      id="frequency-chart-container"
      className="bg-[#161b22] rounded-xl border border-slate-800 shadow-xl p-5 flex flex-col space-y-4"
    >
      {/* Chart Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-cyan-400" />
              Gráfico de Distribuição de Frequência
            </h3>
            <span className="text-xs px-2 py-0.5 bg-[#0d1117] text-cyan-300 rounded-md font-mono border border-slate-800">
              X: {columnName} | Y: Ocorrências
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Contagem de repetições de cada valor e análise visual da distribuição
          </p>
        </div>

        {/* View toggles & Chart type selector */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          {/* Chart Type Buttons */}
          <div className="flex items-center bg-[#0d1117] p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              id="chart-type-bar"
              type="button"
              onClick={() => setChartType('bar')}
              title="Gráfico de Barras / Colunas"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                chartType === 'bar'
                  ? 'bg-[#161b22] text-cyan-400 shadow-xs border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Barras</span>
            </button>
            <button
              id="chart-type-area"
              type="button"
              onClick={() => setChartType('area')}
              title="Polígono de Frequência (Área)"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                chartType === 'area'
                  ? 'bg-[#161b22] text-cyan-400 shadow-xs border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Polígono</span>
            </button>
            <button
              id="chart-type-pareto"
              type="button"
              onClick={() => setChartType('pareto')}
              title="Diagrama de Pareto (Frequência + % Acumulada)"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                chartType === 'pareto'
                  ? 'bg-[#161b22] text-cyan-400 shadow-xs border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span>Pareto</span>
            </button>
          </div>

          {/* Export CSV */}
          <button
            id="export-csv-btn"
            type="button"
            disabled={!hasData}
            onClick={handleExportCSV}
            title="Exportar dados de frequência em CSV"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Advanced Chart Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-[#0d1117] p-2.5 rounded-lg border border-slate-800">
        <div className="flex flex-wrap items-center gap-4">
          {/* Mode Switch: Exact vs Binned */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Agrupamento:
            </span>
            <div className="flex items-center gap-1 bg-[#161b22] p-0.5 rounded border border-slate-700">
              <button
                type="button"
                onClick={() => onGroupingModeChange('exact')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  groupingMode === 'exact'
                    ? 'bg-cyan-500 text-[#0f1115] font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Valores Exatos (Discretos)
              </button>
              <button
                type="button"
                onClick={() => onGroupingModeChange('bins')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  groupingMode === 'bins'
                    ? 'bg-cyan-500 text-[#0f1115] font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Intervalos de Classe
              </button>
            </div>
          </div>

          {/* Sort Order Selector */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-400 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Ordem Eixo X:
            </span>
            <select
              value={sortOrder}
              onChange={e => onSortOrderChange(e.target.value as SortOrder)}
              className="bg-[#161b22] border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-200 outline-none font-medium focus:ring-1 focus:ring-cyan-500"
            >
              <option value="value_asc">Valor Crescente (Menor → Maior)</option>
              <option value="value_desc">Valor Decrescente (Maior → Menor)</option>
              <option value="freq_desc">Frequência Maior → Menor</option>
              <option value="freq_asc">Frequência Menor → Maior</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" /> &lt; Alvo
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-cyan-400 inline-block" /> ≥ Alvo
            </span>
          </div>
        </div>
      </div>

      {/* Primary Chart Canvas */}
      {!hasData ? (
        <div className="h-72 flex flex-col items-center justify-center text-slate-500 bg-[#0d1117]/60 rounded-xl border border-dashed border-slate-800 p-6 text-center space-y-2">
          <BarChart2 className="w-10 h-10 text-slate-600 stroke-1" />
          <p className="text-sm font-medium text-slate-300">Nenhum dado numérico para exibir no gráfico</p>
          <p className="text-xs text-slate-500 max-w-sm">
            Digite números na coluna ao lado ou utilize o botão &quot;Colar Valores&quot; para carregar uma sequência.
          </p>
        </div>
      ) : (
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  angle={data.length > 12 ? -35 : 0}
                  textAnchor={data.length > 12 ? 'end' : 'middle'}
                  height={data.length > 12 ? 55 : 30}
                  label={{
                    value: `Valores de ${columnName} (Eixo X)`,
                    position: 'insideBottom',
                    offset: data.length > 12 ? -5 : -15,
                    fontSize: 12,
                    fill: '#94a3b8',
                    fontWeight: 600,
                  }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  allowDecimals={false}
                  tickLine={false}
                  label={{
                    value: 'Número de Ocorrências (Eixo Y)',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 0,
                    fontSize: 12,
                    fill: '#94a3b8',
                    fontWeight: 600,
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                {isTargetValid && (
                  <ReferenceLine
                    x={formatNumberDisplay(targetValue)}
                    stroke="#22d3ee"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{
                      value: `Alvo (${formatNumberDisplay(targetValue)})`,
                      position: 'top',
                      fill: '#22d3ee',
                      fontSize: 11,
                      fontWeight: 'bold',
                    }}
                  />
                )}
                <Bar
                  dataKey="count"
                  name="Ocorrências"
                  radius={[4, 4, 0, 0]}
                  fill="#0891b2"
                >
                  {data.map((entry, index) => {
                    const isGreaterOrEqual = isTargetValid ? entry.value >= (targetValue as number) : true;
                    const isMode = modeValues.includes(entry.value);
                    const barColor = isGreaterOrEqual ? '#06b6d4' : '#f59e0b';
                    const strokeColor = isMode ? '#ffffff' : (isGreaterOrEqual ? '#22d3ee' : '#fbbf24');

                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={barColor}
                        stroke={strokeColor}
                        strokeWidth={isMode ? 2 : 1}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            ) : chartType === 'area' ? (
              <AreaChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
                <defs>
                  <linearGradient id="freqColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  angle={data.length > 12 ? -35 : 0}
                  textAnchor={data.length > 12 ? 'end' : 'middle'}
                  height={data.length > 12 ? 55 : 30}
                  label={{
                    value: `Valores de ${columnName} (Eixo X)`,
                    position: 'insideBottom',
                    offset: data.length > 12 ? -5 : -15,
                    fontSize: 12,
                    fill: '#94a3b8',
                    fontWeight: 600,
                  }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  allowDecimals={false}
                  tickLine={false}
                  label={{
                    value: 'Número de Ocorrências (Eixo Y)',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 0,
                    fontSize: 12,
                    fill: '#94a3b8',
                    fontWeight: 600,
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#22d3ee"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#freqColor)"
                  dot={{ r: 4, fill: '#0891b2', stroke: '#ffffff', strokeWidth: 1.5 }}
                  activeDot={{ r: 6, fill: '#22d3ee' }}
                />
              </AreaChart>
            ) : (
              /* Pareto Chart: Bar + Cumulative % Line */
              <ComposedChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  angle={data.length > 12 ? -35 : 0}
                  textAnchor={data.length > 12 ? 'end' : 'middle'}
                  height={data.length > 12 ? 55 : 30}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#64748b"
                  fontSize={11}
                  allowDecimals={false}
                  tickLine={false}
                  label={{
                    value: 'Ocorrências (Y)',
                    angle: -90,
                    position: 'insideLeft',
                    fontSize: 11,
                    fill: '#94a3b8',
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#c084fc"
                  fontSize={11}
                  unit="%"
                  domain={[0, 100]}
                  tickLine={false}
                  label={{
                    value: '% Acumulada',
                    angle: 90,
                    position: 'insideRight',
                    fontSize: 11,
                    fill: '#c084fc',
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar
                  yAxisId="left"
                  dataKey="count"
                  name="Ocorrências"
                  fill="#0891b2"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumulativePercentage"
                  name="% Acumulada"
                  stroke="#c084fc"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#c084fc' }}
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
