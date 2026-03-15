// Vercel Edge Function - Exercise analysis proxy
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

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API ključ nije podešen' }), {
            status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }

    const { text, weight, height, gender, age } = await req.json();
    if (!text) {
        return new Response(JSON.stringify({ error: 'No text provided' }), {
            status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }

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
            return new Response(JSON.stringify({ error: data.error.message || 'API greška' }), {
                status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        const content = data.content?.[0]?.text || '[]';
        const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        const parsed = JSON.parse(cleaned);

        return new Response(JSON.stringify(parsed), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Analiza nije uspela. Pokušaj ponovo.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}
