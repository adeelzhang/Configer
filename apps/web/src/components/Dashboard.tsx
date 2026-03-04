import { useState, useEffect } from 'react';
import './Dashboard.css';

interface ConfigItem {
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardProps {
  token: string;
  onLogout: () => void;
}

export default function Dashboard({ token, onLogout }: DashboardProps) {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  // 表单状态
  const [isEditing, setIsEditing] = useState(false);
  const [editingKey, setEditingKey] = useState('');
  const [formKey, setFormKey] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 搜索过滤
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadConfigs();
    loadApiKey();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/config', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          onLogout();
          return;
        }
        throw new Error('加载配置失败');
      }

      const data = await response.json();
      setConfigs(data.configs || []);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadApiKey = async () => {
    try {
      const response = await fetch('/api/auth/api-key', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setApiKey(data.apiKey);
      }
    } catch (err) {
      console.error('Failed to load API key:', err);
    }
  };

  const handleCreate = () => {
    setIsEditing(false);
    setEditingKey('');
    setFormKey('');
    setFormValue('');
    setFormError('');
  };

  const handleEdit = (config: ConfigItem) => {
    setIsEditing(true);
    setEditingKey(config.key);
    setFormKey(config.key);
    setFormValue(config.value);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const url = isEditing ? `/api/config/${editingKey}` : '/api/config';
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing
        ? JSON.stringify({ value: formValue })
        : JSON.stringify({ key: formKey, value: formValue });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '操作失败');
      }

      await loadConfigs();
      setFormKey('');
      setFormValue('');
      setEditingKey('');
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`确定要删除配置 "${key}" 吗？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/config/${key}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '删除失败');
      }

      await loadConfigs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredConfigs = configs.filter(
    (c) =>
      c.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>🔑 Configer</h1>
          <span className="config-count">{configs.length} 个配置</span>
        </div>
        <div className="header-right">
          <button onClick={() => setShowApiKey(!showApiKey)} className="btn-secondary">
            {showApiKey ? '隐藏' : '显示'} API Key
          </button>
          <button onClick={onLogout} className="btn-secondary">
            退出登录
          </button>
        </div>
      </header>

      {showApiKey && (
        <div className="api-key-banner">
          <div className="api-key-content">
            <span className="api-key-label">API Key:</span>
            <code className="api-key-value">{apiKey}</code>
            <button onClick={() => copyToClipboard(apiKey)} className="btn-copy">
              复制
            </button>
          </div>
          <p className="api-key-hint">
            在请求头中添加: <code>X-API-Key: {apiKey}</code>
          </p>
        </div>
      )}

      <div className="dashboard-content">
        <div className="form-section">
          <h2>{isEditing ? '编辑配置' : '新建配置'}</h2>
          <form onSubmit={handleSubmit} className="config-form">
            <div className="form-row">
              <div className="form-group">
                <label>Key</label>
                <input
                  type="text"
                  value={formKey}
                  onChange={(e) => setFormKey(e.target.value)}
                  placeholder="例如: app.name"
                  disabled={isEditing || submitting}
                  required
                />
              </div>
              <div className="form-group flex-grow">
                <label>Value</label>
                <input
                  type="text"
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  placeholder="配置值"
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            {formError && <div className="error-message">{formError}</div>}

            <div className="form-actions">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? '提交中...' : isEditing ? '更新' : '创建'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  取消编辑
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="list-section">
          <div className="list-header">
            <h2>配置列表</h2>
            <input
              type="text"
              placeholder="搜索 Key 或 Value..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {loading ? (
            <div className="loading">加载中...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : filteredConfigs.length === 0 ? (
            <div className="empty-state">
              {searchTerm ? '没有匹配的配置' : '还没有配置，创建第一个吧！'}
            </div>
          ) : (
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '5%' }}>#</th>
                    <th style={{ width: '30%' }}>Key</th>
                    <th style={{ width: '35%' }}>Value</th>
                    <th style={{ width: '15%' }}>更新时间</th>
                    <th style={{ width: '15%' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConfigs.map((config, index) => (
                    <tr key={config.key}>
                      <td>{index + 1}</td>
                      <td>
                        <code className="key-code">{config.key}</code>
                      </td>
                      <td>
                        <div className="value-cell">{config.value}</div>
                      </td>
                      <td className="time-cell">
                        {new Date(config.updatedAt).toLocaleString('zh-CN')}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEdit(config)}
                            className="btn-edit"
                            title="编辑"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(config.key)}
                            className="btn-delete"
                            title="删除"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
