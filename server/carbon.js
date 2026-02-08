// Carbon Intensity Database (gCO2/kWh by region)
export const carbonIntensityDB = {
    'US-WEST': { gco2_kwh: 210, region: 'California, USA' },
    'US-EAST': { gco2_kwh: 386, region: 'Virginia, USA' },
    'US-CENTRAL': { gco2_kwh: 420, region: 'Texas, USA' },
    'EU-WEST': { gco2_kwh: 276, region: 'Ireland, EU' },
    'EU-NORTH': { gco2_kwh: 25, region: 'Sweden, EU' },
    'EU-CENTRAL': { gco2_kwh: 338, region: 'Germany, EU' },
    'ASIA-EAST': { gco2_kwh: 544, region: 'Japan' },
    'ASIA-SOUTH': { gco2_kwh: 708, region: 'India' },
    'OCEANIA': { gco2_kwh: 520, region: 'Australia' },
    'GLOBAL-AVG': { gco2_kwh: 475, region: 'Global Average' },
};

// Hardware power profiles (TDP in Watts)
export const hardwareProfiles = {
    'default': { cpu_tdp: 65, gpu_tdp: 0, memory_watts: 3, disk_watts: 5, network_watts: 2 },
    'laptop': { cpu_tdp: 28, gpu_tdp: 0, memory_watts: 2, disk_watts: 3, network_watts: 1 },
    'desktop': { cpu_tdp: 95, gpu_tdp: 150, memory_watts: 5, disk_watts: 8, network_watts: 3 },
    'server': { cpu_tdp: 150, gpu_tdp: 300, memory_watts: 10, disk_watts: 15, network_watts: 5 },
};

/**
 * Calculate energy consumption from resource metrics
 */
export function calculateEnergy(resourceMetrics, durationSeconds, hardwareProfile = 'default') {
    const profile = hardwareProfiles[hardwareProfile] || hardwareProfiles.default;
    const hours = durationSeconds / 3600;

    // Energy = (Power * Utilization * Time) / 1000 to get kWh
    const cpuEnergy = (profile.cpu_tdp * (resourceMetrics.cpuUtilization / 100) * hours) / 1000;
    const gpuEnergy = resourceMetrics.gpuUtilization > 0
        ? (profile.gpu_tdp * (resourceMetrics.gpuUtilization / 100) * hours) / 1000
        : 0;

    // Memory scales with usage
    const memoryEnergy = (profile.memory_watts * (resourceMetrics.memoryUsagePercent / 100) * hours) / 1000;

    // Disk I/O activity
    const diskEnergy = (profile.disk_watts * (resourceMetrics.diskActivity / 100) * hours) / 1000;

    // Network activity
    const networkEnergy = (profile.network_watts * (resourceMetrics.networkActivity / 100) * hours) / 1000;

    const totalEnergy = cpuEnergy + gpuEnergy + memoryEnergy + diskEnergy + networkEnergy;

    return {
        total_kwh: totalEnergy,
        cpu_kwh: cpuEnergy,
        gpu_kwh: gpuEnergy,
        memory_kwh: memoryEnergy,
        disk_kwh: diskEnergy,
        network_kwh: networkEnergy,
    };
}

/**
 * Calculate carbon emissions from energy consumption
 */
export function calculateCarbon(energyKwh, region = 'GLOBAL-AVG', pue = 1.0) {
    const intensity = carbonIntensityDB[region] || carbonIntensityDB['GLOBAL-AVG'];

    // Apply PUE (Power Usage Effectiveness) for data center overhead
    const effectiveEnergy = energyKwh * pue;

    // Carbon = Energy * Grid Intensity
    const carbonGrams = effectiveEnergy * intensity.gco2_kwh;

    return {
        total_grams: carbonGrams,
        region: region,
        intensity: intensity.gco2_kwh,
        pue: pue,
    };
}

/**
 * Get impact level based on carbon grams
 */
export function getImpactLevel(carbonGrams) {
    if (carbonGrams < 1) return { level: 'LOW', color: 'low' };
    if (carbonGrams < 10) return { level: 'MEDIUM', color: 'medium' };
    if (carbonGrams < 100) return { level: 'HIGH', color: 'high' };
    return { level: 'EXTREME', color: 'extreme' };
}

/**
 * Calculate human-readable equivalents
 */
export function calculateEquivalents(carbonGrams) {
    return {
        smartphoneCharges: (carbonGrams / 8.22).toFixed(2),
        googleSearches: (carbonGrams / 0.2).toFixed(1),
        kmDrivenCar: (carbonGrams / 120).toFixed(3),
        hoursStreamingVideo: (carbonGrams / 36).toFixed(2),
        treeDaysAbsorption: (carbonGrams / 22).toFixed(2),
    };
}
