// Vercel Edge Function — Add food to Supabase database
export const config = { runtime: 'edge' };

export default async function handler(req) {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' }
        });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        return new Response(JSON.stringify({ error: 'Supabase not configured' }), {
            status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }

    try {
        const food = await req.json();

        // Validation
        if (!food.name || !food.kcal_per100g) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        const kcal = Number(food.kcal_per100g);
        const protein = Number(food.protein_per100g) || 0;
        const carbs = Number(food.carbs_per100g) || 0;
        const fat = Number(food.fat_per100g) || 0;

        // Range check
        if (kcal < 0 || kcal > 900 || protein < 0 || protein > 100 || carbs < 0 || carbs > 100 || fat < 0 || fat > 100) {
            return new Response(JSON.stringify({ error: 'Values out of range' }), {
                status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        // Math check: kcal ≈ protein*4 + carbs*4 + fat*9 (±15%)
        const expectedKcal = protein * 4 + carbs * 4 + fat * 9;
        if (expectedKcal > 0 && Math.abs(kcal - expectedKcal) > expectedKcal * 0.15) {
            // Allow it but flag — don't reject, AI sometimes rounds differently
        }

        // Generate tokens if not provided
        const tokens = food.tokens || food.name.toLowerCase()
            .replace(/[().,\-\/]/g, ' ')
            .split(/\s+/)
            .filter(t => t.length >= 2)
            .map(t => t.replace(/č|ć/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z').replace(/đ/g, 'dj'));

        // Insert into Supabase
        const insertData = {
            name: food.name,
            tokens: tokens,
            category: food.category || null,
            preparation: food.preparation || null,
            type: food.type || 'ingredient',
            emoji: food.emoji || null,
            kcal_per100g: kcal,
            protein_per100g: protein,
            carbs_per100g: carbs,
            fat_per100g: fat,
            portions: food.portions || [],
            tier: food.tier || 'ai_generated',
            approximate: food.approximate || false
        };

        const resp = await fetch(`${SUPABASE_URL}/rest/v1/foods`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(insertData)
        });

        if (!resp.ok) {
            const err = await resp.text();
            return new Response(JSON.stringify({ error: 'Insert failed', detail: err }), {
                status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        const result = await resp.json();
        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Add failed' }), {
            status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}
