import React, { useState, useRef, useEffect } from 'react';
import { DataRow } from '../types';
import { parseNumericValue, parsePastedText } from '../utils/statistics';
import {
  Clipboard,
  Trash2,
  Plus,
  ArrowDownAZ,
  ArrowUpAZ,
  RotateCcw,
  Edit2,
  Check,
  Hash,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface SpreadsheetColumnProps {
  columnName: string;
  onColumnNameChange: (newName: string) => void;
  rows: DataRow[];
  onRowsChange: (newRows: DataRow[]) => void;
  onOpenPasteModal: () => void;
  onClearAll: () => void;
}

export const SpreadsheetColumn: React.FC<SpreadsheetColumnProps> = ({
  columnName,
  onColumnNameChange,
  rows,
  onRowsChange,
  onOpenPasteModal,
  onClearAll,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(columnName);
  const [activeCellIndex, setActiveCellIndex] = useState<number | null>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setTitleInput(columnName);
  }, [columnName]);

  const handleTitleSubmit = () => {
    const trimmed = titleInput.trim();
    if (trimmed) {
      onColumnNameChange(trimmed);
    } else {
      setTitleInput(columnName);
    }
    setIsEditingTitle(false);
  };

  const handleCellValueChange = (index: number, val: string) => {
    const updated = [...rows];
    const num = parseNumericValue(val);
    updated[index] = {
      ...updated[index],
      rawValue: val,
      numericValue: num,
      isValid: val.trim() === '' || num !== null,
    };
    onRowsChange(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // If last row, add a new row automatically
      if (index === rows.length - 1) {
        handleAddRow();
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus();
        }, 30);
      } else {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (e.key === 'ArrowDown') {
      if (index < rows.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (e.key === 'ArrowUp') {
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Direct paste support on cell
  const handleCellPaste = (e: React.ClipboardEvent<HTMLInputElement>, startIndex: number) => {
    const clipboardData = e.clipboardData.getData('text');
    if (!clipboardData) return;

    const items = parsePastedText(clipboardData);
    if (items.length > 1) {
      e.preventDefault();
      const updated = [...rows];

      items.forEach((item, i) => {
        const targetIndex = startIndex + i;
        const num = parseNumericValue(item);
        const newRow: DataRow = {
          id: targetIndex < updated.length ? updated[targetIndex].id : `row-${Date.now()}-${targetIndex}`,
          rawValue: item,
          numericValue: num,
          isValid: item.trim() === '' || num !== null,
        };

        if (targetIndex < updated.length) {
          updated[targetIndex] = newRow;
        } else {
          updated.push(newRow);
        }
      });

      onRowsChange(updated);
      const nextFocus = Math.min(startIndex + items.length, updated.length - 1);
      setTimeout(() => {
        inputRefs.current[nextFocus]?.focus();
      }, 30);
    }
  };

  const handleAddRow = () => {
    const newRow: DataRow = {
      id: `row-${Date.now()}-${rows.length}`,
      rawValue: '',
      numericValue: null,
      isValid: true,
    };
    onRowsChange([...rows, newRow]);
  };

  const handleAddMultipleRows = (count: number) => {
    const newRows: DataRow[] = Array.from({ length: count }, (_, i) => ({
      id: `row-${Date.now()}-${rows.length + i}`,
      rawValue: '',
      numericValue: null,
      isValid: true,
    }));
    onRowsChange([...rows, ...newRows]);
  };

  const handleDeleteRow = (index: number) => {
    if (rows.length <= 1) {
      // Clear single row instead of deleting
      handleCellValueChange(0, '');
      return;
    }
    const updated = rows.filter((_, i) => i !== index);
    onRowsChange(updated);
  };

  const handleSort = (ascending: boolean) => {
    // Separate filled and empty rows
    const filled = rows.filter(r => r.rawValue.trim() !== '');
    const empty = rows.filter(r => r.rawValue.trim() === '');

    filled.sort((a, b) => {
      const aVal = a.numericValue;
      const bVal = b.numericValue;
      if (aVal === null && bVal === null) return a.rawValue.localeCompare(b.rawValue);
      if (aVal === null) return 1;
      if (bVal === null) return -1;
      return ascending ? aVal - bVal : bVal - aVal;
    });

    onRowsChange([...filled, ...empty]);
  };

  const filledCount = rows.filter(r => r.rawValue.trim() !== '').length;
  const validCount = rows.filter(r => r.numericValue !== null).length;
  const activeRow = activeCellIndex !== null && activeCellIndex < rows.length ? rows[activeCellIndex] : null;

  return (
    <div
      id="spreadsheet-column-panel"
      className="flex flex-col h-full bg-[#161b22] rounded-xl border border-slate-800 shadow-xl overflow-hidden"
    >
      {/* Header Toolbar (Excel Style) */}
      <div className="bg-[#0d1117] border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950/60 text-cyan-300 rounded-md border border-cyan-800/60 text-xs font-semibold">
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
            <span>Coluna A</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            ({validCount} válidos / {filledCount} total)
          </span>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-1">
          <button
            id="open-paste-modal-btn"
            type="button"
            onClick={onOpenPasteModal}
            title="Colar sequência de valores (Ctrl+V ou clicar)"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-cyan-400 bg-[#161b22] hover:bg-cyan-950/50 border border-cyan-900/60 hover:border-cyan-700 rounded-md transition-colors shadow-xs"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Colar Valores</span>
          </button>

          <button
            id="sort-asc-btn"
            type="button"
            onClick={() => handleSort(true)}
            title="Ordenar valores em ordem crescente (A-Z / 0-9)"
            className="p-1 text-slate-300 hover:text-white bg-[#161b22] hover:bg-slate-800 border border-slate-700/80 rounded-md transition-colors shadow-xs"
          >
            <ArrowDownAZ className="w-3.5 h-3.5" />
          </button>

          <button
            id="sort-desc-btn"
            type="button"
            onClick={() => handleSort(false)}
            title="Ordenar valores em ordem decrescente (Z-A / 9-0)"
            className="p-1 text-slate-300 hover:text-white bg-[#161b22] hover:bg-slate-800 border border-slate-700/80 rounded-md transition-colors shadow-xs"
          >
            <ArrowUpAZ className="w-3.5 h-3.5" />
          </button>

          <button
            id="clear-all-rows-btn"
            type="button"
            onClick={onClearAll}
            title="Limpar todos os valores da coluna"
            className="p-1 text-rose-400 hover:text-rose-300 bg-[#161b22] hover:bg-rose-950/40 border border-slate-700/80 hover:border-rose-800/80 rounded-md transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Formula Bar (Excel fx Bar) */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0d1117]/80 border-b border-slate-800 text-xs font-mono text-slate-300">
        <div className="flex items-center justify-center px-2 py-0.5 bg-[#161b22] border border-slate-700 rounded text-cyan-400 font-semibold min-w-10 text-center">
          {activeCellIndex !== null ? `A${activeCellIndex + 1}` : 'A1'}
        </div>
        <span className="text-slate-500 font-serif italic text-sm select-none">fx</span>
        <div className="flex-1 bg-[#161b22] border border-slate-700 rounded px-2 py-0.5 text-slate-200 truncate h-6 flex items-center">
          {activeRow ? (
            activeRow.rawValue !== '' ? (
              <span className="flex items-center gap-2">
                <span>{activeRow.rawValue}</span>
                {activeRow.numericValue !== null ? (
                  <span className="text-cyan-400 text-[11px]">
                    = {activeRow.numericValue}
                  </span>
                ) : (
                  <span className="text-rose-400 text-[11px] flex items-center gap-0.5">
                    <AlertCircle className="w-3 h-3" /> não numérico
                  </span>
                )}
              </span>
            ) : (
              <span className="text-slate-500 italic">Célula vazia</span>
            )
          ) : (
            <span className="text-slate-500 italic">Selecione uma célula</span>
          )}
        </div>
      </div>

      {/* Column Name Header (Editable Excel Column Header) */}
      <div className="bg-[#161b22] border-b border-slate-800 flex items-stretch">
        <div className="w-12 bg-[#0d1117] border-r border-slate-800 flex items-center justify-center text-xs font-semibold text-slate-500 select-none">
          <Hash className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <div className="flex-1 px-3 py-2 flex items-center justify-between group">
          {isEditingTitle ? (
            <div className="flex items-center gap-1.5 w-full">
              <input
                id="edit-column-name-input"
                type="text"
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleTitleSubmit();
                  if (e.key === 'Escape') {
                    setTitleInput(columnName);
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
                placeholder="Nome da Coluna..."
                className="flex-1 bg-[#0d1117] border border-cyan-500 rounded px-2 py-1 text-xs font-bold text-cyan-200 outline-none shadow-xs"
              />
              <button
                type="button"
                onClick={handleTitleSubmit}
                className="p-1 bg-cyan-500 text-[#0f1115] font-bold rounded hover:bg-cyan-400"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              className="flex items-center justify-between w-full cursor-pointer select-none"
              onClick={() => setIsEditingTitle(true)}
              title="Clique para editar o nome da coluna"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 truncate">
                  {columnName}
                </span>
                <span className="text-[10px] text-slate-500 font-normal">
                  (Eixo X dos Valores)
                </span>
              </div>
              <Edit2 className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>
      </div>

      {/* Spreadsheet Grid Rows */}
      <div
        id="spreadsheet-grid-body"
        className="flex-1 overflow-y-auto min-h-64 divide-y divide-slate-800/60 font-mono text-xs bg-[#0d1117]"
      >
        {rows.map((row, index) => {
          const isInvalid = !row.isValid && row.rawValue.trim() !== '';
          const isFocused = activeCellIndex === index;

          return (
            <div
              key={row.id}
              className={`flex items-stretch hover:bg-slate-800/40 transition-colors group ${
                isFocused ? 'bg-cyan-950/30' : ''
              }`}
            >
              {/* Row Number Header */}
              <div
                className={`w-12 flex items-center justify-center border-r border-slate-800 text-slate-500 font-semibold select-none text-[11px] ${
                  isFocused ? 'bg-cyan-950/80 text-cyan-300 font-bold border-r border-cyan-800' : 'bg-[#0d1117]'
                }`}
              >
                {index + 1}
              </div>

              {/* Cell Input */}
              <div className="flex-1 relative flex items-center">
                <input
                  ref={el => {
                    inputRefs.current[index] = el;
                  }}
                  id={`cell-row-${index + 1}`}
                  type="text"
                  value={row.rawValue}
                  onFocus={() => setActiveCellIndex(index)}
                  onChange={e => handleCellValueChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(e, index)}
                  onPaste={e => handleCellPaste(e, index)}
                  placeholder={index === 0 && rows.length === 1 ? 'Digite ou cole valores aqui...' : ''}
                  className={`w-full h-8 px-3 text-xs bg-transparent border-0 outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-slate-800/50 text-slate-200 placeholder:text-slate-600 ${
                    isInvalid ? 'bg-rose-950/30 text-rose-300 font-semibold' : ''
                  }`}
                />

                {/* Status indicator on cell */}
                {isInvalid && (
                  <div
                    title="Valor não numérico. Use números como 10, 15.5 ou 15,5"
                    className="absolute right-8 text-rose-400"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Delete row button on hover */}
                <button
                  type="button"
                  onClick={() => handleDeleteRow(index)}
                  title="Excluir linha"
                  className="opacity-0 group-hover:opacity-100 px-2 text-slate-500 hover:text-rose-400 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Spreadsheet Footer Toolbar (Add rows) */}
      <div className="bg-[#0d1117] border-t border-slate-800 p-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <button
            id="add-single-row-btn"
            type="button"
            onClick={handleAddRow}
            className="flex items-center gap-1 px-2.5 py-1 font-medium text-slate-300 bg-[#161b22] hover:bg-slate-800 border border-slate-700 rounded-md transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Linha</span>
          </button>
          <button
            id="add-10-rows-btn"
            type="button"
            onClick={() => handleAddMultipleRows(10)}
            className="px-2 py-1 text-slate-400 hover:text-slate-200 bg-[#161b22] hover:bg-slate-800 border border-slate-700 rounded-md transition-colors shadow-xs"
          >
            +10
          </button>
          <button
            id="add-50-rows-btn"
            type="button"
            onClick={() => handleAddMultipleRows(50)}
            className="px-2 py-1 text-slate-400 hover:text-slate-200 bg-[#161b22] hover:bg-slate-800 border border-slate-700 rounded-md transition-colors shadow-xs"
          >
            +50
          </button>
        </div>

        <span className="text-[11px] text-slate-500">
          Dica: <kbd className="px-1 py-0.5 bg-[#161b22] border border-slate-700 rounded text-slate-400 font-mono text-[10px]">Enter</kbd> para próxima
        </span>
      </div>
    </div>
  );
};
