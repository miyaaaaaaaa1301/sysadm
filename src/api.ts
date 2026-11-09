import {
  AuthResponse,
  DockerBuild,
  MetricSnapshot,
  NotificationItem,
  PullRequest,
  QATestRun,
  ReleasePipeline,
  Task,
  User,
  UserRole,
} from './types';

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Ensures HTTP-only cookie is included
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `HTTP error ${res.status}`);
  }
  return data as T;
}

export const api = {
  // Auth
  async checkSession(): Promise<{ user: User }> {
    return fetchJson<{ user: User }>('/api/auth/me');
  },

  async signIn(username: string, password: string, role: UserRole): Promise<AuthResponse> {
    return fetchJson<AuthResponse>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
    });
  },

  async signUp(username: string, password: string, name: string, role: UserRole): Promise<AuthResponse> {
    return fetchJson<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, password, name, role }),
    });
  },

  async signOut(): Promise<{ success: boolean }> {
    return fetchJson<{ success: boolean }>('/api/auth/signout', {
      method: 'POST',
    });
  },

  // Tasks (Kanban)
  async getTasks(params?: { role?: UserRole; status?: string }): Promise<Task[]> {
    const query = new URLSearchParams();
    if (params?.role) query.set('role', params.role);
    if (params?.status) query.set('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<Task[]>(`/api/tasks${qs}`);
  },

  async createTask(task: Partial<Task>): Promise<Task> {
    return fetchJson<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    return fetchJson<Task>(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteTask(id: string): Promise<{ success: boolean }> {
    return fetchJson<{ success: boolean }>(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  // Metrics
  async getMetrics(): Promise<{
    current: MetricSnapshot;
    history: Array<{ time: string; cpu: number; latency: number; memory: number }>;
  }> {
    return fetchJson('/api/metrics');
  },

  // Pull Requests
  async getPullRequests(): Promise<PullRequest[]> {
    return fetchJson<PullRequest[]>('/api/pull-requests');
  },

  async createPullRequest(data: { title: string; summary: string; branch?: string; targetBranch?: string }): Promise<PullRequest> {
    return fetchJson<PullRequest>('/api/pull-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async mergePullRequest(id: string): Promise<{ success: boolean; pullRequest: PullRequest }> {
    return fetchJson(`/api/pull-requests/${id}/merge`, {
      method: 'POST',
    });
  },

  // Docker Builds
  async triggerDockerBuild(service: string, tag: string): Promise<DockerBuild> {
    return fetchJson<DockerBuild>('/api/actions/docker-build', {
      method: 'POST',
      body: JSON.stringify({ service, tag }),
    });
  },

  async getDockerBuilds(): Promise<DockerBuild[]> {
    return fetchJson<DockerBuild[]>('/api/actions/docker-build');
  },

  // QA Runs
  async triggerQARun(suiteName: string): Promise<QATestRun> {
    return fetchJson<QATestRun>('/api/actions/qa-run', {
      method: 'POST',
      body: JSON.stringify({ suiteName }),
    });
  },

  async getQARuns(): Promise<QATestRun[]> {
    return fetchJson<QATestRun[]>('/api/actions/qa-run');
  },

  // Releases
  async triggerRelease(version: string, environment: string, notes: string): Promise<ReleasePipeline> {
    return fetchJson<ReleasePipeline>('/api/actions/release', {
      method: 'POST',
      body: JSON.stringify({ version, environment, notes }),
    });
  },

  async getReleases(): Promise<ReleasePipeline[]> {
    return fetchJson<ReleasePipeline[]>('/api/actions/release');
  },

  // Team
  async getTeam(): Promise<User[]> {
    return fetchJson<User[]>('/api/team');
  },

  async verifyTeamMember(id: string): Promise<{ success: boolean; user: User }> {
    return fetchJson(`/api/team/${id}/verify`, {
      method: 'POST',
    });
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    return fetchJson<NotificationItem[]>('/api/notifications');
  },

  async markNotificationRead(id?: string): Promise<{ success: boolean }> {
    return fetchJson('/api/notifications/mark-read', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  },
};
