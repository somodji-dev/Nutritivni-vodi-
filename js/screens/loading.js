// ========== Loading Screen (Pencil: jHDQl) ==========
import { navigate } from '../router.js';
import { getProfile, saveResults } from '../data-store.js';
import { calcAllResults } from '../calculator.js';

export function renderLoading(container) {
    const screen = document.createElement('div');
    screen.className = 'screen';
    screen.style.cssText = 'align-items: center; justify-content: center; padding: 40px 24px;';

    screen.innerHTML = `
        <div style="flex:1;"></div>

        <div class="loading-circle gray" style="width:120px; height:120px;"></div>
        <div class="loading-circle gradient" style="width:140px; height:140px; margin-top:-20px;"></div>

        <div style="margin:24px 0 8px; color:var(--blue); font-size:24px;">~</div>

        <h2 style="font-size:28px; font-weight:700; color:var(--text-dark); text-align:center; margin-top:16px;" id="loadText">Pravimo tvoj plan!</h2>

        <p style="font-size:14px; color:var(--text-light); text-align:center; margin-top:12px; line-height:1.6;" id="loadSub">
            Analiziramo tvoje podatke i<br>krojimo nutritivni vodič<br>baš za tebe...
        </p>

        <div style="flex:2;"></div>
    `;

    container.appendChild(screen);

    // Calculate results
    const profile = getProfile();
    if (profile) {
        const results = calcAllResults(profile);
        saveResults(results);
    }

    // Navigate after delay
    setTimeout(() => navigate('dashboard'), 2500);
}
