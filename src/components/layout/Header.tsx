import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Menu, Shield, CheckCircle2, Sparkles, Sun, Moon, Activity, Command } from 'lucide-react';
import { PageId } from './Sidebar';
import { SystemStatusModal } from '../chat/SystemStatusModal';
import { KeyboardShortcutsModal } from '../chat/KeyboardShortcutsModal';

interface HeaderProps {
  activePage: PageId;
  onOpenMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activePage, onOpenMobile }) => {
  const { user } = useAuth();
  const { effectiveTheme, toggleTheme } = useTheme();
  const [systemStatusOpen, setSystemStatusOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const getPageMeta = () => {
    switch (activePage) {
      case 'assistant':
        return {
          title: 'AI Assistant',
          subtitle: 'Ask questions about your organization’s knowledge.',
        };
      case 'knowledge':
        return {
          title: 'Knowledge Base',
          subtitle: 'Manage the documents used by your AI knowledge assistant.',
        };
      case 'profile':
        return {
          title: 'Profile & Settings',
          subtitle: 'Manage your credentials, preferences, and session controls.',
        };
    }
  };

  const meta = getPageMeta();

  return (
    <header className="h-16 bg-white dark:bg-[#171A21] border-b border-slate-200/90 dark:border-[#2A2F38] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobile}
          className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
              {meta.title}
            </h1>
            {activePage === 'assistant' && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                RAG Multi-Agent Pipeline
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">
            {meta.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* AI & Vector DB Connection Status Pill (Requirement: AI/backend connection status) */}
        <button
          type="button"
          onClick={() => setSystemStatusOpen(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/70 text-xs text-emerald-800 dark:text-emerald-300 transition cursor-pointer"
          title="Click to view RAG System Diagnostics & Health"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold hidden sm:inline">AI Pipeline:</span>
          <span className="font-medium">Online</span>
          <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-mono hidden md:inline">
            (24ms)
          </span>
        </button>

        {/* Global Shortcuts Button */}
        <button
          type="button"
          onClick={() => setShortcutsOpen(true)}
          className="hidden sm:flex p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          title="Keyboard shortcuts (⌘K)"
          aria-label="Keyboard shortcuts"
        >
          <Command className="w-4 h-4" />
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          title="Change theme"
          aria-label="Change theme"
        >
          {effectiveTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* User Role Badge */}
        <div className="flex items-center gap-2">
          {user?.role === 'ADMIN' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Administrator
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#1D2129] border border-slate-200 dark:border-[#2A2F38] text-slate-700 dark:text-slate-300 text-xs font-medium">
              Employee
            </span>
          )}
        </div>
      </div>

      {/* Modals rendered from Header */}
      <SystemStatusModal
        isOpen={systemStatusOpen}
        onClose={() => setSystemStatusOpen(false)}
      />

      <KeyboardShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </header>
  );
};
