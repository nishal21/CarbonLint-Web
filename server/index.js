import express from 'express';
import cors from 'cors';
import * as profiler from './profiler.js';
import * as carbon from './carbon.js';
import * as storage from './storage.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// API Routes
// ============================================

/**
 * GET /api/stats - Get current system stats
 */
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await profiler.getCurrentStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/stats/summary - Get dashboard summary stats
 */
app.get('/api/stats/summary', async (req, res) => {
    try {
        const summary = storage.getStatsSummary();
        const currentStats = await profiler.getCurrentStats();
        res.json({
            ...summary,
            currentCpu: currentStats.cpu.utilization.toFixed(1),
            currentMemory: currentStats.memory.usage_percent,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/runs - Get all runs (with optional filters)
 */
app.get('/api/runs', (req, res) => {
    try {
        const { project, limit, startDate, endDate } = req.query;
        const runs = storage.getRuns({
            project,
            limit: limit ? parseInt(limit) : undefined,
            startDate,
            endDate,
        });
        res.json(runs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/runs/:id - Get a single run
 */
app.get('/api/runs/:id', (req, res) => {
    try {
        const run = storage.getRun(req.params.id);
        if (!run) {
            return res.status(404).json({ error: 'Run not found' });
        }
        res.json(run);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/runs/:id - Delete a run
 */
app.delete('/api/runs/:id', (req, res) => {
    try {
        const deleted = storage.deleteRun(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Run not found' });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/profile/status - Check profiling status
 */
app.get('/api/profile/status', (req, res) => {
    try {
        const status = profiler.getProfilingStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/profile/start - Start profiling session
 */
app.post('/api/profile/start', async (req, res) => {
    try {
        const { command, project, branch, commit } = req.body;
        const result = await profiler.startProfiling({
            command: command || 'Manual profiling',
            project: project || 'CarbonLint Dashboard',
            branch: branch || 'main',
            commit: commit || 'N/A',
        });
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * POST /api/profile/stop - Stop profiling and save results
 */
app.post('/api/profile/stop', async (req, res) => {
    try {
        const settings = storage.loadSettings();
        const profilingResult = await profiler.stopProfiling();

        // Calculate energy and carbon
        const energy = carbon.calculateEnergy(
            profilingResult.metrics,
            profilingResult.resources.wall_time,
            settings.hardwareProfile
        );

        const carbonResult = carbon.calculateCarbon(
            energy.total_kwh,
            settings.region,
            settings.pue
        );

        const impactInfo = carbon.getImpactLevel(carbonResult.total_grams);
        const equivalents = carbon.calculateEquivalents(carbonResult.total_grams);

        // Build full run object
        const run = {
            id: profilingResult.id,
            project: profilingResult.project,
            command: profilingResult.command,
            branch: profilingResult.branch,
            commit: profilingResult.commit,
            timestamp: profilingResult.timestamp,
            resources: profilingResult.resources,
            energy: energy,
            carbon: carbonResult,
            impact: impactInfo.level,
            equivalents: equivalents,
        };

        // Save to storage
        storage.saveRun(run);

        res.json(run);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * GET /api/settings - Get current settings
 */
app.get('/api/settings', (req, res) => {
    try {
        const settings = storage.loadSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/settings - Update settings
 */
app.put('/api/settings', (req, res) => {
    try {
        const settings = storage.saveSettings(req.body);
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/carbon/intensity - Get carbon intensity database
 */
app.get('/api/carbon/intensity', (req, res) => {
    res.json(carbon.carbonIntensityDB);
});

/**
 * GET /api/carbon/profiles - Get hardware profiles
 */
app.get('/api/carbon/profiles', (req, res) => {
    res.json(carbon.hardwareProfiles);
});

// ============================================
// Start Server
// ============================================

app.listen(PORT, () => {
    console.log(`
🌱 CarbonLint API Server running on http://localhost:${PORT}

Available endpoints:
  GET  /api/stats          - Current system stats
  GET  /api/stats/summary  - Dashboard summary
  GET  /api/runs           - All profiling runs
  GET  /api/runs/:id       - Single run details
  POST /api/profile/start  - Start profiling
  POST /api/profile/stop   - Stop profiling & save
  GET  /api/settings       - Current settings
  PUT  /api/settings       - Update settings
  `);
});
