/**
 * FitTrack - Authentication Service
 * Manages user registration, login, session validation, and logout
 */

const auth = {
  currentUser: null,

  // Check if user is logged in and token is valid
  async checkSession() {
    const token = api.getToken();
    if (!token) {
      this.currentUser = null;
      this.updateAuthUI(false);
      return false;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.success && res.user) {
        this.currentUser = res.user;
        api.setUser(res.user);
        this.updateAuthUI(true);
        return true;
      }
    } catch (err) {
      console.warn('Session check failed:', err.message);
      this.currentUser = null;
      api.clearToken();
      this.updateAuthUI(false);
    }
    return false;
  },

  // Register a new user
  async register(name, email, password) {
    try {
      const data = await api.post('/auth/register', { name, email, password });
      if (data.success && data.token) {
        api.setToken(data.token);
        api.setUser(data.user);
        this.currentUser = data.user;
        this.updateAuthUI(true);
        showToast('Account created successfully! Welcome to FitTrack.', 'success');
        return true;
      }
    } catch (error) {
      showToast(error.message || 'Registration failed.', 'error');
      throw error;
    }
  },

  // Login existing user
  async login(email, password) {
    try {
      const data = await api.post('/auth/login', { email, password });
      if (data.success && data.token) {
        api.setToken(data.token);
        api.setUser(data.user);
        this.currentUser = data.user;
        this.updateAuthUI(true);
        showToast(`Welcome back, ${data.user.name}!`, 'success');
        return true;
      }
    } catch (error) {
      showToast(error.message || 'Invalid email or password.', 'error');
      throw error;
    }
  },

  // Logout current user
  async logout() {
    try {
      await api.post('/auth/logout', {});
    } catch (e) {
      // Ignore network errors during logout
    }
    api.clearToken();
    this.currentUser = null;
    this.updateAuthUI(false);
    showToast('You have been logged out.', 'info');
  },

  // Update UI state based on authentication
  updateAuthUI(isLoggedIn) {
    const authWrapper = document.getElementById('auth-wrapper');
    const appContainer = document.getElementById('app-container');
    const userProfileBadge = document.getElementById('user-profile-badge');
    const userNameElements = document.querySelectorAll('.dynamic-user-name');
    const userEmailElement = document.getElementById('nav-user-email');
    const userAvatarElement = document.getElementById('nav-user-avatar');

    if (isLoggedIn && this.currentUser) {
      if (authWrapper) authWrapper.style.display = 'none';
      if (appContainer) appContainer.style.display = 'flex';

      // Update name everywhere
      userNameElements.forEach((el) => {
        el.textContent = this.currentUser.name;
      });

      if (userEmailElement) {
        userEmailElement.textContent = this.currentUser.email;
      }

      if (userAvatarElement) {
        const initials = this.currentUser.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        userAvatarElement.textContent = initials || 'FT';
      }

      // Load initial dashboard data
      if (window.dashboard && typeof window.dashboard.loadStats === 'function') {
        window.dashboard.loadStats();
      }
    } else {
      if (authWrapper) authWrapper.style.display = 'flex';
      if (appContainer) appContainer.style.display = 'none';
    }
  },
};

window.auth = auth;
window.onAuthExpired = () => {
  auth.updateAuthUI(false);
  showToast('Your session expired. Please sign in.', 'info');
};
