// ========== OZZY App - Main Router ==========
// Dynamic imports with cache busting
const V = Date.now();

async function boot() {
    const [
        { navigate },
        { hasProfile, getResults },
        { renderLanding },
        { renderQuiz },
        { renderBMIResult },
        { renderLoading },
        { renderDashboard },
        { renderMealInput },
        { renderProfile }
    ] = await Promise.all([
        import('./router.js?v=' + V),
        import('./data-store.js?v=' + V),
        import('./screens/landing.js?v=' + V),
        import('./screens/quiz.js?v=' + V),
        import('./screens/bmi-result.js?v=' + V),
        import('./screens/loading.js?v=' + V),
        import('./screens/dashboard.js?v=' + V),
        import('./screens/meal-input.js?v=' + V),
        import('./screens/profile.js?v=' + V)
    ]);

    const app = document.getElementById('app');

    const routes = {
        '': renderLanding,
        'landing': renderLanding,
        'quiz': renderQuiz,
        'bmi': renderBMIResult,
        'loading': renderLoading,
        'dashboard': renderDashboard,
        'meal': renderMealInput,
        'profile': renderProfile
    };

    function parseHash() {
        const hash = window.location.hash.replace('#', '');
        const [route, queryStr] = hash.split('?');
        const params = {};
        if (queryStr) {
            new URLSearchParams(queryStr).forEach((val, key) => { params[key] = val; });
        }
        return { route: route || '', params };
    }

    function handleRoute() {
        const { route, params } = parseHash();

        if ((route === '' || route === 'landing') && hasProfile() && getResults()) {
            navigate('dashboard');
            return;
        }

        const renderer = routes[route];
        if (renderer) {
            app.innerHTML = '';
            renderer(app, params);
        } else {
            navigate('landing');
        }
    }

    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}

boot();
