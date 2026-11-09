import React from 'react';
import { User, UserRole } from '../types';
import {
  Activity,
  Bell,
  CheckCircle2,
  Clock,
  GitPullRequest,
  Kanban,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  X,
} from 'lucide-react';

interface SidebarProps {
  user: User;
  activeTab: 'workspace' | 'metrics' | 'pulls' | 'kanban';
  setActiveTab: (tab: 'workspace' | 'metrics' | 'pulls' | 'kanban') => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  onSignOut: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const roleFriendlyNames: Record<UserRole, { title: string; color: string; badge: string }> = {
  Designer: {
    title: 'Product Designer',
    color: 'text-indigo-600 dark:text-indigo-400',
    badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
  },
  Developer: {
    title: 'Software Developer',
    color: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
  QA: {
    title: 'Quality Tester',
    color: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  },
  Manager: {
    title: 'Team Manager',
    color: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
  },
};

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenNotifications,
  unreadCount,
  onSignOut,
  isDark,
  onToggleTheme,
  isOpenMobile,
  onCloseMobile,
}) => {
  const roleInfo = roleFriendlyNames[user.role];

  const navItems: Array<{
    id: 'workspace' | 'metrics' | 'pulls' | 'kanban';
    label: string;
    icon: React.ReactNode;
    subtitle: string;
  }> = [
    {
      id: 'workspace',
      label: 'My Workspace',
      subtitle: 'Your personal role tools',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      id: 'metrics',
      label: 'System Health',
      subtitle: 'Server speed & performance',
      icon: <Activity className="h-4 w-4" />,
    },
    {
      id: 'pulls',
      label: 'Proposed Changes',
      subtitle: 'Review & approve features',
      icon: <GitPullRequest className="h-4 w-4" />,
    },
    {
      id: 'kanban',
      label: 'Task Board',
      subtitle: 'Team project progress',
      icon: <Kanban className="h-4 w-4" />,
    },
  ];

  const handleNavClick = (tab: 'workspace' | 'metrics' | 'pulls' | 'kanban') => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const sidebarContent = (
    <aside className="w-64 h-full flex flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors">
      
      {/* Top Section: Brand & Navigation */}
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-sm shadow-xs">
              SO
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                SysOps Hub
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Team Workspace
              </span>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="p-3 space-y-6">
          <div>
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Main Menu
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all text-left group ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold shadow-xs dark:bg-slate-100 dark:text-slate-900'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span className={isActive ? 'text-white dark:text-slate-900' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}>
                      {item.icon}
                    </span>
                    <div className="flex flex-col">
                      <span className="leading-tight">{item.label}</span>
                      <span className={`text-[10px] leading-tight ${isActive ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500'}`}>
                        {item.subtitle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Section: User Profile & Utility Controls */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
        
        {/* User Card */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200 shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {user.name}
                </span>
                {user.verified ? (
                  <span title="Approved member">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  </span>
                ) : (
                  <span title="Waiting for approval">
                    <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium truncate ${roleInfo.color}`}>
                {roleInfo.title}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls Row */}
        <div className="grid grid-cols-3 gap-1 pt-1">
          {/* Notifications */}
          <button
            onClick={() => {
              onOpenNotifications();
              onCloseMobile();
            }}
            className="relative flex flex-col items-center justify-center py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            title="Team notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="text-[10px] mt-1 font-medium">Alerts</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="flex flex-col items-center justify-center py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            title="Toggle light/dark appearance"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="text-[10px] mt-1 font-medium">{isDark ? 'Light' : 'Dark'}</span>
          </button>

          {/* Sign Out */}
          <button
            onClick={onSignOut}
            className="flex flex-col items-center justify-center py-2 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 transition-colors"
            title="Sign out of account"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-[10px] mt-1 font-medium">Logout</span>
          </button>
        </div>

      </div>

    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block shrink-0 sticky top-0 h-screen z-20">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Backdrop & Slide-over */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-900/50 backdrop-blur-xs flex">
          <div className="relative w-64 max-w-xs h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
          <div
            className="flex-1 h-full cursor-pointer"
            onClick={onCloseMobile}
          />
        </div>
      )}
    </>
  );
};
