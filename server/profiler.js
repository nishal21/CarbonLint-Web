import si from 'systeminformation';

// Store profiling session data
let profilingSession = null;
let profilingInterval = null;
let resourceSamples = [];

// Cache for slow metrics
let cachedStats = null;
let lastCacheTime = 0;
const CACHE_TTL = 1000; // 1 second cache

/**
 * Get current system stats in real-time
 */
export async function getCurrentStats() {
    // Use cache if available and fresh
    const now = Date.now();
    if (cachedStats && (now - lastCacheTime) < CACHE_TTL) {
        return { ...cachedStats, timestamp: new Date().toISOString() };
    }

    try {
        // Fetch only essential metrics for speed
        const [cpu, mem] = await Promise.all([
            si.currentLoad().catch(() => null),
            si.mem().catch(() => null),
        ]);

        const stats = {
            timestamp: new Date().toISOString(),
            cpu: {
                utilization: cpu?.currentLoad || 0,
                cores: cpu?.cpus?.length || 0,
                user: cpu?.currentLoadUser || 0,
                system: cpu?.currentLoadSystem || 0,
            },
            memory: {
                total_mb: mem ? Math.round(mem.total / (1024 * 1024)) : 0,
                used_mb: mem ? Math.round(mem.used / (1024 * 1024)) : 0,
                free_mb: mem ? Math.round(mem.free / (1024 * 1024)) : 0,
                usage_percent: mem ? ((mem.used / mem.total) * 100).toFixed(1) : '0',
            },
            disk: {
                read_mb: '0',
                write_mb: '0',
                read_per_sec: '0',
                write_per_sec: '0',
            },
            network: {
                rx_mb: '0',
                tx_mb: '0',
                rx_per_sec: '0',
                tx_per_sec: '0',
            },
            gpu: {
                utilization: 0,
                name: 'N/A',
            },
            uptime: 0,
        };

        // Cache the result
        cachedStats = stats;
        lastCacheTime = now;

        return stats;
    } catch (error) {
        console.error('Error getting system stats:', error.message);
        // Return default values
        return {
            timestamp: new Date().toISOString(),
            cpu: { utilization: 0, cores: 0, user: 0, system: 0 },
            memory: { total_mb: 0, used_mb: 0, free_mb: 0, usage_percent: '0' },
            disk: { read_mb: '0', write_mb: '0', read_per_sec: '0', write_per_sec: '0' },
            network: { rx_mb: '0', tx_mb: '0', rx_per_sec: '0', tx_per_sec: '0' },
            gpu: { utilization: 0, name: 'N/A' },
            uptime: 0,
        };
    }
}

/**
 * Start a profiling session
 */
export async function startProfiling(options = {}) {
    if (profilingSession) {
        throw new Error('Profiling session already in progress');
    }

    const startStats = await getCurrentStats();

    profilingSession = {
        id: `cl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        startTime: Date.now(),
        startTimestamp: new Date().toISOString(),
        command: options.command || 'manual profiling',
        project: options.project || 'CarbonLint Dashboard',
        branch: options.branch || 'main',
        commit: options.commit || 'N/A',
    };

    resourceSamples = [];

    // Sample every second
    profilingInterval = setInterval(async () => {
        try {
            const stats = await getCurrentStats();
            resourceSamples.push({
                timestamp: Date.now(),
                cpuUtilization: stats.cpu.utilization,
                memoryUsed: stats.memory.used_mb,
                memoryPercent: parseFloat(stats.memory.usage_percent),
            });
        } catch (e) {
            // Ignore
        }
    }, 1000);

    return {
        sessionId: profilingSession.id,
        startTime: profilingSession.startTimestamp,
        message: 'Profiling started',
    };
}

/**
 * Stop profiling and return results
 */
export async function stopProfiling() {
    if (!profilingSession) {
        throw new Error('No profiling session in progress');
    }

    if (profilingInterval) {
        clearInterval(profilingInterval);
        profilingInterval = null;
    }

    const endTime = Date.now();
    const durationMs = endTime - profilingSession.startTime;
    const durationSeconds = durationMs / 1000;

    const samples = resourceSamples;
    const avgCpu = samples.length > 0
        ? samples.reduce((sum, s) => sum + s.cpuUtilization, 0) / samples.length
        : 0;
    const maxMemory = samples.length > 0
        ? Math.max(...samples.map(s => s.memoryUsed))
        : 0;
    const avgMemoryPercent = samples.length > 0
        ? samples.reduce((sum, s) => sum + s.memoryPercent, 0) / samples.length
        : 0;

    const result = {
        id: profilingSession.id,
        project: profilingSession.project,
        command: profilingSession.command,
        branch: profilingSession.branch,
        commit: profilingSession.commit,
        timestamp: profilingSession.startTimestamp,
        resources: {
            wall_time: durationSeconds,
            cpu_utilization: avgCpu,
            cpu_time_user: (avgCpu / 100) * durationSeconds * 0.7,
            cpu_time_system: (avgCpu / 100) * durationSeconds * 0.3,
            memory_peak_mb: maxMemory,
            memory_avg_percent: avgMemoryPercent,
            disk_read_mb: 0,
            disk_write_mb: 0,
            net_recv_mb: 0,
            net_sent_mb: 0,
            gpu_utilization: 0,
        },
        metrics: {
            cpuUtilization: avgCpu,
            memoryUsagePercent: avgMemoryPercent,
            gpuUtilization: 0,
            diskActivity: 0,
            networkActivity: 0,
        },
        sampleCount: samples.length,
        durationMs: durationMs,
    };

    profilingSession = null;
    resourceSamples = [];

    return result;
}

/**
 * Check if profiling is in progress
 */
export function isProfilingActive() {
    return profilingSession !== null;
}

/**
 * Get current profiling status
 */
export function getProfilingStatus() {
    if (!profilingSession) {
        return { active: false };
    }

    return {
        active: true,
        sessionId: profilingSession.id,
        startTime: profilingSession.startTimestamp,
        elapsedMs: Date.now() - profilingSession.startTime,
        sampleCount: resourceSamples.length,
    };
}
