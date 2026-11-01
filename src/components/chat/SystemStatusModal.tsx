import React, { useEffect, useState } from 'react';
import { X, Activity, Server, Cpu, Database, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { systemService } from '../../services/systemService';
import { SystemStatus, SessionInfo } from '../../types';

interface SystemStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemStatusModal: React.FC<SystemStatusModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [isPinging, setIsPinging] = React.useState(false);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [session, setSession] = useState<SessionInfo | null>(null);

  useEffect(() => {
    if (isOpen) {
      systemService.getSystemStatus().then(setStatus).catch(console.error);
      systemService.getSessionInfo().then(setSession).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePing = async () => {
    setIsPinging(true);
    try {
      const start = Date.now();
      await systemService.getSystemStatus();
      const latency = Date.now() - start;
      showToast(`Health check complete: RAG Pipeline operational (${latency}ms).`, 'success');
    } catch {
      showToast('Health check failed', 'error');
    } finally {
      setIsPinging(false);
    }
  };

  if (!status || !session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1D2129] rounded-2xl border border-slate-200 dark:border-[#2A2F38] text-slate-900 dark:text-slate-100 max-w-lg w-full p-6 shadow-xl animate-in zoom-in-95 duration-200 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-[#2A2F38]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  AI Architecture & Connection Status
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Multi-agent RAG pipeline and vector database health
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

        {/* Diagnostics Grid */}
        <div className="my-4 space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#171A21] border border-slate-200/80 dark:border-[#2A2F38]">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>RAG Pipeline</span>
              </div>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Operational
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Simulated Latency: {status.latencyMs}ms
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#171A21] border border-slate-200/80 dark:border-[#2A2F38]">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                <Database className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Vector Index</span>
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {status.vectorDbRecords} Vectors
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                HNSW Cosine ? 768-dim
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#171A21] border border-slate-200/80 dark:border-[#2A2F38] text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-[#2A2F38] pb-1.5">
              <span className="text-slate-500 dark:text-slate-400">Embedding Model</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                {status.embeddingModel}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-[#2A2F38] pb-1.5">
              <span className="text-slate-500 dark:text-slate-400">Active Multi-Agents</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {status.agentsActive} Agents (Query, Retrieval, Re-Rank, Grounding, Synthesis)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Backend API Bridge</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {status.status}
              </span>
            </div>
          </div>

          {/* User Session Details */}
          <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-150 dark:border-blue-900/40 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300 text-[11px] uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Active User Session Info
            </div>

            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="text-slate-500 dark:text-slate-400">Session ID:</span>
              <span className="font-mono text-[11px] font-semibold">{session.sessionId}</span>
            </div>

            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="text-slate-500 dark:text-slate-400">Login Timestamp:</span>
              <span>{session.loginTime}</span>
            </div>

            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="text-slate-500 dark:text-slate-400">Gateway:</span>
              <span className="font-mono text-[11px]">{session.ipAddress}</span>
            </div>

            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="text-slate-500 dark:text-slate-400">Security Layer:</span>
              <span>{session.encryption}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#2A2F38]">
          <button
            type="button"
            onClick={handlePing}
            disabled={isPinging}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2A2F38] hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
            <span>Test Pipeline Ping</span>
          </button>

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
