import React from 'react';
import { KnowledgeDocument } from '../../types';
import {
  FileText,
  X,
  Building2,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface DocumentPreviewModalProps {
  document: KnowledgeDocument | null;
  onClose: () => void;
  onInspectIndexing?: (doc: KnowledgeDocument) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  onClose,
  onInspectIndexing,
}) => {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1D2129] rounded-2xl border border-slate-200 dark:border-[#2A2F38] text-slate-900 dark:text-slate-100 max-w-xl w-full p-6 shadow-xl animate-in zoom-in-95 duration-200 transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-[#2A2F38]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {document.name}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium text-slate-700 dark:text-slate-300">{document.type}</span>
                <span>•</span>
                <span>{document.size}</span>
                <span>•</span>
                <span>Updated {document.updatedAt}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#171A21] border border-slate-200/80 dark:border-[#2A2F38]">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              Department
            </div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {document.department}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#171A21] border border-slate-200/80 dark:border-[#2A2F38]">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Vector Embeddings
            </div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {document.chunksCount || 42} chunk vectors
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#171A21] border border-slate-200/80 dark:border-[#2A2F38]">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Index Status
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              {document.status === 'Indexed' && (
                <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Indexed (Active in RAG)
                </span>
              )}
              {document.status === 'Processing' && (
                <span className="text-blue-700 dark:text-blue-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Processing Chunks
                </span>
              )}
              {document.status === 'Failed' && (
                <span className="text-rose-700 dark:text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> Indexing Failed
                </span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#171A21] border border-slate-200/80 dark:border-[#2A2F38]">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-slate-400" />
              Source Ingestion
            </div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {document.uploadedBy || 'Knowledge Admin'}
            </div>
          </div>
        </div>

        {/* Document Overview & Snippet */}
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Summary Description
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#171A21] p-3 rounded-lg border border-slate-200 dark:border-[#2A2F38] leading-relaxed">
              {document.description || 'Enterprise document indexed for grounding organizational AI inquiries.'}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Extracted Knowledge Snippet
            </h4>
            <div className="text-xs font-mono text-slate-200 bg-slate-900 dark:bg-black/60 p-3.5 rounded-lg border border-slate-800 dark:border-[#2A2F38] leading-relaxed whitespace-pre-wrap">
              {document.previewSnippet || 'Section 1.1: Enterprise organizational regulations and authorized operational conduct.'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#2A2F38] flex items-center justify-between">
          {onInspectIndexing ? (
            <button
              type="button"
              onClick={() => onInspectIndexing(document)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-850 bg-purple-50/70 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950 text-xs font-semibold transition cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Inspect Vector Chunks</span>
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
