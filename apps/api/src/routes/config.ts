import { Hono } from 'hono';
import * as db from '../db/config.js';

const app = new Hono();

// 获取所有配置
app.get('/', async (c) => {
  try {
    const configs = await db.getAllConfigs();
    return c.json({ configs });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 获取单个配置
app.get('/:key', async (c) => {
  try {
    const key = c.req.param('key');
    const config = await db.getConfig(key);
    
    if (!config) {
      return c.json({ error: 'Config not found' }, 404);
    }
    
    return c.json({ config });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 创建配置
app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return c.json({ error: 'Key and value are required' }, 400);
    }

    const config = await db.createConfig(key, value);
    return c.json({ config }, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

// 更新配置
app.put('/:key', async (c) => {
  try {
    const key = c.req.param('key');
    const body = await c.req.json();
    const { value } = body;

    if (value === undefined) {
      return c.json({ error: 'Value is required' }, 400);
    }

    const config = await db.updateConfig(key, value);
    return c.json({ config });
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

// 删除配置
app.delete('/:key', async (c) => {
  try {
    const key = c.req.param('key');
    await db.deleteConfig(key);
    return c.json({ message: 'Config deleted successfully' });
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

export default app;
