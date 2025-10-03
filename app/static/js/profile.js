// Profile page JavaScript functionality

// Initialize profile page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname === '/profile') {
        initializeProfilePage();
    }
    if (window.location.pathname === '/history') {
        initializeHistoryPage();
    }
});

// Profile Page Functions
function initializeProfilePage() {
    loadUserProfile();
    setupProfileEventListeners();
}

function loadUserProfile() {
    // Get user data from localStorage
    const userName = localStorage.getItem('user_name') || 'User';
    const userEmail = localStorage.getItem('user_email') || 'user@example.com';
    
    // Update profile header
    document.getElementById('profileName').textContent = userName;
    document.getElementById('profileEmail').textContent = userEmail;
    document.getElementById('avatarInitial').textContent = userName.charAt(0).toUpperCase();
    
    // Load saved profile data
    const profileData = JSON.parse(localStorage.getItem('profile_data') || '{}');
    
    // Populate form fields
    if (profileData) {
        document.getElementById('userName').value = profileData.name || userName;
        document.getElementById('userEmail').value = profileData.email || userEmail;
        document.getElementById('userPhone').value = profileData.phone || '';
        document.getElementById('userBirthdate').value = profileData.birthdate || '';
        document.getElementById('userHeight').value = profileData.height || '';
        document.getElementById('userWeight').value = profileData.weight || '';
        document.getElementById('userFitnessLevel').value = profileData.fitnessLevel || '';
        document.getElementById('userFitnessGoal').value = profileData.fitnessGoal || '';
        document.getElementById('userDietType').value = profileData.dietType || '';
        document.getElementById('userWorkoutDays').value = profileData.workoutDays || '';
        document.getElementById('notifyWorkouts').checked = profileData.notifyWorkouts || false;
        document.getElementById('notifyNutrition').checked = profileData.notifyNutrition || false;
        document.getElementById('notifyProgress').checked = profileData.notifyProgress || false;
    }
    
    // Update stats
    updateProfileStats();
}

function updateProfileStats() {
    const workoutHistory = JSON.parse(localStorage.getItem('workout_history') || '[]');
    const nutritionHistory = JSON.parse(localStorage.getItem('nutrition_history') || '[]');
    const memberSince = localStorage.getItem('member_since') || new Date().getFullYear();
    
    document.getElementById('totalWorkouts').textContent = workoutHistory.length;
    document.getElementById('totalNutritionPlans').textContent = nutritionHistory.length;
    document.getElementById('memberSince').textContent = memberSince;
}

function setupProfileEventListeners() {
    // Personal info form
    document.getElementById('personalInfoForm').addEventListener('submit', function(e) {
        e.preventDefault();
        savePersonalInfo();
    });
    
    // Fitness profile form
    document.getElementById('fitnessProfileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveFitnessProfile();
    });
    
    // Preferences form
    document.getElementById('preferencesForm').addEventListener('submit', function(e) {
        e.preventDefault();
        savePreferences();
    });
    
    // Security form
    document.getElementById('securityForm').addEventListener('submit', function(e) {
        e.preventDefault();
        changePassword();
    });
}

function savePersonalInfo() {
    const profileData = JSON.parse(localStorage.getItem('profile_data') || '{}');
    
    profileData.name = document.getElementById('userName').value;
    profileData.email = document.getElementById('userEmail').value;
    profileData.phone = document.getElementById('userPhone').value;
    profileData.birthdate = document.getElementById('userBirthdate').value;
    
    localStorage.setItem('profile_data', JSON.stringify(profileData));
    localStorage.setItem('user_name', profileData.name);
    localStorage.setItem('user_email', profileData.email);
    
    showProfileMessage('Personal information updated successfully!', 'success');
    
    // Update header display
    document.getElementById('profileName').textContent = profileData.name;
    document.getElementById('profileEmail').textContent = profileData.email;
    document.getElementById('avatarInitial').textContent = profileData.name.charAt(0).toUpperCase();
}

function saveFitnessProfile() {
    const profileData = JSON.parse(localStorage.getItem('profile_data') || '{}');
    
    profileData.height = document.getElementById('userHeight').value;
    profileData.weight = document.getElementById('userWeight').value;
    profileData.fitnessLevel = document.getElementById('userFitnessLevel').value;
    profileData.fitnessGoal = document.getElementById('userFitnessGoal').value;
    
    localStorage.setItem('profile_data', JSON.stringify(profileData));
    showProfileMessage('Fitness profile updated successfully!', 'success');
}

function savePreferences() {
    const profileData = JSON.parse(localStorage.getItem('profile_data') || '{}');
    
    profileData.dietType = document.getElementById('userDietType').value;
    profileData.workoutDays = document.getElementById('userWorkoutDays').value;
    profileData.notifyWorkouts = document.getElementById('notifyWorkouts').checked;
    profileData.notifyNutrition = document.getElementById('notifyNutrition').checked;
    profileData.notifyProgress = document.getElementById('notifyProgress').checked;
    
    localStorage.setItem('profile_data', JSON.stringify(profileData));
    showProfileMessage('Preferences updated successfully!', 'success');
}

function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showProfileMessage('New passwords do not match!', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showProfileMessage('Password must be at least 6 characters long!', 'error');
        return;
    }
    
    // Here you would typically make an API call to change the password
    showProfileMessage('Password changed successfully!', 'success');
    
    // Clear form
    document.getElementById('securityForm').reset();
}

function showProfileMessage(message, type) {
    const messageEl = document.createElement('div');
    messageEl.className = `profile-message ${type}`;
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

function exportData() {
    const profileData = JSON.parse(localStorage.getItem('profile_data') || '{}');
    const workoutHistory = JSON.parse(localStorage.getItem('workout_history') || '[]');
    const nutritionHistory = JSON.parse(localStorage.getItem('nutrition_history') || '[]');
    
    const exportData = {
        profile: profileData,
        workoutHistory: workoutHistory,
        nutritionHistory: nutritionHistory,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `gideon_data_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showProfileMessage('Data exported successfully!', 'success');
}

function deleteAccount() {
    const confirmation = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    
    if (confirmation) {
        const finalConfirmation = prompt('Type "DELETE" to confirm account deletion:');
        
        if (finalConfirmation === 'DELETE') {
            // Clear all user data
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_name');
            localStorage.removeItem('user_email');
            localStorage.removeItem('profile_data');
            localStorage.removeItem('workout_history');
            localStorage.removeItem('nutrition_history');
            localStorage.removeItem('member_since');
            
            alert('Your account has been deleted. You will be redirected to the home page.');
            window.location.href = '/';
        }
    }
}

// Quick action functions
function goToWorkoutPlanner() {
    window.location.href = '/#planner';
}

function goToNutritionPlanner() {
    window.location.href = '/#nutrition';
}

function goToHistory() {
    window.location.href = '/history';
}

function goToDashboard() {
    showDashboard();
}