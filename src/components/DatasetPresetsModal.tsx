import React from 'react';
import { PRESET_DATASETS } from '../data/presets';
import { PresetDataset } from '../types';
import { Sparkles, ArrowRight, X } from 'lucide-react';

interface DatasetPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PresetDataset) => void;
}

export const DatasetPresetsModal: React.FC<DatasetPresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="presets-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="presets-modal-container"
        className="w-full max-w-lg rounded-xl bg-[#161b22] shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0d1117]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                Exemplos de Conjuntos de Dados
              </h3>
              <p className="text-xs text-slate-400">
                Selecione uma sequência para carregar e testar instantaneamente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 rounded-lg p-1.5 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-2.5 overflow-y-auto divide-y divide-slate-800">
          {PRESET_DATASETS.map((preset, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelectPreset(preset);
                onClose();
              }}
              className="pt-2.5 first:pt-0 group cursor-pointer p-3 rounded-lg hover:bg-slate-800/50 border border-transparent hover:border-slate-700 transition-all flex items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200 text-sm group-hover:text-cyan-400 transition-colors">
                    {preset.name}
                  </span>
                  <span className="text-[10px] bg-[#0d1117] text-cyan-300 border border-slate-800 px-1.5 py-0.5 rounded font-mono">
                    {preset.values.length} valores
                  </span>
                </div>
                <p className="text-xs text-slate-400">{preset.description}</p>
                <div className="text-[11px] font-mono text-slate-500 truncate max-w-sm">
                  Ex: {preset.values.slice(0, 8).join(', ')}...
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#0d1117] group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-400 border border-slate-800 group-hover:border-transparent flex items-center justify-center transition-all shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-3.5 bg-[#0d1117] border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
