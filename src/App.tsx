/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { TitleCardAnimation } from './components/auth/TitleCardAnimation';
import { AuthScreen } from './components/auth/AuthScreen';
import { AppLayout } from './components/layout/AppLayout';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [showTitleCard, setShowTitleCard] = useState<boolean>(true);

  if (showTitleCard) {
    return <TitleCardAnimation onComplete={() => setShowTitleCard(false)} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0F1115]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Initializing Enterprise AI Assistant...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <AppLayout />;
};

export default function App() {
  return (
    <ToastProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ToastProvider>
  );
}
