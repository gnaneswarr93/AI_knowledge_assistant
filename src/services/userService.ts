import { User, UserPreferences } from '../types';

const PREFERENCES_KEY = 'ea_knowledge_preferences';
const CURRENT_USER_KEY = 'ea_knowledge_current_user';

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  aiResponseNotifications: true,
  documentProcessingNotifications: true,
  compactChatView: false,
};

function getHeaders() {
  const token = localStorage.getItem('ea_knowledge_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export const userService = {
  async getProfile(): Promise<User> {
    const res = await fetch('/api/auth/me', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to get profile');
    const user = await res.json();
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  },

  async updateProfile(updated: Partial<User>): Promise<User> {
    // Basic mock since we didn't add the full update endpoint
    const current = await this.getProfile();
    const merged = { ...current, ...updated };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(merged));
    return merged as User;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    return true;
  },

  getPreferences(): UserPreferences {
    try {
      const data = localStorage.getItem(PREFERENCES_KEY);
      if (data) return JSON.parse(data);
    } catch { }
    return DEFAULT_PREFERENCES;
  },

  savePreferences(prefs: UserPreferences): void {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  },
};
