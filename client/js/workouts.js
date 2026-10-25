/**
 * FitTrack - Workouts Management Service
 * Handles workout creation, table listing, filtering, search, editing, and deletion
 */

const workouts = {
  currentWorkoutsList: [],
  activeEditingId: null,
  activeDeletingId: null,

  // Fetch all workouts from backend with current filters applied
  async loadWorkouts() {
    try {
      const typeFilter = document.getElementById('filter-type')?.value || 'All';
      const startDate = document.getElementById('filter-start-date')?.value || '';
      const endDate = document.getElementById('filter-end-date')?.value || '';
      const search = document.getElementById('filter-search')?.value || '';

      const queryParams = new URLSearchParams();
      if (typeFilter && typeFilter !== 'All') queryParams.append('type', typeFilter);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      if (search.trim()) queryParams.append('search', search.trim());

      const url = `/workouts?${queryParams.toString()}`;
      const res = await api.get(url);

      if (res.success && Array.isArray(res.workouts)) {
        this.currentWorkoutsList = res.workouts;
        this.renderTable(res.workouts);
      }
    } catch (error) {
      console.error('Error fetching workouts:', error);
      showToast('Could not load workout history.', 'error');
    }
  },

  // Render the workout history table
  renderTable(list) {
    const tbody = document.getElementById('workouts-table-body');
    const emptyState = document.getElementById('workouts-empty-state');
    const countBadge = document.getElementById('workouts-count-badge');

    if (countBadge) {
      countBadge.textContent = `${list.length} Workout${list.length === 1 ? '' : 's'}`;
    }

    if (!tbody) return;

    if (!list || list.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = list
      .map((w) => {
        const typeClass = `type-${w.type.toLowerCase()}`;
        const iconClass = dashboard.getTypeIcon(w.type);
        const dateObj = new Date(w.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });

        return `
          <tr data-id="${w._id}">
            <td>
              <div class="workout-title">${dashboard.escapeHtml(w.name)}</div>
              ${w.notes ? `<div class="workout-notes" title="${dashboard.escapeHtml(w.notes)}"><i class="fa-regular fa-note-sticky"></i> ${dashboard.escapeHtml(w.notes)}</div>` : ''}
            </td>
            <td>
              <span class="badge ${typeClass}">
                <i class="${iconClass}"></i> ${w.type}
              </span>
            </td>
            <td>
              <strong>${w.duration}</strong> min
            </td>
            <td>
              <span style="color: var(--accent-orange); font-weight: 600;">${w.calories}</span> kcal
            </td>
            <td>
              <span style="color: var(--text-secondary);">${formattedDate}</span>
            </td>
            <td>
              <div class="actions-cell">
                <button class="btn-table-action edit" onclick="workouts.openEditModal('${w._id}')" title="Edit Workout">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn-table-action delete" onclick="workouts.openDeleteModal('${w._id}', '${dashboard.escapeHtml(w.name)}')" title="Delete Workout">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');
  },

  // Handle Add Workout Form Submission
  async handleAddWorkout(e) {
    e.preventDefault();
    const form = e.target;

    const name = form.name.value.trim();
    const type = form.type.value;
    const duration = Number(form.duration.value);
    const calories = Number(form.calories.value);
    const date = form.date.value;
    const notes = form.notes.value.trim();

    if (!name || !type || !duration || calories === undefined || !date) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    try {
      const res = await api.post('/workouts', {
        name,
        type,
        duration,
        calories,
        date,
        notes,
      });

      if (res.success) {
        showToast('Workout added successfully!', 'success');
        form.reset();
        
        // Reset date input to today
        const dateInput = form.querySelector('input[type="date"]');
        if (dateInput) {
          dateInput.value = new Date().toISOString().split('T')[0];
        }

        // Refresh stats and history
        if (dashboard && typeof dashboard.loadStats === 'function') {
          dashboard.loadStats();
        }
        this.loadWorkouts();

        // Switch to history or dashboard view
        window.app.switchView('dashboard');
      }
    } catch (error) {
      showToast(error.message || 'Failed to add workout', 'error');
    }
  },

  // Open Edit Modal
  openEditModal(workoutId) {
    const workout = this.currentWorkoutsList.find((w) => w._id === workoutId);
    if (!workout) return;

    this.activeEditingId = workoutId;
    const form = document.getElementById('edit-workout-form');
    if (!form) return;

    form.elements['edit-name'].value = workout.name;
    form.elements['edit-type'].value = workout.type;
    form.elements['edit-duration'].value = workout.duration;
    form.elements['edit-calories'].value = workout.calories;
    
    // Format date YYYY-MM-DD
    const dateStr = new Date(workout.date).toISOString().split('T')[0];
    form.elements['edit-date'].value = dateStr;
    form.elements['edit-notes'].value = workout.notes || '';

    const modal = document.getElementById('edit-modal');
    if (modal) modal.classList.add('show');
  },

  closeEditModal() {
    this.activeEditingId = null;
    const modal = document.getElementById('edit-modal');
    if (modal) modal.classList.remove('show');
  },

  // Submit Edit Workout Form
  async handleEditSubmit(e) {
    e.preventDefault();
    if (!this.activeEditingId) return;

    const form = e.target;
    const name = form['edit-name'].value.trim();
    const type = form['edit-type'].value;
    const duration = Number(form['edit-duration'].value);
    const calories = Number(form['edit-calories'].value);
    const date = form['edit-date'].value;
    const notes = form['edit-notes'].value.trim();

    try {
      const res = await api.put(`/workouts/${this.activeEditingId}`, {
        name,
        type,
        duration,
        calories,
        date,
        notes,
      });

      if (res.success) {
        showToast('Workout updated successfully!', 'success');
        this.closeEditModal();
        
        // Refresh views
        this.loadWorkouts();
        if (dashboard && typeof dashboard.loadStats === 'function') {
          dashboard.loadStats();
        }
      }
    } catch (error) {
      showToast(error.message || 'Failed to update workout', 'error');
    }
  },

  // Open Delete Confirmation Modal
  openDeleteModal(workoutId, workoutName) {
    this.activeDeletingId = workoutId;
    const nameSpan = document.getElementById('delete-workout-name');
    if (nameSpan) nameSpan.textContent = workoutName;

    const modal = document.getElementById('delete-modal');
    if (modal) modal.classList.add('show');
  },

  closeDeleteModal() {
    this.activeDeletingId = null;
    const modal = document.getElementById('delete-modal');
    if (modal) modal.classList.remove('show');
  },

  // Confirm and execute delete
  async confirmDelete() {
    if (!this.activeDeletingId) return;

    try {
      const res = await api.delete(`/workouts/${this.activeDeletingId}`);
      if (res.success) {
        showToast('Workout deleted successfully.', 'info');
        this.closeDeleteModal();

        // Refresh views
        this.loadWorkouts();
        if (dashboard && typeof dashboard.loadStats === 'function') {
          dashboard.loadStats();
        }
      }
    } catch (error) {
      showToast(error.message || 'Failed to delete workout', 'error');
    }
  },

  // Reset filters
  resetFilters() {
    const type = document.getElementById('filter-type');
    const start = document.getElementById('filter-start-date');
    const end = document.getElementById('filter-end-date');
    const search = document.getElementById('filter-search');

    if (type) type.value = 'All';
    if (start) start.value = '';
    if (end) end.value = '';
    if (search) search.value = '';

    this.loadWorkouts();
  },
};

window.workouts = workouts;
