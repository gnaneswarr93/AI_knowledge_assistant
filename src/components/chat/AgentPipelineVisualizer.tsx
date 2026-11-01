import React from 'react';
import { Check, Loader2, Sparkles, Bot } from 'lucide-react';
import { AgentStep } from '../../types';

interface AgentPipelineVisualizerProps {
  steps: AgentStep[];
}

export const AgentPipelineVisualizer: React.FC<AgentPipelineVisualizerProps> = ({ steps }) => {
  return (
    <div className="my-3 p-4 rounded-xl bg-blue-50/70 dark:bg-[#1D2129] border border-blue-200/80 dark:border-[#2A2F38] text-slate-800 dark:text-slate-200 shadow-2xs max-w-xl transition-colors">
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-blue-200/60 dark:border-[#2A2F38]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-blue-950 dark:text-blue-300 uppercase tracking-wider">
              RAG Multi-Agent Orchestration
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              Enterprise Knowledge Retrieval & Grounding in progress
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-semibold">
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span>Active Pipeline</span>
        </div>
      </div>

      <div className="space-y-2">
        {steps.map((step) => {
          const isDone = step.status === 'completed';
          const isRunning = step.status === 'running';

          return (
            <div
              key={step.id}
              className={`p-2 rounded-lg text-xs transition-all ${
                isRunning
                  ? 'bg-white dark:bg-blue-950/60 border border-blue-300 dark:border-blue-700 shadow-xs'
                  : isDone
                  ? 'bg-slate-50/60 dark:bg-[#171A21] border border-slate-200/50 dark:border-[#2A2F38]'
                  : 'opacity-50 border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                    {isDone ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center">
                        ✓
                      </span>
                    ) : isRunning ? (
                      <Loader2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                    )}
                  </span>

                  <div className="min-w-0">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {step.agentName}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-1.5">
                      • {step.label}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] font-mono shrink-0 ml-2">
                  {isDone ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                      {step.durationMs ? `${step.durationMs}ms` : 'Done'}
                    </span>
                  ) : isRunning ? (
                    <span className="text-blue-600 dark:text-blue-400 font-medium animate-pulse">
                      Executing...
                    </span>
                  ) : (
                    <span className="text-slate-400">Queued</span>
                  )}
                </div>
              </div>

              {step.description && isRunning && (
                <div className="mt-1 pl-6 text-[10px] text-blue-600 dark:text-blue-300">
                  {step.description}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
