import React, { useState } from 'react';
import { Conversation } from '../../types';
import { Download, Copy, Check, X, FileCode, FileText, FileJson } from 'lucide-react';
import { chatService } from '../../services/chatService';
import { useToast } from '../../context/ToastContext';

interface ChatExportModalProps {
  isOpen: boolean;
  conversation: Conversation | null;
  onClose: () => void;
}

export const ChatExportModal: React.FC<ChatExportModalProps> = ({
  isOpen,
  conversation,
  onClose,
}) => {
  const { showToast } = useToast();
  const [selectedFormat, setSelectedFormat] = useState<'markdown' | 'text' | 'json'>('markdown');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !conversation) return null;

  const handleDownload = () => {
    const content = chatService.exportConversation(conversation, selectedFormat);
    const extensions = {
      markdown: 'md',
      text: 'txt',
      json: 'json',
    };
    const mimeTypes = {
      markdown: 'text/markdown',
      text: 'text/plain',
      json: 'application/json',
    };

    const ext = extensions[selectedFormat];
    const mime = mimeTypes[selectedFormat];
    const filename = `enterprise-knowledge-chat-${conversation.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'export'}.${ext}`;

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Conversation exported as .${ext}`, 'success');
    onClose();
  };

  const handleCopyAll = async () => {
    const content = chatService.exportConversation(conversation, selectedFormat);
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      showToast('Transcript copied to clipboard.', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy transcript', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1D2129] rounded-2xl border border-slate-200 dark:border-[#2A2F38] text-slate-900 dark:text-slate-100 max-w-md w-full p-6 shadow-xl animate-in zoom-in-95 duration-200 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-[#2A2F38]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Export Conversation
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                "{conversation.title}" ({conversation.messages.length} messages)
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

        {/* Format Selectors */}
        <div className="my-4 space-y-3">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Select Export Format
          </label>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedFormat('markdown')}
              className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                selectedFormat === 'markdown'
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 shadow-2xs'
                  : 'border-slate-200 dark:border-[#2A2F38] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <div className="text-xs font-bold">Markdown</div>
              <div className="text-[10px] text-slate-400">.md</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFormat('text')}
              className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                selectedFormat === 'text'
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 shadow-2xs'
                  : 'border-slate-200 dark:border-[#2A2F38] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <div className="text-xs font-bold">Plain Text</div>
              <div className="text-[10px] text-slate-400">.txt</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFormat('json')}
              className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                selectedFormat === 'json'
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 shadow-2xs'
                  : 'border-slate-200 dark:border-[#2A2F38] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <FileJson className="w-4 h-4" />
              <div className="text-xs font-bold">Structured</div>
              <div className="text-[10px] text-slate-400">.json</div>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#171A21] p-3 rounded-xl border border-slate-200/80 dark:border-[#2A2F38]">
            Includes all user questions, AI answers, grounded document citations, confidence scores, and timestamps.
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#2A2F38]">
          <button
            type="button"
            onClick={handleCopyAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2A2F38] hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Transcript</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
