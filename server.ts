import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Native cookie parser helper (using Node built-ins)
function parseCookies(req: express.Request): Record<string, string> {
  const list: Record<string, string> = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      const name = parts.shift()?.trim();
      if (name) {
        list[name] = decodeURIComponent(parts.join('='));
      }
    });
  }
  return list;
}

// Data persistence paths
const DATA_DIR = path.resolve(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Password hashing helpers using Node crypto
function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(password: string, salt: string, hash: string): boolean {
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(derived, 'hex'), Buffer.from(hash, 'hex'));
}

// Types for internal server storage
interface StoredUser {
  id: string;
  username: string;
  name: string;
  role: 'Designer' | 'Developer' | 'QA' | 'Manager';
  salt: string;
  passwordHash: string;
  verified: boolean;
  createdAt: string;
}

// Load and save users from JSON file
function loadUsers(): StoredUser[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read users file:', err);
  }
  return [];
}

function saveUsers(users: StoredUser[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save users file:', err);
  }
}

function sanitizeUser(user: StoredUser) {
  const { salt, passwordHash, ...safe } = user;
  return safe;
}

// Initialize seed users (including embedded manager and ready-to-test role accounts)
function initializeDefaultAccounts() {
  const users = loadUsers();
  let modified = false;

  const managerUser = process.env.MANAGER_USERNAME || 'manager';
  const managerPass = process.env.MANAGER_PASSWORD || 'SysOps2026!Manager';

  // Check if manager account exists
  let manager = users.find((u) => u.role === 'Manager' || u.username === managerUser);
  if (!manager) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(managerPass, salt);
    users.push({
      id: 'usr_mgr_01',
      username: managerUser,
      name: 'Operations Lead (Manager)',
      role: 'Manager',
      salt,
      passwordHash: hash,
      verified: true,
      createdAt: new Date().toISOString(),
    });
    modified = true;
  }

  // Pre-seed demo team members if they don't exist yet
  const defaults: Array<{ username: string; name: string; role: StoredUser['role']; pass: string }> = [
    { username: 'designer', name: 'Elena Rostova', role: 'Designer', pass: 'Designer2026!' },
    { username: 'dev', name: 'Marcus Chen', role: 'Developer', pass: 'DevOps2026!' },
    { username: 'qa', name: 'Sophia Miller', role: 'QA', pass: 'Quality2026!' },
  ];

  for (const item of defaults) {
    if (!users.some((u) => u.username === item.username)) {
      const salt = crypto.randomBytes(16).toString('hex');
      users.push({
        id: `usr_${item.username}_01`,
        username: item.username,
        name: item.name,
        role: item.role,
        salt,
        passwordHash: hashPassword(item.pass, salt),
        verified: true,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      });
      modified = true;
    }
  }

  if (modified) {
    saveUsers(users);
  }
}

initializeDefaultAccounts();

// In-Memory state: Sessions, Tasks, Pull Requests, Docker Builds, QA Runs, Releases, Notifications
interface SessionData {
  userId: string;
  username: string;
  role: StoredUser['role'];
  createdAt: number;
  expiresAt: number;
}

const activeSessions = new Map<string, SessionData>();

// In-memory Tasks
interface InMemTask {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  role: StoredUser['role'];
  assignee: string;
  createdAt: string;
  updatedAt: string;
}

let tasks: InMemTask[] = [
  {
    id: 'TSK-101',
    title: 'Improve login speed and screen response time',
    description: 'Optimize user session verification so screens load in under a second.',
    status: 'in_progress',
    priority: 'high',
    role: 'Developer',
    assignee: 'dev',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'TSK-102',
    title: 'Review text readability and color contrast',
    description: 'Ensure dark mode and light mode have high contrast and are easy for everyone to read.',
    status: 'review',
    priority: 'medium',
    role: 'Designer',
    assignee: 'designer',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'TSK-103',
    title: 'Run automated safety check on mobile screens',
    description: 'Check that buttons, logins, and task cards work properly on phones and tablets.',
    status: 'backlog',
    priority: 'critical',
    role: 'QA',
    assignee: 'qa',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'TSK-104',
    title: 'Review and approve Version 2.2 update for users',
    description: 'Check team readiness, test results, and approve official app update for all users.',
    status: 'backlog',
    priority: 'high',
    role: 'Manager',
    assignee: 'manager',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'TSK-105',
    title: 'Update background software dependencies',
    description: 'Upgrade underlying libraries to keep user accounts and passwords safe.',
    status: 'done',
    priority: 'high',
    role: 'Developer',
    assignee: 'dev',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

// In-memory Pull Requests
interface InMemPR {
  id: string;
  title: string;
  author: string;
  role: StoredUser['role'];
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

let pullRequests: InMemPR[] = [
  {
    id: 'PR-892',
    title: 'Add traffic limiter to prevent app overload',
    author: 'dev',
    role: 'Developer',
    branch: 'feat/traffic-limiter',
    targetBranch: 'main',
    status: 'open',
    ciStatus: 'success',
    diffStats: { filesChanged: 4, additions: 182, deletions: 24 },
    summary: 'Prevents automated spam and heavy traffic from slowing down the app for normal users.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'PR-890',
    title: 'Update card colors for comfortable readability',
    author: 'designer',
    role: 'Designer',
    branch: 'design/contrast-fix',
    targetBranch: 'main',
    status: 'merged',
    ciStatus: 'success',
    diffStats: { filesChanged: 2, additions: 45, deletions: 12 },
    summary: 'Refined background and text colors to make sure cards and tables are crisp and clear.',
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    mergedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'PR-893',
    title: 'Add automated tests for session timeouts',
    author: 'qa',
    role: 'QA',
    branch: 'qa/session-tests',
    targetBranch: 'main',
    status: 'open',
    ciStatus: 'success',
    diffStats: { filesChanged: 3, additions: 94, deletions: 8 },
    summary: 'Tests that expired sessions safely return users to the sign-in screen.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

// In-memory Docker Builds
interface InMemBuild {
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

let dockerBuilds: InMemBuild[] = [
  {
    id: 'BLD-4091',
    tag: 'sysops/api-gateway:v2.14.0-rc1',
    service: 'api-gateway',
    triggeredBy: 'dev',
    status: 'success',
    durationSec: 38,
    logs: [
      '[1/6] FROM node:22-alpine AS builder',
      '[2/6] WORKDIR /app && COPY package*.json ./',
      '[3/6] RUN npm ci --omit=dev --ignore-scripts',
      '[4/6] COPY . . && RUN npm run build:ts',
      '[5/6] EXPOSE 3000',
      '[6/6] HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:3000/health || exit 1',
      'Successfully built image 9f3e41ab7e20',
      'Tagged sysops/api-gateway:v2.14.0-rc1',
    ],
    imageDigest: 'sha256:9f3e41ab7e208a1c90c74df52b11',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
];

// In-memory QA Runs
interface InMemQARun {
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

let qaRuns: InMemQARun[] = [
  {
    id: 'QA-504',
    suiteName: 'Core API Regression & Contract Suite',
    triggeredBy: 'qa',
    status: 'passed',
    totalTests: 48,
    passedTests: 48,
    failedTests: 0,
    durationMs: 1420,
    details: [
      'PASS src/test/auth.test.ts (4 ms)',
      'PASS src/test/rbac-matrix.test.ts (8 ms)',
      'PASS src/test/session-cookie.test.ts (12 ms)',
      'PASS src/test/tasks-api.test.ts (6 ms)',
      'PASS src/test/gateway-throttling.test.ts (24 ms)',
    ],
    executedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

// In-memory Releases
interface InMemRelease {
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

let releases: InMemRelease[] = [
  {
    id: 'REL-091',
    version: 'v2.13.4',
    environment: 'production',
    status: 'healthy',
    approvedBy: 'manager',
    triggeredBy: 'manager',
    commitHash: '8b7e21a',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    notes: 'Hotfix for connection pool leak under heavy telemetry query spikes.',
  },
];

// In-memory Notifications
interface InMemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
  read: boolean;
  targetRole?: StoredUser['role'];
}

let notifications: InMemNotification[] = [
  {
    id: 'notif-1',
    title: 'Manager Approval Ready',
    message: 'Manager account is active. Check the Team tab to approve any new team members.',
    type: 'info',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Safety Check Passed',
    message: 'Proposed change PR-892 passed all automated safety and quality checks.',
    type: 'success',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: false,
    targetRole: 'Developer',
  },
  {
    id: 'notif-3',
    title: 'Quality Check Complete',
    message: 'App Login & Navigation checkup passed 48 out of 48 checks with zero problems.',
    type: 'success',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    read: false,
    targetRole: 'QA',
  },
];

// Authentication Middleware
function getAuthenticatedUser(req: express.Request): StoredUser | null {
  const cookies = parseCookies(req);
  const sessionToken = cookies['sysops_session'];
  if (!sessionToken) return null;

  const session = activeSessions.get(sessionToken);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(sessionToken);
    return null;
  }

  const users = loadUsers();
  return users.find((u) => u.id === session.userId) || null;
}

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Session missing or expired' });
  }
  (req as any).user = user;
  next();
}

/* ========================================================================== */
/*                             API ROUTE HANDLERS                             */
/* ========================================================================== */

// GET /api/auth/me - Restore existing session
app.get('/api/auth/me', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  return res.json({ user: sanitizeUser(user) });
});

// POST /api/auth/signin
app.post('/api/auth/signin', (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Username, password, and role are all required.' });
  }

  const users = loadUsers();
  const user = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());

  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  // Verify password with salted hash
  if (!verifyPassword(password, user.salt, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  // Critical requirement: Sign-in requires matching username, password, and role.
  if (user.role !== role) {
    return res.status(401).json({
      error: `Role mismatch: This account is registered as '${user.role}', not '${role}'. Please switch to the correct role tab.`,
    });
  }

  // Issue session token
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const maxAge = 86400 * 1000; // 24 hours
  activeSessions.set(sessionToken, {
    userId: user.id,
    username: user.username,
    role: user.role,
    createdAt: Date.now(),
    expiresAt: Date.now() + maxAge,
  });

  // Set HTTP-only cookie
  res.setHeader(
    'Set-Cookie',
    `sysops_session=${sessionToken}; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400`
  );

  return res.json({
    user: sanitizeUser(user),
    message: `Welcome back, ${user.name}!`,
  });
});

// POST /api/auth/signup - Self-service signup for Designer, Developer, QA. Manager signup disabled.
app.post('/api/auth/signup', (req, res) => {
  const { username, password, name, role } = req.body;

  if (!username || !password || !name || !role) {
    return res.status(400).json({ error: 'All fields (username, password, full name, role) are required.' });
  }

  const cleanUsername = username.trim().toLowerCase();

  // Explicit rule: Manager signup is disabled
  if (role === 'Manager') {
    return res.status(403).json({
      error:
        'Self-service signup is disabled for Team Manager. Manager accounts are embedded and provisioned at the server level so managers can verify team members.',
    });
  }

  const validRoles: Array<StoredUser['role']> = ['Designer', 'Developer', 'QA'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be Designer, Developer, or QA.' });
  }

  if (cleanUsername.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const users = loadUsers();
  if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
    return res.status(409).json({ error: 'Username is already taken. Please choose another.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  const newUser: StoredUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    username: cleanUsername,
    name: name.trim(),
    role,
    salt,
    passwordHash,
    verified: false, // New self-registered users await manager verification!
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Automatically sign them in
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const maxAge = 86400 * 1000;
  activeSessions.set(sessionToken, {
    userId: newUser.id,
    username: newUser.username,
    role: newUser.role,
    createdAt: Date.now(),
    expiresAt: Date.now() + maxAge,
  });

  res.setHeader(
    'Set-Cookie',
    `sysops_session=${sessionToken}; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400`
  );

  // Add notification for the manager
  notifications.unshift({
    id: `notif-${Date.now()}`,
    title: 'New Member Registration',
    message: `${newUser.name} registered as a ${newUser.role} (@${newUser.username}). Awaiting manager team verification.`,
    type: 'warning',
    timestamp: new Date().toISOString(),
    read: false,
    targetRole: 'Manager',
  });

  return res.status(201).json({
    user: sanitizeUser(newUser),
    message: 'Account created successfully.',
  });
});

// POST /api/auth/signout
app.post('/api/auth/signout', (req, res) => {
  const cookies = parseCookies(req);
  const sessionToken = cookies['sysops_session'];
  if (sessionToken) {
    activeSessions.delete(sessionToken);
  }
  res.setHeader('Set-Cookie', 'sysops_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0');
  return res.json({ success: true, message: 'Signed out successfully.' });
});

// GET /api/tasks
app.get('/api/tasks', requireAuth, (req, res) => {
  const { role, status } = req.query;
  let result = [...tasks];
  if (role) {
    result = result.filter((t) => t.role === role);
  }
  if (status) {
    result = result.filter((t) => t.status === status);
  }
  return res.json(result);
});

// POST /api/tasks
app.post('/api/tasks', requireAuth, (req, res) => {
  const currentUser = (req as any).user as StoredUser;
  const { title, description, status, priority, role, assignee } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Task title is required.' });
  }

  const newTask: InMemTask = {
    id: `TSK-${Math.floor(100 + Math.random() * 900)}`,
    title: title.trim(),
    description: (description || '').trim(),
    status: status || 'backlog',
    priority: priority || 'medium',
    role: role || currentUser.role,
    assignee: assignee || currentUser.username,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  tasks.unshift(newTask);

  notifications.unshift({
    id: `notif-${Date.now()}`,
    title: 'Task Created',
    message: `[${newTask.id}] "${newTask.title}" added to ${newTask.status.replace('_', ' ')}.`,
    type: 'info',
    timestamp: new Date().toISOString(),
    read: false,
  });

  return res.status(201).json(newTask);
});

// PATCH /api/tasks/:id
app.patch('/api/tasks/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  const { status, priority, title, description, assignee, role } = req.body;

  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (title !== undefined) task.title = title.trim();
  if (description !== undefined) task.description = description.trim();
  if (assignee !== undefined) task.assignee = assignee;
  if (role !== undefined) task.role = role;
  task.updatedAt = new Date().toISOString();

  return res.json(task);
});

// DELETE /api/tasks/:id
app.delete('/api/tasks/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found.' });
  }
  tasks.splice(index, 1);
  return res.json({ success: true, message: `Task ${id} deleted.` });
});

// GET /api/metrics - Simulated real-time cluster telemetry
app.get('/api/metrics', requireAuth, (req, res) => {
  const now = new Date();
  // Simulated dynamic jitter based on current second
  const sec = now.getSeconds();
  const cpuBase = 32 + Math.sin(sec / 10) * 12 + (Math.random() * 4 - 2);
  const memBase = 64 + Math.cos(sec / 15) * 6 + (Math.random() * 2 - 1);
  const diskIo = 18 + Math.sin(sec / 5) * 8 + (Math.random() * 3);
  const netMbps = 420 + Math.cos(sec / 8) * 90;
  const latency = 18.4 + Math.abs(Math.sin(sec / 7)) * 14.2;
  const errorRate = 0.04 + (Math.random() < 0.2 ? Math.random() * 0.12 : 0);

  // Generate 12 historical data points for the mini charts
  const history = Array.from({ length: 12 }).map((_, i) => {
    const pastSec = (sec - (11 - i) * 5 + 60) % 60;
    return {
      time: new Date(now.getTime() - (11 - i) * 5000).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
      cpu: Math.max(10, Math.min(95, Math.round((32 + Math.sin(pastSec / 10) * 12 + (i % 3)) * 10) / 10)),
      latency: Math.max(8, Math.round((18.4 + Math.abs(Math.sin(pastSec / 7)) * 14.2) * 10) / 10),
      memory: Math.max(40, Math.round((64 + Math.cos(pastSec / 15) * 6) * 10) / 10),
    };
  });

  return res.json({
    current: {
      timestamp: now.toISOString(),
      cpuUsagePercent: Math.round(cpuBase * 10) / 10,
      memoryUsagePercent: Math.round(memBase * 10) / 10,
      diskIoPercent: Math.round(diskIo * 10) / 10,
      networkThroughputMbps: Math.round(netMbps * 10) / 10,
      latencyP95Ms: Math.round(latency * 10) / 10,
      errorRatePercent: Math.round(errorRate * 100) / 100,
      activeContainers: 24,
      queuedJobs: Math.floor(2 + (sec % 5)),
    },
    history,
  });
});

// GET /api/pull-requests
app.get('/api/pull-requests', requireAuth, (req, res) => {
  return res.json(pullRequests);
});

// POST /api/pull-requests
app.post('/api/pull-requests', requireAuth, (req, res) => {
  const currentUser = (req as any).user as StoredUser;
  const { title, summary, branch, targetBranch } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'PR title is required.' });
  }

  const newPR: InMemPR = {
    id: `PR-${Math.floor(894 + Math.random() * 50)}`,
    title: title.trim(),
    author: currentUser.username,
    role: currentUser.role,
    branch: branch || `feat/${title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 18)}`,
    targetBranch: targetBranch || 'main',
    status: 'open',
    ciStatus: 'pending',
    diffStats: {
      filesChanged: Math.floor(1 + Math.random() * 5),
      additions: Math.floor(20 + Math.random() * 120),
      deletions: Math.floor(4 + Math.random() * 30),
    },
    summary: summary || 'Automated SysOps team submission.',
    createdAt: new Date().toISOString(),
  };

  pullRequests.unshift(newPR);

  // Trigger simulated CI check after 2 seconds
  setTimeout(() => {
    newPR.ciStatus = 'success';
  }, 2000);

  notifications.unshift({
    id: `notif-${Date.now()}`,
    title: 'New Pull Request',
    message: `${newPR.id} "${newPR.title}" submitted by @${newPR.author}.`,
    type: 'info',
    timestamp: new Date().toISOString(),
    read: false,
  });

  return res.status(201).json(newPR);
});

// POST /api/pull-requests/:id/merge
app.post('/api/pull-requests/:id/merge', requireAuth, (req, res) => {
  const currentUser = (req as any).user as StoredUser;
  const { id } = req.params;

  const pr = pullRequests.find((p) => p.id === id);
  if (!pr) {
    return res.status(404).json({ error: 'Pull request not found.' });
  }

  if (pr.status === 'merged') {
    return res.status(400).json({ error: 'Pull request is already merged.' });
  }

  // Developer or Manager can merge
  if (currentUser.role !== 'Developer' && currentUser.role !== 'Manager') {
    return res.status(403).json({ error: 'Only Developer or Manager can merge pull requests.' });
  }

  pr.status = 'merged';
  pr.mergedAt = new Date().toISOString();

  notifications.unshift({
    id: `notif-${Date.now()}`,
    title: 'Pull Request Merged',
    message: `${pr.id} merged into ${pr.targetBranch} by @${currentUser.username}.`,
    type: 'success',
    timestamp: new Date().toISOString(),
    read: false,
  });

  return res.json({ success: true, pullRequest: pr });
});

// POST /api/actions/docker-build - Simulated Docker build
app.post('/api/actions/docker-build', requireAuth, (req, res) => {
  const currentUser = (req as any).user as StoredUser;
  const { service = 'api-gateway', tag = 'latest' } = req.body;

  const buildId = `BLD-${Math.floor(4100 + Math.random() * 500)}`;
  const duration = Math.floor(18 + Math.random() * 20);
  const digest = `sha256:${crypto.randomBytes(16).toString('hex')}`;

  const buildLogs = [
    `[+] Building 1.2s (6/6) FINISHED`,
    ` => [internal] load build definition from Dockerfile`,
    ` => [internal] load .dockerignore`,
    ` => [1/4] FROM node:22-alpine AS runtime`,
    ` => [2/4] WORKDIR /app`,
    ` => [3/4] COPY dist/ ./dist/`,
    ` => [4/4] RUN npm install --omit=dev`,
    ` => exporting to image`,
    ` => => exporting layers`,
    ` => => writing image ${digest}`,
    ` => => naming to sysops/${service}:${tag}`,
    `Successfully tagged sysops/${service}:${tag}`,
  ];

  const newBuild: InMemBuild = {
    id: buildId,
    tag: `sysops/${service}:${tag}`,
    service,
    triggeredBy: currentUser.username,
    status: 'success',
    durationSec: duration,
    logs: buildLogs,
    imageDigest: digest,
    timestamp: new Date().toISOString(),
  };

  dockerBuilds.unshift(newBuild);

  notifications.unshift({
    id: `notif-${Date.now()}`,
    title: 'Docker Build Succeeded',
    message: `${newBuild.tag} built in ${duration}s by @${currentUser.username}.`,
    type: 'success',
    timestamp: new Date().toISOString(),
    read: false,
    targetRole: 'Developer',
  });

  return res.status(201).json(newBuild);
});

// GET /api/actions/docker-build
app.get('/api/actions/docker-build', requireAuth, (req, res) => {
  return res.json(dockerBuilds);
});

// POST /api/actions/qa-run - Simulated QA check
app.post('/api/actions/qa-run', requireAuth, (req, res) => {
  const currentUser = (req as any).user as StoredUser;
  const { suiteName = 'Integration Smoke Suite' } = req.body;

  const total = 36;
  const failed = Math.random() < 0.15 ? 1 : 0;
  const passed = total - failed;
  const duration = Math.floor(950 + Math.random() * 650);

  const newRun: InMemQARun = {
    id: `QA-${Math.floor(510 + Math.random() * 100)}`,
    suiteName,
    triggeredBy: currentUser.username,
    status: failed === 0 ? 'passed' : 'failed',
    totalTests: total,
    passedTests: passed,
    failedTests: failed,
    durationMs: duration,
    details: [
      'PASS tests/unit/session-validation.spec.ts (112ms)',
      'PASS tests/unit/role-guard.spec.ts (84ms)',
      failed === 0
        ? 'PASS tests/e2e/cluster-failover.spec.ts (410ms)'
        : 'FAIL tests/e2e/cluster-failover.spec.ts (Timeout: 5000ms exceeded)',
      'PASS tests/security/sast-scanner.spec.ts (210ms)',
    ],
    executedAt: new Date().toISOString(),
  };

  qaRuns.unshift(newRun);

  notifications.unshift({
    id: `notif-${Date.now()}`,
    title: `QA Suite ${newRun.status.toUpperCase()}`,
    message: `${suiteName}: ${passed}/${total} passed (${duration}ms).`,
    type: newRun.status === 'passed' ? 'success' : 'alert',
    timestamp: new Date().toISOString(),
    read: false,
    targetRole: 'QA',
  });

  return res.status(201).json(newRun);
});

// GET /api/actions/qa-run
app.get('/api/actions/qa-run', requireAuth, (req, res) => {
  return res.json(qaRuns);
});

// POST /api/actions/release - Manager triggered release
app.post('/api/actions/release', requireAuth, (req, res) => {
  const currentUser = (req as any).user as StoredUser;

  // Release requires Manager role
  if (currentUser.role !== 'Manager') {
    return res.status(403).json({ error: 'Production release actions are restricted to Team Managers.' });
  }

  const { version, environment = 'production', notes } = req.body;
  if (!version || !version.trim()) {
    return res.status(400).json({ error: 'Release version tag is required (e.g., v2.15.0).' });
  }

  const newRelease: InMemRelease = {
    id: `REL-${Math.floor(100 + Math.random() * 50)}`,
    version: version.trim(),
    environment,
    status: 'healthy',
    approvedBy: currentUser.username,
    triggeredBy: currentUser.username,
    commitHash: crypto.randomBytes(4).toString('hex'),
    timestamp: new Date().toISOString(),
    notes: notes || 'Standard scheduled release with verified canary stage.',
  };

  releases.unshift(newRelease);

  notifications.unshift({
    id: `notif-${Date.now()}`,
    title: 'Production Release Deployed',
    message: `Release ${newRelease.version} promoted to ${environment} by @${currentUser.username}.`,
    type: 'success',
    timestamp: new Date().toISOString(),
    read: false,
  });

  return res.status(201).json(newRelease);
});

// GET /api/actions/release
app.get('/api/actions/release', requireAuth, (req, res) => {
  return res.json(releases);
});

// GET /api/team - Team roster & verification status
app.get('/api/team', requireAuth, (req, res) => {
  const users = loadUsers();
  return res.json(users.map(sanitizeUser));
});

// POST /api/team/:id/verify - Manager verifies team member
app.post('/api/team/:id/verify', requireAuth, (req, res) => {
  const currentUser = (req as any).user as StoredUser;

  if (currentUser.role !== 'Manager') {
    return res.status(403).json({ error: 'Only Team Managers can verify team members.' });
  }

  const { id } = req.params;
  const users = loadUsers();
  const target = users.find((u) => u.id === id);

  if (!target) {
    return res.status(404).json({ error: 'User not found.' });
  }

  target.verified = true;
  saveUsers(users);

  notifications.unshift({
    id: `notif-${Date.now()}`,
    title: 'Team Member Verified',
    message: `@${target.username} (${target.role}) has been verified by Manager @${currentUser.username}.`,
    type: 'success',
    timestamp: new Date().toISOString(),
    read: false,
  });

  return res.json({ success: true, user: sanitizeUser(target) });
});

// GET /api/notifications
app.get('/api/notifications', requireAuth, (req, res) => {
  const currentUser = (req as any).user as StoredUser;
  // Return notifications relevant to user's role or general
  const filtered = notifications.filter(
    (n) => !n.targetRole || n.targetRole === currentUser.role
  );
  return res.json(filtered);
});

// POST /api/notifications/mark-read
app.post('/api/notifications/mark-read', requireAuth, (req, res) => {
  const { id } = req.body;
  if (id) {
    const item = notifications.find((n) => n.id === id);
    if (item) item.read = true;
  } else {
    notifications.forEach((n) => (n.read = true));
  }
  return res.json({ success: true });
});

/* ========================================================================== */
/*                        FRONTEND SERVING & VITE DEV                         */
/* ========================================================================== */

async function startServer() {
  if (!IS_PROD) {
    // Mount Vite middleware in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SysOps Team Hub] Server active on http://0.0.0.0:${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
