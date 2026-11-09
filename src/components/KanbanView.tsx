import React, { useState, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus, User, UserRole } from '../types';
import { api } from '../api';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  User as UserIcon,
} from 'lucide-react';

interface KanbanViewProps {
  user: User;
}

const columns: Array<{ id: TaskStatus; label: string }> = [
  { id: 'backlog', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'review', label: 'Needs Review' },
  { id: 'done', label: 'Completed' },
];

const priorityDisplay: Record<TaskPriority, { label: string; text: string }> = {
  low: { label: 'Low', text: 'text-slate-500' },
  medium: { label: 'Normal', text: 'text-blue-600 dark:text-blue-400 font-medium' },
  high: { label: 'Important', text: 'text-amber-600 dark:text-amber-400 font-semibold' },
  critical: { label: 'Urgent', text: 'text-rose-600 dark:text-rose-400 font-bold' },
};

export const KanbanView: React.FC<KanbanViewProps> = ({ user }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('backlog');
  const [taskRole, setTaskRole] = useState<UserRole>(user.role);
  const [assignee, setAssignee] = useState(user.username);

  const loadTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks', err);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleMoveTask = async (task: Task, direction: 'prev' | 'next') => {
    const order: TaskStatus[] = ['backlog', 'in_progress', 'review', 'done'];
    const currentIndex = order.indexOf(task.status);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (newIndex < 0 || newIndex >= order.length) return;

    const newStatus = order[newIndex];
    try {
      const updated = await api.updateTask(task.id, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? updated : t))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const created = await api.createTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        role: taskRole,
        assignee: assignee.trim() || user.username,
      });

      setTasks((prev) => [created, ...prev]);
      setShowAddModal(false);
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterRole === 'all') return true;
    return t.role === filterRole;
  });

  return (
    <div className="space-y-6">
      {/* Board Header */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
              <span>TEAM PLANNING · SHARED TASK BOARD</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Team Task Board
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Track project work from start to finish. Move cards between columns to keep everyone on the team aligned.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {[
                { id: 'all', label: 'All Roles' },
                { id: 'Designer', label: 'Design' },
                { id: 'Developer', label: 'Development' },
                { id: 'QA', label: 'Testing' },
                { id: 'Manager', label: 'Management' },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setFilterRole(r.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    filterRole === r.id
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Add Task Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add New Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-3 min-h-[500px]"
            >
              {/* Column Title & Counter */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                  {col.label}
                </span>
                <span className="font-mono text-[11px] text-slate-500 font-semibold px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards Container */}
              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 transition-all text-xs space-y-2 group"
                  >
                    {/* Card Header: ID + Priority */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-slate-400">
                        {task.id}
                      </span>
                      <span className={priorityDisplay[task.priority].text}>
                        {priorityDisplay[task.priority].label} Priority
                      </span>
                    </div>

                    {/* Card Title */}
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                      {task.title}
                    </h3>

                    {/* Card Description */}
                    {task.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      <div className="flex items-center gap-1.5">
                        <UserIcon className="h-3 w-3 text-slate-400" />
                        <span>@{task.assignee}</span>
                        <span>·</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {task.role}
                        </span>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 hover:text-rose-600 transition-opacity p-0.5"
                        title="Delete task"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Stage shift arrows */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        disabled={col.id === 'backlog'}
                        onClick={() => handleMoveTask(task, 'prev')}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 transition-colors"
                        title="Move back a stage"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </button>

                      <button
                        disabled={col.id === 'done'}
                        onClick={() => handleMoveTask(task, 'next')}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 transition-colors"
                        title="Move to next stage"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="h-32 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 text-[11px]">
                    No tasks in {col.label}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Create New Task
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Design clearer search filters"
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Task Details (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what needs to be done..."
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Normal Priority</option>
                    <option value="high">Important Priority</option>
                    <option value="critical">Urgent Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Starting Column
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="backlog">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Needs Review</option>
                    <option value="done">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department / Role
                  </label>
                  <select
                    value={taskRole}
                    onChange={(e) => setTaskRole(e.target.value as any)}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="Designer">Product Designer</option>
                    <option value="Developer">Software Developer</option>
                    <option value="QA">Quality Tester</option>
                    <option value="Manager">Team Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Person
                  </label>
                  <input
                    type="text"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    placeholder="e.g. dev or your name"
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold rounded"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
