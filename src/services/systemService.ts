import { AdminStats, SystemStatus, SessionInfo } from '../types';

function getHeaders() {
  const token = localStorage.getItem('ea_knowledge_token');
  return {
    'Authorization': `Bearer ${token}`
  };
}

export const systemService = {
  async getSystemStatus(): Promise<SystemStatus> {
    const res = await fetch('/api/system/status', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch system status');
    return await res.json();
  },

  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch('/api/system/stats', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return await res.json();
  },

  async getSessionInfo(): Promise<SessionInfo> {
    const res = await fetch('/api/system/session', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch session info');
    return await res.json();
  }
};
