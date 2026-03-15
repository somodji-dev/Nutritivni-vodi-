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

    const { text } = await req.json();
    if (!text) {
        return new Response(JSON.stringify({ error: 'No text provided' }), { status: 400 });
    }

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1024,
            system: `Ti si nutritivni asistent. Korisnik unosi hranu na srpskom jeziku.
Vrati JSON niz sa prepoznatim namirnicama. Svaka namirnica ima:
- name: string (srpski)
- quantity: string (količina, npr "2 komada", "200ml")
- emoji: string (1 emoji za tu hranu)
- kcal: number (kalorije)
- protein: number (grami proteina)
- carbs: number (grami ugljenih hidrata)
- fat: number (grami masti)

Vrati SAMO validan JSON niz, bez dodatnog teksta.`,
            messages: [{ role: 'user', content: text }]
        })
    });

    const data = await resp.json();
    const content = data.content?.[0]?.text || '[]';

    try {
        const parsed = JSON.parse(content);
        return new Response(JSON.stringify(parsed), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    } catch {
        return new Response(JSON.stringify([]), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}
