import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { chatService } from '../services/chatService';
import { Conversation, AgentStep, AnswerMode, DetailedFeedback, AdminStats } from '../types';
import { SUGGESTED_QUESTIONS } from '../data/mockData';
import { systemService } from '../services/systemService';
import { RecentConversations } from '../components/chat/RecentConversations';
import { ChatMessage } from '../components/chat/ChatMessage';
import {
  ChatInput,
  AttachedImage,
  AttachedDocument,
} from '../components/chat/ChatInput';
import { AgentPipelineVisualizer } from '../components/chat/AgentPipelineVisualizer';
import { AdminStatsWidget } from '../components/chat/AdminStatsWidget';
import { UploadDocumentModal } from '../components/documents/UploadDocumentModal';
import { ChatExportModal } from '../components/chat/ChatExportModal';
import { ClearChatModal } from '../components/chat/ClearChatModal';
import { KeyboardShortcutsModal } from '../components/chat/KeyboardShortcutsModal';
import { Sparkles, HelpCircle, Layers, Download, RotateCcw, Command } from 'lucide-react';

export const AssistantPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeSteps, setActiveSteps] = useState<AgentStep[]>([]);
  const [externalInput, setExternalInput] = useState<string>('');
  const [answerMode, setAnswerMode] = useState<AnswerMode>('Concise');

  // Modals state
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState<boolean>(false);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [clearModalOpen, setClearModalOpen] = useState<boolean>(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState<boolean>(false);
  const [targetExportConv, setTargetExportConv] = useState<Conversation | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);

  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    const load = async () => {
      const convs = await chatService.getConversations();
      setConversations(convs);
      if (convs.length > 0 && !activeConvId) {
        setActiveConvId(convs[0].id);
      }
      if (user?.role === 'ADMIN') {
        systemService.getAdminStats().then(setAdminStats).catch(console.error);
      }
    };
    load();
  }, [user]);

  // Global keyboard shortcuts (Cmd+K, Alt+N)
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setShortcutsModalOpen((prev) => !prev);
      }
      if (e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [conversations]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [conversations, activeConvId, activeSteps, isProcessing]);

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  const handleSelectConversation = (id: string) => {
    setActiveConvId(id);
    setActiveSteps([]);
    setIsProcessing(false);
  };

  const handleNewChat = async () => {
    const newConv = await chatService.createConversation('New inquiry');
    setConversations([newConv, ...conversations]);
    setActiveConvId(newConv.id);
    setActiveSteps([]);
    setIsProcessing(false);
    showToast('New conversation started.', 'info', 1500);
  };

  const handleRename = async (id: string, newTitle: string) => {
    try {
      const updated = await chatService.renameConversation(id, newTitle);
      setConversations((prev) => prev.map((c) => (c.id === id ? updated : c)));
      showToast('Conversation renamed.', 'success');
    } catch {
      showToast('Failed to rename conversation', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await chatService.deleteConversation(id);
      const remaining = conversations.filter((c) => c.id !== id);
      setConversations(remaining);
      if (activeConvId === id) {
        setActiveConvId(remaining.length > 0 ? remaining[0].id : null);
      }
      showToast('Conversation deleted.', 'info');
    } catch {
      showToast('Failed to delete conversation', 'error');
    }
  };

  const handleClearChatConfirm = async () => {
    if (!activeConvId) return;
    try {
      const cleared = await chatService.clearConversation(activeConvId);
      setConversations((prev) => prev.map((c) => (c.id === activeConvId ? cleared : c)));
      showToast('Conversation cleared.', 'info');
    } catch {
      showToast('Failed to clear conversation', 'error');
    }
  };

//  const handleSendMessage = async (
//   queryText: string,
//   attachedImage?: AttachedImage | null,
//   mode: AnswerMode = answerMode,
//   attachedDocument?: AttachedDocument | null,
// ) => {
//     let targetId = activeConvId;
//     const initialTitle = queryText.trim() || attachedImage?.name || 'Inquiry';

//     if (!targetId) {
//       const newConv = await chatService.createConversation(initialTitle.slice(0, 32));
//       setConversations((prev) => [newConv, ...prev]);
//       targetId = newConv.id;
//       setActiveConvId(targetId);
//     }

//     setIsProcessing(true);
//     setActiveSteps([]);

//     try {
//       if (attachedDocument) {
//   await chatService.uploadChatAttachment(
//     targetId,
//     attachedDocument.file,
//   );
// }
//       const { userMessage, assistantMessage } = await chatService.sendMessage(
//         targetId,
//         queryText,
//         (_index, step) => {
//           setActiveSteps((prev) => {
//             const copy = [...prev];
//             const foundIdx = copy.findIndex((s) => s.id === step.id);
//             if (foundIdx >= 0) {
//               copy[foundIdx] = step;
//             } else {
//               copy.push(step);
//             }
//             return copy;
//           });
//         },
//         attachedImage
//           ? {
//               dataUrl: attachedImage.dataUrl,
//               name: attachedImage.name,
//             }
//           : null,
//         mode
//       );

//       // Update state with new messages
//       setConversations((prev) =>
//         prev.map((c) => {
//           if (c.id === targetId) {
//             return {
//               ...c,
//               lastUpdated: 'Just now',
//               messages: [...c.messages, userMessage, assistantMessage],
//             };
//           }
//           return c;
//         })
//       );
//     } catch (err: unknown) {
//       const msg = err instanceof Error ? err.message : 'Failed to query assistant';
//       showToast(msg, 'error');
//     } finally {
//       setIsProcessing(false);
//       setActiveSteps([]);
//     }
//   };


  const handleSendMessage = async (
  queryText: string,
  attachedImage?: AttachedImage | null,
  mode: AnswerMode = answerMode,
  attachedDocument?: AttachedDocument | null,
) => {
  let targetId = activeConvId;

  const initialTitle =
    queryText.trim() ||
    attachedDocument?.name ||
    attachedImage?.name ||
    'Inquiry';

  // Create a conversation first if none is selected.
  if (!targetId) {
    const newConv = await chatService.createConversation(
      initialTitle.slice(0, 32),
    );

    setConversations((prev) => [newConv, ...prev]);
    targetId = newConv.id;
    setActiveConvId(targetId);
  }

  setIsProcessing(true);
  setActiveSteps([]);

  try {
    // 1. Upload and index the document before sending the question.
    if (attachedDocument) {
      await chatService.uploadChatAttachment(
        targetId,
        attachedDocument.file,
      );
    }

    // 2. Send the question after the upload has completed.
    const { userMessage, assistantMessage } =
      await chatService.sendMessage(
        targetId,
        queryText,
        (_index, step) => {
          setActiveSteps((prev) => {
            const copy = [...prev];
            const foundIdx = copy.findIndex(
              (item) => item.id === step.id,
            );

            if (foundIdx >= 0) {
              copy[foundIdx] = step;
            } else {
              copy.push(step);
            }

            return copy;
          });
        },
        attachedImage
          ? {
              dataUrl: attachedImage.dataUrl,
              name: attachedImage.name,
            }
          : null,
        mode,
      );

    // 3. Add the user and assistant messages to the UI.
    setConversations((prev) =>
      prev.map((conversation) => {
        if (conversation.id !== targetId) {
          return conversation;
        }

        return {
          ...conversation,
          lastUpdated: 'Just now',
          messages: [
            ...conversation.messages,
            userMessage,
            assistantMessage,
          ],
        };
      }),
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Failed to query assistant';

    showToast(message, 'error');
  } finally {
    setIsProcessing(false);
    setActiveSteps([]);
  }
};

  const handleRegenerate = async (messageId: string) => {
    if (!activeConvId) return;
    try {
      const regenerated = await chatService.regenerateResponse(activeConvId, messageId, answerMode);
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConvId) {
            return {
              ...c,
              messages: c.messages.map((m) => (m.id === messageId ? regenerated : m)),
            };
          }
          return c;
        })
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to regenerate response';
      showToast(msg, 'error');
    }
  };

  const handleFeedback = async (messageId: string, feedback: 'helpful' | 'unhelpful') => {
    if (!activeConvId) return;
    await chatService.submitFeedback(activeConvId, messageId, feedback);
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvId) {
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === messageId
                ? { ...m, feedback: m.feedback === feedback ? null : feedback }
                : m
            ),
          };
        }
        return c;
      })
    );
  };

  const handleDetailedFeedback = async (messageId: string, detailed: DetailedFeedback) => {
    if (!activeConvId) return;
    await chatService.submitDetailedFeedback(activeConvId, messageId, detailed);
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvId) {
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === messageId
                ? { ...m, feedback: detailed.rating, detailedFeedback: detailed }
                : m
            ),
          };
        }
        return c;
      })
    );
  };

  const handleSelectFollowUp = (question: string) => {
    handleSendMessage(question);
  };

  const handleOpenExport = (conv?: Conversation) => {
    setTargetExportConv(conv || activeConversation || null);
    setExportModalOpen(true);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-slate-100 dark:bg-[#0F1115] overflow-hidden transition-colors">
      {/* Compact Recent Conversations Area */}
      <RecentConversations
        conversations={conversations}
        activeConversationId={activeConvId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onRenameConversation={handleRename}
        onDeleteConversation={handleDelete}
        onExportConversation={(c) => handleOpenExport(c)}
        onClearConversation={() => setClearModalOpen(true)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#171A21] overflow-hidden transition-colors">
        {/* Chat Header Toolbar (Requirement: Export, Clear Chat, Shortcuts) */}
        {activeConversation && (
          <div className="px-4 py-2 border-b border-slate-200/80 dark:border-[#2A2F38] bg-slate-50/50 dark:bg-[#14171E] flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {activeConversation.title}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
                • {activeConversation.messages.length} messages
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShortcutsModalOpen(true)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-1 text-xs"
                title="Keyboard Shortcuts (⌘K)"
              >
                <Command className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[11px]">Shortcuts</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenExport(activeConversation)}
                disabled={activeConversation.messages.length === 0}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-1 text-xs disabled:opacity-40"
                title="Export Transcript"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[11px]">Export</span>
              </button>

              {activeConversation.messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setClearModalOpen(true)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer flex items-center gap-1 text-xs"
                  title="Clear Conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden md:inline text-[11px]">Clear</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Chat message stream */}
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Admin Statistics Widget (Shown only for Admin role) */}
            {user?.role === 'ADMIN' && adminStats && <AdminStatsWidget stats={adminStats} />}

            {/* WELCOME Screen when conversation has no messages */}
            {(!activeConversation || activeConversation.messages.length === 0) && (
              <div className="py-8 sm:py-12 animate-in fade-in duration-300">
                <div className="text-center max-w-xl mx-auto mb-8">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {getGreeting()}, {firstName}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                    Ask questions about your organization’s knowledge.
                  </p>
                </div>

                {/* Suggested Questions */}
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Suggested Questions</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SUGGESTED_QUESTIONS.map((question, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setExternalInput(question);
                        }}
                        className="p-3 text-left bg-slate-50 dark:bg-[#1D2129] hover:bg-blue-50/60 dark:hover:bg-[#252B36] border border-slate-200 dark:border-[#2A2F38] hover:border-blue-300 dark:hover:border-blue-500/50 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-2xs group flex items-start justify-between gap-2"
                      >
                        <span className="leading-snug">{question}</span>
                        <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 mt-0.5 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Existing Messages */}
            {activeConversation && activeConversation.messages.length > 0 && (
              <div className="space-y-4">
                {activeConversation.messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    onRegenerate={handleRegenerate}
                    onFeedback={handleFeedback}
                    onDetailedFeedback={handleDetailedFeedback}
                    onSelectFollowUp={handleSelectFollowUp}
                  />
                ))}
              </div>
            )}

            {/* Live Multi-Agent Processing Indicator */}
            {isProcessing && activeSteps.length > 0 && (
              <div className="my-4">
                <AgentPipelineVisualizer steps={activeSteps} />
              </div>
            )}
          </div>
        </div>

        {/* Chat Input Bar with Answer Mode, Voice and Camera/Image capabilities */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isProcessing={isProcessing}
          externalInput={externalInput}
          onClearExternalInput={() => setExternalInput('')}
          answerMode={answerMode}
          onAnswerModeChange={setAnswerMode}
        />
      </div>

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={isUploadDocModalOpen}
        onClose={() => setIsUploadDocModalOpen(false)}
        onUploaded={(newDoc) => {
          showToast(`Document "${newDoc.name}" ready for RAG querying.`, 'success');
        }}
      />

      {/* Chat Export Modal */}
      <ChatExportModal
        isOpen={exportModalOpen}
        conversation={targetExportConv || activeConversation || null}
        onClose={() => setExportModalOpen(false)}
      />

      {/* Clear Chat Confirmation Modal */}
      <ClearChatModal
        isOpen={clearModalOpen}
        conversationTitle={activeConversation?.title || 'Current inquiry'}
        onClose={() => setClearModalOpen(false)}
        onConfirm={handleClearChatConfirm}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />
    </div>
  );
};
