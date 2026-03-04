import { Context, Next } from 'hono';

const API_KEY = process.env.API_KEY || 'configer-default-key';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// 简单的 session 存储（生产环境应使用 Redis）
const sessions = new Map<string, { username: string; createdAt: number }>();

export async function authMiddleware(c: Context, next: Next) {
  // 检查 API Key（用于外部调用 - 只读权限）
  const apiKey = c.req.header('X-API-Key');
  if (apiKey === API_KEY) {
    // API Key 只允许 GET 请求（只读）
    if (c.req.method === 'GET') {
      return next();
    } else {
      return c.json({ error: 'API Key only allows read-only access. Use web interface to modify configurations.' }, 403);
    }
  }

  // 检查 Session（用于 Web 界面 - 完全权限）
  const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '');
  if (sessionToken && sessions.has(sessionToken)) {
    const session = sessions.get(sessionToken)!;
    // Session 有效期 24 小时
    if (Date.now() - session.createdAt < 24 * 60 * 60 * 1000) {
      return next();
    } else {
      sessions.delete(sessionToken);
    }
  }

  return c.json({ error: 'Unauthorized' }, 401);
}

export function createSession(username: string): string {
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  sessions.set(token, { username, createdAt: Date.now() });
  return token;
}

export function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function getApiKey(): string {
  return API_KEY;
}
