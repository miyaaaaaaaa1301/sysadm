export type UserRole = 'Designer' | 'Developer' | 'QA' | 'Manager';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  verified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  message?: string;
}

export type TaskStatus = 'backlog' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  role: UserRole;
  assignee: string;
  createdAt: string;
  updatedAt: string;
}

export interface MetricSnapshot {
  timestamp: string;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  diskIoPercent: number;
  networkThroughputMbps: number;
  latencyP95Ms: number;
  errorRatePercent: number;
  activeContainers: number;
  queuedJobs: number;
}

export interface PullRequest {
  id: string;
  title: string;
  author: string;
  role: UserRole;
  branch: string;
  targetBranch: string;
  status: 'open' | 'merged' | 'closed';
  ciStatus: 'pending' | 'success' | 'failed';
  diffStats: {
    filesChanged: number;
    additions: number;
    deletions: number;
  };
  summary: string;
  createdAt: string;
  mergedAt?: string;
}

export interface QATestRun {
  id: string;
  suiteName: string;
  triggeredBy: string;
  status: 'running' | 'passed' | 'failed';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  durationMs: number;
  details: string[];
  executedAt: string;
}

export interface DockerBuild {
  id: string;
  tag: string;
  service: string;
  triggeredBy: string;
  status: 'building' | 'success' | 'failed';
  durationSec: number;
  logs: string[];
  imageDigest: string;
  timestamp: string;
}

export interface ReleasePipeline {
  id: string;
  version: string;
  environment: 'staging' | 'canary' | 'production';
  status: 'draft' | 'deploying' | 'healthy' | 'rollback';
  approvedBy?: string;
  triggeredBy: string;
  commitHash: string;
  timestamp: string;
  notes: string;
}

export interface TeamMember extends User {
  lastActive: string;
  verifiedBy?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
  read: boolean;
  targetRole?: UserRole;
}
