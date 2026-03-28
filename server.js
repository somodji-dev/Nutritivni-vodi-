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
                system: `Ti si nutritivni asistent. Korisnik unosi hranu na srpskom jeziku.
Vrati JSON niz sa prepoznatim namirnicama. Svaka namirnica ima:
- name: string (srpski naziv)
- quantity: string (količina, npr "2 komada", "200ml", "1 porcija")
- emoji: string (1 emoji za tu hranu)
- kcal: number (kalorije za tu količinu)
- protein: number (grami proteina)
- carbs: number (grami ugljenih hidrata)
- fat: number (grami masti)

Pravila:
- Ako korisnik ne navede količinu, pretpostavi jednu standardnu porciju
- Kalorije i makrosi moraju biti realni za navedenu količinu
- Prepoznaj srpska jela (ćevapi, pljeskavica, gibanica, prebranac, itd.)
- Vrati SAMO validan JSON niz, bez dodatnog teksta ili markdown-a.`,
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

        // Strip markdown code fences if present
        const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        const parsed = JSON.parse(cleaned);
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
                max_tokens: 1024,
                system: `Ti si fitnes asistent. Korisnik unosi fizičku aktivnost na srpskom jeziku.
${userInfo}
Vrati JSON niz sa prepoznatim aktivnostima. Svaka aktivnost ima:
- name: string (srpski naziv)
- duration: string (trajanje, npr "30 min", "1 sat")
- emoji: string (1 emoji za tu aktivnost)
- kcalBurned: number (procenjene potrošene kalorije prilagođene težini i polu korisnika)
- calculationNote: string (kratka formula, npr "MET 7.0 × ${userWeight}kg × 0.5h")
- category: string (jedna od: "strength", "hiit", "cardio", "light")
  - "strength" = trening snage (tegovi, sklekovi, čučnjevi, bench press, mrtvo dizanje)
  - "hiit" = visok intenzitet (HIIT, sprinting, tabata, intervalni trening)
  - "cardio" = izdržljivost (trčanje, bicikl, plivanje, veslanje, hodanje brzo)
  - "light" = lagana aktivnost (šetnja, joga, istezanje, pilates)

Pravila:
- Koristi MET vrednosti za kalkulaciju: kcal = MET × težina(kg) × trajanje(h)
- Ako korisnik ne navede trajanje, pretpostavi 30 minuta
- Kalorije moraju biti realne za navedeno trajanje, intenzitet i podatke korisnika
- Prepoznaj aktivnosti na srpskom (trčanje, šetnja, teretana, plivanje, bicikl, vožnja bicikla, čučnjevi, sklekovi, yoga, fudbal, košarka, itd.)
- Vrati SAMO validan JSON niz, bez dodatnog teksta ili markdown-a.`,
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

        const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        const parsed = JSON.parse(cleaned);
        res.json(parsed);
    } catch (err) {
        console.error('Exercise analysis error:', err.message);
        res.status(500).json({ error: 'Analysis failed' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ozzy server running at http://localhost:${PORT}`);
});
