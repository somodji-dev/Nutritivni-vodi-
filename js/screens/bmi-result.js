// ========== BMI Result Screen (Pencil: 5AFEB) ==========
import { navigate } from '../router.js';
import { calcBMI, getBMICategory } from '../calculator.js';
import { getQuizState } from '../data-store.js';

export function renderBMIResult(container) {
    const quiz = getQuizState();
    const weight = quiz.weight || 72;
    const height = quiz.height || 175;

    const bmi = calcBMI(weight, height);
    const bmiVal = Math.round(bmi * 10) / 10;
    const cat = getBMICategory(bmi);

    // Position on scale (16-35)
    const pct = Math.min(100, Math.max(0, ((bmi - 16) / (35 - 16)) * 100));

    const screen = document.createElement('div');
    screen.className = 'screen bmi-screen';
    screen.style.cssText = 'padding: 0 24px 24px;';

    screen.innerHTML = `
        <div class="nav-header" style="padding:0;">
            <button class="nav-back" id="bmiBack">
                <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <span></span>
            <div style="width:44px;"></div>
        </div>

        <div style="text-align:center; margin-top:8px;">
            <h2 style="font-size:28px; font-weight:700; color:var(--text-dark);">Tvoj današnji</h2>
            <h2 style="font-size:28px; font-weight:700; color:var(--blue); margin-top:4px;">BMI</h2>
            <p style="font-size:14px; color:var(--text-light); margin-top:8px;">Na osnovu tvojih podataka</p>
        </div>

        <div style="flex:1;"></div>

        <div class="bmi-circle">
            <span class="bmi-value">${bmiVal}</span>
            <span class="bmi-label" style="color:${cat.color};">${cat.label}</span>
        </div>

        <div style="padding:24px 0 8px;">
            <div class="bmi-scale">
                <div class="bmi-marker" style="left:${pct}%;"></div>
            </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">
            <div class="bmi-category-row">
                <div style="display:flex; align-items:center; gap:8px;">
                    <div class="bmi-dot" style="background:#00A8D8;"></div>
                    <span style="font-size:13px; color:${bmi < 18.5 ? '#00A8D8' : 'var(--text-light)'}; font-weight:${bmi < 18.5 ? '600' : '400'};">Pothranjenost</span>
                </div>
                <span style="font-size:12px; color:var(--text-light);">< 18.5</span>
            </div>
            <div class="bmi-category-row">
                <div style="display:flex; align-items:center; gap:8px;">
                    <div class="bmi-dot" style="background:#4CAF50;"></div>
                    <span style="font-size:13px; color:${bmi >= 18.5 && bmi < 25 ? '#4CAF50' : 'var(--text-light)'}; font-weight:${bmi >= 18.5 && bmi < 25 ? '600' : '400'};">Normalna</span>
                </div>
                <span style="font-size:12px; color:var(--text-light);">18.5 - 24.9</span>
            </div>
            <div class="bmi-category-row">
                <div style="display:flex; align-items:center; gap:8px;">
                    <div class="bmi-dot" style="background:#FF9500;"></div>
                    <span style="font-size:13px; color:${bmi >= 25 && bmi < 30 ? '#FF9500' : 'var(--text-light)'}; font-weight:${bmi >= 25 && bmi < 30 ? '600' : '400'};">Prekomerna</span>
                </div>
                <span style="font-size:12px; color:var(--text-light);">25 - 29.9</span>
            </div>
            <div class="bmi-category-row">
                <div style="display:flex; align-items:center; gap:8px;">
                    <div class="bmi-dot" style="background:#F44336;"></div>
                    <span style="font-size:13px; color:${bmi >= 30 ? '#F44336' : 'var(--text-light)'}; font-weight:${bmi >= 30 ? '600' : '400'};">Gojaznost</span>
                </div>
                <span style="font-size:12px; color:var(--text-light);">≥ 30</span>
            </div>
        </div>

        <div style="flex:1;"></div>

        <p style="font-size:14px; color:var(--text-light); text-align:center; margin-bottom:16px;">Super si! Hajde da napravimo plan.</p>

        <div class="mascot active" id="bmiVozzy">
            <img src="assets/Device bez pozadine.png" alt="vozzy">
            <div class="mascot-text">
                <span class="mascot-name">vozzy</span>
                <span class="mascot-action">dalje</span>
            </div>
        </div>
    `;

    screen.querySelector('#bmiBack').addEventListener('click', () => navigate('quiz', { step: '5' }));
    screen.querySelector('#bmiVozzy').addEventListener('click', () => navigate('quiz', { step: '5b' }));

    container.appendChild(screen);
}
