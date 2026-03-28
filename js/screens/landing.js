// ========== Landing Screen (Pencil: RLPzr) ==========
import { navigate } from '../router.js';

export function renderLanding(container) {
    const screen = document.createElement('div');
    screen.className = 'screen';
    screen.style.cssText = 'padding: 40px 24px 24px; align-items: center;';

    screen.innerHTML = `
        <img src="assets/Device bez pozadine.png" alt="OZZY" style="height:100px; width:auto;">

        <div style="height:60px;"></div>

        <div style="flex:1;"></div>

        <h1 style="font-size:28px; font-weight:700; text-align:center; color:var(--text-dark);">Dobar dan!</h1>
        <p style="font-size:15px; color:var(--text-light); text-align:center; margin-top:8px;">Zabavno praćenje, ozbiljni rezultati</p>

        <div style="flex:1;"></div>

        <button class="btn btn-primary" id="startBtn">Izračunaj dnevni dozzy</button>

        <button id="ozzyProductBtn" style="margin-top:12px; background:none; border:2px solid var(--primary-light); border-radius:var(--r-xl); padding:12px 24px; cursor:pointer; font-family:Poppins,sans-serif; font-size:14px; font-weight:600; color:var(--primary); width:100%; display:flex; align-items:center; justify-content:center; gap:8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            Više o OZZY Dnevny Dozzy
        </button>

        <div style="height:16px;"></div>

        <p style="font-size:14px; font-weight:600; text-align:center; color:var(--text-dark);">Kalkulator dnevnih nutritivnih potreba</p>
        <p style="font-size:13px; color:var(--text-light); text-align:center; margin-top:8px; line-height:1.5;">Saznaj koliko kalorija, proteina i nutrijenata ti treba svakog dana.</p>

        <div style="flex:1;"></div>

        <div class="disclaimer">
            <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Tvoji podaci se čuvaju samo na tvom uređaju.</span>
        </div>
    `;

    screen.querySelector('#startBtn').addEventListener('click', () => {
        navigate('quiz', { step: '1' });
    });

    screen.querySelector('#ozzyProductBtn').addEventListener('click', () => {
        window.open('https://www.ozzynuts.com/dnevnydozzy/', '_blank');
    });

    container.appendChild(screen);
}
