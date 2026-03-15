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
        <p style="font-size:15px; color:var(--text-light); text-align:center; margin-top:8px;">Spremni za zdrav dan?</p>

        <div style="flex:1;"></div>

        <button class="btn btn-primary" id="startBtn">Izračunaj dnevni dozzy</button>

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

    container.appendChild(screen);
}
