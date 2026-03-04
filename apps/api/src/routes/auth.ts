import { Hono } from 'hono';
import { createSession, verifyPassword } from '../middleware/auth.js';

const app = new Hono();

// 登录
app.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { password } = body;

    if (!password) {
      return c.json({ error: 'Password is required' }, 400);
    }

    if (!verifyPassword(password)) {
      return c.json({ error: 'Invalid password' }, 401);
    }

    const token = createSession('admin');
    return c.json({ token, message: 'Login successful' });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default app;
