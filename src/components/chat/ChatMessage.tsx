import React, { useState } from 'react';
import { ChatMessage as ChatMessageType, SourceReference, DetailedFeedback } from '../../types';
import { useToast } from '../../context/ToastContext';
import { SourceExcerptModal } from './SourceExcerptModal';
import { FeedbackModal } from './FeedbackModal';
import {
  FileText,
  Copy,
  Check,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  ShieldCheck,
  User as UserIcon,
  Maximize2,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowRight,
  MessageSquarePlus,
  Sliders,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
  onRegenerate?: (messageId: string) => void;
  onFeedback?: (messageId: string, feedback: 'helpful' | 'unhelpful') => void;
  onDetailedFeedback?: (messageId: string, detailedFeedback: DetailedFeedback) => void;
  onSelectFollowUp?: (question: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onRegenerate,
  onFeedback,
  onDetailedFeedback,
  onSelectFollowUp,
}) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Enhancement states
  const [selectedSource, setSelectedSource] = useState<SourceReference | null>(null);
  const [showAgentTrace, setShowAgentTrace] = useState<boolean>(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState<boolean>(false);
  const [pendingRating, setPendingRating] = useState<'helpful' | 'unhelpful'>('helpful');

  const isUser = message.sender === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      showToast('Copied to clipboard.', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleRegenerateClick = async () => {
    if (!onRegenerate) return;
    setIsRegenerating(true);
    try {
      await onRegenerate(message.id);
      showToast('Response regenerated from enterprise index.', 'info');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleThumbsClick = (rating: 'helpful' | 'unhelpful') => {
    onFeedback?.(message.id, rating);
    setPendingRating(rating);
    setFeedbackModalOpen(true);
  };

  if (isUser) {
    return (
      <div className="flex justify-end my-4 animate-in fade-in duration-200">
        <div className="max-w-2xl bg-blue-600 text-white rounded-2xl rounded-tr-xs px-4 py-3 shadow-xs">
          <div className="flex items-center gap-1.5 text-[11px] text-blue-200 font-medium mb-1.5">
            <UserIcon className="w-3 h-3" />
            <span>You</span>
            <span>•</span>
            <span>{message.timestamp}</span>
          </div>

          {message.image && (
            <div className="mb-2 relative rounded-lg overflow-hidden bg-black/20 border border-white/20 group">
              <img
                src={message.image}
                alt={message.imageName || 'Attached document'}
                className="max-h-56 max-w-full rounded-lg object-contain mx-auto"
              />
              <button
                type="button"
                onClick={() => setExpandedImage(message.image || null)}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                title="Expand image"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              {message.imageName && (
                <div className="text-[10px] text-blue-100 px-2 py-1 bg-black/30 truncate">
                  📎 {message.imageName}
                </div>
              )}
            </div>
          )}

          {message.content && (
            <p className="text-sm font-normal whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
          )}
        </div>

        {expandedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
            onClick={() => setExpandedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-xl overflow-hidden p-2">
              <button
                onClick={() => setExpandedImage(null)}
                className="absolute top-4 right-4 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={expandedImage}
                alt="Enlarged view"
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="my-4 animate-in fade-in duration-200">
      <div className="max-w-3xl bg-white dark:bg-[#1D2129] border border-slate-200 dark:border-[#2A2F38] text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-xs p-5 shadow-xs transition-colors">
        {/* Header tag */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-[#2A2F38]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                AI Knowledge Assistant
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-2">
                {message.timestamp}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {message.answerMode && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <Sliders className="w-3 h-3 text-slate-500" />
                Mode: {message.answerMode}
              </span>
            )}

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              Grounded in enterprise knowledge
            </span>
          </div>
        </div>
 
        {/* Message Content */}
        <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-2 whitespace-pre-wrap">
          {message.content}
        </div>

        {/* Sources & Grounding Details */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-[#2A2F38]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Retrieved Sources ({message.sources.length}) • Click to inspect snippet
              </span>

              {message.confidence && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Confidence:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      message.confidence === 'High'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {message.confidence}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {message.sources.map((source, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedSource(source)}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-[#171A21] hover:bg-blue-50/60 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-[#2A2F38] hover:border-blue-300 dark:hover:border-blue-500 text-xs text-slate-700 dark:text-slate-300 text-left transition cursor-pointer group shadow-2xs"
                  title="Click to view raw retrieved text chunk excerpt"
                >
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {source.documentName}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {source.page && <span>Page {source.page}</span>}
                      {source.section && (
                        <>
                          <span>•</span>
                          <span className="truncate">{source.section}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {Math.round((source.relevanceScore || 0.9) * 100)}% Match
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 mt-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Follow-up Questions */}
        {message.followUpQuestions && message.followUpQuestions.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-[#2A2F38]">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              <MessageSquarePlus className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>Suggested Follow-ups</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {message.followUpQuestions.map((fq, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelectFollowUp?.(fq)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 border border-slate-200 dark:border-[#2A2F38] hover:border-blue-300 dark:hover:border-blue-800 transition cursor-pointer text-left flex items-center gap-1.5 group"
                >
                  <span>{fq}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Feedback submitted pill */}
        {message.detailedFeedback && (
          <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#171A21] border border-slate-200 dark:border-[#2A2F38] text-[11px] flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              Feedback recorded: {message.detailedFeedback.tags.join(', ') || message.detailedFeedback.rating}
            </span>
            <span className="text-[10px] text-slate-400">{message.detailedFeedback.timestamp}</span>
          </div>
        )}

        {/* Expandable Multi-Agent Pipeline Trace */}
        {message.processingSteps && message.processingSteps.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#2A2F38]">
            <button
              type="button"
              onClick={() => setShowAgentTrace(!showAgentTrace)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            >
              {showAgentTrace ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              <span>
                {showAgentTrace ? 'Hide Multi-Agent Pipeline Trace' : 'View Multi-Agent Pipeline Trace'}
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                ({message.executionTimeMs ? `${(message.executionTimeMs / 1000).toFixed(2)}s total` : '5 Agents executed'})
              </span>
            </button>

            {showAgentTrace && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#171A21] border border-slate-200 dark:border-[#2A2F38] text-xs space-y-2 animate-in fade-in duration-150">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Sequential Agent Execution Log
                </div>
                {message.processingSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] py-1 border-b last:border-b-0 border-slate-200/50 dark:border-[#2A2F38]">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] flex items-center justify-center font-bold">
                        ✓
                      </span>
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {step.agentName}
                        </span>
                        <span className="text-slate-400 ml-1.5">• {step.label}</span>
                      </div>
                    </div>
                    <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                      {step.durationMs ? `${step.durationMs}ms` : 'Completed'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Response Actions */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-[#2A2F38] text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Copy answer to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {onRegenerate && (
              <button
                onClick={handleRegenerateClick}
                disabled={isRegenerating}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                title="Regenerate answer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </button>
            )}
          </div>

          {/* Feedback buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleThumbsClick('helpful')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs ${
                message.feedback === 'helpful'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Helpful (Click to add detailed feedback)"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Helpful</span>
            </button>

            <button
              onClick={() => handleThumbsClick('unhelpful')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs ${
                message.feedback === 'unhelpful'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Not helpful (Click to add detailed feedback)"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Not Helpful</span>
            </button>
          </div>
        </div>
      </div>

      {/* Source Excerpt Inspect Modal */}
      <SourceExcerptModal
        source={selectedSource}
        onClose={() => setSelectedSource(null)}
      />

      {/* Detailed Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        initialRating={pendingRating}
        onClose={() => setFeedbackModalOpen(false)}
        onSubmit={(detailed) => {
          onDetailedFeedback?.(message.id, detailed);
        }}
      />
    </div>
  );
};
