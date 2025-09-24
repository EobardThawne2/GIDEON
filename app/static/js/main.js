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

// Open modal from CTA
document.querySelector('.cta-btn')?.addEventListener('click', openModal);
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
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
  setLoading(btn, true, 'Registering...');
  const data = Object.fromEntries(new FormData(e.target));
  const res = await postJSON('/auth/register', data);
  setLoading(btn, false);
  if (res.error) {
    alert("Registration failed: " + res.error);
  } else {
    alert(res.message || "Registration successful!");
    closeModal();
    e.target.reset();
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
document.head.appendChild(style);
