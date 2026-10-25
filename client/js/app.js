/**
 * FitTrack - Main Application Controller
 * Handles navigation routing, toast notifications, UI event bindings, and app initialization
 */

// Global Toast Notification Helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = 'fa-solid fa-circle-info';
  if (type === 'success') icon = 'fa-solid fa-circle-check';
  if (type === 'error') icon = 'fa-solid fa-triangle-exclamation';

  toast.innerHTML = `
    <i class="${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Auto remove after 3.5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

const app = {
  currentView: 'dashboard',

  init() {
    this.bindEvents();
    this.checkDatabaseHealth();
    
    // Check initial user session
    auth.checkSession().then((isLoggedIn) => {
      if (isLoggedIn) {
        this.switchView('dashboard');
        // Set today's date on add-workout form date input
        const dateInput = document.getElementById('workout-date');
        if (dateInput) {
          dateInput.value = new Date().toISOString().split('T')[0];
        }
      }
    });
  },

  // Switch between view sections
  switchView(viewName) {
    this.currentView = viewName;

    // Update active nav links
    document.querySelectorAll('.nav-link').forEach((link) => {
      if (link.getAttribute('data-view') === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update view containers
    document.querySelectorAll('.app-view').forEach((view) => {
      if (view.id === `view-${viewName}`) {
        view.classList.add('active-view');
      } else {
        view.classList.remove('active-view');
      }
    });

    // Close mobile sidebar if open
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');

    // Trigger view-specific data refresh
    if (viewName === 'dashboard') {
      dashboard.loadStats();
    } else if (viewName === 'history') {
      workouts.loadWorkouts();
    } else if (viewName === 'analytics') {
      dashboard.loadStats();
    }
  },

  // Check MongoDB connection health status
  async checkDatabaseHealth() {
    const statusDot = document.getElementById('db-status-dot');
    const statusText = document.getElementById('db-status-text');

    try {
      const res = await fetch('/api/health');
      const data = await res.json();

      if (data && data.database && data.database.state === 1) {
        if (statusDot) {
          statusDot.className = 'status-dot online';
          statusDot.title = `Connected to ${data.database.host}/${data.database.name}`;
        }
        if (statusText) statusText.textContent = 'MongoDB Connected';
      } else {
        if (statusDot) {
          statusDot.className = 'status-dot offline';
          statusDot.title = 'MongoDB is not connected. Check .env and local mongod service.';
        }
        if (statusText) statusText.textContent = 'MongoDB Disconnected';
      }
    } catch (e) {
      if (statusDot) statusDot.className = 'status-dot offline';
      if (statusText) statusText.textContent = 'Backend Offline';
    }
  },

  // Setup UI event listeners
  bindEvents() {
    // Nav links navigation
    document.querySelectorAll('.nav-link[data-view]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const view = btn.getAttribute('data-view');
        this.switchView(view);
      });
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    if (mobileMenuBtn && sidebar) {
      mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }

    // Quick Action button in header
    const quickAddBtn = document.getElementById('btn-quick-add');
    if (quickAddBtn) {
      quickAddBtn.addEventListener('click', () => {
        this.switchView('add-workout');
      });
    }

    // Auth tab toggling (Login vs Register)
    const tabLogin = document.getElementById('tab-btn-login');
    const tabRegister = document.getElementById('tab-btn-register');
    const formLogin = document.getElementById('login-form');
    const formRegister = document.getElementById('register-form');

    if (tabLogin && tabRegister && formLogin && formRegister) {
      tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        formLogin.style.display = 'block';
        formRegister.style.display = 'none';
      });

      tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        formRegister.style.display = 'block';
        formLogin.style.display = 'none';
      });
    }

    // Login Form Submit
    if (formLogin) {
      formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = formLogin.email.value.trim();
        const password = formLogin.password.value;
        const submitBtn = formLogin.querySelector('button[type="submit"]');

        try {
          if (submitBtn) submitBtn.disabled = true;
          await auth.login(email, password);
          formLogin.reset();
        } catch (err) {
          // Handled in auth.login
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }

    // Register Form Submit
    if (formRegister) {
      formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = formRegister.name.value.trim();
        const email = formRegister.email.value.trim();
        const password = formRegister.password.value;
        const submitBtn = formRegister.querySelector('button[type="submit"]');

        try {
          if (submitBtn) submitBtn.disabled = true;
          await auth.register(name, email, password);
          formRegister.reset();
        } catch (err) {
          // Handled in auth.register
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }

    // Logout Button
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        auth.logout();
      });
    }

    // Add Workout Form
    const addWorkoutForm = document.getElementById('add-workout-form');
    if (addWorkoutForm) {
      addWorkoutForm.addEventListener('submit', (e) => {
        workouts.handleAddWorkout(e);
      });
    }

    // Edit Workout Form
    const editWorkoutForm = document.getElementById('edit-workout-form');
    if (editWorkoutForm) {
      editWorkoutForm.addEventListener('submit', (e) => {
        workouts.handleEditSubmit(e);
      });
    }

    // Workout History Filters
    const filterType = document.getElementById('filter-type');
    const filterStart = document.getElementById('filter-start-date');
    const filterEnd = document.getElementById('filter-end-date');
    const filterSearch = document.getElementById('filter-search');
    const btnResetFilters = document.getElementById('btn-reset-filters');

    if (filterType) filterType.addEventListener('change', () => workouts.loadWorkouts());
    if (filterStart) filterStart.addEventListener('change', () => workouts.loadWorkouts());
    if (filterEnd) filterEnd.addEventListener('change', () => workouts.loadWorkouts());

    if (filterSearch) {
      let debounceTimer;
      filterSearch.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => workouts.loadWorkouts(), 300);
      });
    }

    if (btnResetFilters) {
      btnResetFilters.addEventListener('click', () => workouts.resetFilters());
    }

    // Edit Goal Modal Trigger
    const btnEditGoal = document.getElementById('btn-edit-goal');
    const goalModal = document.getElementById('goal-modal');
    const goalForm = document.getElementById('goal-form');

    if (btnEditGoal && goalModal) {
      btnEditGoal.addEventListener('click', () => {
        goalModal.classList.add('show');
      });
    }

    if (goalForm && goalModal) {
      goalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const goalVal = document.getElementById('input-weekly-goal').value;
        const success = await dashboard.updateGoal(goalVal);
        if (success) {
          goalModal.classList.remove('show');
        }
      });
    }

    // Modal background close triggers
    document.querySelectorAll('.modal-backdrop').forEach((modal) => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('show');
        }
      });
    });

    document.querySelectorAll('.modal-close-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-backdrop');
        if (modal) modal.classList.remove('show');
      });
    });

    // Delete confirmation button
    const btnConfirmDelete = document.getElementById('btn-confirm-delete');
    if (btnConfirmDelete) {
      btnConfirmDelete.addEventListener('click', () => {
        workouts.confirmDelete();
      });
    }
  },
};

window.app = app;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
