import React, { useState, useMemo } from 'react';
import { DataRow, GroupingMode, SortOrder } from './types';
import { calculateTargetComparison, calculateFrequencyDistribution, parseNumericValue } from './utils/statistics';
import { PRESET_DATASETS } from './data/presets';
import { SpreadsheetColumn } from './components/SpreadsheetColumn';
import { StatisticsCards } from './components/StatisticsCards';
import { FrequencyChart } from './components/FrequencyChart';
import { PasteModal } from './components/PasteModal';
import {
  Clipboard,
  Eye,
  EyeOff,
  Table,
} from 'lucide-react';

export default function App() {
  // State for editable column name
  const [columnName, setColumnName] = useState<string>('Notas da Prova');

  // State for editable target value (Valor de Interesse)
  const [targetValueInput, setTargetValueInput] = useState<string>('7.0');

  // Visibility state for original spreadsheet data
  const [showRawData, setShowRawData] = useState<boolean>(true);

  // Initial state with sample data
  const [rows, setRows] = useState<DataRow[]>(() => {
    const initialPreset = PRESET_DATASETS[0];
    return initialPreset.values.map((val, idx) => {
      const strVal = String(val);
      return {
        id: `row-${idx}`,
        rawValue: strVal,
        numericValue: typeof val === 'number' ? val : parseNumericValue(strVal),
        isValid: true,
      };
    });
  });

  // Chart configuration state
  const [groupingMode, setGroupingMode] = useState<GroupingMode>('exact');
  const [sortOrder, setSortOrder] = useState<SortOrder>('value_asc');

  // Modal state
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);

  // Parsed target value
  const parsedTargetValue = useMemo(() => {
    return parseNumericValue(targetValueInput);
  }, [targetValueInput]);

  // Compute target comparison statistics (Count >= target, Count < target, %, etc.)
  const comparisonStats = useMemo(() => {
    return calculateTargetComparison(rows, parsedTargetValue);
  }, [rows, parsedTargetValue]);

  // Compute frequency distribution for X (values) and Y (occurrences)
  const frequencyData = useMemo(() => {
    return calculateFrequencyDistribution(rows, groupingMode, undefined, sortOrder);
  }, [rows, groupingMode, sortOrder]);

  // Handle applying pasted data
  const handleApplyPaste = (pastedItems: string[], append: boolean) => {
    const newRows: DataRow[] = pastedItems.map((item, idx) => {
      const num = parseNumericValue(item);
      return {
        id: `pasted-${Date.now()}-${idx}`,
        rawValue: item,
        numericValue: num,
        isValid: item.trim() === '' || num !== null,
      };
    });

    if (append) {
      // Filter out empty rows at the end before appending
      const existingFilled = rows.filter(r => r.rawValue.trim() !== '');
      setRows([...existingFilled, ...newRows]);
    } else {
      setRows(newRows.length > 0 ? newRows : [{ id: 'row-0', rawValue: '', numericValue: null, isValid: true }]);
    }
  };

  // Clear all rows
  const handleClearAll = () => {
    setRows([
      { id: 'row-0', rawValue: '', numericValue: null, isValid: true },
      { id: 'row-1', rawValue: '', numericValue: null, isValid: true },
      { id: 'row-2', rawValue: '', numericValue: null, isValid: true },
    ]);
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-300 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Application Bar - Elegant Dark Navbar */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-slate-800 bg-[#161b22] sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center text-[#0f1115] font-bold text-lg shadow-sm shadow-cyan-500/40">
            Σ
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white flex items-center gap-1.5">
              Análise de notas - Prof. Grossi
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Toggle visibility of original data */}
          <button
            id="toggle-raw-data-btn"
            type="button"
            onClick={() => setShowRawData(!showRawData)}
            title={showRawData ? 'Ocultar planilha de dados originais' : 'Exibir planilha de dados originais'}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all shadow-xs ${
              showRawData
                ? 'bg-[#0d1117] text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                : 'bg-cyan-950/80 text-cyan-300 border-cyan-700/80 hover:bg-cyan-900/80 shadow-cyan-950/40'
            }`}
          >
            {showRawData ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Ocultar Dados Originais</span>
                <span className="sm:hidden">Ocultar</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Exibir Dados Originais</span>
                <span className="sm:hidden">Exibir Dados</span>
              </>
            )}
          </button>

          {/* Paste button */}
          <button
            id="header-paste-btn"
            type="button"
            onClick={() => setIsPasteModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#0f1115] bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-all shadow-md shadow-cyan-950/60"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Colar Sequência</span>
          </button>
        </div>
      </nav>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Excel-style Spreadsheet Column (4 cols on desktop when visible) */}
        {showRawData && (
          <section
            id="spreadsheet-section"
            className="lg:col-span-4 h-[calc(100vh-6.8rem)] min-h-[530px] sticky top-[4.5rem] flex flex-col transition-all duration-300"
          >
            <SpreadsheetColumn
              columnName={columnName}
              onColumnNameChange={setColumnName}
              rows={rows}
              onRowsChange={setRows}
              onOpenPasteModal={() => setIsPasteModalOpen(true)}
              onClearAll={handleClearAll}
            />
          </section>
        )}

        {/* Right Column: Target Value Analysis & Frequency Chart (8 cols when spreadsheet is open, full 12 cols when hidden) */}
        <section
          id="analytics-section"
          className={`${showRawData ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6 transition-all duration-300`}
        >
          {/* Helper banner when original data is hidden */}
          {!showRawData && (
            <div className="bg-[#161b22] border border-slate-800 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-cyan-400" />
                <span>
                  A planilha de dados originais está <strong>oculta</strong>. O rol contém{' '}
                  <strong className="text-white font-mono">{comparisonStats.totalValid}</strong> valores cadastrados.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowRawData(true)}
                className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 transition-colors ml-2 shrink-0"
              >
                Reexibir dados
              </button>
            </div>
          )}

          {/* Target Value Analysis Cards (Valores Acima/Igual vs Abaixo) */}
          <StatisticsCards
            comparison={comparisonStats}
            targetValueInput={targetValueInput}
            onTargetValueInputChange={setTargetValueInput}
            columnName={columnName}
          />

          {/* Recharts Frequency Distribution Chart with Target Line */}
          <FrequencyChart
            data={frequencyData}
            columnName={columnName}
            targetValue={parsedTargetValue}
            modeValues={comparisonStats.modes}
            groupingMode={groupingMode}
            onGroupingModeChange={setGroupingMode}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            totalValidCount={comparisonStats.totalValid}
          />
        </section>
      </main>

      {/* Footer bar */}
      <footer className="bg-[#0d1117] border-t border-slate-800/80 py-2.5 px-6 sm:px-8 flex flex-wrap justify-between items-center text-[10px] text-slate-500 font-mono mt-auto">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>STATUS: PRONTO</span>
        </div>
        <div className="hidden sm:block">COLUNA: {columnName.toUpperCase()}</div>
        <div>ANÁLISE DE NOTAS - PROF. GROSSI</div>
      </footer>

      {/* Modals */}
      <PasteModal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        onApply={handleApplyPaste}
        columnName={columnName}
      />
    </div>
  );
}
