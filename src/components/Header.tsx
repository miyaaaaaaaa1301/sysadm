import React from 'react';
import { User } from '../types';
import {
  Bell,
  Menu,
  Moon,
  Sun,
} from 'lucide-react';

interface HeaderProps {
  user: User;
  activeTab: 'workspace' | 'metrics' | 'pulls' | 'kanban';
  onOpenMobileSidebar: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  isDark: boolean;
  onToggleTheme: () => void;
}

const tabTitles: Record<'workspace' | 'metrics' | 'pulls' | 'kanban', { title: string; subtitle: string }> = {
  workspace: {
    title: 'My Workspace',
    subtitle: 'Role-based tools and action controls',
  },
  metrics: {
    title: 'System Health',
    subtitle: 'Live computer speed, memory, and loading times',
  },
  pulls: {
    title: 'Proposed Changes',
    subtitle: 'Review and approve new features and updates',
  },
  kanban: {
    title: 'Team Task Board',
    subtitle: 'Organize and track progress across team columns',
  },
};

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  onOpenMobileSidebar,
  onOpenNotifications,
  unreadCount,
  isDark,
  onToggleTheme,
}) => {
  const currentTab = tabTitles[activeTab];

  return (
    <header className="sticky top-0 z-10 w-full h-16 border-b border-slate-200 bg-white/95 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu Toggle + Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
            aria-label="Open sidebar menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
              <span>SysOps Hub</span>
              <span>/</span>
              <span className="text-slate-900 dark:text-slate-100 font-semibold">
                {currentTab.title}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              {currentTab.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Unread Alerts + Theme */}
        <div className="flex items-center gap-2">
          {/* Quick Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            title="Team notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            title="Toggle light or dark look"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

      </div>
    </header>
  );
};
