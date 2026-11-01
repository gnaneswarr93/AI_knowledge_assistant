import React, { useState } from 'react';
import { KnowledgeDocument, DocumentChunk } from '../../types';
import { Layers, X, Database, Hash, Sparkles, CheckCircle2, ChevronRight, FileText, Cpu } from 'lucide-react';

interface DocumentIndexingModalProps {
  document: KnowledgeDocument | null;
  onClose: () => void;
}

export const DocumentIndexingModal: React.FC<DocumentIndexingModalProps> = ({
  document,
  onClose,
}) => {
  const [selectedChunkIndex, setSelectedChunkIndex] = useState<number>(0);

  if (!document) return null;

  // Fallback sample chunks if document doesn't have custom ones
  const chunks: DocumentChunk[] = document.sampleChunks && document.sampleChunks.length > 0
    ? document.sampleChunks
    : [
        {
          id: `chk-${document.id}-1`,
          chunkIndex: 1,
          page: 1,
          section: 'Executive Summary & Introduction',
          tokenCount: 468,
          embeddingDimension: 768,
          text: document.previewSnippet || 'Enterprise documentation provisions organizational alignment, standard workflows, and compliance enforcement across all regional branches.',
        },
        {
          id: `chk-${document.id}-2`,
          chunkIndex: 2,
          page: 2,
          section: 'Standard Operating Procedures',
          tokenCount: 512,
          embeddingDimension: 768,
          text: 'Core procedural policies mandate review cadences, role-based access authorization, and strict logging of modifications to the corporate record repository.',
        },
        {
          id: `chk-${document.id}-3`,
          chunkIndex: 3,
          page: 3,
          section: 'Compliance & Governance Matrix',
          tokenCount: 445,
          embeddingDimension: 768,
          text: 'Non-compliance triggers automated notification to the departmental compliance lead and requires a corrective action resolution within ten (10) business days.',
        },
      ];

  const activeChunk = chunks[selectedChunkIndex] || chunks[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1D2129] rounded-2xl border border-slate-200 dark:border-[#2A2F38] text-slate-900 dark:text-slate-100 max-w-2xl w-full p-6 shadow-xl animate-in zoom-in-95 duration-200 transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-[#2A2F38]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                  RAG Document Indexing
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Fully Vectorized
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                {document.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Indexing Architecture Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#171A21] border border-slate-200/80 dark:border-[#2A2F38]">
            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
              Total Chunks
            </div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {document.chunksCount || chunks.length} Chunks
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#171A21] border border-slate-200/80 dark:border-[#2A2F38]">
            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
              Chunk Window
            </div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              512 Tokens
            </div>
            <div className="text-[10px] text-slate-400">64 overlap</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#171A21] border border-slate-200/80 dark:border-[#2A2F38]">
            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
              Embedding Model
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              text-emb-004
            </div>
            <div className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">768 dimensions</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#171A21] border border-slate-200/80 dark:border-[#2A2F38]">
            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
              Index Metric
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Cosine (HNSW)
            </div>
            <div className="text-[10px] text-slate-400">M=16, ef=64</div>
          </div>
        </div>

        {/* Interactive Chunk Browser */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Vectorized Chunks Explorer
            </span>
            <span className="text-[11px] text-slate-400">
              Viewing chunk {selectedChunkIndex + 1} of {chunks.length}
            </span>
          </div>

          {/* Chunk selector tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {chunks.map((chk, idx) => (
              <button
                key={chk.id || idx}
                type="button"
                onClick={() => setSelectedChunkIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition cursor-pointer flex items-center gap-1.5 ${
                  selectedChunkIndex === idx
                    ? 'bg-purple-600 text-white shadow-2xs font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Hash className="w-3 h-3" />
                <span>Chunk #{chk.chunkIndex}</span>
                <span className="text-[10px] opacity-80">({chk.tokenCount}t)</span>
              </button>
            ))}
          </div>

          {/* Active Chunk Details */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#171A21] border border-slate-200 dark:border-[#2A2F38] text-xs space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-[#2A2F38]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-purple-600 dark:text-purple-400 font-semibold">
                  {activeChunk.id}
                </span>
                {activeChunk.page && (
                  <span className="text-slate-400">• Page {activeChunk.page}</span>
                )}
                {activeChunk.section && (
                  <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-xs">
                    • {activeChunk.section}
                  </span>
                )}
              </div>
              <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-mono border border-purple-200 dark:border-purple-800">
                dim: {activeChunk.embeddingDimension}
              </span>
            </div>

            <div className="text-slate-800 dark:text-slate-200 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap font-sans text-xs sm:text-sm">
              {activeChunk.text}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-[#2A2F38] text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-purple-600" />
            Chunks mapped into dense embedding vector space for semantic retrieval
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
