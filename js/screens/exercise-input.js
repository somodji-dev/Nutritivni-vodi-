// ========== Exercise Input Screen — Autocomplete + AI fallback ==========
import { navigate } from '../router.js';
import { getTodayExercises, saveExercise, isAIDisclaimerAccepted, acceptAIDisclaimer, getProfile } from '../data-store.js';
import { searchExercises } from '../exercise-database.js';

// Supabase exercise search (for crowdsourced exercises not in local DB)
let dbSearchTimer = null;
let dbAbort = null;
function searchExercisesDB(query, callback) {
    if (dbAbort) dbAbort.abort();
    if (dbSearchTimer) clearTimeout(dbSearchTimer);
    dbSearchTimer = setTimeout(async () => {
        dbAbort = new AbortController();
        try {
            const resp = await fetch(`/api/exercise-search?q=${encodeURIComponent(query)}`, { signal: dbAbort.signal });
            if (!resp.ok) { callback([]); return; }
            const data = await resp.json();
            callback(Array.isArray(data) ? data : []);
        } catch (e) {
            if (e.name !== 'AbortError') callback([]);
        }
    }, 300);
}

async function addExerciseToDB(exercise) {
    try {
        await fetch('/api/exercise-add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(exercise)
        });
    } catch (e) { /* silent */ }
}

const EXERCISE_ICONS = {
    run: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="17" cy="4" r="2"/><path d="M15.59 13.51l-1.16-2.65a2.38 2.38 0 0 0-1.6-1.38l-2.21-.55a1.69 1.69 0 0 0-1.87.74L7 12.5"/><path d="m14 16.5-2.5-3.5L8 17l-3-1"/><path d="m17 14 2.78 5.14A1.3 1.3 0 0 1 18.64 21H17"/><path d="M8 17l-1.59 4.45A1.23 1.23 0 0 0 7.57 23h1.17"/></svg>',
    walk: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="M13.5 8.5 15 12l-3 3 1.5 5.5"/><path d="M10.5 8.5 9 12l3 3-1.5 5.5"/></svg>',
    swim: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18c2-1 4 1 6 0s4-1 6 0 4 1 6 0"/><path d="M2 22c2-1 4 1 6 0s4-1 6 0 4 1 6 0"/><circle cx="9" cy="7" r="2"/><path d="m9 9 2 4 5-3"/></svg>',
    bike: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>',
    strength: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>',
    yoga: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="M12 6v4"/><path d="m8 14 4-4 4 4"/><path d="M6 18h12"/><path d="M12 10v8"/></svg>',
    ball: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
    hiit: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    default: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>'
};

function getExerciseIcon(name, category) {
    if (category === 'hiit') return EXERCISE_ICONS.hiit;
    const n = (name || '').toLowerCase();
    if (/trč|sprint|jogging/.test(n)) return EXERCISE_ICONS.run;
    if (/šetn|hodanj/.test(n)) return EXERCISE_ICONS.walk;
    if (/plivan/.test(n)) return EXERCISE_ICONS.swim;
    if (/bicikl|bajk|cycling|spinning/.test(n)) return EXERCISE_ICONS.bike;
    if (/teretan|sklek|čučn|bench|deadlift|squat|zgib|bučic|press|mrtvo|kettl/.test(n)) return EXERCISE_ICONS.strength;
    if (/yoga|joga|pilates|stretc|istezanj|tai chi/.test(n)) return EXERCISE_ICONS.yoga;
    if (/fudbal|košark|odbojk|tenis|rukomet|ping|badminton|padel/.test(n)) return EXERCISE_ICONS.ball;
    if (/hiit|tabata|burp|crossfit/.test(n)) return EXERCISE_ICONS.hiit;
    return EXERCISE_ICONS.default;
}

export function renderExerciseInput(container) {
    const savedExercises = getTodayExercises();
    let exerciseItems = [...savedExercises];
    const hadSavedExercises = savedExercises.length > 0;
    const profile = getProfile();
    const userWeight = profile?.weight || 75;

    const screen = document.createElement('div');
    screen.className = 'screen';

    function totalKcal() { return exerciseItems.reduce((s, i) => s + (i.kcalBurned || 0), 0); }

    function render() {
        screen.innerHTML = `
            <div class="input-header">
                <button class="nav-back" id="backBtn">
                    <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <span style="font-size:17px; font-weight:700;">Vežba</span>
                <button id="saveCheck" style="background:none; border:none; cursor:pointer;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                </button>
            </div>

            <div class="cal-bar" style="background:var(--primary-light);">
                <span>Potrošene kalorije</span>
                <span>${totalKcal()} kcal</span>
            </div>

            <div style="padding:0 0 4px;">
                <p style="font-size:14px; font-weight:600; color:var(--text-dark); margin-bottom:8px; padding:0 20px;">Šta si vežbao/la?</p>
                <div class="autocomplete-wrapper">
                    <input type="text" class="autocomplete-input" id="exerciseInput" placeholder="Pretraži vežbu..." autocomplete="off" />
                    <div class="autocomplete-dropdown" id="dropdown" style="display:none;"></div>
                </div>
            </div>

            <div style="padding:4px 20px 4px;">
                <p style="font-size:11px; color:var(--text-muted);">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" style="vertical-align:middle;"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                    Pretraži bazu vežbi ili koristi AI za specifične treninge.
                </p>
            </div>

            ${exerciseItems.length > 0 ? `
                <div style="padding:12px 20px 0;">
                    <p style="font-size:14px; font-weight:600; color:var(--text-dark);">Izabrane aktivnosti (${exerciseItems.length})</p>
                </div>
                <div id="exerciseList" style="padding:8px 20px; display:flex; flex-direction:column; gap:8px;">
                    ${exerciseItems.map((item, i) => renderExerciseCard(item, i)).join('')}
                </div>
            ` : '<div style="flex:1;"></div>'}

            ${(exerciseItems.length > 0 || hadSavedExercises) ? `
                <div class="bottom-bar">
                    <div>
                        <span style="font-size:12px; color:var(--text-light);">Ukupno potrošeno</span>
                        <p style="font-family:var(--font-numbers); font-size:20px; font-weight:900; color:var(--text-dark);">${totalKcal()} kcal</p>
                    </div>
                    <button class="btn btn-primary" style="width:auto; padding:0 24px; height:44px; font-size:15px;" id="saveBtn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>
                        Sačuvaj
                    </button>
                </div>
            ` : ''}
        `;

        // Event listeners
        screen.querySelector('#backBtn').addEventListener('click', () => navigate('dashboard'));
        screen.querySelector('#saveCheck')?.addEventListener('click', () => { saveExercise(exerciseItems); navigate('dashboard'); });
        screen.querySelector('#saveBtn')?.addEventListener('click', () => { saveExercise(exerciseItems); navigate('dashboard'); });

        // Autocomplete
        const input = screen.querySelector('#exerciseInput');
        const dropdown = screen.querySelector('#dropdown');

        input.addEventListener('input', () => {
            const q = input.value.trim();
            if (q.length < 2) { dropdown.style.display = 'none'; return; }

            // 1. Search local DB first (instant)
            const localResults = searchExercises(q);

            function renderDropdown(allResults) {
                if (allResults.length === 0) {
                    dropdown.innerHTML = `
                        <div class="autocomplete-empty">Nije pronađeno u bazi</div>
                        <div class="autocomplete-ai-btn" id="aiFallbackBtn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                            Analiziraj "${q}" sa AI
                        </div>
                    `;
                    dropdown.style.display = 'block';
                    dropdown.querySelector('#aiFallbackBtn')?.addEventListener('click', () => {
                        dropdown.style.display = 'none';
                        handleAIAnalyze(q);
                    });
                    return;
                }

                dropdown.innerHTML = allResults.map((ex, i) => `
                    <div class="autocomplete-item" data-idx="${i}">
                        <span style="display:flex;">${getExerciseIcon(ex.name, ex.category)}</span>
                        <div class="autocomplete-item-name">
                            <span>${ex.name}</span>
                            <small>MET ${ex.met} · ${ex.category}</small>
                        </div>
                    </div>
                `).join('') + `
                    <div class="autocomplete-ai-btn" id="aiFallbackBtn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        Ne nalazim — AI analiza
                    </div>
                `;
                dropdown.style.display = 'block';

                dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const ex = allResults[parseInt(item.dataset.idx)];
                        dropdown.style.display = 'none';
                        input.value = '';
                        showDurationPicker(ex);
                    });
                });

                dropdown.querySelector('#aiFallbackBtn')?.addEventListener('click', () => {
                    dropdown.style.display = 'none';
                    handleAIAnalyze(input.value.trim());
                });
            }

            // Show local results immediately
            renderDropdown(localResults);

            // 2. Also search Supabase (async, merges with local)
            if (localResults.length < 5) {
                searchExercisesDB(q, (dbResults) => {
                    const localNames = new Set(localResults.map(r => r.name.toLowerCase()));
                    const merged = [...localResults];
                    dbResults.forEach(r => {
                        if (!localNames.has(r.name.toLowerCase())) merged.push(r);
                    });
                    if (merged.length > localResults.length) renderDropdown(merged.slice(0, 7));
                });
            }
        });

        screen.addEventListener('click', (e) => {
            if (!e.target.closest('.autocomplete-wrapper')) dropdown.style.display = 'none';
        });

        // Card expand/collapse & remove
        screen.querySelectorAll('.food-card-header').forEach(h => {
            h.addEventListener('click', () => h.closest('.food-card').classList.toggle('expanded'));
        });
        screen.querySelectorAll('.exercise-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                exerciseItems.splice(parseInt(btn.dataset.idx), 1);
                render();
            });
        });
    }

    // ===== Duration Picker =====
    function showDurationPicker(exercise) {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';

        let selectedMin = 30;

        function calcKcal(min) { return Math.round(exercise.met * userWeight * (min / 60)); }

        function updatePreview() {
            const kcal = calcKcal(selectedMin);
            const preview = overlay.querySelector('#durationPreview');
            if (preview) {
                preview.innerHTML = `
                    <span class="np-kcal">${kcal} kcal</span>
                    <span style="font-size:12px; color:var(--text-light);">MET ${exercise.met} × ${userWeight}kg × ${(selectedMin/60).toFixed(2)}h</span>
                `;
            }
            overlay.querySelectorAll('.picker-option').forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.min) === selectedMin);
            });
        }

        overlay.innerHTML = `
            <div class="bottom-sheet" style="padding:24px; max-width:375px; left:50%; transform:translateX(-50%);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <h3 style="font-size:17px; font-weight:700;">Koliko dugo?</h3>
                    <button id="closeDuration" style="background:none; border:none; font-size:20px; cursor:pointer; color:var(--text-light);">✕</button>
                </div>

                <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
                    <span style="display:flex;">${getExerciseIcon(exercise.name, exercise.category)}</span>
                    <div>
                        <p style="font-size:15px; font-weight:700; color:var(--text-dark);">${exercise.name}</p>
                        <p style="font-size:12px; color:var(--text-light);">MET ${exercise.met} · ${exercise.category}</p>
                    </div>
                </div>

                <div class="picker-grid">
                    ${[10, 15, 20, 30, 45, 60].map(m => `
                        <button class="picker-option${m === 30 ? ' active' : ''}" data-min="${m}">${m} min</button>
                    `).join('')}
                </div>

                <div class="picker-custom">
                    <label>Ili unesi trajanje:</label>
                    <input type="number" id="customMin" value="30" min="1" max="300" />
                    <label>min</label>
                </div>

                <div class="nutrition-preview" id="durationPreview" style="flex-direction:column; align-items:center; gap:4px;"></div>

                <button class="btn btn-primary" style="width:100%; margin-top:8px;" id="addExerciseBtn">Dodaj</button>
            </div>
        `;

        overlay.querySelectorAll('.picker-option').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedMin = parseInt(btn.dataset.min);
                overlay.querySelector('#customMin').value = selectedMin;
                updatePreview();
            });
        });

        overlay.querySelector('#customMin').addEventListener('input', (e) => {
            const v = parseInt(e.target.value);
            if (v > 0 && v <= 300) { selectedMin = v; updatePreview(); }
        });

        overlay.querySelector('#addExerciseBtn').addEventListener('click', () => {
            const kcal = calcKcal(selectedMin);
            exerciseItems.push({
                name: exercise.name,
                duration: selectedMin + ' min',
                emoji: exercise.emoji,
                kcalBurned: kcal,
                calculationNote: `MET ${exercise.met} × ${userWeight}kg × ${(selectedMin/60).toFixed(2)}h`,
                category: exercise.category
            });
            overlay.remove();
            render();
        });

        overlay.querySelector('#closeDuration').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

        screen.appendChild(overlay);
        updatePreview();
    }

    // ===== AI Fallback =====
    function showToast(msg) {
        let toast = screen.querySelector('.toast-msg');
        if (toast) toast.remove();
        toast = document.createElement('div');
        toast.className = 'toast-msg';
        toast.textContent = msg;
        toast.style.cssText = 'background:var(--red); color:white; padding:10px 16px; border-radius:var(--r-md); font-size:13px; text-align:center; margin:0 20px;';
        screen.querySelector('.autocomplete-wrapper')?.after(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    async function handleAIAnalyze(text) {
        if (!text) return;

        const input = screen.querySelector('#exerciseInput');
        if (input) { input.disabled = true; input.value = ''; input.placeholder = '🔍 AI analizira...'; }

        const thinkingMsgs = ['🔍 Prepoznajem...', '📊 Tražim MET...', '🧮 Računam...', '✅ Završavam...'];
        let msgIdx = 0;
        const thinkingInterval = setInterval(() => {
            msgIdx = Math.min(msgIdx + 1, thinkingMsgs.length - 1);
            if (input) input.placeholder = thinkingMsgs[msgIdx];
        }, 1500);

        try {
            const resp = await fetch('/api/analyze-exercise', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text, weight: profile?.weight, height: profile?.height,
                    gender: profile?.gender, age: profile?.age
                })
            });
            if (!resp.ok) throw new Error('API error');
            const data = await resp.json();
            const filtered = Array.isArray(data) ? data.filter(d => d.name !== '_summary') : [];
            if (filtered.length > 0) {
                exerciseItems.push(...filtered);
                // Save each to Supabase in background
                filtered.forEach(ex => {
                    if (ex.name && ex.category) {
                        // Extract MET from calculationNote if available
                        const metMatch = ex.calculationNote?.match(/MET\s+([\d.]+)/);
                        const met = metMatch ? parseFloat(metMatch[1]) : 5.0;
                        addExerciseToDB({ name: ex.name, met, category: ex.category, emoji: ex.emoji });
                    }
                });
            } else {
                showToast('Nisam prepoznao. Pokušaj drugačiji opis.');
            }
        } catch (err) {
            showToast('Greška pri AI analizi. Pokušaj ponovo.');
        }

        clearInterval(thinkingInterval);
        render();
    }

    // Show disclaimer on first use
    if (!isAIDisclaimerAccepted()) {
        showAIDisclaimer(screen, () => { acceptAIDisclaimer(); render(); });
    } else {
        render();
    }

    container.appendChild(screen);
}

function renderExerciseCard(item, idx) {
    return `
        <div class="food-card">
            <div class="food-card-header">
                <span class="food-emoji" style="display:flex;">${getExerciseIcon(item.name, item.category)}</span>
                <span class="food-name">${item.name}${item.duration ? ' (' + item.duration + ')' : ''}</span>
                <span class="food-kcal">${item.kcalBurned} kcal</span>
                <button class="exercise-remove" data-idx="${idx}" style="background:none; border:none; cursor:pointer; color:var(--text-muted); font-size:16px; padding:4px;">✕</button>
            </div>
            ${item.calculationNote ? `
            <div class="food-card-details" style="flex-wrap:wrap;">
                <span style="font-family:var(--font-numbers); font-size:12px; color:var(--text-light);">${item.calculationNote} = ${item.kcalBurned} kcal</span>
            </div>
            ` : ''}
        </div>
    `;
}

function showAIDisclaimer(screen, onAccept) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `
        <div class="center-modal" style="text-align:center;">
            <div style="width:56px; height:56px; border-radius:50%; background:var(--primary-light); margin:0 auto 16px; display:flex; align-items:center; justify-content:center;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>
            </div>
            <h3 style="font-size:20px; font-weight:700; color:var(--text-dark);">Ozzy koristi AI</h3>
            <p style="font-size:13px; color:var(--text-light); margin-top:12px; line-height:1.6;">
                Potrošnja kalorija koju Ozzy prikazuje je procena na osnovu MET vrednosti.
                Vrednosti su približne i mogu odstupati od stvarnih.
            </p>
            <div style="background:var(--bg-light); border-radius:var(--r-md); padding:12px 16px; margin:16px 0; text-align:left;">
                <p style="font-size:13px; font-weight:600; color:var(--text-dark); margin-bottom:6px;">💡 Kako koristiti?</p>
                <p style="font-size:12px; color:var(--text-light); line-height:1.5;">Pretraži vežbu po imenu → izaberi trajanje → gotovo!</p>
                <p style="font-size:12px; color:var(--text-muted); font-style:italic; margin-top:6px;">Za složene treninge koristi AI analizu.</p>
            </div>
            <button class="btn btn-primary" style="margin-top:0;" id="acceptAI">Razumem, nastavi</button>
        </div>
    `;
    overlay.querySelector('#acceptAI').addEventListener('click', () => { overlay.remove(); onAccept(); });
    screen.appendChild(overlay);
}
