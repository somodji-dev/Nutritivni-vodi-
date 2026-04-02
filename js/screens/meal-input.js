// ========== Meal Input Screen — Autocomplete + AI fallback ==========
import { navigate } from '../router.js';
import { getResults, saveMeal, getTodayMeals, isAIDisclaimerAccepted, acceptAIDisclaimer, getProfile } from '../data-store.js';
import { searchFoods, addFoodToDB, incrementUsage, calculateNutrition, generateTokens, parseGramsFromQuantity } from '../food-search.js';

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

            <div style="padding:0 0 4px;">
                <p style="font-size:14px; font-weight:600; color:var(--text-dark); margin-bottom:8px; padding:0 20px;">Šta si jeo/jela?</p>
                <div class="autocomplete-wrapper">
                    <input type="text" class="autocomplete-input" id="foodInput" placeholder="Pretraži namirnicu..." autocomplete="off" />
                    <div class="autocomplete-dropdown" id="dropdown" style="display:none;"></div>
                </div>
            </div>

            <div style="padding:4px 20px 4px;">
                <p style="font-size:11px; color:var(--text-muted);">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" style="vertical-align:middle;"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                    Pretraži bazu namirnica ili koristi AI za nepoznate.
                </p>
            </div>

            ${foodItems.length > 0 ? `
                <div style="padding:12px 20px 0;">
                    <p style="font-size:14px; font-weight:600; color:var(--text-dark);">Izabrane namirnice (${foodItems.length})</p>
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
        screen.querySelector('#saveBtn')?.addEventListener('click', () => {
            saveMeal(type, foodItems);
            navigate('dashboard');
        });

        // Autocomplete input
        const input = screen.querySelector('#foodInput');
        const dropdown = screen.querySelector('#dropdown');

        input.addEventListener('input', () => {
            const q = input.value.trim();
            if (q.length < 2) { dropdown.style.display = 'none'; return; }

            searchFoods(q, (results) => {
                if (results.length === 0 && q.length >= 2) {
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

                dropdown.innerHTML = results.map((food, i) => `
                    <div class="autocomplete-item" data-idx="${i}">
                        <span style="font-size:20px;">${food.emoji || '🍽️'}</span>
                        <div class="autocomplete-item-name">
                            <span>${food.name}</span>
                            <small>${food.category || ''} · per 100g</small>
                        </div>
                        <span class="autocomplete-item-kcal">${food.kcal_per100g} kcal</span>
                    </div>
                `).join('') + `
                    <div class="autocomplete-ai-btn" id="aiFallbackBtn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        Ne nalazim — AI analiza
                    </div>
                `;
                dropdown.style.display = 'block';

                // Click handlers for results
                dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const food = results[parseInt(item.dataset.idx)];
                        dropdown.style.display = 'none';
                        input.value = '';
                        showPortionPicker(food);
                    });
                });

                dropdown.querySelector('#aiFallbackBtn')?.addEventListener('click', () => {
                    dropdown.style.display = 'none';
                    handleAIAnalyze(input.value.trim());
                });
            });
        });

        // Close dropdown when clicking outside
        screen.addEventListener('click', (e) => {
            if (!e.target.closest('.autocomplete-wrapper')) dropdown.style.display = 'none';
        });

        // Food card expand/collapse & remove
        screen.querySelectorAll('.food-card-header').forEach(h => {
            h.addEventListener('click', () => h.closest('.food-card').classList.toggle('expanded'));
        });
        screen.querySelectorAll('.food-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                foodItems.splice(parseInt(btn.dataset.idx), 1);
                render();
            });
        });
    }

    // ===== Portion Picker =====
    function showPortionPicker(food) {
        const portions = food.portions || [];
        const overlay = document.createElement('div');
        overlay.className = 'overlay';

        let selectedGrams = portions.length > 0 ? portions[0].grams : 100;

        function updatePreview() {
            const n = calculateNutrition(food, selectedGrams);
            const preview = overlay.querySelector('#nutritionPreview');
            if (preview) {
                preview.innerHTML = `
                    <span class="np-kcal">${n.kcal} kcal</span>
                    <span class="np-p">P ${n.protein}g</span>
                    <span class="np-uh">UH ${n.carbs}g</span>
                    <span class="np-m">M ${n.fat}g</span>
                `;
            }
            // Update active state on portion buttons
            overlay.querySelectorAll('.picker-option').forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.grams) === selectedGrams);
            });
        }

        overlay.innerHTML = `
            <div class="bottom-sheet" style="padding:24px; max-width:375px; left:50%; transform:translateX(-50%);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <h3 style="font-size:17px; font-weight:700;">Koliko?</h3>
                    <button id="closePortion" style="background:none; border:none; font-size:20px; cursor:pointer; color:var(--text-light);">✕</button>
                </div>

                <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
                    <span style="font-size:28px;">${food.emoji || '🍽️'}</span>
                    <div>
                        <p style="font-size:15px; font-weight:700; color:var(--text-dark);">${food.name}</p>
                        <p style="font-size:12px; color:var(--text-light);">${food.kcal_per100g} kcal per 100g</p>
                    </div>
                </div>

                ${portions.length > 0 ? `
                    <div class="picker-grid">
                        ${portions.map(p => `
                            <button class="picker-option${p.grams === selectedGrams ? ' active' : ''}" data-grams="${p.grams}">
                                ${p.label} (${p.grams}g)
                            </button>
                        `).join('')}
                        <button class="picker-option" data-grams="100">100g</button>
                    </div>
                ` : ''}

                <div class="picker-custom">
                    <label>Ili unesi gramažu:</label>
                    <input type="number" id="customGrams" value="${selectedGrams}" min="1" max="2000" />
                    <label>g</label>
                </div>

                <div class="nutrition-preview" id="nutritionPreview"></div>

                <button class="btn btn-primary" style="width:100%; margin-top:8px;" id="addFoodBtn">Dodaj</button>
            </div>
        `;

        // Portion button clicks
        overlay.querySelectorAll('.picker-option').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedGrams = parseInt(btn.dataset.grams);
                overlay.querySelector('#customGrams').value = selectedGrams;
                updatePreview();
            });
        });

        // Custom grams input
        overlay.querySelector('#customGrams').addEventListener('input', (e) => {
            const v = parseInt(e.target.value);
            if (v > 0 && v <= 2000) {
                selectedGrams = v;
                updatePreview();
            }
        });

        // Add button
        overlay.querySelector('#addFoodBtn').addEventListener('click', () => {
            const n = calculateNutrition(food, selectedGrams);
            foodItems.push({
                name: food.name,
                quantity: selectedGrams + 'g',
                emoji: food.emoji || '🍽️',
                kcal: n.kcal,
                protein: n.protein,
                carbs: n.carbs,
                fat: n.fat
            });
            // Increment usage in background
            if (food.id) incrementUsage(food.id);
            overlay.remove();
            render();
        });

        overlay.querySelector('#closePortion').addEventListener('click', () => overlay.remove());
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

        // Show loading in input area
        const input = screen.querySelector('#foodInput');
        if (input) { input.disabled = true; input.value = ''; input.placeholder = '🔍 AI analizira...'; }

        const thinkingMsgs = ['🔍 Prepoznajem...', '📊 Tražim vrednosti...', '🧮 Računam...', '✅ Završavam...'];
        let msgIdx = 0;
        const thinkingInterval = setInterval(() => {
            msgIdx = Math.min(msgIdx + 1, thinkingMsgs.length - 1);
            if (input) input.placeholder = thinkingMsgs[msgIdx];
        }, 1200);

        try {
            const resp = await fetch('/api/analyze-food', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            if (!resp.ok) throw new Error('API error');
            const data = await resp.json();
            if (Array.isArray(data) && data.length > 0) {
                foodItems.push(...data);
                // Save each to Supabase in background
                data.forEach(item => {
                    const grams = parseGramsFromQuantity(item.quantity) || 100;
                    addFoodToDB({
                        name: item.name,
                        tokens: generateTokens(item.name),
                        emoji: item.emoji,
                        category: null,
                        kcal_per100g: Math.round(item.kcal * 100 / grams),
                        protein_per100g: Math.round(item.protein * 100 / grams * 10) / 10,
                        carbs_per100g: Math.round(item.carbs * 100 / grams * 10) / 10,
                        fat_per100g: Math.round(item.fat * 100 / grams * 10) / 10,
                        portions: [{ label: item.quantity, grams }],
                        tier: 'ai_generated'
                    });
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

    // Show AI disclaimer on first use
    if (!isAIDisclaimerAccepted()) {
        showAIDisclaimer(screen, () => { acceptAIDisclaimer(); render(); });
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
                <p style="font-size:12px; color:var(--text-light); line-height:1.5;">Pretraži namirnicu po imenu ili koristi AI za nepoznate.</p>
                <p style="font-size:12px; color:var(--text-muted); font-style:italic; margin-top:6px; line-height:1.5;">
                    Kucaj „piletina" → izaberi iz liste → unesi gramažu
                </p>
            </div>
            <button class="btn btn-primary" style="margin-top:0;" id="acceptAI">Razumem, nastavi</button>
        </div>
    `;
    overlay.querySelector('#acceptAI').addEventListener('click', () => { overlay.remove(); onAccept(); });
    screen.appendChild(overlay);
}
