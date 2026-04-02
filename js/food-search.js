// ========== Food Search Module (Supabase) ==========

let abortController = null;
let debounceTimer = null;

// Search foods in Supabase database
export function searchFoods(query, callback) {
    // Cancel previous request
    if (abortController) abortController.abort();
    if (debounceTimer) clearTimeout(debounceTimer);

    if (!query || query.length < 2) {
        callback([]);
        return;
    }

    debounceTimer = setTimeout(async () => {
        abortController = new AbortController();
        try {
            const resp = await fetch(`/api/food-search?q=${encodeURIComponent(query)}`, {
                signal: abortController.signal
            });
            if (!resp.ok) { callback([]); return; }
            const data = await resp.json();
            callback(Array.isArray(data) ? data : []);
        } catch (e) {
            if (e.name !== 'AbortError') callback([]);
        }
    }, 300);
}

// Add food to Supabase database (fire-and-forget after AI analysis)
export async function addFoodToDB(foodData) {
    try {
        await fetch('/api/food-add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(foodData)
        });
    } catch (e) {
        // Silent fail — DB add is best-effort
    }
}

// Increment usage count (fire-and-forget)
export function incrementUsage(foodId) {
    if (!foodId) return;
    fetch('/api/food-use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: foodId })
    }).catch(() => {});
}

// Calculate nutrition for a given food and gram amount (pure math, no API)
export function calculateNutrition(food, grams) {
    const g = grams || 100;
    return {
        kcal: Math.round(food.kcal_per100g * g / 100),
        protein: Math.round(food.protein_per100g * g / 100 * 10) / 10,
        carbs: Math.round(food.carbs_per100g * g / 100 * 10) / 10,
        fat: Math.round(food.fat_per100g * g / 100 * 10) / 10
    };
}

// Generate search tokens from a food name
export function generateTokens(name) {
    if (!name) return [];
    return name.toLowerCase()
        .replace(/[().,\-\/]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length >= 2)
        .map(t => t.replace(/č|ć/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z').replace(/đ/g, 'dj'));
}

// Parse grams from quantity string (e.g. "150g" → 150, "2 komada" → null)
export function parseGramsFromQuantity(quantity) {
    if (!quantity) return null;
    const match = quantity.match(/(\d+(?:\.\d+)?)\s*g/i);
    return match ? parseFloat(match[1]) : null;
}
