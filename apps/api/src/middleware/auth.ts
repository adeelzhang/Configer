import { Context, Next } from 'hono';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// 简单的 session 存储（生产环境应使用 Redis）
const sessions = new Map<string, { username: string; createdAt: number }>();

export async function authMiddleware(c: Context, next: Next) {
  // GET 请求完全开放，不需要认证
  if (c.req.method === 'GET') {
    return next();
  }

  // POST/PUT/DELETE 请求需要 Session Token（管理端登录）
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

  return c.json({ error: 'Unauthorized. Please login via web interface to modify configurations.' }, 401);
}

export function createSession(username: string): string {
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  sessions.set(token, { username, createdAt: Date.now() });
  return token;
}

export function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}


