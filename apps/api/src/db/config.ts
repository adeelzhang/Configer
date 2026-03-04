import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

export interface ConfigItem {
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

interface ConfigData {
  configs: ConfigItem[];
}

// 确保数据目录和文件存在
async function ensureDataFile() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }

  try {
    await fs.access(CONFIG_FILE);
  } catch {
    await fs.writeFile(CONFIG_FILE, JSON.stringify({ configs: [] }, null, 2));
  }
}

// 读取配置
export async function readConfigs(): Promise<ConfigItem[]> {
  await ensureDataFile();
  const data = await fs.readFile(CONFIG_FILE, 'utf-8');
  const parsed: ConfigData = JSON.parse(data);
  return parsed.configs || [];
}

// 写入配置
async function writeConfigs(configs: ConfigItem[]): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(CONFIG_FILE, JSON.stringify({ configs }, null, 2));
}

// 获取所有配置
export async function getAllConfigs(): Promise<ConfigItem[]> {
  return readConfigs();
}

// 获取单个配置
export async function getConfig(key: string): Promise<ConfigItem | null> {
  const configs = await readConfigs();
  return configs.find(c => c.key === key) || null;
}

// 创建配置
export async function createConfig(key: string, value: string): Promise<ConfigItem> {
  const configs = await readConfigs();
  
  // 检查是否已存在
  if (configs.some(c => c.key === key)) {
    throw new Error(`Config with key "${key}" already exists`);
  }

  const now = new Date().toISOString();
  const newConfig: ConfigItem = {
    key,
    value,
    createdAt: now,
    updatedAt: now,
  };

  configs.push(newConfig);
  await writeConfigs(configs);
  return newConfig;
}

// 更新配置
export async function updateConfig(key: string, value: string): Promise<ConfigItem> {
  const configs = await readConfigs();
  const index = configs.findIndex(c => c.key === key);

  if (index === -1) {
    throw new Error(`Config with key "${key}" not found`);
  }

  configs[index].value = value;
  configs[index].updatedAt = new Date().toISOString();

  await writeConfigs(configs);
  return configs[index];
}

// 删除配置
export async function deleteConfig(key: string): Promise<void> {
  const configs = await readConfigs();
  const filtered = configs.filter(c => c.key !== key);

  if (filtered.length === configs.length) {
    throw new Error(`Config with key "${key}" not found`);
  }

  await writeConfigs(filtered);
}
