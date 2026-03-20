// ========== Data Store (localStorage) ==========

const KEYS = {
    profile: 'ozzy_user_profile',
    results: 'ozzy_results',
    aiDisclaimer: 'ozzy_ai_disclaimer_accepted'
};

// Safe JSON parse helper
function safeParse(raw) {
    if (!raw) return null;
    try { return JSON.parse(raw); }
    catch { return null; }
}

// Profile
export function saveProfile(data) { localStorage.setItem(KEYS.profile, JSON.stringify(data)); }
export function getProfile() { return safeParse(localStorage.getItem(KEYS.profile)); }
export function hasProfile() { return !!getProfile(); }

// Results
export function saveResults(data) { localStorage.setItem(KEYS.results, JSON.stringify(data)); }
export function getResults() { return safeParse(localStorage.getItem(KEYS.results)); }

// Meals (date-based)
function mealKey(date) {
    const d = date || new Date().toISOString().slice(0, 10);
    return `ozzy_meals_${d}`;
}

export function getTodayMeals() { return getMealsForDate(); }

export function getMealsForDate(date) {
    return safeParse(localStorage.getItem(mealKey(date))) || { dorucak: null, rucak: null, vecera: null, uzina: null };
}

export function saveMeal(type, items, date) {
    const meals = getMealsForDate(date);
    meals[type] = items;
    localStorage.setItem(mealKey(date), JSON.stringify(meals));
}

export function getDailyTotals() { return getTotalsForDate(); }

export function getTotalsForDate(date) {
    const meals = getMealsForDate(date);
    const totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    Object.values(meals).forEach(items => {
        if (items) items.forEach(item => {
            totals.kcal += item.kcal || 0;
            totals.protein += item.protein || 0;
            totals.carbs += item.carbs || 0;
            totals.fat += item.fat || 0;
        });
    });
    return totals;
}

// Exercise (date-based)
function exerciseKey(date) {
    const d = date || new Date().toISOString().slice(0, 10);
    return `ozzy_exercises_${d}`;
}

export function getTodayExercises() { return getExercisesForDate(); }

export function getExercisesForDate(date) {
    return safeParse(localStorage.getItem(exerciseKey(date))) || [];
}

export function saveExercise(items, date) {
    localStorage.setItem(exerciseKey(date), JSON.stringify(items));
}

export function getDailyExerciseCalories() { return getExerciseCaloriesForDate(); }

export function getExerciseCaloriesForDate(date) {
    return getExercisesForDate(date).reduce((sum, item) => sum + (item.kcalBurned || item.kcal || 0), 0);
}

// Water
function waterKey(date) {
    const d = date || new Date().toISOString().slice(0, 10);
    return `ozzy_water_${d}`;
}

export function getTodayWater() { return getWaterForDate(); }

export function getWaterForDate(date) {
    return parseInt(localStorage.getItem(waterKey(date)) || '0');
}

export function setTodayWater(glasses, date) {
    localStorage.setItem(waterKey(date), glasses.toString());
}

// AI Disclaimer
export function isAIDisclaimerAccepted() { return !!localStorage.getItem(KEYS.aiDisclaimer); }
export function acceptAIDisclaimer() { localStorage.setItem(KEYS.aiDisclaimer, 'true'); }

// Dashboard onboarding
export function isDashboardOnboardingSeen() { return !!localStorage.getItem('ozzy_onboarding_dashboard_seen'); }
export function setDashboardOnboardingSeen() { localStorage.setItem('ozzy_onboarding_dashboard_seen', 'true'); }

// Quiz state (sessionStorage)
export function getQuizState() {
    return safeParse(sessionStorage.getItem('ozzy_quiz_state')) || {};
}
export function setQuizState(key, value) {
    const state = getQuizState();
    state[key] = value;
    sessionStorage.setItem('ozzy_quiz_state', JSON.stringify(state));
}

// PWA install banner
export function getDashboardVisits() {
    return parseInt(localStorage.getItem('ozzy_dashboard_visits') || '0');
}
export function incrementDashboardVisits() {
    const v = getDashboardVisits() + 1;
    localStorage.setItem('ozzy_dashboard_visits', v.toString());
    return v;
}
export function isPwaInstallDismissed() { return !!localStorage.getItem('ozzy_pwa_install_dismissed'); }
export function dismissPwaInstall() { localStorage.setItem('ozzy_pwa_install_dismissed', 'true'); }

// Reset
export function clearAll() {
    localStorage.clear();
    sessionStorage.clear();
}
