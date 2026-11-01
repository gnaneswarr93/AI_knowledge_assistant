import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  MessageSquareText,
  FolderArchive,
  LogOut,
  Layers,
  Sparkles,
  Shield,
  X,
  RefreshCw,
} from 'lucide-react';

export type PageId = 'assistant' | 'knowledge' | 'profile';

interface SidebarProps {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  mobileOpen,
  onCloseMobile,
}) => {
  const { user, logout, switchRole } = useAuth();
  const { showToast } = useToast();

  const handleNav = (page: PageId) => {
    onSelectPage(page);
    onCloseMobile();
  };

  const handleLogout = async () => {
    await logout();
    showToast('Signed out of Enterprise Assistant.', 'info');
  };

  const handleToggleRole = async () => {
    if (!user) return;
    const targetRole = user.role === 'ADMIN' ? 'EMPLOYEE' : 'ADMIN';
    const updated = await switchRole(targetRole);
    showToast(`Switched view to ${updated.role === 'ADMIN' ? 'Administrator' : 'Employee'}.`, 'info');
  };

  const navItems = [
    {
      id: 'assistant' as PageId,
      label: 'AI Assistant',
      icon: MessageSquareText,
      badge: 'RAG',
    },
    {
      id: 'knowledge' as PageId,
      label: 'Knowledge Base',
      icon: FolderArchive,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 dark:bg-[#14171E] text-slate-300 w-64 border-r border-slate-800 dark:border-[#2A2F38] select-none transition-colors">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 dark:border-[#2A2F38] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white tracking-tight leading-tight">
              Enterprise AI
            </div>
            <div className="text-[11px] text-blue-400 font-medium tracking-wide">
              Knowledge Assistant
            </div>
          </div>
        </div>

        {/* Close button on mobile */}
        <button
          onClick={onCloseMobile}
          className="md:hidden text-slate-400 hover:text-white p-1 rounded-md"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* RAG Subtitle tag */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-[11px]">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3 h-3 text-blue-400" />
            RAG &amp; Multi-Agent
          </span>
          <span className="px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 font-semibold text-[10px]">
            v2.4
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-2 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                    isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Demo Role Switcher bar */}
      <div className="px-3 py-2 border-t border-slate-800">
        <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/40">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Demo Role Mode:</span>
            <button
              onClick={handleToggleRole}
              className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              title="Toggle role between Employee and Admin"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              Switch
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs px-2 py-0.5 rounded font-semibold flex items-center gap-1 ${
                user?.role === 'ADMIN'
                  ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                  : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
              }`}
            >
              <Shield className="w-3 h-3" />
              {user?.role === 'ADMIN' ? 'Administrator' : 'Employee'}
            </span>
            <span className="text-[10px] text-slate-400 truncate">({user?.department})</span>
          </div>
        </div>
      </div>

      {/* User Card & Logout */}
      <div className="p-3 border-t border-slate-800 dark:border-[#2A2F38] bg-slate-900/90 dark:bg-[#14171E]">
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleNav('profile')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleNav('profile');
            }
          }}
          aria-label="Open Profile & Settings"
          title="Open Profile & Settings"
          className={`flex items-center justify-between gap-2 p-1.5 rounded-lg text-left transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 group ${
            activePage === 'profile'
              ? 'bg-slate-800/90 ring-1 ring-blue-500/50 shadow-xs'
              : 'hover:bg-slate-800/80 active:bg-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-300 font-semibold text-xs flex items-center justify-center border border-blue-500/40 shrink-0 group-hover:border-blue-400/60 transition-colors">
              {user?.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors truncate">
                {user?.name}
              </div>
              <div className="text-[10px] text-slate-400 group-hover:text-slate-300 transition-colors truncate">
                {user?.email}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer shrink-0"
            title="Sign Out"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
