// ========== Meal Input Screen (Pencil: FpwJp) ==========
import { navigate } from '../router.js';
import { getResults, saveMeal, getTodayMeals, isAIDisclaimerAccepted, acceptAIDisclaimer } from '../data-store.js';

const MEAL_NAMES = { dorucak: 'Doručak', rucak: 'Ručak', vecera: 'Večera', uzina: 'Užina' };

export function renderMealInput(container, params = {}) {
    const type = params.type || 'dorucak';
    const mealName = MEAL_NAMES[type] || 'Doručak';
    const results = getResults();
    const targetCal = results ? results.mealCals[type] : 500;

    let foodItems = [];
    const existing = getTodayMeals()[type];
    if (existing) foodItems = [...existing];
    const hadSavedFood = foodItems.length > 0;

    const screen = document.createElement('div');
    screen.className = 'screen';

    function totalKcal() { return foodItems.reduce((s, i) => s + (i.kcal || 0), 0); }

    function render() {
        screen.innerHTML = `
            <div class="input-header">
                <button class="nav-back" id="backBtn">
                    <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <span class="input-header .title" style="font-size:17px; font-weight:700;">${mealName}</span>
                <button id="saveCheck" style="background:none; border:none; cursor:pointer;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                </button>
            </div>

            <div class="cal-bar">
                <span>Kalorije obroka</span>
                <span>${totalKcal()} / ${targetCal} kcal</span>
            </div>

            <div style="padding:0 20px 12px;">
                <p style="font-size:14px; font-weight:600; color:var(--text-dark); margin-bottom:8px;">Šta si jeo/jela?</p>
                <textarea class="text-input" id="foodInput" placeholder="2 jaja, hleb, jogurt..." maxlength="500" rows="2"></textarea>
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
                    Nutritivne vrednosti su AI procena i mogu varirati.
                </p>
            </div>

            ${foodItems.length > 0 ? `
                <div style="padding:12px 20px 0;">
                    <p style="font-size:14px; font-weight:600; color:var(--text-dark);">Prepoznate namirnice (${foodItems.length})</p>
                </div>
                <div id="foodList" style="padding:8px 20px; display:flex; flex-direction:column; gap:8px;">
                    ${foodItems.map((item, i) => renderFoodCard(item, i)).join('')}
                </div>
            ` : '<div style="flex:1;"></div>'}

            ${(foodItems.length > 0 || hadSavedFood) ? `
                <div class="bottom-bar">
                    <div>
                        <span style="font-size:12px; color:var(--text-light);">Ukupno</span>
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
            saveMeal(type, foodItems);
            navigate('dashboard');
        });

        screen.querySelector('#analyzeBtn').addEventListener('click', handleAnalyze);
        screen.querySelector('#saveBtn')?.addEventListener('click', () => {
            saveMeal(type, foodItems);
            navigate('dashboard');
        });

        // Food card expand/collapse & remove
        screen.querySelectorAll('.food-card-header').forEach(h => {
            h.addEventListener('click', () => h.closest('.food-card').classList.toggle('expanded'));
        });
        screen.querySelectorAll('.food-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.idx);
                foodItems.splice(idx, 1);
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
        const input = screen.querySelector('#foodInput').value.trim();
        if (!input) return;

        const btn = screen.querySelector('#analyzeBtn');
        btn.disabled = true;

        const thinkingMsgs = [
            '🔍 Prepoznajem namirnice...',
            '📊 Tražim nutritivne vrednosti...',
            '🧮 Računam kalorije i makrose...',
            '✅ Završavam analizu...'
        ];
        let msgIdx = 0;
        btn.innerHTML = `<div class="spinner" style="width:20px; height:20px; border-width:2px;"></div> ${thinkingMsgs[0]}`;
        const thinkingInterval = setInterval(() => {
            msgIdx = Math.min(msgIdx + 1, thinkingMsgs.length - 1);
            btn.innerHTML = `<div class="spinner" style="width:20px; height:20px; border-width:2px;"></div> ${thinkingMsgs[msgIdx]}`;
        }, 1200);

        try {
            const resp = await fetch('/api/analyze-food', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: input })
            });
            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                throw new Error(err.error || 'API error');
            }
            const data = await resp.json();
            if (Array.isArray(data) && data.length > 0) {
                foodItems.push(...data);
            } else {
                showToast('Nisam prepoznao namirnice. Pokušaj ponovo sa jasnijim opisom.');
            }
        } catch (err) {
            showToast('Greška pri analizi hrane. Pokušaj ponovo.');
        }

        clearInterval(thinkingInterval);
        render();
    }

    // Show AI disclaimer on first use
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

function renderFoodCard(item, idx) {
    return `
        <div class="food-card">
            <div class="food-card-header">
                <span class="food-emoji">${item.emoji || '🍽️'}</span>
                <span class="food-name">${item.name}${item.quantity ? ' (' + item.quantity + ')' : ''}</span>
                <span class="food-kcal">${item.kcal} kcal</span>
                <button class="food-remove" data-idx="${idx}" style="background:none; border:none; cursor:pointer; color:var(--text-muted); font-size:16px; padding:4px;">✕</button>
            </div>
            <div class="food-card-details">
                <span class="macro-chip protein">● P${item.protein || 0}g</span>
                <span class="macro-chip carbs">● UH${item.carbs || 0}g</span>
                <span class="macro-chip fat">● M${item.fat || 0}g</span>
            </div>
        </div>
    `;
}

function showAIDisclaimer(screen, onAccept) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `
        <div class="center-modal" style="text-align:center;">
            <div style="width:56px; height:56px; border-radius:50%; background:var(--primary-light); margin:0 auto 16px; display:flex; align-items:center; justify-content:center; font-size:28px;">🤖</div>
            <h3 style="font-size:20px; font-weight:700; color:var(--text-dark);">Ozzy koristi AI</h3>
            <p style="font-size:13px; color:var(--text-light); margin-top:12px; line-height:1.6;">
                Nutritivne vrednosti hrane koje Ozzy prikazuje su generisane pomoću AI tehnologije.
                Vrednosti su približne i mogu odstupati od stvarnih.
            </p>
            <div style="background:var(--primary-light); border-radius:var(--r-3xl); padding:10px 16px; margin:16px 0; font-size:12px; color:var(--primary); display:flex; align-items:center; gap:6px;">
                <span>⚠️</span>
                <span>Ova aplikacija nije zamena za stručni medicinski ili nutricionistički savet.</span>
            </div>
            <div style="background:var(--bg-light); border-radius:var(--r-md); padding:12px 16px; margin:0 0 16px; text-align:left;">
                <p style="font-size:13px; font-weight:600; color:var(--text-dark); margin-bottom:6px;">💡 Kako koristiti?</p>
                <p style="font-size:12px; color:var(--text-light); line-height:1.5;">Upiši šta si jeo/jela prirodnim jezikom.</p>
                <p style="font-size:12px; color:var(--text-muted); font-style:italic; margin-top:6px; line-height:1.5;">
                    „2 jaja na oko, parče hleba i jogurt"<br>
                    „Pica margherita i coca cola"
                </p>
            </div>
            <button class="btn btn-primary" style="margin-top:0;" id="acceptAI">Razumem, nastavi</button>
        </div>
    `;

    overlay.querySelector('#acceptAI').addEventListener('click', () => {
        overlay.remove();
        onAccept();
    });

    screen.appendChild(overlay);
}
