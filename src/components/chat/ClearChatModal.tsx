import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface ClearChatModalProps {
  isOpen: boolean;
  conversationTitle: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const ClearChatModal: React.FC<ClearChatModalProps> = ({
  isOpen,
  conversationTitle,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1D2129] rounded-2xl border border-slate-200 dark:border-[#2A2F38] text-slate-900 dark:text-slate-100 max-w-sm w-full p-6 shadow-xl animate-in zoom-in-95 duration-200 transition-colors">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Clear Conversation?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              "{conversationTitle}"
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
          All messages, retrieved RAG sources, and synthesized answers in this thread will be permanently cleared. This action cannot be undone.
        </p>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#2A2F38] hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Thread</span>
          </button>
        </div>
      </div>
    </div>
  );
};
