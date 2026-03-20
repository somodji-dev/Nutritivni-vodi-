// ========== Nutrition Calculator ==========

// Faktori aktivnosti prema nivou
export const ACTIVITY_FACTORS = {
    'Sedeći': 1.2,
    'Lagano aktivan/na': 1.375,
    'Umereno aktivan/na': 1.55,
    'Veoma aktivan/na': 1.725
};

// Deficit za mršavljenje (kcal/dan)
export const DEFICIT_MAP = {
    'Turbo': 750,
    'Stabilno': 500,
    'Opušteno': 250
};

// Suficit za nabacivanje mase — manji od deficita jer je lean bulk sporiji proces
export const SURPLUS_MAP = {
    'Turbo': 500,
    'Stabilno': 350,
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

// TDEE — BMR × faktor aktivnosti
export function calcTDEE(bmr, activityLevel) {
    const factor = ACTIVITY_FACTORS[activityLevel] || 1.2;
    return bmr * factor;
}

// Calorie goal
export function calcCalorieGoal(tdee, goal, tempo) {
    if (goal === 'Smršaj') return tdee - (DEFICIT_MAP[tempo] || 500);
    if (goal === 'Nabaci mišiće' || goal === 'Nabildaj se') return tdee + (SURPLUS_MAP[tempo] || 350);
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

// Weeks to goal — izračunato iz efektivnog deficita/suficita (1 kg ≈ 7700 kcal)
export function calcWeeksToGoal(currentWeight, targetWeight, tempo, tdee, calories) {
    const diff = Math.abs(currentWeight - targetWeight);
    if (diff === 0) return 0;
    // Efektivni deficit/suficit = razlika izmedju TDEE i kalorijskog cilja
    const effectiveDelta = Math.abs(tdee - calories);
    if (effectiveDelta === 0) return 0;
    // 7700 kcal = 1 kg, delta × 7 = nedeljni delta
    const weeksNeeded = (diff * 7700) / (effectiveDelta * 7);
    return Math.ceil(weeksNeeded);
}

// Calorie safety limits
const MIN_CALORIES = 1200;
const MAX_CALORIES_ABOVE_TDEE = 1000; // Max suficit iznad TDEE

// All results at once
export function calcAllResults(profile) {
    // Guard against zero/invalid values
    const weight = Math.max(profile.weight || 40, 20);
    const height = Math.max(profile.height || 160, 100);
    const age = Math.max(profile.age || 25, 10);

    const bmr = calcBMR(profile.gender, weight, height, age);
    const tdee = calcTDEE(bmr, profile.activityLevel);
    let calories = calcCalorieGoal(tdee, profile.goal, profile.tempo);

    // Safety limits: never below 1200, never more than 1000 above TDEE
    calories = Math.max(calories, MIN_CALORIES);
    calories = Math.min(calories, tdee + MAX_CALORIES_ABOVE_TDEE);

    const macros = calcMacros(calories, profile.dietType);
    const water = calcWater(weight);
    const bmi = height > 0 ? calcBMI(weight, height) : 0;
    const mealCals = calcMealCalories(calories);

    // Za "Ostani fit" — ciljna težina = sadašnja
    const targetWeight = profile.goal === 'Ostani fit' ? weight : (profile.targetWeight || weight);
    const weeks = calcWeeksToGoal(weight, targetWeight, profile.tempo, tdee, calories);

    return { bmr: Math.round(bmr), tdee: Math.round(tdee), calories: Math.round(calories), macros, water, bmi, mealCals, weeks };
}
