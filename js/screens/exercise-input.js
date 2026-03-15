// ========== Exercise Input Screen (Pencil: dpw2J) ==========
import { navigate } from '../router.js';
import { getTodayExercises, saveExercise, isAIDisclaimerAccepted, acceptAIDisclaimer, getProfile } from '../data-store.js';

export function renderExerciseInput(container) {
    const savedExercises = getTodayExercises();
    let exerciseItems = [...savedExercises];
    const hadSavedExercises = savedExercises.length > 0;

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

            <div style="padding:0 20px 12px;">
                <p style="font-size:14px; font-weight:600; color:var(--text-dark); margin-bottom:8px;">Šta si vežbao/la?</p>
                <textarea class="text-input" id="exerciseInput" placeholder="Trčanje 30 min, čučnjevi..." maxlength="500" rows="2"></textarea>
            </div>

            <div style="padding:0 20px 12px;">
                <button class="btn-analyze" id="analyzeBtn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    Analiziraj
                </button>
            </div>

            <div style="padding:0 20px 4px;">
                <p style="font-size:11px; color:var(--text-muted);">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" style="vertical-align:middle;"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                    Potrošnja kalorija je AI procena i može varirati.
                </p>
            </div>

            ${exerciseItems.length > 0 ? `
                <div style="padding:12px 20px 0;">
                    <p style="font-size:14px; font-weight:600; color:var(--text-dark);">Prepoznate aktivnosti (${exerciseItems.length})</p>
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
        screen.querySelector('#saveCheck')?.addEventListener('click', () => {
            saveExercise(exerciseItems);
            navigate('dashboard');
        });

        screen.querySelector('#analyzeBtn').addEventListener('click', handleAnalyze);
        screen.querySelector('#saveBtn')?.addEventListener('click', () => {
            saveExercise(exerciseItems);
            navigate('dashboard');
        });

        // Card expand/collapse & remove
        screen.querySelectorAll('.food-card-header').forEach(h => {
            h.addEventListener('click', () => h.closest('.food-card').classList.toggle('expanded'));
        });
        screen.querySelectorAll('.exercise-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.idx);
                exerciseItems.splice(idx, 1);
                render();
            });
        });
    }

    function showToast(msg) {
        let toast = screen.querySelector('.toast-msg');
        if (toast) toast.remove();
        toast = document.createElement('div');
        toast.className = 'toast-msg';
        toast.textContent = msg;
        toast.style.cssText = 'background:var(--red); color:white; padding:10px 16px; border-radius:var(--r-md); font-size:13px; text-align:center; margin:0 20px;';
        const btn = screen.querySelector('#analyzeBtn');
        btn.parentElement.after(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    async function handleAnalyze() {
        const input = screen.querySelector('#exerciseInput').value.trim();
        if (!input) return;

        const btn = screen.querySelector('#analyzeBtn');
        btn.disabled = true;
        btn.innerHTML = '<div class="spinner" style="width:20px; height:20px; border-width:2px;"></div> Analiziram...';

        try {
            const profile = getProfile();
            const resp = await fetch('/api/analyze-exercise', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: input,
                    weight: profile?.weight,
                    height: profile?.height,
                    gender: profile?.gender,
                    age: profile?.age
                })
            });
            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                throw new Error(err.error || 'API error');
            }
            const data = await resp.json();
            if (Array.isArray(data) && data.length > 0) {
                exerciseItems.push(...data);
            } else {
                showToast('Nisam prepoznao aktivnost. Pokušaj ponovo sa jasnijim opisom.');
            }
        } catch (err) {
            showToast('Greška pri analizi vežbe. Pokušaj ponovo.');
        }

        render();
    }

    if (!isAIDisclaimerAccepted()) {
        showAIDisclaimer(screen, () => {
            acceptAIDisclaimer();
            render();
        });
    } else {
        render();
    }

    container.appendChild(screen);
}

const EXERCISE_ICONS = {
    // Trčanje / running
    run: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="17" cy="4" r="2"/><path d="M15.59 13.51l-1.16-2.65a2.38 2.38 0 0 0-1.6-1.38l-2.21-.55a1.69 1.69 0 0 0-1.87.74L7 12.5"/><path d="m14 16.5-2.5-3.5L8 17l-3-1"/><path d="m17 14 2.78 5.14A1.3 1.3 0 0 1 18.64 21H17"/><path d="M8 17l-1.59 4.45A1.23 1.23 0 0 0 7.57 23h1.17"/></svg>',
    // Šetnja / walking
    walk: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="M13.5 8.5 15 12l-3 3 1.5 5.5"/><path d="M10.5 8.5 9 12l3 3-1.5 5.5"/></svg>',
    // Plivanje / swimming
    swim: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18c2-1 4 1 6 0s4-1 6 0 4 1 6 0"/><path d="M2 22c2-1 4 1 6 0s4-1 6 0 4 1 6 0"/><circle cx="9" cy="7" r="2"/><path d="m9 9 2 4 5-3"/></svg>',
    // Bicikl / cycling
    bike: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>',
    // Teretana / snaga / strength
    strength: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>',
    // Yoga / stretching
    yoga: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="M12 6v4"/><path d="m8 14 4-4 4 4"/><path d="M6 18h12"/><path d="M12 10v8"/></svg>',
    // Lopte / ball sports
    ball: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
    // Default
    default: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>'
};

function getExerciseIcon(name) {
    const n = (name || '').toLowerCase();
    if (/trč|sprint|jogging/.test(n)) return EXERCISE_ICONS.run;
    if (/šetn|hodanj/.test(n)) return EXERCISE_ICONS.walk;
    if (/plivan/.test(n)) return EXERCISE_ICONS.swim;
    if (/bicikl|bajk|cycling/.test(n)) return EXERCISE_ICONS.bike;
    if (/teretan|sklek|čučn|bench|deadlift|squat|zgib|bučic|press/.test(n)) return EXERCISE_ICONS.strength;
    if (/yoga|pilates|stretc|istezanj/.test(n)) return EXERCISE_ICONS.yoga;
    if (/fudbal|košark|odbojk|tenis|rukomet|ping|badminton/.test(n)) return EXERCISE_ICONS.ball;
    return EXERCISE_ICONS.default;
}

function renderExerciseCard(item, idx) {
    return `
        <div class="food-card">
            <div class="food-card-header">
                <span class="food-emoji" style="display:flex;">${getExerciseIcon(item.name)}</span>
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
            <div style="width:56px; height:56px; border-radius:50%; background:var(--primary-light); margin:0 auto 16px; display:flex; align-items:center; justify-content:center; font-size:28px;">🏋️</div>
            <h3 style="font-size:20px; font-weight:700; color:var(--text-dark);">Ozzy koristi AI</h3>
            <p style="font-size:13px; color:var(--text-light); margin-top:12px; line-height:1.6;">
                Potrošnja kalorija koju Ozzy prikazuje je generisana pomoću AI tehnologije.
                Vrednosti su približne i mogu odstupati od stvarnih.
            </p>
            <div style="background:var(--primary-light); border-radius:var(--r-3xl); padding:10px 16px; margin:16px 0; font-size:12px; color:var(--primary); display:flex; align-items:center; gap:6px;">
                <span>⚠️</span>
                <span>Ova aplikacija nije zamena za stručni medicinski ili nutricionistički savet.</span>
            </div>
            <button class="btn btn-primary" style="margin-top:8px;" id="acceptAI">Razumem, nastavi</button>
        </div>
    `;

    overlay.querySelector('#acceptAI').addEventListener('click', () => {
        overlay.remove();
        onAccept();
    });

    screen.appendChild(overlay);
}
