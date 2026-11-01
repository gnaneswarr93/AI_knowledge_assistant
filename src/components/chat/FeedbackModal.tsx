import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, X, MessageSquare, Check } from 'lucide-react';
import { DetailedFeedback } from '../../types';
import { useToast } from '../../context/ToastContext';

interface FeedbackModalProps {
  isOpen: boolean;
  initialRating: 'helpful' | 'unhelpful';
  onClose: () => void;
  onSubmit: (feedback: DetailedFeedback) => void;
}

const HELPFUL_TAGS = [
  'Accurate citation',
  'Clear & concise',
  'Comprehensive explanation',
  'Grounded in policy',
  'Directly answered query',
];

const UNHELPFUL_TAGS = [
  'Inaccurate citation',
  'Outdated information',
  'Missing key context',
  'Too generic',
  'Incorrect document referenced',
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  initialRating,
  onClose,
  onSubmit,
}) => {
  const { showToast } = useToast();
  const [rating, setRating] = useState<'helpful' | 'unhelpful'>(initialRating);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>('');

  if (!isOpen) return null;

  const currentTags = rating === 'helpful' ? HELPFUL_TAGS : UNHELPFUL_TAGS;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      rating,
      tags: selectedTags,
      comment: comment.trim() || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    showToast('Feedback submitted to AI improvement pipeline.', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1D2129] rounded-2xl border border-slate-200 dark:border-[#2A2F38] text-slate-900 dark:text-slate-100 max-w-md w-full p-6 shadow-xl animate-in zoom-in-95 duration-200 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-[#2A2F38]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Detailed Feedback
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Help tune the RAG retriever and multi-agent synthesis
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

        <form onSubmit={handleSubmit} className="space-y-4 my-4">
          {/* Rating Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Overall Assessment
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setRating('helpful');
                  setSelectedTags([]);
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  rating === 'helpful'
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 shadow-2xs'
                    : 'border-slate-200 dark:border-[#2A2F38] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Accurate & Helpful</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRating('unhelpful');
                  setSelectedTags([]);
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  rating === 'unhelpful'
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 shadow-2xs'
                    : 'border-slate-200 dark:border-[#2A2F38] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Needs Improvement</span>
              </button>
            </div>
          </div>

          {/* Quick Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select all that apply
            </label>
            <div className="flex flex-wrap gap-1.5">
              {currentTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Comment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Additional Details (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What specifically could be improved regarding citations, accuracy, or clarity?"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#2A2F38] bg-slate-50 dark:bg-[#171A21] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#2A2F38]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#2A2F38] hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
