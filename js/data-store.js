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

export function getTodayMeals() {
    return safeParse(localStorage.getItem(mealKey())) || { dorucak: null, rucak: null, vecera: null, uzina: null };
}

export function saveMeal(type, items) {
    const meals = getTodayMeals();
    meals[type] = items;
    localStorage.setItem(mealKey(), JSON.stringify(meals));
}

export function getDailyTotals() {
    const meals = getTodayMeals();
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

export function getTodayExercises() {
    return safeParse(localStorage.getItem(exerciseKey())) || [];
}

export function saveExercise(items) {
    localStorage.setItem(exerciseKey(), JSON.stringify(items));
}

export function getDailyExerciseCalories() {
    return getTodayExercises().reduce((sum, item) => sum + (item.kcalBurned || 0), 0);
}

// Water
export function getTodayWater() {
    return parseInt(localStorage.getItem(`ozzy_water_${new Date().toISOString().slice(0, 10)}`) || '0');
}
export function setTodayWater(glasses) {
    localStorage.setItem(`ozzy_water_${new Date().toISOString().slice(0, 10)}`, glasses.toString());
}

// AI Disclaimer
export function isAIDisclaimerAccepted() { return !!localStorage.getItem(KEYS.aiDisclaimer); }
export function acceptAIDisclaimer() { localStorage.setItem(KEYS.aiDisclaimer, 'true'); }

// Quiz state (sessionStorage)
export function getQuizState() {
    return safeParse(sessionStorage.getItem('ozzy_quiz_state')) || {};
}
export function setQuizState(key, value) {
    const state = getQuizState();
    state[key] = value;
    sessionStorage.setItem('ozzy_quiz_state', JSON.stringify(state));
}

// Reset
export function clearAll() {
    localStorage.clear();
    sessionStorage.clear();
}
