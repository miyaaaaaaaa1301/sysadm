import React, { useState, useEffect } from 'react';
import { User, NotificationItem } from './types';
import { api } from './api';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AuthView } from './components/AuthView';
import { WorkspaceDesigner } from './components/WorkspaceDesigner';
import { WorkspaceDeveloper } from './components/WorkspaceDeveloper';
import { WorkspaceQA } from './components/WorkspaceQA';
import { WorkspaceManager } from './components/WorkspaceManager';
import { MetricsView } from './components/MetricsView';
import { PullRequestsView } from './components/PullRequestsView';
import { KanbanView } from './components/KanbanView';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'workspace' | 'metrics' | 'pulls' | 'kanban'>('workspace');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Theme state: explicitly light by default as requested
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('sysops_theme') === 'dark';
  });

  // Drawer and notification states
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Apply theme to document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sysops_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sysops_theme', 'light');
    }
  }, [isDark]);

  // Check existing session on load
  const checkSession = async () => {
    try {
      setLoading(true);
      const res = await api.checkSession();
      setUser(res.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await api.signOut();
    } catch (err) {
      console.error(err);
    }
    setUser(null);
  };

  const handleCreateTaskFromWorkspace = async (title: string, description: string, priority: any = 'medium') => {
    if (!user) return;
    try {
      await api.createTask({
        title,
        description,
        priority,
        status: 'backlog',
        role: user.role,
        assignee: user.username,
      });
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitPRFromWorkspace = async (title: string, summary: string) => {
    if (!user) return;
    try {
      await api.createPullRequest({
        title,
        summary,
        targetBranch: 'main',
      });
      loadNotifications();
      setActiveTab('pulls');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-500 font-mono text-xs gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-slate-900 dark:text-slate-100" />
        <span>Restoring SysOps session...</span>
      </div>
    );
  }

  if (!user) {
    return <AuthView onSuccess={(loggedUser) => setUser(loggedUser)} />;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      
      {/* Clean Sidebar Navigation */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadCount={unreadCount}
        onSignOut={handleSignOut}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Context Header */}
        <Header
          user={user}
          activeTab={activeTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadCount={unreadCount}
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
        />

        {/* Viewport Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full">
          
          {/* Workspace Tab */}
          {activeTab === 'workspace' && (
            <div>
              {user.role === 'Designer' && (
                <WorkspaceDesigner
                  user={user}
                  onCreateTask={handleCreateTaskFromWorkspace}
                  onSubmitPR={handleSubmitPRFromWorkspace}
                />
              )}
              {user.role === 'Developer' && (
                <WorkspaceDeveloper
                  user={user}
                  onOpenPRModal={() => setActiveTab('pulls')}
                  onCreateTask={handleCreateTaskFromWorkspace}
                />
              )}
              {user.role === 'QA' && (
                <WorkspaceQA
                  user={user}
                  onCreateTask={handleCreateTaskFromWorkspace}
                />
              )}
              {user.role === 'Manager' && (
                <WorkspaceManager
                  user={user}
                  onCreateTask={handleCreateTaskFromWorkspace}
                />
              )}
            </div>
          )}

          {/* Global Operational Areas */}
          {activeTab === 'metrics' && <MetricsView />}
          {activeTab === 'pulls' && <PullRequestsView user={user} />}
          {activeTab === 'kanban' && <KanbanView user={user} />}

        </main>
      </div>

      {/* Slide-over Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onNotificationsUpdated={loadNotifications}
      />

    </div>
  );
}
