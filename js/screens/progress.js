// ========== Progress Screen (ApexCharts — 2 charts) ==========
import { navigate } from '../router.js';
import { getProgressData, getWeightForDate, saveWeightForDate, getProfile, saveProfile } from '../data-store.js';

let areaChart = null;
let barChart = null;

export function renderProgress(container) {
    const screen = document.createElement('div');
    screen.className = 'screen';
    screen.style.cssText = 'padding: 0; overflow-y: auto;';

    screen.innerHTML = `
        <div class="nav-header">
            <button class="nav-back" id="backBtn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-dark)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <span style="font-size:16px; font-weight:700; color:var(--text-dark);">Progres</span>
            <div style="width:24px;"></div>
        </div>

        <!-- Period selector -->
        <div style="display:flex; align-items:center; justify-content:space-between; margin:12px 20px 16px; ">
            <span style="font-size:14px; font-weight:700; color:var(--text-dark);">Period</span>
            <div class="progress-period" id="periodSelector">
                <button class="period-btn" data-days="7">7d</button>
                <button class="period-btn active" data-days="14">14d</button>
                <button class="period-btn" data-days="30">30d</button>
            </div>
        </div>

        <!-- Chart 1: Kalorije, Vežba, Težina (area) -->
        <div class="progress-section" style="margin:0 20px 16px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                <span style="font-size:13px; font-weight:700; color:var(--text-dark);">Kalorije i težina</span>
                <div class="progress-toggles" id="areaToggles">
                    <label class="toggle-chip active" data-key="calories" style="--chip-color:#FF9500;">
                        <input type="checkbox" checked> Kcal
                    </label>
                    <label class="toggle-chip" data-key="exerciseCals" style="--chip-color:#F44336;">
                        <input type="checkbox"> Vežba
                    </label>
                    <label class="toggle-chip" data-key="weight" style="--chip-color:#1A1F3A;">
                        <input type="checkbox"> Težina
                    </label>
                </div>
            </div>
            <div id="areaChartContainer" style="min-height:220px;"></div>
        </div>

        <!-- Chart 2: Makrosi (stacked bar) -->
        <div class="progress-section" style="margin:0 20px 16px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                <span style="font-size:13px; font-weight:700; color:var(--text-dark);">Makronutrijenti</span>
                <div class="progress-toggles" id="barToggles">
                    <label class="toggle-chip active" data-key="protein" style="--chip-color:#9C27B0;">
                        <input type="checkbox" checked> P
                    </label>
                    <label class="toggle-chip active" data-key="carbs" style="--chip-color:#00A8D8;">
                        <input type="checkbox" checked> UH
                    </label>
                    <label class="toggle-chip active" data-key="fat" style="--chip-color:#4CAF50;">
                        <input type="checkbox" checked> M
                    </label>
                </div>
            </div>
            <div id="barChartContainer" style="min-height:220px;"></div>
        </div>

        <div style="height:24px;"></div>
    `;

    screen.querySelector('#backBtn').addEventListener('click', () => navigate('dashboard'));

    // Period buttons — rebuild both charts
    screen.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            screen.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            buildBothCharts(screen);
        });
    });

    // Area chart toggles
    screen.querySelectorAll('#areaToggles .toggle-chip input').forEach(cb => {
        cb.addEventListener('change', () => {
            cb.closest('.toggle-chip').classList.toggle('active', cb.checked);
            buildAreaChart(screen);
        });
    });

    // Bar chart toggles
    screen.querySelectorAll('#barToggles .toggle-chip input').forEach(cb => {
        cb.addEventListener('change', () => {
            cb.closest('.toggle-chip').classList.toggle('active', cb.checked);
            buildBarChart(screen);
        });
    });

    setTimeout(() => buildBothCharts(screen), 50);
    container.appendChild(screen);
}

function getDays(screen) {
    return parseInt(screen.querySelector('.period-btn.active')?.dataset.days || 14);
}

function getCheckedKeys(wrapper) {
    const keys = [];
    wrapper.querySelectorAll('.toggle-chip input:checked').forEach(cb => {
        keys.push(cb.closest('.toggle-chip').dataset.key);
    });
    return keys;
}

function buildBothCharts(screen) {
    buildAreaChart(screen);
    buildBarChart(screen);
}

// ==================== AREA CHART ====================
function buildAreaChart(screen) {
    const el = screen.querySelector('#areaChartContainer');
    if (!el || typeof ApexCharts === 'undefined') return;

    const days = getDays(screen);
    const data = getProgressData(days);
    const keys = getCheckedKeys(screen.querySelector('#areaToggles'));

    if (areaChart) { areaChart.destroy(); areaChart = null; }

    if (keys.length === 0) {
        el.innerHTML = '<p style="text-align:center; color:var(--text-light); padding:30px 0; font-size:12px;">Izaberi šta želiš da pratiš</p>';
        return;
    }

    const AREA_CFG = {
        calories:     { label: 'Kalorije',  color: '#FF9500', unit: 'kcal' },
        exerciseCals: { label: 'Vežba',     color: '#F44336', unit: 'kcal' },
        weight:       { label: 'Težina',    color: '#1A1F3A', unit: 'kg' }
    };

    const series = [];
    const colors = [];
    keys.forEach(k => {
        const c = AREA_CFG[k]; if (!c) return;
        series.push({ name: c.label, data: data.map(d => d[k] || 0) });
        colors.push(c.color);
    });

    const hasWeight = keys.includes('weight');
    const hasOther = keys.some(k => k !== 'weight');

    const yaxis = [];
    // Primary axis
    if (hasOther) {
        yaxis.push({
            labels: { style: { colors: '#8e8da4', fontSize: '11px', fontFamily: 'Montserrat' }, formatter: v => Math.round(v) },
            axisBorder: { show: false }, axisTicks: { show: false }
        });
    }
    // Weight on opposite side
    if (hasWeight) {
        const idx = keys.indexOf('weight');
        // Pad yaxis array to match series index
        while (yaxis.length < idx) yaxis.push({ show: false });
        yaxis.push({
            opposite: true,
            labels: { style: { colors: '#1A1F3A', fontSize: '11px', fontFamily: 'Montserrat' }, formatter: v => v.toFixed(1) + ' kg' },
            axisBorder: { show: false }, axisTicks: { show: false }
        });
    }

    el.innerHTML = '';
    areaChart = new ApexCharts(el, {
        series,
        chart: { type: 'area', height: 220, fontFamily: 'Poppins', toolbar: { show: false }, zoom: { enabled: false }, animations: { enabled: true, easing: 'easeinout', speed: 400 } },
        colors,
        dataLabels: { enabled: false },
        markers: { size: 0 },
        stroke: { curve: 'smooth', width: 2.5 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, inverseColors: false, opacityFrom: 0.4, opacityTo: 0.05, stops: [20, 100] } },
        xaxis: {
            categories: data.map(d => d.label),
            labels: { style: { colors: '#8e8da4', fontSize: '10px', fontFamily: 'Montserrat' }, rotate: 0, hideOverlappingLabels: true },
            axisBorder: { show: false }, axisTicks: { show: false }
        },
        yaxis: yaxis.length === 1 ? yaxis[0] : yaxis,
        grid: { borderColor: '#F0F0F0', strokeDashArray: 3, xaxis: { lines: { show: false } } },
        tooltip: { shared: true, intersect: false, style: { fontFamily: 'Poppins', fontSize: '12px' }, y: { formatter: (val, { seriesIndex }) => { const k = keys[seriesIndex]; return Math.round(val * 10) / 10 + ' ' + (AREA_CFG[k]?.unit || ''); } } },
        legend: { show: false }
    });
    areaChart.render();
}

// ==================== STACKED BAR CHART ====================
function buildBarChart(screen) {
    const el = screen.querySelector('#barChartContainer');
    if (!el || typeof ApexCharts === 'undefined') return;

    const days = getDays(screen);
    const data = getProgressData(days);
    const keys = getCheckedKeys(screen.querySelector('#barToggles'));

    if (barChart) { barChart.destroy(); barChart = null; }

    if (keys.length === 0) {
        el.innerHTML = '<p style="text-align:center; color:var(--text-light); padding:30px 0; font-size:12px;">Izaberi makrose za prikaz</p>';
        return;
    }

    const BAR_CFG = {
        protein: { label: 'Proteini', color: '#9C27B0' },
        carbs:   { label: 'UH',       color: '#00A8D8' },
        fat:     { label: 'Masti',    color: '#4CAF50' }
    };

    const series = [];
    const colors = [];
    keys.forEach(k => {
        const c = BAR_CFG[k]; if (!c) return;
        series.push({ name: c.label, data: data.map(d => d[k] || 0) });
        colors.push(c.color);
    });

    el.innerHTML = '';
    barChart = new ApexCharts(el, {
        series,
        chart: { type: 'bar', stacked: true, height: 220, fontFamily: 'Poppins', toolbar: { show: false }, zoom: { enabled: false }, animations: { enabled: true, easing: 'easeinout', speed: 400 } },
        colors,
        dataLabels: { enabled: false },
        plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
        xaxis: {
            categories: data.map(d => d.label),
            labels: { style: { colors: '#8e8da4', fontSize: '10px', fontFamily: 'Montserrat' }, rotate: 0, hideOverlappingLabels: true },
            axisBorder: { show: false }, axisTicks: { show: false }
        },
        yaxis: {
            labels: { style: { colors: '#8e8da4', fontSize: '11px', fontFamily: 'Montserrat' }, formatter: v => Math.round(v) + 'g' },
            axisBorder: { show: false }, axisTicks: { show: false }
        },
        grid: { borderColor: '#F0F0F0', strokeDashArray: 3, xaxis: { lines: { show: false } } },
        tooltip: { shared: true, intersect: false, style: { fontFamily: 'Poppins', fontSize: '12px' }, y: { formatter: v => Math.round(v) + ' g' } },
        legend: { show: false }
    });
    barChart.render();
}
