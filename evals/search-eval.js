// ========== Eval: Food Search Quality ==========
// Testira koliko dobro fuzzy search pronalazi namirnice
// Pokreni: node evals/search-eval.js

const fs = require('fs');
const path = require('path');

// Load env
const env = {};
fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8').split('\n').forEach(l => {
    const [k, ...v] = l.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
});

// Test cases: [query, expected match name (or part of it)]
const SEARCH_TESTS = [
    // Tačni nazivi
    ['piletina', 'Piletina'],
    ['jogurt', 'Jogurt'],
    ['banana', 'Banana'],
    ['hleb', 'Hleb'],
    ['ćevapi', 'Ćevapi'],
    ['burek', 'Burek'],
    ['sarma', 'Sarma'],
    ['kajmak', 'Kajmak'],

    // Greške u kucanju
    ['jogrt', 'Jogurt'],
    ['piletna', 'Piletina'],
    ['bananna', 'Banana'],
    ['cokolada', 'Čokolada'],
    ['cevapi', 'Ćevapi'],
    ['pljeskavca', 'Pljeskavica'],
    ['paradajz', 'Paradajz'],

    // Parcijalna pretraga
    ['pile', 'Piletina'],
    ['sir', 'Sir'],
    ['krompir', 'Krompir'],
    ['jabuk', 'Jabuka'],
    ['ovsene', 'Ovsene'],

    // Srpska jela sa greškama
    ['gibanica', 'Gibanica'],
    ['prebranac', 'Pasulj'],
    ['musaka', 'Musaka'],
    ['raznjici', 'Ražnjići'],
    ['snicla', 'Karađorđeva'],
    ['kajgana', 'Kajgana'],
    ['proja', 'Proja'],
];

async function searchFoods(query) {
    const resp = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/search_foods`, {
        method: 'POST',
        headers: {
            'apikey': env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ search_query: query })
    });
    return await resp.json();
}

async function runEvals() {
    console.log('🧪 FOOD SEARCH EVAL');
    console.log('='.repeat(60));
    console.log('');

    let pass = 0;
    let fail = 0;
    const failures = [];

    for (const [query, expected] of SEARCH_TESTS) {
        const results = await searchFoods(query);
        const names = results.map(r => r.name);
        const found = names.some(n => n.toLowerCase().includes(expected.toLowerCase()));

        if (found) {
            pass++;
            console.log(`  ✅ "${query}" → ${names[0]}`);
        } else {
            fail++;
            console.log(`  ❌ "${query}" → očekivano "${expected}", dobio: ${names.join(', ') || 'PRAZNO'}`);
            failures.push({ query, expected, got: names });
        }
    }

    console.log('');
    console.log('='.repeat(60));
    console.log(`📊 REZULTAT: ${pass}/${pass + fail} (${Math.round(pass / (pass + fail) * 100)}%)`);
    console.log(`  ✅ Prošlo: ${pass}`);
    console.log(`  ❌ Palo: ${fail}`);

    if (failures.length > 0) {
        console.log('');
        console.log('❌ NEUSPELI TESTOVI:');
        failures.forEach(f => {
            console.log(`  "${f.query}" → očekivano "${f.expected}", dobio: ${f.got.join(', ') || 'ništa'}`);
        });
    }

    console.log('');
}

runEvals();
