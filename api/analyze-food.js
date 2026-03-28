// Vercel Edge Function - Food analysis proxy
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

    const { text } = await req.json();
    if (!text) {
        return new Response(JSON.stringify({ error: 'No text provided' }), {
            status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }

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
