import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/userService';
import { UserPreferences, Theme } from '../types';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { ChangePasswordModal } from '../components/profile/ChangePasswordModal';
import { MOCK_SESSION_INFO } from '../data/mockData';
import {
  Mail,
  Building2,
  BadgeCheck,
  Shield,
  Key,
  LogOut,
  Sun,
  Moon,
  Laptop,
  Bell,
  Sparkles,
  User as UserIcon,
  ShieldCheck,
  Lock,
  Globe,
  Clock,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [preferences, setPreferences] = useState<UserPreferences>(userService.getPreferences());
  const [editProfileOpen, setEditProfileOpen] = useState<boolean>(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState<boolean>(false);

  const handleThemeChange = (selectedTheme: Theme) => {
    setTheme(selectedTheme);
    const updated = { ...preferences, theme: selectedTheme };
    setPreferences(updated);
    userService.savePreferences(updated);
    showToast(`Theme updated to ${selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)}.`, 'info');
  };

  const handleToggleNotification = (key: 'aiResponseNotifications' | 'documentProcessingNotifications') => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    userService.savePreferences(updated);
    showToast('Notification preference saved.', 'info');
  };

  const handleLogout = async () => {
    await logout();
    showToast('Signed out of Enterprise Assistant.', 'info');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 transition-colors">
      {/* Title */}
      <div className="pb-4 border-b border-slate-200 dark:border-[#2A2F38]">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Profile &amp; Settings
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your account credentials, role permissions, and interface preferences.
        </p>
      </div>

      {/* SECTION 1: PROFILE */}
      <div className="bg-white dark:bg-[#1D2129] rounded-xl border border-slate-200 dark:border-[#2A2F38] shadow-2xs overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-[#2A2F38] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xl border border-blue-200 dark:border-blue-800 shrink-0">
              {user?.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2) || 'KR'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{user?.name}</h3>
                {user?.role === 'ADMIN' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    <Shield className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    Administrator
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <BadgeCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    Employee
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">
                <span>ID: {user?.employeeId}</span>
                <span>•</span>
                <span>Dept: {user?.department}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setEditProfileOpen(true)}
              className="flex-1 sm:flex-initial px-3.5 py-2 text-xs font-semibold bg-white dark:bg-[#171A21] hover:bg-slate-50 dark:hover:bg-[#252B36] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-[#2A2F38] rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              Edit Profile
            </button>
            <button
              onClick={() => setChangePasswordOpen(true)}
              className="flex-1 sm:flex-initial px-3.5 py-2 text-xs font-semibold bg-white dark:bg-[#171A21] hover:bg-slate-50 dark:hover:bg-[#252B36] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-[#2A2F38] rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5 text-slate-400" />
              <span>Change Password</span>
            </button>
          </div>
        </div>

        {/* Profile Attributes grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50/70 dark:bg-[#171A21] border border-slate-200/80 dark:border-[#2A2F38]">
            <div className="text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Work Email
            </div>
            <div className="font-semibold text-slate-800 dark:text-slate-200">{user?.email}</div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50/70 dark:bg-[#171A21] border border-slate-200/80 dark:border-[#2A2F38]">
            <div className="text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Department
            </div>
            <div className="font-semibold text-slate-800 dark:text-slate-200">{user?.department}</div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50/70 dark:bg-[#171A21] border border-slate-200/80 dark:border-[#2A2F38]">
            <div className="text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Role Classification
            </div>
            <div className="font-semibold text-slate-800 dark:text-slate-200">
              {user?.role === 'ADMIN' ? 'Administrator (Full Access)' : 'Employee (Knowledge Query & Ingestion)'}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50/70 dark:bg-[#171A21] border border-slate-200/80 dark:border-[#2A2F38]">
            <div className="text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5" /> Enterprise Member Since
            </div>
            <div className="font-semibold text-slate-800 dark:text-slate-200">{user?.joinedDate || '2023'}</div>
          </div>
        </div>
      </div>

      {/* SECTION 2: PREFERENCES (Real Theme Switching) */}
      <div className="bg-white dark:bg-[#1D2129] rounded-xl border border-slate-200 dark:border-[#2A2F38] shadow-2xs p-6 space-y-6 transition-colors">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Preferences
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure appearance and notifications.
          </p>
        </div>

        {/* Theme Toggle (Requirement 10, 11, 12, 13, 14, 17) */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Theme</label>
          <div className="grid grid-cols-3 gap-2.5 max-w-md">
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer ${
                theme === 'light'
                  ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                  : 'border-slate-200 dark:border-[#2A2F38] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer ${
                theme === 'dark'
                  ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                  : 'border-slate-200 dark:border-[#2A2F38] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Moon className="w-4 h-4 text-slate-600 dark:text-blue-400" />
              <span>Dark</span>
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange('system')}
              className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer ${
                theme === 'system'
                  ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                  : 'border-slate-200 dark:border-[#2A2F38] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Laptop className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>System</span>
            </button>
          </div>
        </div>

        {/* Notification Switches */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#2A2F38]">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Notifications</label>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#171A21] border border-slate-200/80 dark:border-[#2A2F38]">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  AI response notifications
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Receive toast updates when answers are fully synthesized.
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.aiResponseNotifications}
              onChange={() => handleToggleNotification('aiResponseNotifications')}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#171A21] border border-slate-200/80 dark:border-[#2A2F38]">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Document processing notifications
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Alert when uploaded documents finish embedding and vector indexing.
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.documentProcessingNotifications}
              onChange={() => handleToggleNotification('documentProcessingNotifications')}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: ACTIVE ENTERPRISE SESSION & SECURITY INFO (Requirement: User/session information) */}
      <div className="bg-white dark:bg-[#1D2129] rounded-xl border border-slate-200 dark:border-[#2A2F38] shadow-2xs p-6 space-y-4 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#2A2F38]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Active Session &amp; Security
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cryptographic session state, device gateway, and authentication token
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Session
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#171A21] border border-slate-200/80 dark:border-[#2A2F38]">
            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-slate-400" />
              Session Token ID
            </div>
            <div className="font-mono font-semibold text-slate-900 dark:text-slate-100 text-xs">
              {MOCK_SESSION_INFO.sessionId}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#171A21] border border-slate-200/80 dark:border-[#2A2F38]">
            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-slate-400" />
              Login Timestamp
            </div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
              {MOCK_SESSION_INFO.loginTime}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#171A21] border border-slate-200/80 dark:border-[#2A2F38]">
            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-slate-400" />
              Network Location &amp; IP
            </div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs font-mono">
              {MOCK_SESSION_INFO.ipAddress}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{MOCK_SESSION_INFO.networkLocation}</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#171A21] border border-slate-200/80 dark:border-[#2A2F38]">
            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-slate-400" />
              Encryption Protocol &amp; Token
            </div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
              {MOCK_SESSION_INFO.encryption}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
              Token refresh in: {MOCK_SESSION_INFO.tokenExpiry}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: ACCOUNT & LOGOUT */}
      <div className="bg-white dark:bg-[#1D2129] rounded-xl border border-slate-200 dark:border-[#2A2F38] shadow-2xs p-6 flex items-center justify-between transition-colors">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Session Controls</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sign out of your active enterprise session on this workstation.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
      />

      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </div>
  );
};
