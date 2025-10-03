// Modal accessibility and animation
const registerModal = document.getElementById('registerModal');
const closeBtn = registerModal?.querySelector('.close');
let lastFocusedElement = null;

function openModal() {
  if (!registerModal) return;
  lastFocusedElement = document.activeElement;
  registerModal.style.display = 'block';
  registerModal.classList.add('modal-animate');
  setTimeout(() => registerModal.classList.remove('modal-animate'), 300);
  // Focus first input
  registerModal.querySelector('input,button')?.focus();
}

function closeModal() {
  if (!registerModal) return;
  registerModal.classList.add('modal-animate-close');
  setTimeout(() => {
    registerModal.style.display = 'none';
    registerModal.classList.remove('modal-animate-close');
    lastFocusedElement?.focus();
  }, 250);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Open modal from CTA and Get Started buttons
function setupInitialEventListeners() {
  // Only set up if user is not logged in
  const token = localStorage.getItem('access_token');
  if (!token) {
    document.querySelectorAll('.cta-btn, #loginBtn').forEach(btn => {
      btn.addEventListener('click', openModal);
    });
  }
}

// Call setup function
setupInitialEventListeners();

// Close modal on Escape or close button
document.addEventListener('keydown', e => {
  if (e.key === "Escape" && registerModal?.style.display === 'block') closeModal();
});
closeBtn?.addEventListener('click', closeModal);
closeBtn?.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') closeModal();
});

// Trap focus in modal
registerModal?.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    const focusable = registerModal.querySelectorAll('input,button,.close');
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      last.focus(); e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus(); e.preventDefault();
    }
  }
});

// Helper function for POST JSON with error handling
async function postJSON(url, data) {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Add authorization header if token exists
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Network error');
    return await response.json();
  } catch (err) {
    return { error: err.message };
  }
}

// Loading indicator utility
function setLoading(el, loading, msg = 'Loading...') {
  if (!el) return;
  if (loading) {
    el.dataset.prev = el.textContent;
    el.textContent = msg;
    el.classList.add('loading');
  } else {
    el.textContent = el.dataset.prev || '';
    el.classList.remove('loading');
  }
}

// Workout Planner form submit
document.getElementById('workoutForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  const resultEl = document.getElementById('workoutResult');
  const submitBtn = form.querySelector('button[type="submit"]');
  
  // Disable submit button and show loading
  submitBtn.disabled = true;
  setLoading(submitBtn, true, 'Generating...');
  
  try {
    const formData = new FormData(form);
    const data = {
      goal: formData.get('goal'),
      level: formData.get('level'),
      days: parseInt(formData.get('days'))
    };
    
    // Validate form data
    if (!data.goal || !data.level || isNaN(data.days)) {
      throw new Error('Please fill all fields correctly');
    }
    if (data.days < 1 || data.days > 7) {
      throw new Error('Days must be between 1 and 7');
    }
    
    const response = await fetch('/api/workout-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate plan');
    }
    
    const res = await response.json();
    if (res.error) {
      throw new Error(res.error);
    }
    
    // Parse the JSON string if it's a string
    const plan = typeof res.plan === 'string' ? JSON.parse(res.plan) : res.plan;
    
    // Save to history
    saveWorkoutToHistory({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      goal: data.goal,
      level: data.level,
      days: parseInt(data.days),
      plan: JSON.stringify(plan)
    });
    
    // Format the plan nicely
    const formattedPlan = formatWorkoutPlan(plan);
    
    // Create a container for the new plan
    const planContainer = document.createElement('div');
    planContainer.className = 'workout-result-container';
    planContainer.innerHTML = formattedPlan;
    
    // Clear previous results and add new plan with animation
    resultEl.innerHTML = '';
    resultEl.appendChild(planContainer);
    planContainer.style.opacity = '0';
    planContainer.style.transform = 'translateY(20px)';
    
    // Trigger animation
    setTimeout(() => {
      planContainer.style.transition = 'all 0.3s ease-out';
      planContainer.style.opacity = '1';
      planContainer.style.transform = 'translateY(0)';
    }, 10);
    
  } catch (error) {
    resultEl.innerHTML = `
      <div class="error-message">
        <span class="error-icon">⚠️</span>
        <span>${error.message}</span>
      </div>
    `;
    console.error('Workout plan error:', error);
  } finally {
    // Re-enable submit button and remove loading state
    submitBtn.disabled = false;
    setLoading(submitBtn, false);
  }
});

// Nutrition Optimizer form submit
document.getElementById('nutritionForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  const resultEl = document.getElementById('nutritionResult');
  const submitBtn = form.querySelector('button[type="submit"]');
  
  // Disable submit button and show loading
  submitBtn.disabled = true;
  setLoading(submitBtn, true, 'Generating...');
  
  try {
    const formData = new FormData(form);
    const data = {
      diet: formData.get('diet'),
      calories: parseInt(formData.get('calories'))
    };
    
    // Validate form data
    if (!data.diet || isNaN(data.calories)) {
      throw new Error('Please fill all fields correctly');
    }
    if (data.calories < 1000 || data.calories > 5000) {
      throw new Error('Calories must be between 1000 and 5000');
    }
    
    const response = await fetch('/api/nutrition-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate plan');
    }
    
    const res = await response.json();
    if (res.error) {
      throw new Error(res.error);
    }
    
    // Parse the JSON string if it's a string
    const plan = typeof res.plan === 'string' ? JSON.parse(res.plan) : res.plan;
    
    // Save to history
    saveNutritionToHistory({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      diet: data.diet,
      calories: data.calories,
      plan: JSON.stringify(plan)
    });
    
    // Format the plan nicely
    const formattedPlan = formatNutritionPlan(plan);
    
    // Create a container for the new plan
    const planContainer = document.createElement('div');
    planContainer.className = 'nutrition-result-container';
    planContainer.innerHTML = formattedPlan;
    
    // Clear previous results and add new plan with animation
    resultEl.innerHTML = '';
    resultEl.appendChild(planContainer);
    planContainer.style.opacity = '0';
    planContainer.style.transform = 'translateY(20px)';
    
    // Trigger animation
    setTimeout(() => {
      planContainer.style.transition = 'all 0.3s ease-out';
      planContainer.style.opacity = '1';
      planContainer.style.transform = 'translateY(0)';
    }, 10);
    
  } catch (error) {
    resultEl.innerHTML = `
      <div class="error-message">
        <span class="error-icon">⚠️</span>
        <span>${error.message}</span>
      </div>
    `;
    console.error('Nutrition plan error:', error);
  } finally {
    // Re-enable submit button and remove loading state
    submitBtn.disabled = false;
    setLoading(submitBtn, false);
  }
});

// Registration form submit
document.getElementById('registerForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  setLoading(btn, true, 'Creating Account...');
  
  try {
    const data = Object.fromEntries(new FormData(e.target));
    const res = await postJSON('/auth/register', data);
    
    if (res.error) {
      // Show error message in the form
      showFormMessage(e.target, res.error, 'error');
    } else {
      // Store the access token
      localStorage.setItem('access_token', res.access_token);
      localStorage.setItem('user_name', data.name);
      
      // Show success message
      showFormMessage(e.target, res.message || "Account created successfully!", 'success');
      
      // Update UI to logged-in state
      updateUIForLoggedInUser(data.name);
      
      // Close modal after short delay
      setTimeout(() => {
        closeModal();
        e.target.reset();
        
        // Show welcome message
        showWelcomeMessage(data.name);
      }, 1500);
    }
  } catch (error) {
    showFormMessage(e.target, 'Registration failed. Please try again.', 'error');
  } finally {
    setLoading(btn, false);
  }
});

// Function to show form messages
function showFormMessage(form, message, type) {
  // Remove existing message
  const existingMessage = form.querySelector('.form-message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  // Create new message
  const messageEl = document.createElement('div');
  messageEl.className = `form-message ${type}`;
  messageEl.innerHTML = `
    <span class="message-icon">${type === 'error' ? '⚠️' : '✅'}</span>
    <span>${message}</span>
  `;
  
  // Insert message before submit button
  const submitBtn = form.querySelector('button[type="submit"]');
  form.insertBefore(messageEl, submitBtn);
}

// Function to update UI for logged-in user
function updateUIForLoggedInUser(userName) {
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.innerHTML = `Welcome, ${userName}`;
    // Remove any existing event listeners
    loginBtn.onclick = null;
    loginBtn.removeEventListener('click', openModal);
    // Add new event listener
    loginBtn.addEventListener('click', showUserMenu);
  }
  
  // Update hero CTA button
  const heroCtaBtn = document.querySelector('.hero .cta-btn');
  if (heroCtaBtn) {
    heroCtaBtn.innerHTML = 'Go to Dashboard';
    // Remove any existing event listeners
    heroCtaBtn.onclick = null;
    heroCtaBtn.removeEventListener('click', openModal);
    // Add new event listener
    heroCtaBtn.addEventListener('click', showDashboard);
  }
  
  // Update secondary button if it exists
  const secondaryBtn = document.querySelector('.hero .secondary-btn');
  if (secondaryBtn) {
    secondaryBtn.innerHTML = 'View Plans';
    secondaryBtn.onclick = null;
    secondaryBtn.addEventListener('click', () => {
      document.getElementById('planner').scrollIntoView({ behavior: 'smooth' });
    });
  }
}

// Function to show welcome message
function showWelcomeMessage(userName) {
  const welcomeEl = document.createElement('div');
  welcomeEl.className = 'welcome-toast';
  welcomeEl.innerHTML = `
    <div class="welcome-content">
      <span class="welcome-icon">🎉</span>
      <div>
        <h4>Welcome to GIDEON, ${userName}!</h4>
        <p>Your AI-powered fitness journey starts now.</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(welcomeEl);
  
  // Show toast
  setTimeout(() => welcomeEl.classList.add('show'), 100);
  
  // Hide toast after 4 seconds
  setTimeout(() => {
    welcomeEl.classList.remove('show');
    setTimeout(() => welcomeEl.remove(), 300);
  }, 4000);
}

// Function to show user menu (placeholder)
function showUserMenu() {
  const userMenu = document.createElement('div');
  userMenu.className = 'user-menu-dropdown';
  userMenu.innerHTML = `
    <div class="user-menu-content">
      <div class="user-menu-item" onclick="showDashboard()">
        <span>📊</span> Dashboard
      </div>
      <div class="user-menu-item" onclick="showProfile()">
        <span>👤</span> Profile
      </div>
      <div class="user-menu-item" onclick="showHistory()">
        <span>📈</span> History
      </div>
      <div class="user-menu-divider"></div>
      <div class="user-menu-item logout" onclick="logout()">
        <span>🚪</span> Logout
      </div>
    </div>
  `;
  
  // Position menu
  const loginBtn = document.getElementById('loginBtn');
  const rect = loginBtn.getBoundingClientRect();
  userMenu.style.position = 'fixed';
  userMenu.style.top = (rect.bottom + 5) + 'px';
  userMenu.style.right = '20px';
  
  document.body.appendChild(userMenu);
  
  // Close menu when clicking outside
  setTimeout(() => {
    document.addEventListener('click', function closeMenu(e) {
      if (!userMenu.contains(e.target)) {
        userMenu.remove();
        document.removeEventListener('click', closeMenu);
      }
    });
  }, 10);
}

// Function to logout
function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_name');
  
  // Reset UI to logged-out state
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.innerHTML = 'Get Started';
    // Remove logged-in event listeners
    loginBtn.onclick = null;
    loginBtn.removeEventListener('click', showUserMenu);
    // Add back the original event listener
    loginBtn.addEventListener('click', openModal);
  }
  
  // Reset hero CTA button
  const heroCtaBtn = document.querySelector('.hero .cta-btn');
  if (heroCtaBtn) {
    heroCtaBtn.innerHTML = 'Get Started Free';
    // Remove dashboard event listeners
    heroCtaBtn.onclick = null;
    heroCtaBtn.removeEventListener('click', showDashboard);
    // Add back the original event listener
    heroCtaBtn.addEventListener('click', openModal);
  }
  
  // Reset secondary button
  const secondaryBtn = document.querySelector('.hero .secondary-btn');
  if (secondaryBtn) {
    secondaryBtn.innerHTML = 'Try AI Planner';
    secondaryBtn.onclick = null;
    secondaryBtn.addEventListener('click', () => {
      document.getElementById('planner').scrollIntoView({ behavior: 'smooth' });
    });
  }
  
  // Remove any user menu
  const userMenu = document.querySelector('.user-menu-dropdown');
  if (userMenu) userMenu.remove();
  
  // Show logout message
  showLogoutMessage();
}

// Function to show logout message
function showLogoutMessage() {
  const logoutEl = document.createElement('div');
  logoutEl.className = 'welcome-toast';
  logoutEl.innerHTML = `
    <div class="welcome-content">
      <span class="welcome-icon">👋</span>
      <div>
        <h4>Logged out successfully</h4>
        <p>Thanks for using GIDEON. Come back anytime!</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(logoutEl);
  
  // Show toast
  setTimeout(() => logoutEl.classList.add('show'), 100);
  
  // Hide toast after 3 seconds
  setTimeout(() => {
    logoutEl.classList.remove('show');
    setTimeout(() => logoutEl.remove(), 300);
  }, 3000);
}

// Placeholder functions for menu items
function showProfile() {
    window.location.href = '/profile';
}

function showHistory() {
    window.location.href = '/history';
}

// Function to show dashboard (placeholder)
function showDashboard() {
  // Create dashboard modal
  const dashboardModal = document.createElement('div');
  dashboardModal.className = 'modal';
  dashboardModal.style.display = 'block';
  dashboardModal.innerHTML = `
    <div class="modal-content" style="max-width: 800px;">
      <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <h2 style="text-align: center; margin-bottom: 2rem; color: #0f172a;">
        🎯 Your AI Fitness Dashboard
      </h2>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
        <div class="feature-card">
          <div class="feature-icon">🏋️</div>
          <h3>Workout Plans</h3>
          <p>Create and manage your personalized workout routines</p>
          <button onclick="document.getElementById('planner').scrollIntoView(); this.parentElement.parentElement.parentElement.parentElement.remove();" style="margin-top: 1rem;">
            Create Workout Plan
          </button>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">🍎</div>
          <h3>Nutrition Plans</h3>
          <p>Get AI-optimized meal plans for your dietary goals</p>
          <button onclick="document.getElementById('nutrition').scrollIntoView(); this.parentElement.parentElement.parentElement.parentElement.remove();" style="margin-top: 1rem;">
            Create Nutrition Plan
          </button>
        </div>
      </div>
      
      <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 12px; text-align: center;">
        <h4 style="color: #3b82f6; margin-bottom: 1rem;">🚀 Coming Soon</h4>
        <p style="color: #64748b; margin: 0;">
          Progress tracking, workout history, nutrition analytics, and personalized recommendations
          are coming in future updates!
        </p>
      </div>
    </div>
  `;
  
  document.body.appendChild(dashboardModal);
  
  // Close modal when clicking outside
  dashboardModal.addEventListener('click', (e) => {
    if (e.target === dashboardModal) {
      dashboardModal.remove();
    }
  });
}

// Check if user is already logged in on page load
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('access_token');
  const userName = localStorage.getItem('user_name');
  
  if (token && userName) {
    updateUIForLoggedInUser(userName);
  }
});

// Contact form submit (demo)
document.getElementById('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  alert("Message sent! We'll be in touch.");
  e.target.reset();
});

// Helper function to format nutrition plan
function formatNutritionPlan(plan) {
  if (!plan || !plan.macronutrients) return 'Invalid plan format';
  
  let html = `
    <div class="nutrition-plan">
      <h3>Daily Nutrition Plan</h3>
      <div class="macros-info">
        <h4>Daily Macronutrient Targets</h4>
        <div class="macros-grid">
          <div class="macro-item">
            <strong>Protein</strong>
            <span>${plan.macronutrients.protein}</span>
          </div>
          <div class="macro-item">
            <strong>Carbohydrates</strong>
            <span>${plan.macronutrients.carbohydrates}</span>
          </div>
          <div class="macro-item">
            <strong>Fats</strong>
            <span>${plan.macronutrients.fats}</span>
          </div>
        </div>
      </div>
      
      <div class="meal-plan">
        <h4>Daily Meal Schedule</h4>
  `;
  
  // Add main meals
  ['breakfast', 'lunch', 'dinner'].forEach(meal => {
    html += `
      <div class="meal-section">
        <h4>${meal}</h4>
        <div class="meal-item">${plan.meal_plan[meal]}</div>
      </div>
    `;
  });
  
  // Add snacks section
  html += `
    <div class="meal-section">
      <h4>Recommended Snacks</h4>
      <div class="snacks-list">
        ${plan.meal_plan.snacks.map(snack => `
          <div class="meal-item">${snack}</div>
        `).join('')}
      </div>
    </div>
  `;
  
  html += `
      </div>
      <p class="nutrition-notes">${plan.notes}</p>
    </div>
  `;
  
  return html;
}

// Helper function to format workout plan
function formatWorkoutPlan(plan) {
  if (!plan || !plan.weekly_schedule) return 'Invalid plan format';
  
  let html = `
    <div class="workout-plan">
      <h3>Weekly Workout Schedule</h3>
      <div class="intensity-info">
        <strong>Intensity Level:</strong>
        <ul>
          <li>Sets: ${plan.intensity.sets}</li>
          <li>Reps: ${plan.intensity.reps}</li>
          <li>Rest: ${plan.intensity.rest}</li>
        </ul>
      </div>
      <div class="weekly-schedule">
  `;
  
  plan.weekly_schedule.forEach(day => {
    html += `
      <div class="workout-day">
        <h4>Day ${day.day}</h4>
        <p><strong>Focus:</strong> ${day.focus}</p>
        <p><strong>Duration:</strong> ${day.duration}</p>
        <strong>Exercises:</strong>
        <ul>
          ${day.exercises.map(exercise => `<li>${exercise}</li>`).join('')}
        </ul>
      </div>
    `;
  });
  
  html += `
      </div>
      <p class="plan-notes">${plan.notes}</p>
    </div>
  `;
  
  return html;
}

// Add styles for workout plan and modal animations
const style = document.createElement('style');
style.textContent = `
.modal-animate { animation: modalIn .3s; }
.modal-animate-close { animation: modalOut .25s; }
@keyframes modalIn { from { opacity:0; transform:scale(.95);} to {opacity:1;transform:scale(1);} }
@keyframes modalOut { from { opacity:1; transform:scale(1);} to {opacity:0;transform:scale(.95);} }
.loading { 
  opacity: 0.7;
  cursor: not-allowed;
  position: relative;
}
.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1em;
  height: 1em;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.workout-result-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.workout-plan {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-top: 1rem;
}

.workout-plan h3 {
  color: #1e88e5;
  margin-bottom: 1rem;
  text-align: center;
}

.intensity-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.intensity-info ul {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
  display: flex;
  gap: 1.5rem;
}

.weekly-schedule {
  display: grid;
  gap: 1.5rem;
  margin: 1.5rem 0;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.workout-day {
  background: #f8f9fa;
  padding: 1.25rem;
  border-radius: 8px;
  border: 1px solid #e3f2fd;
  transition: transform 0.2s, box-shadow 0.2s;
}

.workout-day:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.workout-day h4 {
  margin: 0 0 0.75rem 0;
  color: #1e88e5;
  font-size: 1.2rem;
}

.workout-day ul {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}

.workout-day li {
  margin: 0.5rem 0;
}

.plan-notes {
  font-style: italic;
  color: #666;
  margin-top: 1.5rem;
  text-align: center;
  padding: 1rem;
  background: #e3f2fd;
  border-radius: 6px;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
  animation: fadeIn 0.3s ease-out;
}

.error-icon {
  font-size: 1.2rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Nutrition Plan Styles */
.nutrition-result-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.nutrition-plan {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-top: 1rem;
}

.nutrition-plan h3 {
  color: #1e88e5;
  margin-bottom: 1rem;
  text-align: center;
}

.macros-info {
  background: #e8f5e9;
  padding: 1.25rem;
  border-radius: 8px;
  margin: 1.5rem 0;
}

.macros-info h4 {
  color: #2e7d32;
  margin: 0 0 1rem 0;
}

.macros-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.macro-item {
  background: #fff;
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
  border: 1px solid #c8e6c9;
}

.macro-item strong {
  color: #2e7d32;
  display: block;
  margin-bottom: 0.5rem;
}

.meal-plan {
  margin-top: 2rem;
}

.meal-section {
  background: #f8f9fa;
  padding: 1.25rem;
  border-radius: 8px;
  margin: 1rem 0;
  border: 1px solid #e3f2fd;
  transition: transform 0.2s, box-shadow 0.2s;
}

.meal-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.meal-section h4 {
  color: #1e88e5;
  margin: 0 0 0.75rem 0;
  font-size: 1.2rem;
  text-transform: capitalize;
}

.snacks-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
}

.nutrition-notes {
  font-style: italic;
  color: #666;
  margin-top: 1.5rem;
  text-align: center;
  padding: 1rem;
  background: #e3f2fd;
  border-radius: 6px;
}
`;
/* Line 929 omitted */
document.head.appendChild(style);

// Functions to save plans to history
function saveWorkoutToHistory(workoutData) {
  const workoutHistory = JSON.parse(localStorage.getItem('workout_history') || '[]');
  workoutHistory.unshift(workoutData);
  
  // Keep only last 50 entries
  if (workoutHistory.length > 50) {
    workoutHistory.splice(50);
  }
  
  localStorage.setItem('workout_history', JSON.stringify(workoutHistory));
}

function saveNutritionToHistory(nutritionData) {
  const nutritionHistory = JSON.parse(localStorage.getItem('nutrition_history') || '[]');
  nutritionHistory.unshift(nutritionData);
  
  // Keep only last 50 entries
  if (nutritionHistory.length > 50) {
    nutritionHistory.splice(50);
  }
  
  localStorage.setItem('nutrition_history', JSON.stringify(nutritionHistory));
}

// Set member since date if not already set
if (!localStorage.getItem('member_since')) {
  localStorage.setItem('member_since', new Date().getFullYear().toString());
}
