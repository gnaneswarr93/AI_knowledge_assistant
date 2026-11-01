import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Mic,
  MicOff,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  Camera,
  FileText,
  X,
  Sliders,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { speechService } from '../../services/speechService';
import { CameraModal } from './CameraModal';
import { AnswerMode } from '../../types';
import { FloatingPopover } from '../common/FloatingPopover';

export interface AttachedImage {
  dataUrl: string;
  name: string;
  size?: number;
}
export interface AttachedDocument {
  file: File;
  name: string;
  size: number;
}

interface ChatInputProps {
  onSendMessage: (
    query: string,
    attachedImage?: AttachedImage | null,
    answerMode?: AnswerMode,
    attachedDocument?: AttachedDocument | null,
  ) => void;
  isProcessing: boolean;
  externalInput?: string;
  onClearExternalInput?: () => void;
  answerMode: AnswerMode;
  onAnswerModeChange: (mode: AnswerMode) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isProcessing,
  externalInput,
  onClearExternalInput,
  answerMode,
  onAnswerModeChange,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState<boolean>(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [showModeDropdown, setShowModeDropdown] = useState<boolean>(false);
  const [attachedDocument, setAttachedDocument] = useState<AttachedDocument | null>(null);

  const documentInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachButtonRef = useRef<HTMLButtonElement>(null);
  const modeButtonRef = useRef<HTMLButtonElement>(null);

  const { showToast } = useToast();

  const toggleAttachMenu = () => {
    if (!showAttachMenu) {
      setShowModeDropdown(false);
    }
    setShowAttachMenu((prev) => !prev);
  };

  const toggleModeDropdown = () => {
    if (!showModeDropdown) {
      setShowAttachMenu(false);
    }
    setShowModeDropdown((prev) => !prev);
  };

  // Load external suggested queries into input
  useEffect(() => {
    if (externalInput) {
      setInputText(externalInput);
      onClearExternalInput?.();
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [externalInput, onClearExternalInput]);

  // Alt+M shortcut to cycle answer mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        const modes: AnswerMode[] = ['Concise', 'Detailed', 'Summarize'];
        const nextIdx = (modes.indexOf(answerMode) + 1) % modes.length;
        onAnswerModeChange(modes[nextIdx]);
        showToast(`Answer Mode: ${modes[nextIdx]}`, 'info', 1500);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [answerMode, onAnswerModeChange, showToast]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      speechService.stopListening();
    };
  }, []);

  const handleToggleVoiceInput = () => {
    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
      return;
    }

    if (!speechService.isSupported()) {
      showToast('Voice input is not supported in this browser.', 'error');
      return;
    }

    setIsRecording(true);
    showToast('Listening... Speak your query.', 'info', 2000);

    speechService.startListening({
      onStart: () => {
        setIsRecording(true);
      },
      onResult: (transcript: string) => {
        setInputText((prev) => {
          // If input has text, append with a space, otherwise replace
          const trimmed = prev.trim();
          return trimmed ? `${trimmed} ${transcript}` : transcript;
        });
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
        }
      },
      onError: (friendlyError: string) => {
        setIsRecording(false);
        showToast(friendlyError, 'error');
      },
      onEnd: () => {
        setIsRecording(false);
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Please select a JPG, PNG, or WEBP image.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAttachedImage({
          dataUrl: reader.result,
          name: file.name,
          size: file.size,
        });
        showToast(`Image "${file.name}" attached.`, 'info', 2000);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
    setShowAttachMenu(false);
  };

  const handlePhotoCaptured = (dataUrl: string, filename: string) => {
    setAttachedImage({
      dataUrl,
      name: filename,
    });
    showToast('Photo captured and attached.', 'info', 2000);
  };

  const handleRemoveAttachedImage = () => {
    setAttachedImage(null);
    showToast('Attachment removed', 'info', 1500);
  };

  const handleSubmit = (e?: React.FormEvent) => {
  e?.preventDefault();

  const cleanText = inputText.trim();

  // Require a question unless an image is attached.
  // A document alone should not trigger an empty RAG query.
  if (!cleanText && !attachedImage) {
    showToast(
      attachedDocument
        ? 'Please type a question about the attached document.'
        : 'Please type a question or attach an image.',
      'error',
    );
    return;
  }

  if (isProcessing) return;

  if (isRecording) {
    speechService.stopListening();
    setIsRecording(false);
  }

  onSendMessage(
    cleanText,
    attachedImage,
    answerMode,
    attachedDocument,
  );

  setInputText('');
  setAttachedImage(null);
  setAttachedDocument(null);

  if (textareaRef.current) {
    textareaRef.current.style.height = 'auto';
  }
};

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  const canSend = !isProcessing && (
  inputText.trim().length > 0 || attachedImage !== null
);

  return (
    <div className="bg-white dark:bg-[#171A21] border-t border-slate-200/90 dark:border-[#2A2F38] p-4 transition-colors">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="relative bg-slate-50 dark:bg-[#1D2129] border border-slate-300 dark:border-[#2A2F38] rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-600 focus-within:bg-white dark:focus-within:bg-[#1D2129] transition-all shadow-2xs overflow-visible">
          {/* Attached Image Preview Bar (Requirement 4, 7, 21) */}
          {attachedImage && (
            <div className="px-3 py-2 bg-blue-50/70 dark:bg-blue-950/40 border-b border-blue-200/60 dark:border-blue-900/50 flex items-center justify-between rounded-t-xl animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-md overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-300 dark:border-slate-700">
                  <img
                    src={attachedImage.dataUrl}
                    alt="Attached preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {attachedImage.name}
                  </div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                    Attached Image • Ready to send
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveAttachedImage}
                title="Remove attachment"
                aria-label="Remove attachment"
                className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          
          {attachedDocument && (
  <div className="flex items-center gap-2 rounded-lg border p-3">
    <span>📄</span>
    <div className="min-w-0 flex-1">
      <p className="truncate font-medium">
        {attachedDocument.name}
      </p>
      <p className="text-xs text-gray-500">
        {(attachedDocument.size / 1024).toFixed(1)} KB
      </p>
    </div>
    <button
      type="button"
      onClick={() => setAttachedDocument(null)}
      aria-label="Remove attachment"
    >
      ×
    </button>
  </div>
)}

          {/* Text input area */}
          <div className="p-2.5">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              disabled={isProcessing}
              placeholder={
                isRecording
                  ? 'Listening... Speak your enterprise question now.'
                  : isProcessing
                  ? 'Retrieving enterprise knowledge and synthesizing answer...'
                  : 'Ask anything about your organization’s knowledge...'
              }
              className="w-full resize-none bg-transparent py-1 px-1 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none disabled:opacity-60 max-h-36 leading-relaxed"
            />
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-between px-2.5 pb-2 pt-0.5">
            <div className="flex items-center gap-1">
              {/* Attachment Button */}
              <button
                ref={attachButtonRef}
                type="button"
                onClick={toggleAttachMenu}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  showAttachMenu
                    ? 'bg-slate-200 dark:bg-slate-800 text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
                title="Attach file"
                aria-label="Attach file"
                aria-expanded={showAttachMenu}
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Attachment Floating Popover (Requirement 1, 3, 5, 6, 12) */}
              <FloatingPopover
                isOpen={showAttachMenu}
                onClose={() => setShowAttachMenu(false)}
                anchorRef={attachButtonRef}
                preferredPlacement="top"
                align="start"
                offset={8}
                className="w-48 py-1"
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowAttachMenu(false);
                    setIsCameraModalOpen(true);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Take Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAttachMenu(false);
                    fileInputRef.current?.click();
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Upload Image</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAttachMenu(false);
                    documentInputRef.current?.click();
                    
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-2.5 border-t border-slate-100 dark:border-[#2A2F38] transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Upload Document</span>
                </button>
              </FloatingPopover>

              {/* Hidden file input for image upload */}
              <input
               
  ref={documentInputRef}
  type="file"
  accept=".pdf,.doc,.docx,.txt,.csv"
  className="hidden"
  onChange={(event) => {
    const file = event.target.files?.[0];

    if (file) {
      const allowed = /\.(pdf|doc|docx|txt|csv)$/i.test(file.name);

      if (!allowed) {
        alert("Please select a PDF, DOC, DOCX, TXT, or CSV file.");
      } else if (file.size > 20 * 1024 * 1024) {
        alert("The maximum file size is 20 MB.");
      } else {
        setAttachedDocument({
          file,
          name: file.name,
          size: file.size,
        });
      }
    }

    event.currentTarget.value = "";
  }}

              />

              {/* Working Microphone Voice-to-Text Button (Requirement 1 & 2) */}
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                className={`p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs font-medium ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse shadow-sm shadow-rose-500/40'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
                title="Voice input"
                aria-label="Voice input"
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isRecording && <span className="text-[11px] font-semibold pr-1">Listening...</span>}
              </button>
            </div>

            {/* Action controls right side: Answer Mode Selector & Send */}
            <div className="flex items-center gap-2">
              {/* Answer Mode Selector (Concise / Detailed / Summarize) */}
              <div>
                <button
                  ref={modeButtonRef}
                  type="button"
                  onClick={toggleModeDropdown}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
                    showModeDropdown
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 shadow-2xs'
                      : 'text-slate-700 dark:text-slate-300 bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300/80 dark:hover:bg-slate-700 border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                  title="Answer Mode (Alt+M to cycle)"
                  aria-label="Answer Mode"
                  aria-expanded={showModeDropdown}
                >
                  <Sliders className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="hidden sm:inline text-slate-500 dark:text-slate-400">Mode:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{answerMode}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </button>

                {/* Answer Mode Floating Popover (Requirement 4, 5, 6, 12) */}
                <FloatingPopover
                  isOpen={showModeDropdown}
                  onClose={() => setShowModeDropdown(false)}
                  anchorRef={modeButtonRef}
                  preferredPlacement="top"
                  align="end"
                  offset={8}
                  className="w-56 py-1"
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-[#2A2F38]">
                    Answer Mode
                  </div>
                  {(['Concise', 'Detailed', 'Summarize'] as AnswerMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        onAnswerModeChange(mode);
                        setShowModeDropdown(false);
                        showToast(`Answer Mode set to: ${mode}`, 'info', 1500);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        answerMode === mode
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{mode}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                          {mode === 'Concise' && 'Short direct answer & citations'}
                          {mode === 'Detailed' && 'In-depth procedural breakdown'}
                          {mode === 'Summarize' && 'Executive bullet-point summary'}
                        </div>
                      </div>
                      {answerMode === mode && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
                    </button>
                  ))}
                </FloatingPopover>
              </div>

              {/* Send Button */}
              <button

                type="submit"
                disabled={!canSend}
                className="p-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs flex items-center justify-center shrink-0"
                title="Send message"
                aria-label="Send message"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Small footer caption */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-2 px-1">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-500" />
            Answers synthesized strictly from indexed enterprise docs
          </span>
          <span className="hidden sm:inline">
            <kbd className="font-sans px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-[10px]">
              Enter
            </kbd>{' '}
            to send,{' '}
            <kbd className="font-sans px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-[10px]">
              Shift+Enter
            </kbd>{' '}
            for new line
          </span>
        </div>
      </form>

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onPhotoCaptured={handlePhotoCaptured}
      />
    </div>
  );
};
