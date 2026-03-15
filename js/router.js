// ========== Shared navigate function ==========
// Uses window global to avoid caching issues with ES module imports
export function navigate(route, params = {}) {
    const hash = Object.keys(params).length
        ? `${route}?${new URLSearchParams(params)}`
        : route;
    window.location.hash = hash;
}

// Also set on window for cross-module access
window.__navigate = function(route, params = {}) {
    const hash = Object.keys(params).length
        ? `${route}?${new URLSearchParams(params)}`
        : route;
    window.location.hash = hash;
};
