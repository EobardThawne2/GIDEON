// History page JavaScript functionality

// Initialize history page
function initializeHistoryPage() {
    loadHistoryStats();
    loadHistoryTimeline();
    loadWorkoutHistory();
    loadNutritionHistory();
    loadProgressHistory();
    setupHistoryEventListeners();
}

function setupHistoryEventListeners() {
    // Filter event listeners
    document.getElementById('filterType').addEventListener('change', filterHistory);
    document.getElementById('filterTime').addEventListener('change', filterHistory);
    document.getElementById('exportHistory').addEventListener('click', exportHistory);
    
    // Progress form
    document.getElementById('progressForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProgressEntry();
    });
    
    // Set default date to today
    document.getElementById('progressDate').value = new Date().toISOString().split('T')[0];
}

function loadHistoryStats() {
    const workoutHistory = JSON.parse(localStorage.getItem('workout_history') || '[]');
    const nutritionHistory = JSON.parse(localStorage.getItem('nutrition_history') || '[]');
    const progressHistory = JSON.parse(localStorage.getItem('progress_history') || '[]');
    
    document.getElementById('totalWorkoutPlans').textContent = workoutHistory.length;
    document.getElementById('totalNutritionPlans').textContent = nutritionHistory.length;
    document.getElementById('activeDays').textContent = calculateActiveDays();
    document.getElementById('goalsAchieved').textContent = calculateGoalsAchieved();
}

function calculateActiveDays() {
    const workoutHistory = JSON.parse(localStorage.getItem('workout_history') || '[]');
    const nutritionHistory = JSON.parse(localStorage.getItem('nutrition_history') || '[]');
    
    const dates = new Set();
    workoutHistory.forEach(item => dates.add(item.date.split('T')[0]));
    nutritionHistory.forEach(item => dates.add(item.date.split('T')[0]));
    
    return dates.size;
}

function calculateGoalsAchieved() {
    // Placeholder calculation - in a real app, this would be based on actual goal tracking
    return Math.floor(Math.random() * 10) + 5;
}

function loadHistoryTimeline() {
    const workoutHistory = JSON.parse(localStorage.getItem('workout_history') || '[]');
    const nutritionHistory = JSON.parse(localStorage.getItem('nutrition_history') || '[]');
    const progressHistory = JSON.parse(localStorage.getItem('progress_history') || '[]');
    
    // Combine all activities
    const allActivities = [
        ...workoutHistory.map(item => ({...item, type: 'workout'})),
        ...nutritionHistory.map(item => ({...item, type: 'nutrition'})),
        ...progressHistory.map(item => ({...item, type: 'progress'}))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const timelineEl = document.getElementById('historyTimeline');
    
    if (allActivities.length === 0) {
        timelineEl.innerHTML = `
            <div class="timeline-message">
                <p>No activity history yet. Start by creating your first workout or nutrition plan!</p>
                <div style="margin-top: 1rem;">
                    <button onclick="goToWorkoutPlanner()" class="cta-btn" style="margin-right: 1rem;">Create Workout Plan</button>
                    <button onclick="goToNutritionPlanner()" class="secondary-btn">Create Nutrition Plan</button>
                </div>
            </div>
        `;
        return;
    }
    
    timelineEl.innerHTML = allActivities.slice(0, 10).map(activity => `
        <div class="timeline-item">
            <div class="timeline-item-header">
                <h4>${getActivityTitle(activity)}</h4>
                <span class="timeline-date">${formatDate(activity.date)}</span>
            </div>
            <p>${getActivityDescription(activity)}</p>
            <button onclick="viewActivityDetail('${activity.type}', '${activity.id}')" class="secondary-btn" style="margin-top: 1rem;">View Details</button>
        </div>
    `).join('');
}

function getActivityTitle(activity) {
    switch(activity.type) {
        case 'workout':
            return `🏋️ Workout Plan Created - ${activity.goal}`;
        case 'nutrition':
            return `🍎 Nutrition Plan Created - ${activity.diet}`;
        case 'progress':
            return `📊 Progress Entry Added`;
        default:
            return 'Activity';
    }
}

function getActivityDescription(activity) {
    switch(activity.type) {
        case 'workout':
            return `${activity.level} level, ${activity.days} days per week`;
        case 'nutrition':
            return `${activity.calories} calories daily target`;
        case 'progress':
            return `Weight: ${activity.weight || 'N/A'}kg, Body Fat: ${activity.bodyFat || 'N/A'}%`;
        default:
            return '';
    }
}

function loadWorkoutHistory() {
    const workoutHistory = JSON.parse(localStorage.getItem('workout_history') || '[]');
    const container = document.getElementById('workoutHistoryContent');
    
    if (workoutHistory.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🏋️</div>
                <h3>No workout plans yet</h3>
                <p>Create your first AI-powered workout plan to get started!</p>
                <button onclick="goToWorkoutPlanner()" class="cta-btn">Create Workout Plan</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = workoutHistory.map(workout => `
        <div class="history-card" onclick="viewPlanDetail('workout', '${workout.id}')">
            <div class="history-card-header">
                <div class="history-card-date">${formatDate(workout.date)}</div>
                <div class="history-card-type">Workout</div>
            </div>
            <h3>${workout.goal}</h3>
            <p><strong>Level:</strong> ${workout.level}</p>
            <p><strong>Days per week:</strong> ${workout.days}</p>
            <div class="card-actions">
                <button onclick="event.stopPropagation(); duplicatePlan('workout', '${workout.id}')" class="secondary-btn">Duplicate</button>
            </div>
        </div>
    `).join('');
}

function loadNutritionHistory() {
    const nutritionHistory = JSON.parse(localStorage.getItem('nutrition_history') || '[]');
    const container = document.getElementById('nutritionHistoryContent');
    
    if (nutritionHistory.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🍎</div>
                <h3>No nutrition plans yet</h3>
                <p>Create your first AI-optimized nutrition plan!</p>
                <button onclick="goToNutritionPlanner()" class="cta-btn">Create Nutrition Plan</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = nutritionHistory.map(nutrition => `
        <div class="history-card" onclick="viewPlanDetail('nutrition', '${nutrition.id}')">
            <div class="history-card-header">
                <div class="history-card-date">${formatDate(nutrition.date)}</div>
                <div class="history-card-type">Nutrition</div>
            </div>
            <h3>${nutrition.diet}</h3>
            <p><strong>Calories:</strong> ${nutrition.calories} per day</p>
            <div class="card-actions">
                <button onclick="event.stopPropagation(); duplicatePlan('nutrition', '${nutrition.id}')" class="secondary-btn">Duplicate</button>
            </div>
        </div>
    `).join('');
}

function loadProgressHistory() {
    const progressHistory = JSON.parse(localStorage.getItem('progress_history') || '[]');
    const container = document.getElementById('progressHistoryContent');
    
    if (progressHistory.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <h3>No progress entries yet</h3>
                <p>Start tracking your fitness progress!</p>
                <button onclick="addProgressEntry()" class="cta-btn">Add Progress Entry</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = progressHistory.map(progress => `
        <div class="progress-entry">
            <div class="progress-date">${formatDate(progress.date)}</div>
            <div class="progress-metrics">
                ${progress.weight ? `<div class="progress-metric">Weight: ${progress.weight}kg</div>` : ''}
                ${progress.bodyFat ? `<div class="progress-metric">Body Fat: ${progress.bodyFat}%</div>` : ''}
                ${progress.muscle ? `<div class="progress-metric">Muscle: ${progress.muscle}kg</div>` : ''}
            </div>
            <button onclick="deleteProgressEntry('${progress.id}')" class="danger-btn">Delete</button>
        </div>
    `).join('');
    
    // Update chart if we have data
    if (progressHistory.length > 0) {
        updateProgressChart(progressHistory);
    }
}

function updateProgressChart(progressHistory) {
    // Simple chart implementation - in a real app, you'd use Chart.js or similar
    const canvas = document.getElementById('progressChart');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw a simple line chart showing weight progress
    const weightData = progressHistory.filter(p => p.weight).map(p => ({
        date: new Date(p.date),
        weight: parseFloat(p.weight)
    })).sort((a, b) => a.date - b.date);
    
    if (weightData.length < 2) {
        ctx.fillStyle = '#64748b';
        ctx.font = '16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Add more progress entries to see trends', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // Simple chart drawing logic would go here
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const maxWeight = Math.max(...weightData.map(d => d.weight));
    const minWeight = Math.min(...weightData.map(d => d.weight));
    const weightRange = maxWeight - minWeight || 1;
    
    weightData.forEach((point, index) => {
        const x = (index / (weightData.length - 1)) * (canvas.width - 40) + 20;
        const y = canvas.height - 20 - ((point.weight - minWeight) / weightRange) * (canvas.height - 40);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
}

function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

function addProgressEntry() {
    document.getElementById('progressModal').style.display = 'block';
}

function closeProgressModal() {
    document.getElementById('progressModal').style.display = 'none';
    document.getElementById('progressForm').reset();
}

function saveProgressEntry() {
    const progressData = {
        id: Date.now().toString(),
        date: document.getElementById('progressDate').value,
        weight: document.getElementById('progressWeight').value,
        bodyFat: document.getElementById('progressBodyFat').value,
        muscle: document.getElementById('progressMuscle').value,
        notes: document.getElementById('progressNotes').value
    };
    
    const progressHistory = JSON.parse(localStorage.getItem('progress_history') || '[]');
    progressHistory.unshift(progressData);
    localStorage.setItem('progress_history', JSON.stringify(progressHistory));
    
    closeProgressModal();
    loadProgressHistory();
    loadHistoryStats();
    loadHistoryTimeline();
    
    showHistoryMessage('Progress entry saved successfully!', 'success');
}

function deleteProgressEntry(entryId) {
    if (confirm('Are you sure you want to delete this progress entry?')) {
        const progressHistory = JSON.parse(localStorage.getItem('progress_history') || '[]');
        const updatedHistory = progressHistory.filter(entry => entry.id !== entryId);
        localStorage.setItem('progress_history', JSON.stringify(updatedHistory));
        
        loadProgressHistory();
        loadHistoryStats();
        loadHistoryTimeline();
        
        showHistoryMessage('Progress entry deleted.', 'success');
    }
}

function viewPlanDetail(type, planId) {
    const historyKey = `${type}_history`;
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    const plan = history.find(item => item.id === planId);
    
    if (!plan) return;
    
    const modal = document.getElementById('planDetailModal');
    const content = document.getElementById('planDetailContent');
    
    if (type === 'workout') {
        content.innerHTML = `
            <h2>🏋️ Workout Plan Details</h2>
            <div class="plan-meta">
                <p><strong>Created:</strong> ${formatDate(plan.date)}</p>
                <p><strong>Goal:</strong> ${plan.goal}</p>
                <p><strong>Level:</strong> ${plan.level}</p>
                <p><strong>Days per week:</strong> ${plan.days}</p>
            </div>
            <div class="plan-content">
                <h3>Generated Plan:</h3>
                <pre>${plan.plan || 'Plan details not available'}</pre>
            </div>
        `;
    } else if (type === 'nutrition') {
        content.innerHTML = `
            <h2>🍎 Nutrition Plan Details</h2>
            <div class="plan-meta">
                <p><strong>Created:</strong> ${formatDate(plan.date)}</p>
                <p><strong>Diet Type:</strong> ${plan.diet}</p>
                <p><strong>Daily Calories:</strong> ${plan.calories}</p>
            </div>
            <div class="plan-content">
                <h3>Generated Plan:</h3>
                <pre>${plan.plan || 'Plan details not available'}</pre>
            </div>
        `;
    }
    
    modal.style.display = 'block';
}

function closePlanDetail() {
    document.getElementById('planDetailModal').style.display = 'none';
}

function duplicatePlan(type, planId) {
    const historyKey = `${type}_history`;
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    const plan = history.find(item => item.id === planId);
    
    if (!plan) return;
    
    if (type === 'workout') {
        // Pre-fill workout form
        window.location.href = `/#planner?goal=${plan.goal}&level=${plan.level}&days=${plan.days}`;
    } else if (type === 'nutrition') {
        // Pre-fill nutrition form
        window.location.href = `/#nutrition?diet=${plan.diet}&calories=${plan.calories}`;
    }
}

function filterHistory() {
    // Placeholder for filtering functionality
    const filterType = document.getElementById('filterType').value;
    const filterTime = document.getElementById('filterTime').value;
    
    // Reload data with filters applied
    loadHistoryTimeline();
    loadWorkoutHistory();
    loadNutritionHistory();
}

function exportHistory() {
    const workoutHistory = JSON.parse(localStorage.getItem('workout_history') || '[]');
    const nutritionHistory = JSON.parse(localStorage.getItem('nutrition_history') || '[]');
    const progressHistory = JSON.parse(localStorage.getItem('progress_history') || '[]');
    
    const exportData = {
        workouts: workoutHistory,
        nutrition: nutritionHistory,
        progress: progressHistory,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `gideon_history_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showHistoryMessage('History exported successfully!', 'success');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showHistoryMessage(message, type) {
    const messageEl = document.createElement('div');
    messageEl.className = `history-message ${type}`;
    messageEl.innerHTML = `
        <span class="message-icon">${type === 'error' ? '⚠️' : '✅'}</span>
        <span>${message}</span>
    `;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => messageEl.classList.add('show'), 100);
    
    setTimeout(() => {
        messageEl.classList.remove('show');
        setTimeout(() => messageEl.remove(), 300);
    }, 3000);
}