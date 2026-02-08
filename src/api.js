const API_BASE = 'http://localhost:3001/api';

/**
 * Fetch with error handling
 */
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API request failed');
        }

        return await response.json();
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

// ============================================
// Stats API
// ============================================

export async function getCurrentStats() {
    return fetchAPI('/stats');
}

export async function getStatsSummary() {
    return fetchAPI('/stats/summary');
}

// ============================================
// Runs API
// ============================================

export async function getRuns(options = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit);
    if (options.project) params.append('project', options.project);

    const query = params.toString();
    return fetchAPI(`/runs${query ? `?${query}` : ''}`);
}

export async function getRun(id) {
    return fetchAPI(`/runs/${id}`);
}

export async function deleteRun(id) {
    return fetchAPI(`/runs/${id}`, { method: 'DELETE' });
}

// ============================================
// Profiling API
// ============================================

export async function getProfilingStatus() {
    return fetchAPI('/profile/status');
}

export async function startProfiling(options = {}) {
    return fetchAPI('/profile/start', {
        method: 'POST',
        body: JSON.stringify(options),
    });
}

export async function stopProfiling() {
    return fetchAPI('/profile/stop', {
        method: 'POST',
    });
}

// ============================================
// Settings API
// ============================================

export async function getSettings() {
    return fetchAPI('/settings');
}

export async function saveSettings(settings) {
    return fetchAPI('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
    });
}

// ============================================
// Carbon Data API
// ============================================

export async function getCarbonIntensity() {
    return fetchAPI('/carbon/intensity');
}

export async function getHardwareProfiles() {
    return fetchAPI('/carbon/profiles');
}

// ============================================
// Helper: Impact Level
// ============================================

export function getImpactLevel(carbonGrams) {
    if (carbonGrams < 1) return { level: 'LOW', color: 'low' };
    if (carbonGrams < 10) return { level: 'MEDIUM', color: 'medium' };
    if (carbonGrams < 100) return { level: 'HIGH', color: 'high' };
    return { level: 'EXTREME', color: 'extreme' };
}

// ============================================
// Helper: Calculate Equivalents
// ============================================

export function calculateEquivalents(carbonGrams) {
    return {
        smartphoneCharges: (carbonGrams / 8.22).toFixed(2),
        googleSearches: (carbonGrams / 0.2).toFixed(1),
        kmDrivenCar: (carbonGrams / 120).toFixed(3),
        hoursStreamingVideo: (carbonGrams / 36).toFixed(2),
    };
}
