// ========== Profile Screen (Pencil: sxB5J) ==========
import { navigate } from '../router.js';
import { getProfile, saveProfile, saveResults, clearAll } from '../data-store.js';
import { calcAllResults } from '../calculator.js';

function ozzyConfirm({ icon = '⚠️', title, desc, confirmText = 'Potvrdi', cancelText = 'Odustani', confirmColor = 'var(--primary)', onConfirm }) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;padding:0 32px;z-index:1000;';
    overlay.innerHTML = `
        <div style="background:#fff;border-radius:24px;padding:28px;display:flex;flex-direction:column;align-items:center;gap:20px;width:100%;max-width:340px;">
            <div style="width:64px;height:64px;border-radius:50%;background:#FFF3E0;display:flex;align-items:center;justify-content:center;font-size:32px;">${icon}</div>
            <div style="font-family:Poppins,sans-serif;font-size:20px;font-weight:700;color:#1A1F3A;text-align:center;">${title}</div>
            <div style="font-family:Poppins,sans-serif;font-size:14px;color:#666;line-height:1.5;text-align:center;">${desc}</div>
            <div style="display:flex;gap:12px;width:100%;">
                <button class="ozzy-cancel" style="flex:1;height:48px;border-radius:12px;background:#F5F5F5;border:none;font-family:Poppins,sans-serif;font-size:16px;font-weight:600;color:#666;cursor:pointer;">${cancelText}</button>
                <button class="ozzy-confirm" style="flex:1;height:48px;border-radius:12px;background:${confirmColor};border:none;font-family:Poppins,sans-serif;font-size:16px;font-weight:600;color:#fff;cursor:pointer;">${confirmText}</button>
            </div>
        </div>
    `;
    overlay.querySelector('.ozzy-cancel').addEventListener('click', () => overlay.remove());
    overlay.querySelector('.ozzy-confirm').addEventListener('click', () => { overlay.remove(); onConfirm(); });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
}

const GOAL_OPTIONS = ['Smršaj', 'Nabaci mišiće', 'Ostani fit'];
const GENDER_OPTIONS = ['Muško', 'Žensko'];
const DIET_OPTIONS = ['Jedem sve', 'Low Carb', 'Biljni fokus', 'Paleo / Clean'];
const TEMPO_OPTIONS = ['Turbo', 'Stabilno', 'Opušteno'];

function makeRow(label, value, onClick) {
    const row = document.createElement('div');
    row.className = 'profile-row';
    row.innerHTML = `
        <span class="profile-row-label">${label}</span>
        <div class="profile-row-right">
            <span class="profile-row-value">${value}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>
    `;
    row.addEventListener('click', onClick);
    return row;
}

function showOptionPicker(screen, title, options, current, onSelect) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `
        <div class="popup-card" style="padding:24px; max-width:320px; width:90%;">
            <h3 style="font-size:16px; font-weight:700; color:var(--text-dark); margin-bottom:16px; text-align:center;">${title}</h3>
            <div class="picker-options" style="display:flex; flex-direction:column; gap:8px;"></div>
        </div>
    `;
    const optionsDiv = overlay.querySelector('.picker-options');
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'profile-option-btn' + (opt === current ? ' selected' : '');
        btn.textContent = opt;
        btn.addEventListener('click', () => {
            onSelect(opt);
            overlay.remove();
        });
        optionsDiv.appendChild(btn);
    });
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    screen.appendChild(overlay);
}

function showNumberInput(screen, title, unit, current, min, max, onSave) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `
        <div class="popup-card" style="padding:24px; max-width:280px; width:85%;">
            <h3 style="font-size:16px; font-weight:700; color:var(--text-dark); margin-bottom:16px; text-align:center;">${title}</h3>
            <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:20px;">
                <input type="number" id="numInput" value="${current}" min="${min}" max="${max}"
                    style="width:100px; text-align:center; font-size:24px; font-weight:700; color:var(--text-dark);
                    border:2px solid var(--primary); border-radius:12px; padding:10px; outline:none; font-family:Poppins;">
                <span style="font-size:16px; color:var(--text-light); font-weight:500;">${unit}</span>
            </div>
            <button id="numSave" style="width:100%; padding:12px; background:var(--primary); color:white;
                border:none; border-radius:12px; font-size:15px; font-weight:600; cursor:pointer; font-family:Poppins;">
                OK
            </button>
        </div>
    `;
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    const input = overlay.querySelector('#numInput');
    overlay.querySelector('#numSave').addEventListener('click', () => {
        const val = parseInt(input.value);
        if (!isNaN(val) && val >= min && val <= max) {
            onSave(val);
            overlay.remove();
        }
    });
    screen.appendChild(overlay);
    input.focus();
    input.select();
}

export function renderProfile(container) {
    const profile = getProfile();
    if (!profile) { navigate('landing'); return; }

    // Local copy for editing
    const data = { ...profile };

    const screen = document.createElement('div');
    screen.className = 'screen';
    screen.style.cssText = 'padding: 0 0 24px;';

    function render() {
        screen.innerHTML = `
            <div class="quiz-header" style="display:flex; align-items:center; justify-content:space-between; padding:0 20px; height:56px;">
                <button class="back-btn" style="width:40px; height:40px; border-radius:20px; background:var(--bg-light);
                    border:none; cursor:pointer; display:flex; align-items:center; justify-content:center;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-dark)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <span style="font-size:18px; font-weight:700; color:var(--text-dark); font-family:Poppins;">Moj profil</span>
                <div style="width:40px;"></div>
            </div>

            <div class="profile-content"></div>

            <div class="profile-buttons"></div>
        `;

        const content = screen.querySelector('.profile-content');

        // Name section
        const nameSection = document.createElement('div');
        nameSection.className = 'profile-name-section';
        nameSection.innerHTML = `
            <label class="profile-section-label">Tvoje ime</label>
            <div class="profile-name-input">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input type="text" id="nameInput" value="${data.name || ''}" placeholder="Upiši ime..."
                    style="flex:1; border:none; outline:none; font-size:16px; font-weight:500; color:var(--text-dark);
                    font-family:Poppins; background:transparent;">
            </div>
        `;
        content.appendChild(nameSection);

        // Divider
        const divider = document.createElement('div');
        divider.style.cssText = 'height:1px; background:#F0F0F0; margin:0 20px;';
        content.appendChild(divider);

        // Data section
        const dataSection = document.createElement('div');
        dataSection.className = 'profile-data-section';
        const dataLabel = document.createElement('label');
        dataLabel.className = 'profile-section-label';
        dataLabel.textContent = 'Moji podaci';
        dataSection.appendChild(dataLabel);

        const rows = document.createElement('div');
        rows.className = 'profile-rows';

        rows.appendChild(makeRow('Cilj', data.goal, () => {
            showOptionPicker(screen, 'Izaberi cilj', GOAL_OPTIONS, data.goal, v => { data.goal = v; render(); });
        }));
        rows.appendChild(makeRow('Pol', data.gender, () => {
            showOptionPicker(screen, 'Izaberi pol', GENDER_OPTIONS, data.gender, v => { data.gender = v; render(); });
        }));
        rows.appendChild(makeRow('Godine', data.age, () => {
            showNumberInput(screen, 'Koliko imaš godina?', 'god', data.age, 13, 95, v => { data.age = v; render(); });
        }));
        rows.appendChild(makeRow('Visina', data.height + ' cm', () => {
            showNumberInput(screen, 'Tvoja visina', 'cm', data.height, 100, 250, v => { data.height = v; render(); });
        }));
        rows.appendChild(makeRow('Težina', data.weight + ' kg', () => {
            showNumberInput(screen, 'Tvoja težina', 'kg', data.weight, 20, 300, v => { data.weight = v; render(); });
        }));
        rows.appendChild(makeRow('Ciljna težina', data.targetWeight + ' kg', () => {
            showNumberInput(screen, 'Ciljna težina', 'kg', data.targetWeight, 20, 300, v => { data.targetWeight = v; render(); });
        }));
        rows.appendChild(makeRow('Ishrana', data.dietType, () => {
            showOptionPicker(screen, 'Tip ishrane', DIET_OPTIONS, data.dietType, v => { data.dietType = v; render(); });
        }));
        rows.appendChild(makeRow('Tempo', data.tempo, () => {
            showOptionPicker(screen, 'Tempo promene', TEMPO_OPTIONS, data.tempo, v => { data.tempo = v; render(); });
        }));

        dataSection.appendChild(rows);
        content.appendChild(dataSection);

        // Buttons
        const btns = screen.querySelector('.profile-buttons');
        btns.innerHTML = `
            <button class="profile-btn save">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Sačuvaj
            </button>
            <button class="profile-btn retry">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1F3A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                Ponovi kviz
            </button>
            <button class="profile-btn delete">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F44336" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Obriši
            </button>
        `;

        // Event listeners
        screen.querySelector('.back-btn').addEventListener('click', () => navigate('dashboard'));

        screen.querySelector('#nameInput').addEventListener('input', e => {
            data.name = e.target.value.trim();
        });

        screen.querySelector('.profile-btn.save').addEventListener('click', () => {
            saveProfile(data);
            const results = calcAllResults(data);
            saveResults(results);
            navigate('dashboard');
        });

        screen.querySelector('.profile-btn.retry').addEventListener('click', () => {
            ozzyConfirm({
                icon: '🔄',
                title: 'Ponovi kviz?',
                desc: 'Tvoji rezultati će biti preračunati na osnovu novih odgovora. Uneti obroci za danas ostaju sačuvani.',
                confirmText: 'Ponovi',
                onConfirm: () => {
                    localStorage.removeItem('ozzy_results');
                    navigate('quiz', { step: '1' });
                }
            });
        });

        screen.querySelector('.profile-btn.delete').addEventListener('click', () => {
            ozzyConfirm({
                icon: '🗑️',
                title: 'Obriši sve podatke?',
                desc: 'Svi tvoji podaci, rezultati i uneti obroci će biti trajno obrisani.',
                confirmText: 'Obriši',
                confirmColor: '#E53935',
                onConfirm: () => {
                    clearAll();
                    navigate('landing');
                }
            });
        });
    }

    render();
    container.appendChild(screen);
}
