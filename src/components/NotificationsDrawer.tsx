import React from 'react';
import { NotificationItem } from '../types';
import { api } from '../api';
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock,
  Info,
  X,
} from 'lucide-react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onNotificationsUpdated: () => void;
}

const typeIcons = {
  info: <Info className="h-4 w-4 text-blue-500 shrink-0" />,
  success: <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />,
  warning: <Clock className="h-4 w-4 text-amber-500 shrink-0" />,
  alert: <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />,
};

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onNotificationsUpdated,
}) => {
  if (!isOpen) return null;

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationRead();
      onNotificationsUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      onNotificationsUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Team Updates & Notices
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
            >
              Mark all as read
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => !item.read && handleMarkSingleRead(item.id)}
              className={`p-3 text-xs rounded-lg transition-colors cursor-pointer ${
                item.read
                  ? 'opacity-70 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  : 'bg-slate-50/80 dark:bg-slate-800/60 font-medium hover:bg-slate-100'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {typeIcons[item.type]}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </span>
                    {!item.read && (
                      <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.message}
                  </p>
                  <div className="text-[10px] text-slate-400 pt-0.5">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400">
              No recent notifications or updates.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
