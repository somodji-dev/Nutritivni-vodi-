// ========== Exercise Database (100 exercises with MET values) ==========
// Source: Compendium of Physical Activities (Ainsworth et al.)
// MET = Metabolic Equivalent of Task

export const EXERCISES = [
    // === KARDIO (20) === (2024 Compendium of Physical Activities)
    { name: "Trčanje (lagano, 8km/h)", aliases: ["trčanje", "trcanje", "jogging", "džoging", "trčao", "trcao"], met: 8.5, emoji: "🏃", category: "cardio" },
    { name: "Trčanje (brzo, 10km/h)", aliases: ["sprint", "brzo trčanje", "trčanje brzo"], met: 9.3, emoji: "🏃", category: "cardio" },
    { name: "Trčanje (umeren tempo)", aliases: ["trčanje umeren", "trčanje srednje"], met: 9.0, emoji: "🏃", category: "cardio" },
    { name: "Trčanje na traci", aliases: ["traka", "tredmil", "treadmill", "trčanje traka"], met: 8.0, emoji: "🏃", category: "cardio" },
    { name: "Brza šetnja", aliases: ["brza šetnja", "brza setnja", "hodanje brzo", "power walk"], met: 4.8, emoji: "🚶", category: "cardio" },
    { name: "Šetnja (lagana)", aliases: ["šetnja", "setnja", "hodanje", "prošetao", "prosetao", "šetao", "setao"], met: 2.8, emoji: "🚶", category: "cardio" },
    { name: "Bicikl (umeren)", aliases: ["bicikl", "bicikla", "vožnja bicikla", "biciklizam", "bajk", "cycling"], met: 7.0, emoji: "🚴", category: "cardio" },
    { name: "Bicikl (intenzivan)", aliases: ["bicikl brzo", "bicikl intenzivan", "spinning"], met: 10.0, emoji: "🚴", category: "cardio" },
    { name: "Sobni bicikl", aliases: ["sobni bicikl", "stacionar bicikl", "ergometar"], met: 6.8, emoji: "🚴", category: "cardio" },
    { name: "Plivanje (umeren)", aliases: ["plivanje", "plivao", "bazen"], met: 5.8, emoji: "🏊", category: "cardio" },
    { name: "Plivanje (intenzivno)", aliases: ["plivanje brzo", "plivanje intenzivno"], met: 9.8, emoji: "🏊", category: "cardio" },
    { name: "Veslanje", aliases: ["veslanje", "kajak", "kanu", "rowing"], met: 7.0, emoji: "🚣", category: "cardio" },
    { name: "Veslanje na mašini", aliases: ["veslačka mašina", "rowing machine", "ergometar veslanje"], met: 7.0, emoji: "🚣", category: "cardio" },
    { name: "Preskakanje konopca", aliases: ["konopac", "vijača", "preskakanje", "skipping"], met: 11.5, emoji: "⏫", category: "cardio" },
    { name: "Stepenice (penjanje)", aliases: ["stepenice", "stepovi", "penjanje stepenice", "step"], met: 8.8, emoji: "🪜", category: "cardio" },
    { name: "Eliptični trenažer", aliases: ["eliptik", "eliptični", "crosstrainer", "eliptical"], met: 5.0, emoji: "🏋️", category: "cardio" },
    { name: "Aerobik", aliases: ["aerobik", "aerobic", "aerobics"], met: 7.3, emoji: "💃", category: "cardio" },
    { name: "Zumba", aliases: ["zumba"], met: 7.3, emoji: "💃", category: "cardio" },
    { name: "Ples", aliases: ["ples", "plesanje", "dancing", "plesao"], met: 5.0, emoji: "💃", category: "cardio" },
    { name: "Nordijsko hodanje", aliases: ["nordijsko hodanje", "nordic walking", "hodanje sa štapovima"], met: 4.8, emoji: "🚶", category: "cardio" },

    // === TRENING SNAGE (25) ===
    { name: "Čučnjevi (sa tegovima)", aliases: ["čučnjevi", "cucnjevi", "squat", "čučanj", "cucanj", "čučnjevi sa šipkom", "čučnjevi sa tegovima"], met: 6.0, emoji: "🦵", category: "strength" },
    { name: "Čučnjevi (bez tegova)", aliases: ["čučnjevi bez tegova", "air squat", "čučnjevi slobodni"], met: 5.0, emoji: "🦵", category: "strength" },
    { name: "Bench press", aliases: ["bench press", "bench", "bench pres", "potisak sa klupe", "legao na klupu dizao tegove"], met: 6.0, emoji: "🏋️", category: "strength" },
    { name: "Mrtvo dizanje", aliases: ["mrtvo dizanje", "deadlift", "dizanje sa poda", "dizao sa poda šipku"], met: 6.0, emoji: "🏋️", category: "strength" },
    { name: "Sklekovi", aliases: ["sklekovi", "push up", "pushup", "push-up", "sklekove", "radio sklekove"], met: 8.0, emoji: "💪", category: "strength" },
    { name: "Zgibovi", aliases: ["zgibovi", "pull up", "pullup", "pull-up", "vukao se na šipki", "vučenje na šipki"], met: 8.0, emoji: "💪", category: "strength" },
    { name: "Vojnički potisak", aliases: ["vojnički potisak", "overhead press", "military press", "ramena", "dizao iznad glave", "press iznad glave", "šulter"], met: 6.0, emoji: "🏋️", category: "strength" },
    { name: "Biceps pregib", aliases: ["biceps", "biceps pregib", "bicep curl", "savijao ruke", "savijanje ruku sa bučicama", "bučice biceps"], met: 3.5, emoji: "💪", category: "strength" },
    { name: "Triceps ekstenzija", aliases: ["triceps", "triceps ekstenzija", "tricep extension", "opružao ruke", "opružanje ruku iza glave"], met: 3.5, emoji: "💪", category: "strength" },
    { name: "Veslanje sa bučicama", aliases: ["veslanje bučice", "row", "bent over row", "veslanje šipka"], met: 6.0, emoji: "🏋️", category: "strength" },
    { name: "Lat pulldown", aliases: ["lat pulldown", "lat", "povlačenje na mašini"], met: 6.0, emoji: "🏋️", category: "strength" },
    { name: "Leg press", aliases: ["leg press", "potisak nogama", "noge mašina"], met: 6.0, emoji: "🦵", category: "strength" },
    { name: "Iskorak (lunges)", aliases: ["iskorak", "iskoraci", "lunges", "lunge"], met: 5.0, emoji: "🦵", category: "strength" },
    { name: "Dizanje na prste", aliases: ["dizanje na prste", "calf raise", "listovi"], met: 3.0, emoji: "🦵", category: "strength" },
    { name: "Plank", aliases: ["plank", "daska", "držao dasku", "drži dasku"], met: 3.8, emoji: "💪", category: "strength" },
    { name: "Trbušnjaci", aliases: ["trbušnjaci", "trbusnjaci", "sit up", "situp", "crunches", "abs"], met: 3.8, emoji: "💪", category: "strength" },
    { name: "Podizanje nogu (ležeći)", aliases: ["podizanje nogu", "leg raise", "noge podizanje"], met: 3.8, emoji: "💪", category: "strength" },
    { name: "Bočni plank", aliases: ["bočni plank", "side plank", "bocni plank"], met: 3.8, emoji: "💪", category: "strength" },
    { name: "Šipka (teretana opšte)", aliases: ["teretana", "tegovi", "šipka", "dizanje tegova", "weight training"], met: 6.0, emoji: "🏋️", category: "strength" },
    { name: "Mašine (teretana)", aliases: ["mašine", "masine", "mašina teretana", "cable"], met: 5.0, emoji: "🏋️", category: "strength" },
    { name: "Kettlebell swing", aliases: ["kettlebell", "ketlbel", "girja", "swing"], met: 6.0, emoji: "🏋️", category: "strength" },
    { name: "Farmer walk", aliases: ["farmer walk", "nošenje tegova", "nosenje"], met: 6.0, emoji: "🏋️", category: "strength" },
    { name: "Hip thrust", aliases: ["hip thrust", "podizanje kukova", "glute bridge", "gluteus"], met: 5.0, emoji: "🦵", category: "strength" },
    { name: "Face pull", aliases: ["face pull", "povlačenje ka licu"], met: 3.5, emoji: "🏋️", category: "strength" },
    { name: "Shrug (trapez)", aliases: ["shrug", "trapez", "sleganje ramenima"], met: 3.5, emoji: "🏋️", category: "strength" },

    // === HIIT (10) ===
    { name: "HIIT trening", aliases: ["hiit", "intervalni", "intervalni trening", "high intensity"], met: 9.0, emoji: "⚡", category: "hiit" },
    { name: "Tabata", aliases: ["tabata"], met: 9.0, emoji: "⚡", category: "hiit" },
    { name: "Burpees", aliases: ["burpees", "burpee", "burpije"], met: 9.0, emoji: "⚡", category: "hiit" },
    { name: "Box jump", aliases: ["box jump", "skok na kutiju", "box"], met: 8.0, emoji: "⚡", category: "hiit" },
    { name: "Mountain climbers", aliases: ["mountain climbers", "penjači", "penjanje"], met: 8.0, emoji: "⚡", category: "hiit" },
    { name: "Jumping jacks", aliases: ["jumping jacks", "jumping jack", "skakanje"], met: 7.0, emoji: "⚡", category: "hiit" },
    { name: "Sprint intervali", aliases: ["sprint", "sprinting", "sprint intervali"], met: 11.0, emoji: "⚡", category: "hiit" },
    { name: "Battle ropes", aliases: ["battle ropes", "konopci", "rope training"], met: 9.0, emoji: "⚡", category: "hiit" },
    { name: "Sled push/pull", aliases: ["sled push", "sled pull", "guranje sanki"], met: 8.0, emoji: "⚡", category: "hiit" },
    { name: "CrossFit WOD", aliases: ["crossfit", "wod", "krosfit"], met: 9.0, emoji: "⚡", category: "hiit" },

    // === TIMSKI SPORT (15) === (2024 Compendium)
    { name: "Fudbal (rekreativno)", aliases: ["fudbal", "football", "soccer", "mali fudbal"], met: 7.0, emoji: "⚽", category: "cardio" },
    { name: "Fudbal (takmičarski)", aliases: ["fudbal takmicarski", "fudbal utakmica"], met: 9.5, emoji: "⚽", category: "cardio" },
    { name: "Košarka (igra)", aliases: ["košarka", "kosarka", "basketball", "basket"], met: 8.0, emoji: "🏀", category: "cardio" },
    { name: "Odbojka", aliases: ["odbojka", "volleyball", "voley"], met: 4.0, emoji: "🏐", category: "cardio" },
    { name: "Odbojka na pesku", aliases: ["odbojka pesak", "beach volleyball", "plaza odbojka"], met: 8.0, emoji: "🏐", category: "cardio" },
    { name: "Tenis (singl)", aliases: ["tenis", "tennis", "tenis singl", "singl"], met: 8.0, emoji: "🎾", category: "cardio" },
    { name: "Tenis (dubl)", aliases: ["tenis dubl", "tenis dublovi", "doubles", "dubl tenis"], met: 6.0, emoji: "🎾", category: "cardio" },
    { name: "Stoni tenis", aliases: ["stoni tenis", "ping pong", "pingpong"], met: 4.0, emoji: "🏓", category: "cardio" },
    { name: "Badminton (rekreativno)", aliases: ["badminton"], met: 5.5, emoji: "🏸", category: "cardio" },
    { name: "Rukomet", aliases: ["rukomet", "handball"], met: 8.0, emoji: "🤾", category: "cardio" },
    { name: "Vaterpolo", aliases: ["vaterpolo", "water polo"], met: 10.0, emoji: "🤽", category: "cardio" },
    { name: "Ragbi", aliases: ["ragbi", "rugby"], met: 8.5, emoji: "🏈", category: "cardio" },
    { name: "Hokej (na ledu)", aliases: ["hokej", "hockey"], met: 8.0, emoji: "🏒", category: "cardio" },
    { name: "Skvoš", aliases: ["skvoš", "squash"], met: 7.5, emoji: "🎾", category: "cardio" },
    { name: "Padel", aliases: ["padel", "paddle"], met: 6.5, emoji: "🎾", category: "cardio" },
    { name: "Kriket", aliases: ["kriket", "cricket"], met: 5.0, emoji: "🏏", category: "cardio" },
    { name: "Golf", aliases: ["golf", "golf hodanje"], met: 4.3, emoji: "⛳", category: "light" },

    // === BORILAČKI (10) === (2024 Compendium)
    { name: "Boks (ring)", aliases: ["boks", "boxing", "boksovanje"], met: 12.3, emoji: "🥊", category: "hiit" },
    { name: "Boks (džak)", aliases: ["boks džak", "dzak", "vreća za udaranje", "punching bag"], met: 5.8, emoji: "🥊", category: "strength" },
    { name: "Boks (sparing)", aliases: ["boks sparing", "sparring"], met: 7.8, emoji: "🥊", category: "hiit" },
    { name: "Kikboks", aliases: ["kikboks", "kickboxing", "kick box"], met: 7.3, emoji: "🥊", category: "hiit" },
    { name: "MMA", aliases: ["mma", "mixed martial arts", "mešovite borilačke"], met: 10.3, emoji: "🥋", category: "hiit" },
    { name: "Džudo", aliases: ["džudo", "judo", "dzudo"], met: 11.3, emoji: "🥋", category: "hiit" },
    { name: "Karate", aliases: ["karate"], met: 10.3, emoji: "🥋", category: "hiit" },
    { name: "Tekvondo", aliases: ["tekvondo", "taekwondo"], met: 10.3, emoji: "🥋", category: "hiit" },
    { name: "Brazilski džiu-džicu", aliases: ["bjj", "džiu džicu", "jiu jitsu", "brazilian"], met: 10.3, emoji: "🥋", category: "hiit" },
    { name: "Rvanje", aliases: ["rvanje", "wrestling"], met: 10.3, emoji: "🤼", category: "hiit" },
    { name: "Sambo", aliases: ["sambo"], met: 10.3, emoji: "🥋", category: "hiit" },

    // === FLEKSIBILNOST (10) ===
    { name: "Joga", aliases: ["joga", "yoga"], met: 3.0, emoji: "🧘", category: "light" },
    { name: "Joga (power/vinyasa)", aliases: ["power yoga", "vinyasa", "ashtanga"], met: 4.0, emoji: "🧘", category: "light" },
    { name: "Pilates", aliases: ["pilates"], met: 3.0, emoji: "🧘", category: "light" },
    { name: "Istezanje", aliases: ["istezanje", "stretching", "istegnuo se", "istegao se", "strečing", "istezao"], met: 2.3, emoji: "🧘", category: "light" },
    { name: "Tai Chi", aliases: ["tai chi", "tai či", "tajči"], met: 3.0, emoji: "🧘", category: "light" },
    { name: "Foam rolling", aliases: ["foam roller", "foam rolling", "masažni valjak", "valjak"], met: 2.0, emoji: "🧘", category: "light" },
    { name: "Meditacija (sa pokretom)", aliases: ["meditacija", "qi gong", "ći gong"], met: 2.0, emoji: "🧘", category: "light" },
    { name: "Barre", aliases: ["barre", "balet fitness"], met: 3.5, emoji: "🩰", category: "light" },
    { name: "Mobilnost i zagrevanje", aliases: ["zagrevanje", "warmup", "warm up", "mobilnost"], met: 2.3, emoji: "🧘", category: "light" },
    { name: "Hlađenje posle treninga", aliases: ["hlađenje", "cool down", "cooldown", "hladjenje"], met: 2.0, emoji: "🧘", category: "light" },

    // === SVAKODNEVNE (10) ===
    { name: "Čišćenje kuće", aliases: ["čišćenje", "ciscenje", "usisavanje", "brisanje", "ribanje"], met: 3.5, emoji: "🏠", category: "light" },
    { name: "Baštovanstvo", aliases: ["baštovanstvo", "bastovanstvo", "kopanje", "bašta", "basta", "vrt"], met: 4.0, emoji: "🌱", category: "light" },
    { name: "Penjanje uz stepenice", aliases: ["stepenice gore", "penjanje stepenice svakodnevno"], met: 4.0, emoji: "🪜", category: "light" },
    { name: "Nošenje namirnica", aliases: ["nošenje", "nosenje", "nošenje kesa"], met: 3.0, emoji: "🛒", category: "light" },
    { name: "Igranje sa decom", aliases: ["igranje sa decom", "igra deca", "igranje"], met: 4.0, emoji: "👶", category: "light" },
    { name: "Selidba/Nošenje nameštaja", aliases: ["selidba", "nameštaj", "nošenje tereta"], met: 6.0, emoji: "📦", category: "strength" },
    { name: "Kuvanje", aliases: ["kuvanje", "spremanje hrane"], met: 2.0, emoji: "🍳", category: "light" },
    { name: "Peglanje", aliases: ["peglanje"], met: 2.3, emoji: "👕", category: "light" },
    { name: "Pranje automobila", aliases: ["pranje auta", "pranje kola", "auto pranje"], met: 3.5, emoji: "🚗", category: "light" },
    { name: "Šetanje psa", aliases: ["šetanje psa", "pas šetnja", "šetao psa"], met: 3.0, emoji: "🐕", category: "light" }
];

// ========== Search Function ==========
// Strips diacritics for flexible matching: č→c, ć→c, š→s, ž→z, đ→dj
function normalize(str) {
    return str.toLowerCase()
        .replace(/č|ć/g, 'c')
        .replace(/š/g, 's')
        .replace(/ž/g, 'z')
        .replace(/đ/g, 'dj')
        .trim();
}

export function searchExercises(query) {
    if (!query || query.length < 2) return [];
    const q = normalize(query);

    const scored = EXERCISES.map(ex => {
        const normName = normalize(ex.name);
        const normAliases = ex.aliases.map(normalize);

        let score = 0;

        // Exact alias match → highest
        if (normAliases.includes(q)) score = 100;
        // Name starts with query
        else if (normName.startsWith(q)) score = 80;
        // Alias starts with query
        else if (normAliases.some(a => a.startsWith(q))) score = 70;
        // Name contains query
        else if (normName.includes(q)) score = 50;
        // Any alias contains query
        else if (normAliases.some(a => a.includes(q))) score = 40;
        // Query words all found in name+aliases
        else {
            const words = q.split(/\s+/);
            const allText = normName + ' ' + normAliases.join(' ');
            if (words.every(w => allText.includes(w))) score = 30;
        }

        return { exercise: ex, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

    return scored.map(r => r.exercise);
}
