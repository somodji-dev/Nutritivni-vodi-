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
                max_tokens: 2048,
                system: `Ti si precizni fitnes kalkulator. ${userInfo}

REFERENTNE MET VREDNOSTI (OBAVEZNO koristi ove):
- Trčanje (lagano, 8km/h): 8.0 | Trčanje (brzo, 10km/h): 10.0
- Brza šetnja: 3.5 | Lagana šetnja: 2.5
- Bicikl (umeren): 6.8 | Plivanje (umeren): 7.0
- Čučnjevi/Mrtvo dizanje/Bench press (sa tegovima): 6.0
- Sklekovi/Zgibovi: 8.0
- Biceps/Triceps/Izolacione vežbe: 3.5
- Vojnički potisak/Ramena: 6.0
- Plank/Core: 3.8
- HIIT/Intervalni: 9.0
- Joga: 3.0 | Istezanje: 2.3
- Fudbal/Košarka: 8.0 | Tenis: 7.0

METOD KALKULACIJE (OBAVEZNO):
1. Ako korisnik navede UKUPNO trajanje (npr "sat vremena", "45 min") — rasporedi to vreme na sve vežbe tako da ZBIR bude TAČNO toliko. Uračunaj pauze između serija (~30% ukupnog vremena za trening snage, MET 1.5).
2. Ako korisnik navede trajanje za svaku vežbu — koristi ta trajanja direktno.
3. Formula: kcal = MET × ${userWeight}kg × trajanje(h)
4. PROVERA: Ukupne kalorije za sat vremena mešanog treninga (kardio+snaga) treba da budu 400-550 kcal za osobu od ${userWeight}kg. Ako dobiješ značajno više, smanji — proverio si MET ili trajanje.

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
            return new Response(JSON.stringify({ error: data.error.message || 'API greška' }), {
                status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        const content = data.content?.[0]?.text || '[]';
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('No JSON array found in response');
        const parsed = JSON.parse(jsonMatch[0]);

        return new Response(JSON.stringify(parsed), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Analiza nije uspela. Pokušaj ponovo.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}
