import React, { useState, useMemo } from 'react';
import { Conversation } from '../../types';
import {
  MessageSquare,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  X,
  Search,
  Download,
  RotateCcw,
} from 'lucide-react';
import { FloatingPopover } from '../common/FloatingPopover';

interface RecentConversationsProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onExportConversation?: (conversation: Conversation) => void;
  onClearConversation?: (conversation: Conversation) => void;
}

export const RecentConversations: React.FC<RecentConversationsProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  onExportConversation,
  onClearConversation,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeMenuConv = conversations.find((c) => c.id === menuOpenId);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase().trim();
    return conversations.filter((c) =>
      c.title.toLowerCase().includes(q) ||
      c.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  const startEditing = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
    setMenuOpenId(null);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteConversation(id);
    setMenuOpenId(null);
  };

  const handleExport = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    onExportConversation?.(conv);
    setMenuOpenId(null);
  };

  const handleClear = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    onClearConversation?.(conv);
    setMenuOpenId(null);
  };

  return (
    <div className="w-full lg:w-72 bg-slate-50/80 dark:bg-[#14171E] border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-[#2A2F38] flex flex-col shrink-0 transition-colors">
      {/* Top Header & New Chat button */}
      <div className="p-3.5 border-b border-slate-200/80 dark:border-[#2A2F38] flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Recent conversations
          </h2>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {conversations.length} active threads
          </span>
        </div>

        <button
          onClick={onNewChat}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-medium transition-colors shadow-2xs cursor-pointer shrink-0"
          title="Start new conversation (Alt+N)"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Conversation Search Bar (Requirement: Conversation search) */}
      <div className="p-2 border-b border-slate-200/60 dark:border-[#2A2F38]">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-white dark:bg-[#1D2129] border border-slate-200 dark:border-[#2A2F38] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-56 lg:max-h-none">
        {filteredConversations.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
            <MessageSquare className="w-6 h-6 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="font-medium text-slate-600 dark:text-slate-400">
              {searchQuery ? 'No matching conversations' : 'No conversations yet.'}
            </p>
            <p className="mt-1">
              {searchQuery ? 'Try another keyword or clear search.' : 'Ask your first question to get started.'}
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isActive = activeConversationId === conv.id;
            const isEditing = editingId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => !isEditing && onSelectConversation(conv.id)}
                className={`group relative flex items-center justify-between p-2 rounded-lg text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-[#1D2129] border border-slate-200 dark:border-[#2A2F38] text-blue-700 dark:text-blue-400 font-semibold shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white border border-transparent'
                }`}
              >
                {isEditing ? (
                  <form
                    onSubmit={(e) => handleSaveRename(conv.id, e)}
                    className="flex items-center gap-1 w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 px-1.5 py-1 text-xs bg-white dark:bg-slate-800 border border-blue-400 rounded text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={(e) => handleSaveRename(conv.id, e)}
                      className="p-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelRename}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                        }`}
                      />
                      <span className="truncate">{conv.title}</span>
                    </div>

                    {/* Actions Menu Trigger */}
                    <div className="shrink-0 flex items-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (menuOpenId === conv.id) {
                            setMenuOpenId(null);
                            setMenuAnchorEl(null);
                          } else {
                            setMenuOpenId(conv.id);
                            setMenuAnchorEl(e.currentTarget);
                          }
                        }}
                        className={`p-1 rounded hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition ${
                          isActive || menuOpenId === conv.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                        title="Options"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Floating Options Popover for Selected Conversation */}
      {activeMenuConv && (
        <FloatingPopover
          isOpen={Boolean(menuOpenId && menuAnchorEl)}
          onClose={() => {
            setMenuOpenId(null);
            setMenuAnchorEl(null);
          }}
          anchorRef={{ current: menuAnchorEl }}
          preferredPlacement="bottom"
          align="end"
          offset={4}
          className="w-36 py-1"
        >
          <button
            type="button"
            onClick={(e) => startEditing(activeMenuConv, e)}
            className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer text-xs"
          >
            <Edit2 className="w-3 h-3 text-slate-400" />
            <span>Rename</span>
          </button>

          {onExportConversation && (
            <button
              type="button"
              onClick={(e) => handleExport(activeMenuConv, e)}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer text-xs"
            >
              <Download className="w-3 h-3 text-blue-500" />
              <span>Export</span>
            </button>
          )}

          {onClearConversation && activeMenuConv.messages.length > 0 && (
            <button
              type="button"
              onClick={(e) => handleClear(activeMenuConv, e)}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer text-xs"
            >
              <RotateCcw className="w-3 h-3 text-amber-500" />
              <span>Clear Chat</span>
            </button>
          )}

          <button
            type="button"
            onClick={(e) => handleDelete(activeMenuConv.id, e)}
            className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 cursor-pointer border-t border-slate-100 dark:border-[#2A2F38] text-xs"
          >
            <Trash2 className="w-3 h-3 text-rose-500" />
            <span>Delete</span>
          </button>
        </FloatingPopover>
      )}
    </div>
  );
};
