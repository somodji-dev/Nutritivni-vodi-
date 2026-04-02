const fs = require('fs');
const express = require('express');
const path = require('path');

// Load .env manually (no dotenv dependency needed)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
        const [key, ...val] = line.split('=');
        if (key && val.length) process.env[key.trim()] = val.join('=').trim();
    });
}

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname), {
    extensions: ['html'],
    setHeaders(res, filePath) {
        if (filePath.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript');
    }
}));

// API: Analyze food using Claude Haiku 4.5
app.post('/api/analyze-food', async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });

    try {
        const resp = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 1024,
                system: `Ti si precizni nutritivni kalkulator. Korisnik unosi hranu na srpskom jeziku.

METOD KALKULACIJE (OBAVEZNO):
Za svaku namirnicu MORAŠ da izračunaš ovako:
1. Odredi nutritivne vrednosti PER 100g za tu namirnicu
2. Pomnoži sa tačnom količinom koju je korisnik uneo
3. Formula: vrednost = (vrednost_per_100g × količina_u_gramima) / 100

PRIMER: Ako korisnik kaže "50g feta sira":
- Feta per 100g: 264 kcal, 14.2g protein, 4.1g UH, 21.3g masti
- Za 50g: kcal=132, protein=7.1, carbs=2.1, fat=10.7
NIKADA ne vraćaj vrednosti za 100g kada korisnik traži 50g!

KONVERZIJE KOLIČINA:
- "1 parče hleba" = ~30g, "1 kriška" = ~25g
- "1 jaje" = ~60g (veličina L)
- "1 kašika" = ~15g, "1 kašičica" = ~5g
- "1 šolja" = ~240ml
- "1 porcija" mesa/ribe = ~150g
- "1 porcija testenine/pirinča (kuvano)" = ~200g

Vrati JSON niz. Svaka namirnica ima:
- name: string (srpski naziv)
- quantity: string (TAČNA količina koju je korisnik uneo, npr "50g", "2 komada")
- emoji: string (1 emoji)
- kcal: number (PRERAČUNATO za tačnu količinu, zaokruženo na ceo broj)
- protein: number (grami, zaokruženo na 1 decimalu)
- carbs: number (grami, zaokruženo na 1 decimalu)
- fat: number (grami, zaokruženo na 1 decimalu)

Pravila:
- Ako korisnik navede gramažu (npr "100g", "50g", "200g") — MORAŠ preračunati proporciju
- Ako korisnik NE navede količinu — pretpostavi 1 standardnu porciju i navedi koliko grama je to
- PROVERA: kcal ≈ protein×4 + carbs×4 + fat×9 (dozvoljeno odstupanje ±10%)
- Prepoznaj srpska jela (ćevapi, pljeskavica, gibanica, prebranac, burek, sarma, itd.)
- OBAVEZNO SRPSKI jezik: hleb (ne kruh), mleko (ne mlijeko), pavlaka (ne vrhnje), paradajz (ne rajčica), supa (ne juha), sos (ne umak), testenina (ne tjestenina), puter (ne maslac), pirinač (ne riža)
- Vrati SAMO validan JSON niz, bez teksta ili markdown-a.`,
                messages: [{ role: 'user', content: text }]
            })
        });

        const data = await resp.json();
        if (data.error) {
            console.error('Anthropic API error:', JSON.stringify(data.error));
            return res.status(500).json({ error: data.error.message || 'API error' });
        }
        const content = data.content?.[0]?.text || '[]';
        console.log('Haiku raw response:', content);

        // Extract only the JSON array
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('No JSON array found in response');
        const parsed = JSON.parse(jsonMatch[0]);
        res.json(parsed);
    } catch (err) {
        console.error('Food analysis error:', err.message);
        res.status(500).json({ error: 'Analysis failed' });
    }
});

// API: Analyze exercise using Claude Haiku 4.5
app.post('/api/analyze-exercise', async (req, res) => {
    const { text, weight, height, gender, age } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });

    const userWeight = weight || 75;
    const genderStr = gender === 'Muško' ? 'muški' : gender === 'Žensko' ? 'ženski' : 'nepoznat';
    const userInfo = `Korisnik: ${genderStr}, ${age || 30} godina, ${userWeight}kg, ${height || 175}cm.`;

    try {
        const resp = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 2048,
                system: `Ti si precizni fitnes kalkulator. ${userInfo}

REFERENTNE MET VREDNOSTI iz 2024 Compendium (OBAVEZNO koristi ove):
- Trčanje (lagano, 8km/h): 8.5 | Trčanje (brzo, 10km/h): 9.3 | Jogging: 7.5
- Brza šetnja (6km/h): 4.8 | Lagana šetnja: 2.8
- Bicikl (umeren): 7.0 | Bicikl (intenzivan): 10.0
- Plivanje (umeren): 5.8 | Plivanje (intenzivno): 9.8
- Čučnjevi/Mrtvo dizanje/Bench press (sa tegovima): 6.0
- Sklekovi/Zgibovi: 8.0
- Biceps/Triceps/Izolacione vežbe: 3.5
- Vojnički potisak/Ramena: 6.0
- Plank/Core/Trbušnjaci: 3.8
- HIIT/Intervalni/Tabata: 9.0
- Joga: 3.0 | Istezanje: 2.3
- Fudbal (rekreativno): 7.0 | Fudbal (takmičarski): 9.5
- Košarka: 8.0 | Odbojka: 4.0 | Odbojka na pesku: 8.0
- Tenis singl: 8.0 | Tenis dubl: 6.0 | Badminton: 5.5
- Boks (ring): 12.3 | Boks (sparing): 7.8 | Boks (džak): 5.8
- Borilačke veštine (džudo/karate/MMA): 10.3 | Kikboks: 7.3
- Preskakanje konopca: 11.5 | Stepenice: 8.8

METOD KALKULACIJE (OBAVEZNO):
1. Ako korisnik navede UKUPNO trajanje (npr "sat vremena", "45 min") — rasporedi to vreme na sve vežbe tako da ZBIR bude TAČNO toliko. Uračunaj pauze između serija (~30% ukupnog vremena za trening snage, MET 1.5).
2. Ako korisnik navede trajanje za svaku vežbu — koristi ta trajanja direktno.
3. Formula: kcal = MET × ${userWeight}kg × trajanje(h)
4. PROVERA: Ukupne kalorije za sat vremena mešanog treninga (kardio+snaga) treba da budu 400-550 kcal za osobu od ${userWeight}kg. Ako dobiješ značajno više, smanji — proverio si MET ili trajanje.

VAŽNO:
- Vrati SAMO vežbe koje je korisnik eksplicitno naveo. NE dodaj zagrevanje, istezanje, hlađenje ili recovery osim ako korisnik to nije tražio.
- Ako korisnik kaže "tenis dublovi 1h" — vrati SAMO tenis dublovi, ne dodaj zagrevanje i hlađenje.
- Ako korisnik navede ceo trening sa pripremom — tek onda uključi sve delove.

RAZMISLI PRE ODGOVORA:
- Koliko je ukupno vreme? Rasporedi ga realno.
- Da li su MET vrednosti iz tabele iznad?
- Da li zbir trajanja odgovara navedenom ukupnom vremenu?
- Da li ukupne kalorije imaju smisla za tu osobu i to trajanje?

Vrati JSON niz. Svaka aktivnost ima:
- name: string (srpski naziv)
- duration: string (trajanje, npr "5 min")
- emoji: string (1 emoji)
- kcalBurned: number (zaokruženo na ceo broj)
- calculationNote: string (formula, npr "MET 6.0 × ${userWeight}kg × 0.133h")
- category: string ("strength" | "hiit" | "cardio" | "light")

Na kraju JSON niza dodaj JEDNU specijalnu stavku sa ukupnim pregledom:
{ "name": "_summary", "duration": "UKUPNO VREME", "emoji": "📊", "kcalBurned": UKUPNO_KCAL, "calculationNote": "Prosečan MET X.X za ceo trening", "category": "light" }

Vrati SAMO validan JSON niz.`,
                messages: [{ role: 'user', content: text }]
            })
        });

        const data = await resp.json();
        if (data.error) {
            console.error('Anthropic API error:', JSON.stringify(data.error));
            return res.status(500).json({ error: data.error.message || 'API error' });
        }
        const content = data.content?.[0]?.text || '[]';
        console.log('Exercise Haiku raw response:', content);

        // Extract only the JSON array — strip markdown, trailing text, etc.
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('No JSON array found in response');
        const parsed = JSON.parse(jsonMatch[0]);
        res.json(parsed);
    } catch (err) {
        console.error('Exercise analysis error:', err.message);
        res.status(500).json({ error: 'Analysis failed' });
    }
});

// ========== Food Database API (Supabase proxy for local dev) ==========
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Search foods
app.get('/api/food-search', async (req, res) => {
    const query = req.query.q;
    if (!query || query.length < 2) return res.json([]);
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return res.status(500).json({ error: 'Supabase not configured' });

    try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/search_foods`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ search_query: query })
        });
        const data = await resp.json();
        res.json(data);
    } catch (err) {
        console.error('Food search error:', err.message);
        res.json([]);
    }
});

// Add food to database
app.post('/api/food-add', async (req, res) => {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return res.status(500).json({ error: 'Supabase not configured' });

    const food = req.body;
    if (!food.name || !food.kcal_per100g) return res.status(400).json({ error: 'Missing fields' });

    const tokens = food.tokens || food.name.toLowerCase()
        .replace(/[().,\-\/]/g, ' ').split(/\s+/).filter(t => t.length >= 2)
        .map(t => t.replace(/č|ć/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z').replace(/đ/g, 'dj'));

    try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/foods`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                name: food.name, tokens, category: food.category || null,
                preparation: food.preparation || null, type: food.type || 'ingredient',
                emoji: food.emoji || null, kcal_per100g: food.kcal_per100g,
                protein_per100g: food.protein_per100g || 0, carbs_per100g: food.carbs_per100g || 0,
                fat_per100g: food.fat_per100g || 0, portions: food.portions || [],
                tier: food.tier || 'ai_generated', approximate: food.approximate || false
            })
        });
        const result = await resp.json();
        res.json(result);
    } catch (err) {
        console.error('Food add error:', err.message);
        res.status(500).json({ error: 'Add failed' });
    }
});

// Increment usage count
app.post('/api/food-use', async (req, res) => {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return res.status(500).json({ error: 'Supabase not configured' });

    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing id' });

    try {
        const getResp = await fetch(`${SUPABASE_URL}/rest/v1/foods?id=eq.${id}&select=usage_count`, {
            headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` }
        });
        const data = await getResp.json();
        const current = data?.[0]?.usage_count || 0;

        await fetch(`${SUPABASE_URL}/rest/v1/foods?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usage_count: current + 1 })
        });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
});

// Search exercises in Supabase
app.get('/api/exercise-search', async (req, res) => {
    const query = req.query.q;
    if (!query || query.length < 2) return res.json([]);
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return res.json([]);

    try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/search_exercises_db`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ search_query: query })
        });
        const data = await resp.json();
        res.json(Array.isArray(data) ? data : []);
    } catch (err) {
        res.json([]);
    }
});

// Add exercise to Supabase
app.post('/api/exercise-add', async (req, res) => {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return res.status(500).json({ error: 'Supabase not configured' });

    const exercise = req.body;
    if (!exercise.name || !exercise.met || !exercise.category) return res.status(400).json({ error: 'Missing fields' });

    const tokens = exercise.name.toLowerCase()
        .replace(/[().,\-\/]/g, ' ').split(/\s+/).filter(t => t.length >= 2)
        .map(t => t.replace(/č|ć/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z').replace(/đ/g, 'dj'));

    try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/exercises`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json', 'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                name: exercise.name, tokens, category: exercise.category,
                met: exercise.met, emoji: exercise.emoji || null, tier: 'ai_generated'
            })
        });
        const result = await resp.json();
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Add failed' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ozzy server running at http://localhost:${PORT}`);
});
