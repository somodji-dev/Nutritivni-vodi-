// ========== Nutrition Calculator ==========

// Bazalni faktor aktivnosti (sedeći) — vežbe se dodaju eksplicitno kroz unos
export const BASELINE_ACTIVITY_FACTOR = 1.2;

export const DEFICIT_MAP = {
    'Turbo': 750,
    'Stabilno': 500,
    'Opušteno': 250
};

export const MACRO_SPLITS = {
    'Jedem sve':     { protein: 0.25, carbs: 0.50, fat: 0.25 },
    'Low Carb':      { protein: 0.30, carbs: 0.20, fat: 0.50 },
    'Biljni fokus':  { protein: 0.20, carbs: 0.55, fat: 0.25 },
    'Paleo / Clean': { protein: 0.35, carbs: 0.25, fat: 0.40 }
};

export const MEAL_SPLITS = {
    dorucak: 0.25,
    rucak: 0.35,
    vecera: 0.25,
    uzina: 0.15
};

// BMI
export function calcBMI(weightKg, heightCm) {
    const h = heightCm / 100;
    return weightKg / (h * h);
}

export function getBMICategory(bmi) {
    if (bmi < 18.5) return { label: 'Pothranjenost', color: '#00A8D8', range: '< 18.5' };
    if (bmi < 25)   return { label: 'Normalna težina', color: '#4CAF50', range: '18.5 - 24.9' };
    if (bmi < 30)   return { label: 'Prekomerna težina', color: '#FF9500', range: '25 - 29.9' };
    return { label: 'Gojaznost', color: '#F44336', range: '≥ 30' };
}

// BMR (Mifflin-St Jeor)
export function calcBMR(gender, weightKg, heightCm, age) {
    if (gender === 'Muško') {
        return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    }
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

// TDEE — bazalni (sedeći × 1.2), vežbe se dodaju eksplicitno na dashboardu
export function calcTDEE(bmr) {
    return bmr * BASELINE_ACTIVITY_FACTOR;
}

// Calorie goal
export function calcCalorieGoal(tdee, goal, tempo) {
    if (goal === 'Smršaj') return tdee - (DEFICIT_MAP[tempo] || 500);
    if (goal === 'Nabildaj se') return tdee + (DEFICIT_MAP[tempo] || 300);
    return tdee; // Ostani fit
}

// Macros
export function calcMacros(calories, dietType) {
    const split = MACRO_SPLITS[dietType] || MACRO_SPLITS['Jedem sve'];
    return {
        protein: Math.round(calories * split.protein / 4),
        carbs: Math.round(calories * split.carbs / 4),
        fat: Math.round(calories * split.fat / 9)
    };
}

// Water (ml)
export function calcWater(weightKg) {
    return Math.round(weightKg * 35 / 100) / 10; // liters, 1 decimal
}

// Meal calories
export function calcMealCalories(totalCalories) {
    return {
        dorucak: Math.round(totalCalories * MEAL_SPLITS.dorucak),
        rucak: Math.round(totalCalories * MEAL_SPLITS.rucak),
        vecera: Math.round(totalCalories * MEAL_SPLITS.vecera),
        uzina: Math.round(totalCalories * MEAL_SPLITS.uzina)
    };
}

// Weeks to goal — izračunato iz efektivnog deficita (1 kg masti ≈ 7700 kcal)
export function calcWeeksToGoal(currentWeight, targetWeight, tempo, tdee, calories) {
    const diff = Math.abs(currentWeight - targetWeight);
    if (diff === 0) return 0;
    // Efektivni deficit = razlika izmedju TDEE i kalorijskog cilja (uzima u obzir MIN_CALORIES limit)
    const effectiveDeficit = Math.abs(tdee - calories);
    if (effectiveDeficit === 0) return 0;
    // 7700 kcal = 1 kg masti, deficit × 7 = nedeljni deficit
    const weeksNeeded = (diff * 7700) / (effectiveDeficit * 7);
    return Math.ceil(weeksNeeded);
}

// Minimum safe calories
const MIN_CALORIES = 1200;

// All results at once
export function calcAllResults(profile) {
    // Guard against zero/invalid values
    const weight = Math.max(profile.weight || 40, 20);
    const height = Math.max(profile.height || 160, 100);
    const age = Math.max(profile.age || 25, 10);

    const bmr = calcBMR(profile.gender, weight, height, age);
    const tdee = calcTDEE(bmr);
    let calories = calcCalorieGoal(tdee, profile.goal, profile.tempo);
    // Never go below minimum safe calories
    calories = Math.max(calories, MIN_CALORIES);
    const macros = calcMacros(calories, profile.dietType);
    const water = calcWater(weight);
    const bmi = height > 0 ? calcBMI(weight, height) : 0;
    const mealCals = calcMealCalories(calories);
    const weeks = calcWeeksToGoal(weight, profile.targetWeight || weight, profile.tempo, tdee, calories);

    return { bmr: Math.round(bmr), tdee: Math.round(tdee), calories: Math.round(calories), macros, water, bmi, mealCals, weeks };
}
