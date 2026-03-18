// ========== Quiz Flow (Pencil: TWDuA → aov79) ==========
import { navigate } from '../router.js';
import { saveProfile, getQuizState, setQuizState } from '../data-store.js';

// ===== Shared Components =====

const SVG_BACK = '<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>';
const SVG_USER = '<svg viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

// SVG icons matching Pencil design (outline style, 32x32)
const ICONS = {
    // Q1 - Goals
    fire: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    dumbbell: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>',
    trophy: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
    // Q6b - Diet types
    utensils: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',
    egg: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c6.23-.05 7.87-5.57 7.5-10-.36-4.34-3.95-9.96-7.5-10-3.55.04-7.14 5.66-7.5 10-.37 4.43 1.27 9.95 7.5 10z"/></svg>',
    leaf: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
    apple: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>',
    // Q7 - Tempo
    zap: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    lightbulb: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00A8D8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
    thumbsUp: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>'
};

function makeScreen() {
    const s = document.createElement('div');
    s.className = 'screen';
    s.style.cssText = 'padding: 0 0 24px;';
    return s;
}

function header(step, total, onBack, rightType = 'user', onRight = null) {
    const div = document.createElement('div');
    div.className = 'nav-header';
    div.innerHTML = `
        <button class="nav-back">${SVG_BACK}</button>
        <span class="nav-step">${step} / ${total}</span>
        ${rightType === 'skip'
            ? '<button class="btn-skip">Preskoči</button>'
            : `<button class="nav-right">${SVG_USER}</button>`
        }
    `;
    div.querySelector('.nav-back').addEventListener('click', onBack);
    if (rightType === 'skip' && onRight) {
        div.querySelector('.btn-skip').addEventListener('click', onRight);
    }
    return div;
}

function title(main, highlight, sub) {
    const div = document.createElement('div');
    div.style.cssText = 'text-align:center; padding:0 24px;';
    div.innerHTML = `
        <h2 style="font-size:28px; font-weight:700; color:var(--text-dark);">${main}</h2>
        <h2 style="font-size:28px; font-weight:700; color:var(--primary); margin-top:4px;">${highlight}</h2>
        <p style="font-size:14px; color:var(--text-light); margin-top:10px;">${sub}</p>
    `;
    return div;
}

function spacer() {
    const s = document.createElement('div');
    s.style.flex = '1';
    return s;
}

// Vozzy CTA mascot - starts inactive, becomes active when selection is made
function mascotCTA(onClick, startActive = false) {
    const div = document.createElement('div');
    div.className = 'mascot' + (startActive ? ' active' : '');
    div.innerHTML = `
        <img src="assets/Device bez pozadine.png" alt="vozzy">
        <div class="mascot-text">
            <span class="mascot-name">vozzy</span>
            <span class="mascot-action">dalje</span>
        </div>
    `;
    div.addEventListener('click', () => {
        if (div.classList.contains('active')) {
            onClick();
        }
    });
    return div;
}

// Activate Vozzy CTA on the screen
function activateVozzy(screen) {
    const m = screen.querySelector('.mascot');
    if (m) m.classList.add('active');
}

// 3-card picker with swipe (values change, cards stay in place)
function picker3Card(values, initialValue, onChange) {
    let current = values.indexOf(initialValue);
    if (current < 0) current = 0;

    const SWIPE_THRESHOLD = 30; // px minimum to count as swipe

    let dragging = false;
    let swiped = false;
    let startX = 0, lastX = 0, lastTime = 0;
    let velocity = 0; // px/ms
    let dragOffset = 0;
    let animating = false;

    const wrap = document.createElement('div');
    wrap.className = 'picker-3card';

    const leftCard = document.createElement('div');
    leftCard.className = 'picker-card side';

    const centerCard = document.createElement('div');
    centerCard.className = 'picker-card center';

    const rightCard = document.createElement('div');
    rightCard.className = 'picker-card side';

    function clamp(idx) { return Math.max(0, Math.min(values.length - 1, idx)); }

    function render() {
        leftCard.textContent = current > 0 ? values[current - 1] : '';
        centerCard.textContent = values[current];
        rightCard.textContent = current < values.length - 1 ? values[current + 1] : '';
        onChange(values[current]);
    }

    // Animate value change with a quick pulse on center card
    function animateChange(targetIdx) {
        const newIdx = clamp(targetIdx);
        if (newIdx === current) return;
        // Cancel any ongoing animation
        if (animating) {
            animating = false;
            centerCard.style.transition = '';
            centerCard.style.transform = '';
            centerCard.style.opacity = '';
        }
        animating = true;
        current = newIdx;
        render();
        centerCard.style.transition = 'transform 0.08s ease-out';
        centerCard.style.transform = 'scale(0.92)';
        setTimeout(() => {
            centerCard.style.transform = 'scale(1)';
            setTimeout(() => {
                centerCard.style.transition = '';
                centerCard.style.transform = '';
                animating = false;
            }, 80);
        }, 80);
    }

    // Touch: start
    wrap.addEventListener('touchstart', e => {
        if (animating) return;
        dragging = true;
        swiped = false;
        startX = lastX = e.touches[0].clientX;
        lastTime = Date.now();
        velocity = 0;
        dragOffset = 0;
    }, { passive: true });

    // Touch: move - track gesture only, no visual dragging
    wrap.addEventListener('touchmove', e => {
        if (!dragging) return;
        const x = e.touches[0].clientX;
        const now = Date.now();
        const dt = now - lastTime;
        if (dt > 0) velocity = (x - lastX) / dt;
        lastX = x;
        lastTime = now;
        dragOffset = x - startX;
        if (Math.abs(dragOffset) > 10) {
            swiped = true;
            e.preventDefault();
        }
    }, { passive: false });

    // Touch: end - calculate how many steps to change
    wrap.addEventListener('touchend', () => {
        if (!dragging) return;
        dragging = false;
        if (!swiped) return;

        const speed = Math.abs(velocity); // px/ms
        let steps;
        if (speed > 1.5) {
            steps = Math.min(15, Math.round(speed * 6));
        } else if (speed > 0.5) {
            steps = Math.max(1, Math.round(speed * 3));
        } else if (Math.abs(dragOffset) > SWIPE_THRESHOLD) {
            steps = 1;
        } else {
            steps = 0;
        }

        if (steps === 0) return;

        // Swipe left (negative offset) = increase value
        const direction = dragOffset < 0 ? 1 : -1;
        const target = clamp(current + direction * steps);

        if (target !== current) {
            // Skip animation for multi-step jumps, just update
            if (steps > 1) {
                current = target;
                render();
            } else {
                animateChange(target);
            }
        }
    }, { passive: true });

    // Click side cards (ignore if swipe just happened)
    leftCard.addEventListener('click', () => { if (!swiped && current > 0) animateChange(current - 1); });
    rightCard.addEventListener('click', () => { if (!swiped && current < values.length - 1) animateChange(current + 1); });

    // Mouse wheel (desktop)
    wrap.addEventListener('wheel', e => {
        e.preventDefault();
        const dir = e.deltaY > 0 ? 1 : -1;
        animateChange(current + dir);
    }, { passive: false });

    wrap.appendChild(leftCard);
    wrap.appendChild(centerCard);
    wrap.appendChild(rightCard);

    render();
    return wrap;
}

// Helper: select one option card and deselect others
function selectCard(card, container) {
    container.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
}

// ===== Step 1 - Koji je tvoj cilj? =====
function renderStep1(container) {
    const screen = makeScreen();
    screen.appendChild(header(1, 7, () => navigate('landing')));
    screen.appendChild(document.createElement('div')).style.height = '12px';
    screen.appendChild(title('Koji je tvoj', 'cilj?', 'Hajde da saznamo šta ti treba!'));
    screen.appendChild(spacer());

    let selectedGoal = null;

    const options = document.createElement('div');
    options.style.cssText = 'display:flex; flex-direction:column; gap:12px; padding:0 24px;';

    const vozzy = mascotCTA(() => {
        if (selectedGoal) {
            setQuizState('goal', selectedGoal);
            navigate('quiz', { step: '2' });
        }
    });

    [
        { name: 'Smršaj', icon: ICONS.fire },
        { name: 'Nabildaj se', icon: ICONS.dumbbell },
        { name: 'Ostani fit', icon: ICONS.trophy }
    ].forEach(g => {
        const card = document.createElement('div');
        card.className = 'option-card';
        card.innerHTML = `<span class="option-name">${g.name}</span>${g.icon}`;
        card.addEventListener('click', () => {
            selectedGoal = g.name;
            selectCard(card, options);
            activateVozzy(screen);
        });
        options.appendChild(card);
    });

    screen.appendChild(options);
    screen.appendChild(spacer());
    screen.appendChild(vozzy);
    container.appendChild(screen);
}

// ===== Step 2 - Koji si pol? =====
function renderStep2(container) {
    const screen = makeScreen();
    screen.appendChild(header(2, 7, () => navigate('quiz', { step: '1' })));
    screen.appendChild(document.createElement('div')).style.height = '12px';
    screen.appendChild(title('Koji si', 'pol?', 'Za precizniji proračun tvog plana!'));
    screen.appendChild(spacer());

    let selectedGender = null;

    const grid = document.createElement('div');
    grid.className = 'gender-grid';

    const vozzy = mascotCTA(() => {
        if (selectedGender) {
            setQuizState('gender', selectedGender);
            navigate('quiz', { step: '3' });
        }
    });

    [
        { name: 'Muško', cls: 'male', stroke: 'var(--text-dark)' },
        { name: 'Žensko', cls: 'female', stroke: 'var(--primary)' }
    ].forEach(g => {
        const card = document.createElement('div');
        card.className = `gender-card ${g.cls}`;
        card.innerHTML = `
            <svg viewBox="0 0 24 24" stroke="${g.stroke}">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>${g.name}</span>
        `;
        card.addEventListener('click', () => {
            selectedGender = g.name;
            grid.querySelectorAll('.gender-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            activateVozzy(screen);
        });
        grid.appendChild(card);
    });

    screen.appendChild(grid);
    screen.appendChild(spacer());
    screen.appendChild(vozzy);
    container.appendChild(screen);
}

// ===== Step 3 - Koliko imaš godina? =====
function renderStep3(container) {
    const screen = makeScreen();
    screen.appendChild(header(3, 7, () => navigate('quiz', { step: '2' }), 'skip', () => {
        navigate('quiz', { step: '4' });
    }));
    screen.appendChild(document.createElement('div')).style.height = '12px';
    screen.appendChild(title('Koliko imaš', 'godina?', 'Koliko leta voziš?'));
    screen.appendChild(spacer());

    let selected = getQuizState().age || 25;
    const ages = Array.from({ length: 83 }, (_, i) => i + 13);
    screen.appendChild(picker3Card(ages, selected, val => { selected = val; }));

    screen.appendChild(spacer());
    // Picker always has a value → Vozzy starts active
    screen.appendChild(mascotCTA(() => {
        setQuizState('age', selected);
        navigate('quiz', { step: '4' });
    }, true));
    container.appendChild(screen);
}

// ===== Step 4 - Kolika je tvoja visina? =====
function renderStep4(container) {
    const screen = makeScreen();
    screen.appendChild(header(4, 7, () => navigate('quiz', { step: '3' })));
    screen.appendChild(document.createElement('div')).style.height = '12px';
    screen.appendChild(title('Kolika je tvoja', 'visina?', 'Hajde da vidimo koliko si visok/a!'));
    screen.appendChild(spacer());

    let selected = getQuizState().height || 175;
    const heights = Array.from({ length: 81 }, (_, i) => i + 140);
    screen.appendChild(picker3Card(heights, selected, val => { selected = val; }));

    screen.appendChild(spacer());
    screen.appendChild(mascotCTA(() => {
        setQuizState('height', selected);
        navigate('quiz', { step: '5' });
    }, true));
    container.appendChild(screen);
}

// ===== Step 5 - Tvoja težina danas? =====
function renderStep5(container) {
    const screen = makeScreen();
    screen.appendChild(header(5, 7, () => navigate('quiz', { step: '4' })));
    screen.appendChild(document.createElement('div')).style.height = '12px';
    screen.appendChild(title('Tvoja težina', 'danas?', 'Koliko kilograma imaš danas?'));
    screen.appendChild(spacer());

    let selected = getQuizState().weight || 72;
    const weights = Array.from({ length: 161 }, (_, i) => i + 40);
    screen.appendChild(picker3Card(weights, selected, val => { selected = val; }));

    screen.appendChild(spacer());
    screen.appendChild(mascotCTA(() => {
        setQuizState('weight', selected);
        navigate('bmi');
    }, true));
    container.appendChild(screen);
}

// ===== Step 6 - Tvoja ciljna težina? =====
function renderStep6(container) {
    const screen = makeScreen();
    screen.appendChild(header(6, 7, () => navigate('bmi')));
    screen.appendChild(document.createElement('div')).style.height = '12px';
    screen.appendChild(title('Tvoja ciljna', 'težina?', 'Gde želiš da stigneš? Mi ćemo ti pomoći!'));
    screen.appendChild(spacer());

    let selected = getQuizState().targetWeight || 65;
    const weights = Array.from({ length: 161 }, (_, i) => i + 40);
    screen.appendChild(picker3Card(weights, selected, val => { selected = val; }));

    screen.appendChild(spacer());
    screen.appendChild(mascotCTA(() => {
        setQuizState('targetWeight', selected);
        navigate('quiz', { step: '6b' });
    }, true));
    container.appendChild(screen);
}

// ===== Step 6b - Šta danas ide u tvoj tanjir? =====
function renderStep6b(container) {
    const screen = makeScreen();
    screen.appendChild(header(6, 7, () => navigate('quiz', { step: '6' })));
    screen.appendChild(document.createElement('div')).style.height = '12px';
    screen.appendChild(title('Šta danas ide u tvoj', 'tanjir?', 'Izaberi stil ishrane koji ti odgovara!'));
    screen.appendChild(spacer());

    let selectedDiet = null;

    const options = document.createElement('div');
    options.style.cssText = 'display:flex; flex-direction:column; gap:12px; padding:0 24px;';

    const vozzy = mascotCTA(() => {
        if (selectedDiet) {
            setQuizState('dietType', selectedDiet);
            navigate('quiz', { step: '7' });
        }
    });

    [
        { name: 'Jedem sve', icon: ICONS.utensils },
        { name: 'Low Carb', icon: ICONS.egg },
        { name: 'Biljni fokus', icon: ICONS.leaf },
        { name: 'Paleo / Clean', icon: ICONS.apple }
    ].forEach(d => {
        const card = document.createElement('div');
        card.className = 'option-card';
        card.innerHTML = `<span class="option-name">${d.name}</span>${d.icon}`;
        card.addEventListener('click', () => {
            selectedDiet = d.name;
            selectCard(card, options);
            activateVozzy(screen);
        });
        options.appendChild(card);
    });

    screen.appendChild(options);
    screen.appendChild(spacer());
    screen.appendChild(vozzy);
    container.appendChild(screen);
}

// ===== Step 7 - Kojim tempom do ciljne težine? =====
function renderStep7(container) {
    const screen = makeScreen();
    screen.appendChild(header(7, 7, () => navigate('quiz', { step: '6b' })));
    screen.appendChild(document.createElement('div')).style.height = '12px';
    screen.appendChild(title('Kojim tempom do', 'ciljne težine?', 'Odaberi koliko brzo želiš da stigneš do svoje ciljne težine.'));
    screen.appendChild(spacer());

    let selectedTempo = null;

    const options = document.createElement('div');
    options.style.cssText = 'display:flex; flex-direction:column; gap:12px; padding:0 24px;';

    const vozzy = mascotCTA(() => {
        if (selectedTempo) {
            const profile = getQuizState();
            profile.tempo = selectedTempo;
            saveProfile(profile);
            navigate('loading');
        }
    });

    [
        { name: 'Turbo', desc: 'Intenzivno', rate: '~0.7 kg/ned', icon: ICONS.zap, color: '#FF9500' },
        { name: 'Stabilno', desc: 'Umereno', rate: '~0.45 kg/ned', icon: ICONS.lightbulb, color: '#00A8D8' },
        { name: 'Opušteno', desc: 'Lagano', rate: '~0.23 kg/ned', icon: ICONS.thumbsUp, color: '#4CAF50' }
    ].forEach(t => {
        const card = document.createElement('div');
        card.className = 'option-card';
        card.innerHTML = `
            <div>
                <span class="option-name">${t.name}</span>
                <div class="option-info">
                    <span style="color:${t.color}; font-weight:600;">${t.desc}</span>
                    <span style="color:var(--text-muted);">—</span>
                    <span style="color:var(--text-light);">${t.rate}</span>
                </div>
            </div>
            ${t.icon}
        `;
        card.addEventListener('click', () => {
            selectedTempo = t.name;
            selectCard(card, options);
            activateVozzy(screen);
        });
        options.appendChild(card);
    });

    screen.appendChild(options);
    screen.appendChild(spacer());
    screen.appendChild(vozzy);
    container.appendChild(screen);
}

// ===== Router =====
const steps = { '1': renderStep1, '2': renderStep2, '3': renderStep3, '4': renderStep4, '5': renderStep5, '6': renderStep6, '6b': renderStep6b, '7': renderStep7 };

export function renderQuiz(container, params = {}) {
    const step = params.step || '1';
    (steps[step] || renderStep1)(container);
}
