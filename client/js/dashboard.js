/**
 * FitTrack - Dashboard & Analytics Service
 * Renders live statistics, Chart.js graphs, goal progress, and recent workout activity
 */

const dashboard = {
  weeklyChartInstance: null,
  typeChartInstance: null,
  cachedData: null,

  // Load dashboard stats from real MongoDB database via REST API
  async loadStats() {
    try {
      this.showLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.success && res.data) {
        this.cachedData = res.data;
        this.renderStats(res.data.summary);
        this.renderWeeklyChart(res.data.chart);
        this.renderTypeChart(res.data.typeBreakdown);
        this.renderRecentWorkouts(res.data.recentWorkouts);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      showToast('Could not refresh dashboard statistics.', 'error');
    } finally {
      this.showLoading(false);
    }
  },

  // Render stat cards and goal progress
  renderStats(summary) {
    if (!summary) return;

    // Stat cards
    const totalWorkoutsEl = document.getElementById('stat-total-workouts');
    const totalDurationEl = document.getElementById('stat-total-duration');
    const totalCaloriesEl = document.getElementById('stat-total-calories');
    const thisWeekEl = document.getElementById('stat-this-week');

    if (totalWorkoutsEl) totalWorkoutsEl.textContent = summary.totalWorkouts || 0;
    
    if (totalDurationEl) {
      const mins = summary.totalDuration || 0;
      if (mins >= 60) {
        const hrs = (mins / 60).toFixed(1);
        totalDurationEl.textContent = `${mins} min (${hrs} hrs)`;
      } else {
        totalDurationEl.textContent = `${mins} min`;
      }
    }

    if (totalCaloriesEl) {
      totalCaloriesEl.textContent = `${(summary.totalCalories || 0).toLocaleString()} kcal`;
    }

    if (thisWeekEl) {
      thisWeekEl.textContent = summary.workoutsThisWeek || 0;
    }

    // Weekly Goal Banner
    const goalWorkoutsCountEl = document.getElementById('goal-workouts-count');
    const goalTargetEl = document.getElementById('goal-target');
    const goalProgressBarEl = document.getElementById('goal-progress-bar');
    const goalPercentEl = document.getElementById('goal-percent-badge');
    const goalSubtitleEl = document.getElementById('goal-subtitle');

    const done = summary.workoutsThisWeek || 0;
    const target = summary.weeklyGoal || 5;
    const percent = Math.min(100, Math.round((done / target) * 100));

    if (goalWorkoutsCountEl) goalWorkoutsCountEl.textContent = done;
    if (goalTargetEl) goalTargetEl.textContent = target;
    if (goalPercentEl) goalPercentEl.textContent = `${percent}% Completed`;
    if (goalProgressBarEl) goalProgressBarEl.style.width = `${percent}%`;

    if (goalSubtitleEl) {
      if (done >= target) {
        goalSubtitleEl.textContent = `🎉 Fantastic job! You've crushed your goal of ${target} workouts for this week!`;
      } else {
        const remaining = target - done;
        goalSubtitleEl.textContent = `You're ${percent}% there! Complete ${remaining} more workout${remaining > 1 ? 's' : ''} to hit your weekly target.`;
      }
    }

    // Also update any input field for goal
    const goalInput = document.getElementById('input-weekly-goal');
    if (goalInput) goalInput.value = target;
  },

  // Render weekly duration chart using Chart.js
  renderWeeklyChart(chartData) {
    const ctx = document.getElementById('weeklyProgressChart');
    if (!ctx) return;

    if (this.weeklyChartInstance) {
      this.weeklyChartInstance.destroy();
    }

    const labels = chartData ? chartData.labels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const durations = chartData ? chartData.durations : [0, 0, 0, 0, 0, 0, 0];
    const calories = chartData ? chartData.calories : [0, 0, 0, 0, 0, 0, 0];

    this.weeklyChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Duration (Minutes)',
            data: durations,
            backgroundColor: '#10b981',
            borderRadius: 6,
            barThickness: 22,
            order: 2,
          },
          {
            label: 'Calories Burned (kcal)',
            data: calories,
            borderColor: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.15)',
            type: 'line',
            tension: 0.35,
            fill: true,
            pointBackgroundColor: '#f97316',
            pointRadius: 4,
            yAxisID: 'y1',
            order: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#9ca3af',
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
              usePointStyle: true,
              boxWidth: 8,
            },
          },
          tooltip: {
            backgroundColor: '#111827',
            titleColor: '#f9fafb',
            bodyColor: '#9ca3af',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#9ca3af', font: { size: 11 } },
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: { display: true, text: 'Minutes', color: '#10b981', font: { size: 11 } },
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#9ca3af', font: { size: 11 } },
            beginAtZero: true,
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: { display: true, text: 'Calories (kcal)', color: '#f97316', font: { size: 11 } },
            grid: { drawOnChartArea: false },
            ticks: { color: '#9ca3af', font: { size: 11 } },
            beginAtZero: true,
          },
        },
      },
    });
  },

  // Render doughnut chart for workout type distribution
  renderTypeChart(typeBreakdown) {
    const ctx = document.getElementById('workoutTypeChart');
    if (!ctx) return;

    if (this.typeChartInstance) {
      this.typeChartInstance.destroy();
    }

    if (!typeBreakdown || typeBreakdown.length === 0) {
      typeBreakdown = [{ type: 'No Workouts Yet', count: 1 }];
    }

    const labels = typeBreakdown.map((t) => t.type);
    const data = typeBreakdown.map((t) => t.count);

    const typeColorMap = {
      Cardio: '#06b6d4',
      Strength: '#f97316',
      Yoga: '#8b5cf6',
      Running: '#10b981',
      Cycling: '#3b82f6',
      Other: '#6b7280',
      'No Workouts Yet': '#374151',
    };

    const bgColors = labels.map((l) => typeColorMap[l] || '#10b981');

    this.typeChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: bgColors,
            borderWidth: 2,
            borderColor: '#151d2f',
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#9ca3af',
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
              padding: 16,
              usePointStyle: true,
            },
          },
          tooltip: {
            backgroundColor: '#111827',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 10,
          },
        },
        cutout: '70%',
      },
    });
  },

  // Render recent 5 workouts on dashboard
  renderRecentWorkouts(workouts) {
    const container = document.getElementById('dashboard-recent-list');
    if (!container) return;

    if (!workouts || workouts.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 13px;">
          <i class="fa-solid fa-dumbbell" style="font-size: 28px; margin-bottom: 8px; display: block; opacity: 0.4;"></i>
          No workouts logged yet. Click <strong>Add Workout</strong> to log your first exercise!
        </div>
      `;
      return;
    }

    container.innerHTML = workouts
      .map((w) => {
        const typeClass = `type-${w.type.toLowerCase()}`;
        const iconClass = this.getTypeIcon(w.type);
        const dateFormatted = new Date(w.date).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        });

        return `
          <div class="recent-item">
            <div class="recent-item-left">
              <div class="workout-type-icon ${typeClass}">
                <i class="${iconClass}"></i>
              </div>
              <div class="recent-item-info">
                <h4>${this.escapeHtml(w.name)}</h4>
                <p>${w.type} • ${dateFormatted}</p>
              </div>
            </div>
            <div class="recent-item-metrics">
              <div class="metric-highlight">${w.duration} min</div>
              <div class="metric-sub">${w.calories} kcal</div>
            </div>
          </div>
        `;
      })
      .join('');
  },

  // Update weekly goal through the API
  async updateGoal(newGoal) {
    try {
      const res = await api.put('/users/goal', { weeklyGoal: newGoal });
      if (res.success) {
        showToast('Weekly goal updated successfully!', 'success');
        this.loadStats();
        return true;
      }
    } catch (error) {
      showToast(error.message || 'Could not update weekly goal', 'error');
    }
    return false;
  },

  getTypeIcon(type) {
    switch (type) {
      case 'Cardio':
        return 'fa-solid fa-heart-pulse';
      case 'Strength':
        return 'fa-solid fa-dumbbell';
      case 'Yoga':
        return 'fa-solid fa-spa';
      case 'Running':
        return 'fa-solid fa-person-running';
      case 'Cycling':
        return 'fa-solid fa-person-biking';
      default:
        return 'fa-solid fa-fire';
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  showLoading(isLoading) {
    const loader = document.getElementById('dashboard-loading-indicator');
    if (loader) {
      loader.style.display = isLoading ? 'inline-block' : 'none';
    }
  },
};

window.dashboard = dashboard;
