import React from 'react';
import { Command, X, CornerDownLeft, Sparkles, Search, Plus, Sliders } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      action: 'Send Question',
      keys: ['Enter'],
      description: 'Submit your query into the RAG multi-agent pipeline',
      icon: <CornerDownLeft className="w-3.5 h-3.5" />,
    },
    {
      action: 'New Line in Input',
      keys: ['Shift', 'Enter'],
      description: 'Insert a line break without sending the message',
      icon: <CornerDownLeft className="w-3.5 h-3.5" />,
    },
    {
      action: 'Quick Search / Command',
      keys: ['⌘', 'K'],
      keysAlt: ['Ctrl', 'K'],
      description: 'Focus conversation search or start new inquiry',
      icon: <Search className="w-3.5 h-3.5" />,
    },
    {
      action: 'Start New Conversation',
      keys: ['Alt', 'N'],
      description: 'Create a clean new enterprise chat thread',
      icon: <Plus className="w-3.5 h-3.5" />,
    },
    {
      action: 'Cycle Answer Modes',
      keys: ['Alt', 'M'],
      description: 'Toggle between Concise, Detailed, and Summarize',
      icon: <Sliders className="w-3.5 h-3.5" />,
    },
    {
      action: 'Close Any Modal / Dialog',
      keys: ['Esc'],
      description: 'Dismiss open popups, citation cards, or preview sheets',
      icon: <X className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1D2129] rounded-2xl border border-slate-200 dark:border-[#2A2F38] text-slate-900 dark:text-slate-100 max-w-md w-full p-6 shadow-xl animate-in zoom-in-95 duration-200 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-[#2A2F38]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Command className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Keyboard Shortcuts
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Speed up querying, document exploration, and navigation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="my-4 divide-y divide-slate-100 dark:divide-[#2A2F38] max-h-80 overflow-y-auto pr-1">
          {shortcuts.map((sc, i) => (
            <div key={i} className="py-2.5 flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="text-slate-400">{sc.icon}</span>
                  <span>{sc.action}</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {sc.description}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {sc.keys.map((k, idx) => (
                  <kbd
                    key={idx}
                    className="px-2 py-1 text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-2xs"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#2A2F38] text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Designed for power enterprise productivity
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
