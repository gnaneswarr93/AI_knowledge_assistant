import { User, UserRole } from '../types';

const CURRENT_USER_KEY = 'ea_knowledge_current_user';
const TOKEN_KEY = 'ea_knowledge_token';

export const authService = {
  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(CURRENT_USER_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return null;
  },

  async login(email: string, _password: string): Promise<User> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', _password || 'default_password');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    });

    if (!res.ok) {
      throw new Error('Invalid email or password. Please verify credentials.');
    }

    const data = await res.json();
    localStorage.setItem(TOKEN_KEY, data.access_token);

    const meRes = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${data.access_token}` }
    });
    
    if (!meRes.ok) throw new Error('Failed to fetch user profile');
    const user = await meRes.json();
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    
    return user;
  },

  async signup(name: string, email: string, _password: string, department: string): Promise<User> {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: _password, department })
    });

    if (!res.ok) {
      throw new Error('An account with this email address already exists.');
    }
    
    // Auto login after signup
    return this.login(email, _password);
  },

  async logout(): Promise<void> {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  async switchRole(targetRole: UserRole): Promise<User> {
    // In a real application, you would make an API call to change the role
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      currentUser.role = targetRole;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      return currentUser;
    }
    throw new Error('No user logged in');
  },
};
