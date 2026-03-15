// ========== Dashboard Screen (Pencil: 9oPY4) ==========
import { navigate } from '../router.js';
import { getProfile, getResults, getDailyTotals, getTodayMeals, getTodayWater, setTodayWater, getDailyExerciseCalories, getTodayExercises } from '../data-store.js';
import { calcBMI, getBMICategory, calcMealCalories, calcWater, MACRO_SPLITS } from '../calculator.js';

// SVG Icons matching Pencil design
const SVG = {
    user: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    fire: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    heart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    waterDrop: '<svg width="24" height="28" viewBox="0 0 24 28" fill="none" stroke="var(--blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
    waterDropFilled: '<svg width="24" height="28" viewBox="0 0 24 28" fill="var(--blue)" stroke="var(--blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
    // Exercise icons
    exerciseRun: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="17" cy="4" r="2"/><path d="M15.59 13.51l-1.16-2.65a2.38 2.38 0 0 0-1.6-1.38l-2.21-.55a1.69 1.69 0 0 0-1.87.74L7 12.5"/><path d="m14 16.5-2.5-3.5L8 17l-3-1"/><path d="m17 14 2.78 5.14A1.3 1.3 0 0 1 18.64 21H17"/><path d="M8 17l-1.59 4.45A1.23 1.23 0 0 0 7.57 23h1.17"/></svg>',
    exerciseWalk: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="M13.5 8.5 15 12l-3 3 1.5 5.5"/><path d="M10.5 8.5 9 12l3 3-1.5 5.5"/></svg>',
    exerciseSwim: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18c2-1 4 1 6 0s4-1 6 0 4 1 6 0"/><path d="M2 22c2-1 4 1 6 0s4-1 6 0 4 1 6 0"/><circle cx="9" cy="7" r="2"/><path d="m9 9 2 4 5-3"/></svg>',
    exerciseBike: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>',
    exerciseStrength: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>',
    exerciseYoga: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="M12 6v4"/><path d="m8 14 4-4 4 4"/><path d="M6 18h12"/><path d="M12 10v8"/></svg>',
    exerciseBall: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
    exerciseDefault: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>',
    exerciseHeader: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>',
    // Meal icons
    sun: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    cloudSun: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6z"/></svg>',
    moon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    cookie: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/></svg>',
    check: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    chevronRight: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
    plus: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>'
};

function getExerciseIcon(name) {
    const n = (name || '').toLowerCase();
    if (/trč|sprint|jogging/.test(n)) return SVG.exerciseRun;
    if (/šetn|hodanj/.test(n)) return SVG.exerciseWalk;
    if (/plivan/.test(n)) return SVG.exerciseSwim;
    if (/bicikl|bajk|cycling/.test(n)) return SVG.exerciseBike;
    if (/teretan|sklek|čučn|bench|deadlift|squat|zgib|bučic|press/.test(n)) return SVG.exerciseStrength;
    if (/yoga|pilates|stretc|istezanj/.test(n)) return SVG.exerciseYoga;
    if (/fudbal|košark|odbojk|tenis|rukomet|ping|badminton/.test(n)) return SVG.exerciseBall;
    return SVG.exerciseDefault;
}

export function renderDashboard(container) {
    const profile = getProfile();
    const results = getResults();
    if (!profile || !results) { navigate('landing'); return; }

    const totals = getDailyTotals();
    const meals = getTodayMeals();
    const mealCals = results.mealCals;
    let water = getTodayWater();
    const waterTarget = results.water;
    const bmi = results.bmi;
    const bmiCat = getBMICategory(bmi);
    const exerciseCals = getDailyExerciseCalories();
    const exercises = getTodayExercises();

    const adjustedGoal = results.calories + exerciseCals;
    const remaining = Math.max(0, adjustedGoal - totals.kcal);
    const calPercent = Math.min(100, (totals.kcal / adjustedGoal) * 100);

    const screen = document.createElement('div');
    screen.className = 'screen';

    function renderScreen() {
        water = getTodayWater();

        screen.innerHTML = `
            <!-- Header -->
            <div class="dash-header">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h1 class="dash-greeting">${profile.name ? `Zdravo, ${profile.name}!` : 'Zdravo!'}</h1>
                        <p class="dash-sub">Evo tvog nutritivnog vodica</p>
                    </div>
                    <button id="profileBtn" style="background:none; border:none; cursor:pointer; padding:4px; display:flex; flex-direction:column; align-items:center; gap:2px;">
                        ${SVG.user}
                        <span style="font-size:10px; color:var(--text-light);">Moj profil</span>
                    </button>
                </div>
            </div>

            <!-- Calorie Card (light bg, fire icon, progress bar) -->
            <div class="cal-card-v2" id="calCard">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <p style="font-size:12px; font-weight:500; color:var(--text-light);">Dnevne kalorije</p>
                        <p style="font-family:var(--font-numbers); font-size:38px; font-weight:900; color:var(--text-dark); line-height:1.1; margin-top:4px;">${remaining.toLocaleString()}</p>
                        <p style="font-size:12px; color:var(--text-light); margin-top:2px;">/ ${adjustedGoal.toLocaleString()} kcal preostalo${exerciseCals > 0 ? ' <span style="color:var(--green);">(+' + exerciseCals + ' vežba)</span>' : ''}</p>
                    </div>
                    <div style="width:40px; height:40px; border-radius:50%; background:var(--primary-light); display:flex; align-items:center; justify-content:center;">
                        ${SVG.fire}
                    </div>
                </div>
                <div style="margin-top:12px; height:6px; background:var(--bg-divider); border-radius:3px; overflow:hidden;">
                    <div style="height:100%; width:${calPercent}%; background:linear-gradient(90deg, var(--blue), var(--green)); border-radius:3px; transition:width 0.5s ease;"></div>
                </div>
            </div>

            <!-- Macro Row -->
            <div class="macro-row" id="macroRow">
                ${renderMacroCard('Proteini', totals.protein, results.macros.protein, 'var(--primary)')}
                ${renderMacroCard('Ugljeni', totals.carbs, results.macros.carbs, 'var(--blue)')}
                ${renderMacroCard('Masti', totals.fat, results.macros.fat, 'var(--green)')}
            </div>

            <!-- BMI Card (warm bg, heart icon) -->
            <div class="bmi-card-v2" id="bmiCard">
                <div style="flex:1;">
                    <span style="font-size:12px; color:var(--text-light);">Tvoj BMI</span>
                    <div style="display:flex; align-items:baseline; gap:6px; margin-top:2px;">
                        <span style="font-family:var(--font-numbers); font-size:24px; font-weight:900; color:var(--text-dark);">${Math.round(bmi * 10) / 10}</span>
                        <span style="font-size:12px; color:${bmiCat.color}; font-weight:600;">${bmiCat.label}</span>
                    </div>
                </div>
                <div style="width:40px; height:40px; border-radius:50%; background:var(--primary); display:flex; align-items:center; justify-content:center;">
                    ${SVG.heart}
                </div>
            </div>

            <!-- Exercise Card -->
            <div class="exercise-card" id="exerciseCard">
                <div style="display:flex; align-items:center; justify-content:space-between;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="display:flex;">${SVG.exerciseHeader}</span>
                        <span style="font-size:13px; font-weight:600; color:var(--text-dark);">Današnja vežba</span>
                    </div>
                    <span style="font-family:var(--font-numbers); font-size:14px; font-weight:700; color:var(--primary);">${exerciseCals} kcal</span>
                </div>
                <div style="display:flex; align-items:center; justify-content:space-between; margin-top:8px;">
                    <span style="font-size:12px; color:var(--text-light); display:flex; align-items:center; gap:6px; flex-wrap:wrap;">${exercises.length > 0 ? exercises.map(e => '<span style="display:inline-flex; align-items:center; gap:3px;">' + getExerciseIcon(e.name) + ' ' + e.name + (e.duration ? ' ' + e.duration : '') + '</span>').join('') : 'Dodaj vežbu'}</span>
                    <div style="width:28px; height:28px; border-radius:50%; background:var(--primary); display:flex; align-items:center; justify-content:center; cursor:pointer;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                    </div>
                </div>
            </div>

            <!-- Meals -->
            <div class="meal-section">
                <h3>Današnji obroci</h3>
                ${renderMealCardV2('dorucak', 'Doručak', SVG.sun, mealCals.dorucak, meals.dorucak)}
                ${renderMealCardV2('rucak', 'Ručak', SVG.cloudSun, mealCals.rucak, meals.rucak)}
                ${renderMealCardV2('vecera', 'Večera', SVG.moon, mealCals.vecera, meals.vecera)}
                ${renderMealCardV2('uzina', 'Užina', SVG.cookie, mealCals.uzina, meals.uzina)}
            </div>

            <!-- Water Tracker (8 clickable drops) -->
            <div class="water-tracker">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:18px;">💧</span>
                        <span style="font-size:13px; font-weight:600; color:var(--text-dark);">Dnevni unos vode</span>
                    </div>
                    <span style="font-family:var(--font-numbers); font-size:14px; font-weight:700; color:var(--blue);">${water}/8 čaša · ${waterTarget}L</span>
                </div>
                <div class="water-drops" style="display:flex; gap:8px; justify-content:center;">
                    ${Array.from({length: 8}, (_, i) => `
                        <button class="water-drop-btn" data-idx="${i}" style="background:none; border:none; cursor:pointer; padding:2px; opacity:${i < water ? 1 : 0.3}; transition:opacity 0.2s;">
                            ${i < water ? SVG.waterDropFilled : SVG.waterDrop}
                        </button>
                    `).join('')}
                </div>
            </div>

            <!-- Footer -->
            <div class="dash-footer">
                Powered by Ozzy NutriFon<br>
                <span style="color:var(--primary);">#dnevnydozzy</span>
            </div>
        `;

        // Event listeners
        screen.querySelector('#profileBtn').addEventListener('click', () => {
            navigate('profile');
        });

        screen.querySelector('#calCard').addEventListener('click', () => showCaloriesPopup(screen, profile, results, exerciseCals));
        screen.querySelector('#exerciseCard').addEventListener('click', () => navigate('exercise'));
        screen.querySelector('#macroRow').addEventListener('click', () => showMacrosPopup(screen, profile, results));

        screen.querySelectorAll('.meal-card').forEach(card => {
            card.addEventListener('click', () => {
                navigate('meal', { type: card.dataset.type });
            });
        });

        // Water drop click handlers
        screen.querySelectorAll('.water-drop-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.idx);
                // If clicking on an already-filled drop at the current water level, decrease
                if (idx + 1 === water) {
                    setTodayWater(idx);
                } else {
                    setTodayWater(idx + 1);
                }
                renderScreen();
            });
        });
    }

    renderScreen();
    container.appendChild(screen);
}

function renderMacroCard(label, consumed, target, color) {
    const pct = Math.min(100, (consumed / target) * 100);
    return `
        <div class="macro-card">
            <span class="macro-label">${label}</span>
            <span class="macro-value">${consumed} / ${target}g</span>
            <div class="macro-bar"><div class="macro-bar-fill" style="width:${pct}%; background:${color};"></div></div>
        </div>
    `;
}

function renderMealCardV2(type, name, icon, targetCal, items) {
    const logged = items && items.length > 0;
    const consumed = logged ? items.reduce((s, i) => s + (i.kcal || 0), 0) : 0;
    return `
        <div class="meal-card ${logged ? 'logged' : ''}" data-type="${type}">
            <span class="meal-icon">${icon}</span>
            <div class="meal-info">
                <span class="meal-name">${name}</span>
                <span class="meal-cal">${logged ? consumed + ' / ' + targetCal + ' kcal' : '0 / ' + targetCal + ' kcal'}</span>
            </div>
            ${logged ? SVG.check : SVG.chevronRight}
        </div>
    `;
}

function showCaloriesPopup(screen, profile, results, exerciseCals = 0) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `
        <div class="bottom-sheet">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="font-size:17px; font-weight:700;">Kako smo izračunali kalorije?</h3>
                <button id="closePopup" style="background:none; border:none; font-size:20px; cursor:pointer; color:var(--text-light);">✕</button>
            </div>

            <div class="formula-step">
                <div style="display:flex; align-items:center;">
                    <span class="step-num" style="background:var(--primary);">1</span>
                    <span class="step-title">Bazalni metabolizam (BMR)</span>
                </div>
                <p class="step-formula">10 × težina + 6.25 × visina - 5 × godine ${profile.gender === 'Muško' ? '+ 5' : '- 161'}</p>
                <p class="step-calc">10 × ${profile.weight}kg + 6.25 × ${profile.height}cm - 5 × ${profile.age} ${profile.gender === 'Muško' ? '+ 5' : '- 161'}</p>
                <p class="step-result" style="color:var(--primary);">= ${results.bmr} kcal</p>
            </div>

            <div class="formula-step">
                <div style="display:flex; align-items:center;">
                    <span class="step-num" style="background:var(--blue);">2</span>
                    <span class="step-title">Dnevna potrošnja (TDEE)</span>
                </div>
                <p class="step-formula">BMR × faktor aktivnosti (${profile.activityLevel || 'Umereno aktivan/na'} = ${({'Sedeći':1.2,'Lagano aktivan/na':1.375,'Umereno aktivan/na':1.55,'Veoma aktivan/na':1.725})[profile.activityLevel] || 1.55})</p>
                <p class="step-calc">${results.bmr} × ${({'Sedeći':1.2,'Lagano aktivan/na':1.375,'Umereno aktivan/na':1.55,'Veoma aktivan/na':1.725})[profile.activityLevel] || 1.55}</p>
                <p class="step-result" style="color:var(--blue);">= ${results.tdee} kcal</p>
            </div>

            <div class="formula-step">
                <div style="display:flex; align-items:center;">
                    <span class="step-num" style="background:var(--green);">3</span>
                    <span class="step-title">Tvoj kalorijski cilj</span>
                </div>
                <p class="step-formula">TDEE - deficit (cilj: ${profile.goal}, tempo: ${profile.tempo})</p>
                <p class="step-calc">${results.tdee} - ${results.tdee - results.calories} (${profile.tempo.toLowerCase()})</p>
                <p class="step-result" style="color:var(--green);">= ${results.calories} kcal dnevno</p>
            </div>

            ${exerciseCals > 0 ? `
            <div class="formula-step">
                <div style="display:flex; align-items:center;">
                    <span class="step-num" style="background:var(--primary);">4</span>
                    <span class="step-title">Vežba danas</span>
                </div>
                <p class="step-formula">Kalorijski cilj + potrošene kalorije od vežbe</p>
                <p class="step-calc">${results.calories} + ${exerciseCals} (vežba)</p>
                <p class="step-result" style="color:var(--primary);">= ${results.calories + exerciseCals} kcal prilagođeni cilj</p>
            </div>
            ` : ''}
        </div>
    `;

    overlay.querySelector('#closePopup').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    screen.appendChild(overlay);
}

function showMacrosPopup(screen, profile, results) {
    const split = MACRO_SPLITS[profile.dietType] || MACRO_SPLITS['Jedem sve'];
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `
        <div class="bottom-sheet">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="font-size:17px; font-weight:700;">Kako smo izračunali makrose?</h3>
                <button id="closePopup" style="background:none; border:none; font-size:20px; cursor:pointer; color:var(--text-light);">✕</button>
            </div>

            <div class="formula-step">
                <div style="display:flex; align-items:center;">
                    <span class="step-num" style="background:var(--primary);">1</span>
                    <span class="step-title">Tvoj tip ishrane</span>
                </div>
                <div style="display:flex; align-items:center; gap:8px; margin-top:8px;">
                    <span style="font-size:20px;">🍽️</span>
                    <span style="font-weight:700;">${profile.dietType}</span>
                    <span style="font-size:12px; color:var(--text-light);">P ${split.protein * 100}% · UH ${split.carbs * 100}% · M ${split.fat * 100}%</span>
                </div>
            </div>

            <div class="formula-step">
                <div style="display:flex; align-items:center;">
                    <span class="step-num" style="background:var(--blue);">2</span>
                    <span class="step-title">Raspodela makronutrijenata</span>
                </div>
                <p class="step-formula">procenat × kcal ÷ 4 (protein/UH) ili ÷ 9 (masti) = grami</p>

                <div style="margin-top:12px; display:flex; flex-direction:column; gap:8px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="width:10px; height:10px; border-radius:50%; background:var(--primary);"></div>
                        <span style="font-size:13px; font-weight:600;">Proteini</span>
                        <span style="font-size:12px; color:var(--text-light); flex:1;">${split.protein * 100}% × ${results.calories} ÷ 4</span>
                        <span style="font-family:var(--font-numbers); font-weight:900; color:var(--primary);">= ${results.macros.protein}g</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="width:10px; height:10px; border-radius:50%; background:var(--blue);"></div>
                        <span style="font-size:13px; font-weight:600;">Ugljeni</span>
                        <span style="font-size:12px; color:var(--text-light); flex:1;">${split.carbs * 100}% × ${results.calories} ÷ 4</span>
                        <span style="font-family:var(--font-numbers); font-weight:900; color:var(--blue);">= ${results.macros.carbs}g</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="width:10px; height:10px; border-radius:50%; background:var(--green);"></div>
                        <span style="font-size:13px; font-weight:600;">Masti</span>
                        <span style="font-size:12px; color:var(--text-light); flex:1;">${split.fat * 100}% × ${results.calories} ÷ 9</span>
                        <span style="font-family:var(--font-numbers); font-weight:900; color:var(--green);">= ${results.macros.fat}g</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    overlay.querySelector('#closePopup').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    screen.appendChild(overlay);
}
