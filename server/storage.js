import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const RUNS_FILE = path.join(DATA_DIR, 'runs.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Default settings
const defaultSettings = {
    region: 'GLOBAL-AVG',
    pue: 1.0,
    hardwareProfile: 'default',
    maxCarbon: 100,
    maxEnergy: 0.5,
    failOnThreshold: true,
    suggestionsEnabled: true,
};

/**
 * Ensure data directory exists
 */
function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

/**
 * Load all runs from storage
 */
export function loadRuns() {
    ensureDataDir();

    if (!fs.existsSync(RUNS_FILE)) {
        return [];
    }

    try {
        const data = fs.readFileSync(RUNS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading runs:', error);
        return [];
    }
}

/**
 * Save a new run to storage
 */
export function saveRun(run) {
    ensureDataDir();

    const runs = loadRuns();
    runs.unshift(run); // Add to beginning

    // Keep only last 100 runs
    const trimmedRuns = runs.slice(0, 100);

    fs.writeFileSync(RUNS_FILE, JSON.stringify(trimmedRuns, null, 2));
    return run;
}

/**
 * Get a single run by ID
 */
export function getRun(id) {
    const runs = loadRuns();
    return runs.find(run => run.id === id) || null;
}

/**
 * Delete a run by ID
 */
export function deleteRun(id) {
    const runs = loadRuns();
    const filtered = runs.filter(run => run.id !== id);
    fs.writeFileSync(RUNS_FILE, JSON.stringify(filtered, null, 2));
    return filtered.length < runs.length;
}

/**
 * Get runs with optional filtering
 */
export function getRuns(options = {}) {
    let runs = loadRuns();

    // Filter by project
    if (options.project) {
        runs = runs.filter(r => r.project === options.project);
    }

    // Filter by date range
    if (options.startDate) {
        runs = runs.filter(r => new Date(r.timestamp) >= new Date(options.startDate));
    }
    if (options.endDate) {
        runs = runs.filter(r => new Date(r.timestamp) <= new Date(options.endDate));
    }

    // Limit results
    if (options.limit) {
        runs = runs.slice(0, options.limit);
    }

    return runs;
}

/**
 * Load settings
 */
export function loadSettings() {
    ensureDataDir();

    if (!fs.existsSync(SETTINGS_FILE)) {
        return { ...defaultSettings };
    }

    try {
        const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
        return { ...defaultSettings, ...JSON.parse(data) };
    } catch (error) {
        console.error('Error loading settings:', error);
        return { ...defaultSettings };
    }
}

/**
 * Save settings
 */
export function saveSettings(settings) {
    ensureDataDir();
    const merged = { ...defaultSettings, ...settings };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(merged, null, 2));
    return merged;
}

/**
 * Get statistics summary
 */
export function getStatsSummary() {
    const runs = loadRuns();

    if (runs.length === 0) {
        return {
            totalRuns: 0,
            totalCarbon: 0,
            totalEnergy: 0,
            avgCarbon: 0,
            trend: 0,
        };
    }

    const totalCarbon = runs.reduce((sum, r) => sum + (r.carbon?.total_grams || 0), 0);
    const totalEnergy = runs.reduce((sum, r) => sum + (r.energy?.total_kwh || 0), 0);

    // Calculate trend (compare recent vs older)
    const recentRuns = runs.slice(0, Math.min(10, runs.length));
    const olderRuns = runs.slice(10, Math.min(20, runs.length));

    let trend = 0;
    if (olderRuns.length > 0 && recentRuns.length > 0) {
        const recentAvg = recentRuns.reduce((sum, r) => sum + (r.carbon?.total_grams || 0), 0) / recentRuns.length;
        const olderAvg = olderRuns.reduce((sum, r) => sum + (r.carbon?.total_grams || 0), 0) / olderRuns.length;
        trend = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
    }

    return {
        totalRuns: runs.length,
        totalCarbon: totalCarbon.toFixed(2),
        totalEnergy: totalEnergy.toFixed(5),
        avgCarbon: (totalCarbon / runs.length).toFixed(2),
        trend: trend.toFixed(1),
    };
}
