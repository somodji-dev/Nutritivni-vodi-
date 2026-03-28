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
- OBAVEZNO koristi SRPSKI jezik, NIKADA hrvatski! Primeri: hleb (ne kruh), mleko (ne mlijeko), jaje (ne jaje), pavlaka (ne vrhnje), paradajz (ne rajčica), supa (ne juha), sos (ne umak), testenina (ne tjestenina), paprika (ne paprika), puter (ne maslac), pirinač (ne riža)
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
