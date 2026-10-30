import React, { useState } from 'react';
import { parsePastedText, parseNumericValue, formatNumberDisplay } from '../utils/statistics';
import { Clipboard, Check, X, ArrowDown, FileSpreadsheet } from 'lucide-react';

interface PasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (values: string[], append: boolean) => void;
  columnName: string;
}

export const PasteModal: React.FC<PasteModalProps> = ({
  isOpen,
  onClose,
  onApply,
  columnName,
}) => {
  const [pastedText, setPastedText] = useState('');
  const [appendMode, setAppendMode] = useState(false);

  if (!isOpen) return null;

  const parsedItems = parsePastedText(pastedText);
  const validCount = parsedItems.filter(item => parseNumericValue(item) !== null).length;
  const invalidCount = parsedItems.length - validCount;

  const handleApply = () => {
    if (parsedItems.length > 0) {
      onApply(parsedItems, appendMode);
      setPastedText('');
      onClose();
    }
  };

  const handleQuickPasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setPastedText(text);
      }
    } catch {
      // Clipboard API might be restricted in some iframes, textarea works reliably
    }
  };

  return (
    <div
      id="paste-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="paste-modal-container"
        className="w-full max-w-xl rounded-xl bg-[#161b22] shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0d1117]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 flex items-center justify-center">
              <Clipboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                Colar Sequência de Valores
              </h3>
              <p className="text-xs text-slate-400">
                Para a coluna: <span className="font-medium text-cyan-300">{columnName}</span>
              </p>
            </div>
          </div>
          <button
            id="close-paste-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 rounded-lg p-1.5 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Cole aqui os dados copiados do Excel, Bloco de Notas ou CSV:
              </label>
              <button
                type="button"
                onClick={handleQuickPasteFromClipboard}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 hover:underline"
              >
                <Clipboard className="w-3.5 h-3.5" /> Colar da Área de Transferência
              </button>
            </div>
            <textarea
              id="paste-textarea"
              value={pastedText}
              onChange={e => setPastedText(e.target.value)}
              placeholder={`Exemplo (uma linha por valor, ou separados por vírgula/espaço/tabulação):\n10.5\n15,2\n10.5\n8,0\n12.5\n10.5`}
              rows={8}
              autoFocus
              className="w-full rounded-lg border border-slate-700 bg-[#0d1117] p-3 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all resize-none shadow-inner"
            />
          </div>

          {/* Status Preview */}
          {parsedItems.length > 0 && (
            <div className="rounded-lg bg-[#0d1117] border border-slate-800 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                  Valores detectados: <strong className="text-white">{parsedItems.length}</strong>
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400 font-medium">
                    ✓ {validCount} números válidos
                  </span>
                  {invalidCount > 0 && (
                    <span className="text-amber-400 font-medium">
                      ⚠ {invalidCount} não-numéricos
                    </span>
                  )}
                </div>
              </div>

              {/* Sample preview chips */}
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-[#161b22] rounded border border-slate-800">
                {parsedItems.slice(0, 15).map((item, idx) => {
                  const num = parseNumericValue(item);
                  return (
                    <span
                      key={idx}
                      className={`text-xs px-2 py-0.5 rounded font-mono ${
                        num !== null
                          ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/80'
                          : 'bg-amber-950/60 text-amber-300 border border-amber-800/80'
                      }`}
                    >
                      {item} {num !== null ? `(${formatNumberDisplay(num)})` : '✕'}
                    </span>
                  );
                })}
                {parsedItems.length > 15 && (
                  <span className="text-xs text-slate-400 self-center px-1">
                    +{parsedItems.length - 15} mais...
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Options */}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
              <input
                type="radio"
                name="pasteMode"
                checked={!appendMode}
                onChange={() => setAppendMode(false)}
                className="w-4 h-4 text-cyan-500 focus:ring-cyan-500 bg-[#0d1117] border-slate-700"
              />
              <span>Substituir valores existentes</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
              <input
                type="radio"
                name="pasteMode"
                checked={appendMode}
                onChange={() => setAppendMode(true)}
                className="w-4 h-4 text-cyan-500 focus:ring-cyan-500 bg-[#0d1117] border-slate-700"
              />
              <span className="flex items-center gap-1">
                <ArrowDown className="w-3.5 h-3.5 text-cyan-400" /> Anexar ao final
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#0d1117] border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-transparent"
          >
            Cancelar
          </button>
          <button
            id="apply-paste-btn"
            type="button"
            disabled={parsedItems.length === 0}
            onClick={handleApply}
            className={`px-5 py-2 text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-md ${
              parsedItems.length > 0
                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer shadow-cyan-950/60'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
            }`}
          >
            <Check className="w-4 h-4" />
            Aplicar {parsedItems.length > 0 ? `(${parsedItems.length} itens)` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};
