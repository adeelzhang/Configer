import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import configRoutes from './routes/config.js';
import authRoutes from './routes/auth.js';
import { authMiddleware } from './middleware/auth.js';

const app = new Hono();

// 中间件
app.use('*', logger());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));

// 健康检查
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 认证路由（不需要 API Key）
app.route('/api/auth', authRoutes);

// 配置管理路由（需要 API Key 或 Session）
app.use('/api/config/*', authMiddleware);
app.route('/api/config', configRoutes);

// 404
app.notFound((c) => c.json({ error: 'Not Found' }, 404));

// 错误处理
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: err.message || 'Internal Server Error' }, 500);
});

const port = parseInt(process.env.PORT || '8788');

console.log(`🚀 Configer API Server starting on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
