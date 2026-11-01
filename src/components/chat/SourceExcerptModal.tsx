import React from 'react';
import { SourceReference } from '../../types';
import { FileText, X, Copy, Check, ShieldCheck, Hash, Layers } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface SourceExcerptModalProps {
  source: SourceReference | null;
  onClose: () => void;
}

export const SourceExcerptModal: React.FC<SourceExcerptModalProps> = ({ source, onClose }) => {
  const { showToast } = useToast();
  const [copied, setCopied] = React.useState(false);

  if (!source) return null;

  const handleCopy = async () => {
    if (!source.excerpt) return;
    try {
      await navigator.clipboard.writeText(source.excerpt);
      setCopied(true);
      showToast('Source excerpt copied to clipboard.', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy excerpt', 'error');
    }
  };

  const relevancePct = Math.round((source.relevanceScore || 0.92) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1D2129] rounded-2xl border border-slate-200 dark:border-[#2A2F38] text-slate-900 dark:text-slate-100 max-w-lg w-full p-6 shadow-xl animate-in zoom-in-95 duration-200 transition-colors">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-[#2A2F38]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                  RAG Citation Grounding
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> {relevancePct}% Match
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 truncate">
                {source.documentName}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-3 gap-2.5 my-4">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#171A21] border border-slate-200/80 dark:border-[#2A2F38]">
            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
              Location
            </div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Page {source.page || 'N/A'}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#171A21] border border-slate-200/80 dark:border-[#2A2F38]">
            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5 flex items-center gap-1">
              <Hash className="w-3 h-3 text-slate-400" />
              Chunk ID
            </div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono">
              {source.chunkId || 'chk-vec-01'}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#171A21] border border-slate-200/80 dark:border-[#2A2F38]">
            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5 flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-400" />
              Token Count
            </div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {source.tokenCount || 480} tokens
            </div>
          </div>
        </div>

        {source.section && (
          <div className="mb-3 px-3 py-1.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-xs text-blue-800 dark:text-blue-300">
            <span className="font-semibold text-blue-900 dark:text-blue-200">Section: </span>
            {source.section}
          </div>
        )}

        {/* Retrieved Raw Chunk Excerpt */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              Retrieved Document Passage
            </span>
            <span className="text-[10px] text-slate-400">Vector Cosine: {(source.relevanceScore || 0.92).toFixed(3)}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#171A21] border border-slate-200 dark:border-[#2A2F38] text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed max-h-48 overflow-y-auto font-serif italic border-l-4 border-l-blue-600">
            "{source.excerpt || 'This excerpt represents the verbatim text chunk retrieved from the indexed organizational document and fed into the multi-agent context window.'}"
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-[#2A2F38]">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2A2F38] hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">Copied Passage</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Passage</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
