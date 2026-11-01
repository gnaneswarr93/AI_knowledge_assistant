import React from 'react';
import { Files, Users, MessageSquareCode, Database, CheckCircle2 } from 'lucide-react';
import { AdminStats } from '../../types';

interface AdminStatsWidgetProps {
  stats: AdminStats;
}

export const AdminStatsWidget: React.FC<AdminStatsWidgetProps> = ({ stats }) => {
  return (
    <div className="bg-slate-900 dark:bg-[#1D2129] text-white rounded-xl p-4 mb-4 border border-slate-800 dark:border-[#2A2F38] shadow-xs transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800 dark:border-[#2A2F38]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
            Admin System Metrics
          </span>
        </div>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
          RAG Pipeline: Online (Zero Degraded)
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-slate-800/80 dark:bg-[#171A21] rounded-lg p-3 border border-slate-700/60 dark:border-[#2A2F38]">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Files className="w-3.5 h-3.5 text-blue-400" />
            <span>Total Documents</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {stats.totalDocuments}
          </div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-2.5 h-2.5" />
            100% vector indexed
          </div>
        </div>

        <div className="bg-slate-800/80 dark:bg-[#171A21] rounded-lg p-3 border border-slate-700/60 dark:border-[#2A2F38]">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>Total Users</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {stats.totalUsers}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Enterprise Directory
          </div>
        </div>

        <div className="bg-slate-800/80 dark:bg-[#171A21] rounded-lg p-3 border border-slate-700/60 dark:border-[#2A2F38]">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <MessageSquareCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>Total Queries</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {stats.totalQueries.toLocaleString()}
          </div>
          <div className="text-[10px] text-blue-400 flex items-center gap-1 mt-0.5">
            <Database className="w-2.5 h-2.5" />
            {stats.vectorEmbeddingsCount} embeddings
          </div>
        </div>
      </div>
    </div>
  );
};
