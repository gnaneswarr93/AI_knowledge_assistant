import React, { useState } from 'react';
import { Sidebar, PageId } from './Sidebar';
import { Header } from './Header';
import { AssistantPage } from '../../pages/AssistantPage';
import { KnowledgeBasePage } from '../../pages/KnowledgeBasePage';
import { ProfilePage } from '../../pages/ProfilePage';

export const AppLayout: React.FC = () => {
  const [activePage, setActivePage] = useState<PageId>('assistant');
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0F1115] text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors">
      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        onSelectPage={setActivePage}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activePage={activePage}
          onOpenMobile={() => setMobileOpen(true)}
        />

        <main className="flex-1 min-w-0">
          {activePage === 'assistant' && <AssistantPage />}
          {activePage === 'knowledge' && <KnowledgeBasePage />}
          {activePage === 'profile' && <ProfilePage />}
        </main>
      </div>
    </div>
  );
};
