// CarbonLint Mock Data - Based on design.md specifications

// Carbon intensity database from design.md
export const carbonIntensityDB = {
    'US-WEST': { region: 'California', source: 'CAISO', gco2_kwh: 210 },
    'US-EAST': { region: 'Virginia', source: 'PJM', gco2_kwh: 380 },
    'EU-WEST': { region: 'Ireland', source: 'EirGrid', gco2_kwh: 300 },
    'EU-NORTH': { region: 'Sweden', source: 'Svenska Kraftnat', gco2_kwh: 25 },
    'ASIA-EAST': { region: 'Japan', source: 'TEPCO', gco2_kwh: 470 },
    'ASIA-SOUTH': { region: 'India', source: 'CEA', gco2_kwh: 700 },
    'GLOBAL-AVG': { region: 'Mixed', source: 'Mixed', gco2_kwh: 475 },
};

// Hardware profiles from design.md
export const hardwareProfiles = {
    'apple_m1': { cpu_tdp: 15, gpu_tdp: 15, memory_watts_per_gb: 0.25 },
    'apple_m2_pro': { cpu_tdp: 30, gpu_tdp: 25, memory_watts_per_gb: 0.25 },
    'intel_i7_13700k': { cpu_tdp: 125, gpu_tdp: 0, memory_watts_per_gb: 0.3725 },
    'aws_t3_medium': { cpu_tdp: 8.5, gpu_tdp: 0, memory_watts_per_gb: 0.3725, pue: 1.135 },
    'aws_p3_2xlarge': { cpu_tdp: 65, gpu_tdp: 300, memory_watts_per_gb: 0.3725, pue: 1.135 },
};

// Impact level thresholds
export const getImpactLevel = (carbonGrams) => {
    if (carbonGrams < 1) return { level: 'LOW', color: 'low' };
    if (carbonGrams < 10) return { level: 'MEDIUM', color: 'medium' };
    if (carbonGrams < 100) return { level: 'HIGH', color: 'high' };
    return { level: 'EXTREME', color: 'critical' };
};

// Calculate carbon equivalents from design.md
export const calculateEquivalents = (carbonGrams) => ({
    smartphoneCharges: (carbonGrams / 8.22).toFixed(2),
    kmDrivenCar: (carbonGrams / 121).toFixed(3),
    googleSearches: (carbonGrams / 0.2).toFixed(1),
    hoursStreamingVideo: (carbonGrams / 36).toFixed(3),
    treeSecondsAbsorbed: (carbonGrams / (22000 / 365 / 24 / 3600)).toFixed(0),
});

// Sample runs data
export const recentRuns = [
    {
        id: 'cl_20260208_abc123',
        project: 'my-ml-pipeline',
        command: 'python train.py',
        branch: 'main',
        commit: 'a1b2c3d',
        timestamp: '2026-02-08T14:30:00Z',
        resources: {
            cpu_time_user: 45.2,
            cpu_time_system: 3.1,
            cpu_utilization: 78,
            memory_peak_mb: 1240,
            memory_avg_mb: 980,
            disk_read_mb: 850,
            disk_write_mb: 120,
            net_sent_mb: 2,
            net_recv_mb: 25,
            gpu_utilization: 78,
            wall_time: 52.8,
        },
        energy: {
            cpu_kwh: 0.00212,
            gpu_kwh: 0.00096,
            memory_kwh: 0.00024,
            disk_kwh: 0.00007,
            network_kwh: 0.00003,
            total_kwh: 0.00342,
        },
        carbon: {
            total_grams: 0.72,
            intensity: 210,
            region: 'US-WEST',
            pue: 1.0,
        },
        impact: 'LOW',
    },
    {
        id: 'cl_20260208_def456',
        project: 'my-ml-pipeline',
        command: 'python evaluate.py',
        branch: 'main',
        commit: 'd4e5f6g',
        timestamp: '2026-02-08T13:45:00Z',
        resources: {
            cpu_time_user: 12.5,
            cpu_time_system: 1.2,
            cpu_utilization: 45,
            memory_peak_mb: 560,
            memory_avg_mb: 420,
            disk_read_mb: 200,
            disk_write_mb: 50,
            net_sent_mb: 1,
            net_recv_mb: 5,
            gpu_utilization: 35,
            wall_time: 15.2,
        },
        energy: {
            cpu_kwh: 0.00058,
            gpu_kwh: 0.00025,
            memory_kwh: 0.00008,
            disk_kwh: 0.00002,
            network_kwh: 0.00001,
            total_kwh: 0.00094,
        },
        carbon: {
            total_grams: 0.20,
            intensity: 210,
            region: 'US-WEST',
            pue: 1.0,
        },
        impact: 'LOW',
    },
    {
        id: 'cl_20260207_ghi789',
        project: 'data-processor',
        command: 'npm run build',
        branch: 'feature/optimize',
        commit: 'h7i8j9k',
        timestamp: '2026-02-07T18:20:00Z',
        resources: {
            cpu_time_user: 85.3,
            cpu_time_system: 12.8,
            cpu_utilization: 92,
            memory_peak_mb: 3200,
            memory_avg_mb: 2400,
            disk_read_mb: 1500,
            disk_write_mb: 800,
            net_sent_mb: 50,
            net_recv_mb: 200,
            gpu_utilization: 0,
            wall_time: 98.5,
        },
        energy: {
            cpu_kwh: 0.0098,
            gpu_kwh: 0,
            memory_kwh: 0.0012,
            disk_kwh: 0.00025,
            network_kwh: 0.015,
            total_kwh: 0.02725,
        },
        carbon: {
            total_grams: 5.72,
            intensity: 210,
            region: 'US-WEST',
            pue: 1.0,
        },
        impact: 'MEDIUM',
    },
    {
        id: 'cl_20260207_jkl012',
        project: 'api-server',
        command: 'pytest tests/',
        branch: 'main',
        commit: 'l0m1n2o',
        timestamp: '2026-02-07T16:10:00Z',
        resources: {
            cpu_time_user: 28.6,
            cpu_time_system: 5.4,
            cpu_utilization: 65,
            memory_peak_mb: 890,
            memory_avg_mb: 720,
            disk_read_mb: 350,
            disk_write_mb: 80,
            net_sent_mb: 5,
            net_recv_mb: 15,
            gpu_utilization: 0,
            wall_time: 35.2,
        },
        energy: {
            cpu_kwh: 0.0015,
            gpu_kwh: 0,
            memory_kwh: 0.00035,
            disk_kwh: 0.00005,
            network_kwh: 0.0012,
            total_kwh: 0.0031,
        },
        carbon: {
            total_grams: 0.65,
            intensity: 210,
            region: 'US-WEST',
            pue: 1.0,
        },
        impact: 'LOW',
    },
    {
        id: 'cl_20260206_mno345',
        project: 'ml-training',
        command: 'python train_large.py',
        branch: 'main',
        commit: 'p3q4r5s',
        timestamp: '2026-02-06T22:30:00Z',
        resources: {
            cpu_time_user: 3600,
            cpu_time_system: 450,
            cpu_utilization: 95,
            memory_peak_mb: 32000,
            memory_avg_mb: 28000,
            disk_read_mb: 50000,
            disk_write_mb: 15000,
            net_sent_mb: 500,
            net_recv_mb: 2000,
            gpu_utilization: 98,
            wall_time: 4200,
        },
        energy: {
            cpu_kwh: 0.125,
            gpu_kwh: 0.35,
            memory_kwh: 0.029,
            disk_kwh: 0.007,
            network_kwh: 0.15,
            total_kwh: 0.661,
        },
        carbon: {
            total_grams: 138.81,
            intensity: 210,
            region: 'US-WEST',
            pue: 1.0,
        },
        impact: 'EXTREME',
    },
];

// Suggestions data based on design.md suggestion rules
export const suggestions = [
    {
        id: 'sug_001',
        rule_id: 'CachingOpportunityRule',
        title: 'Cache dataset loading',
        description: 'Dataset loaded 3 times with identical arguments. Implement caching to avoid redundant I/O operations.',
        severity: 'critical',
        impact_score: 0.3,
        code_reference: 'train.py:45',
        fix_example: `# Before
data = load_dataset("large_dataset.csv")

# After  
@lru_cache(maxsize=1)
def get_cached_dataset():
    return load_dataset("large_dataset.csv")
    
data = get_cached_dataset()`,
        tags: ['caching', 'io', 'memory'],
    },
    {
        id: 'sug_002',
        rule_id: 'UnnecessaryComputationRule',
        title: 'Use mixed precision training',
        description: 'Training using FP32. Switch to mixed precision (FP16/BF16) for faster training and lower energy consumption.',
        severity: 'high',
        impact_score: 0.15,
        code_reference: 'train.py:78',
        fix_example: `# Before
model = Model()
model.train(data)

# After
from torch.cuda.amp import autocast, GradScaler
scaler = GradScaler()

with autocast():
    output = model(data)
    loss = criterion(output, target)`,
        tags: ['gpu', 'optimization', 'training'],
    },
    {
        id: 'sug_003',
        rule_id: 'BatchProcessingRule',
        title: 'Batch database writes',
        description: '500 individual INSERT statements detected. Use bulk insert for significantly reduced I/O overhead.',
        severity: 'medium',
        impact_score: 0.12,
        code_reference: 'db_utils.py:122',
        fix_example: `# Before
for item in items:
    db.execute("INSERT INTO table VALUES (?)", item)

# After
db.executemany("INSERT INTO table VALUES (?)", items)`,
        tags: ['database', 'io', 'batching'],
    },
    {
        id: 'sug_004',
        rule_id: 'RegionOptimizationRule',
        title: 'Consider EU-NORTH region',
        description: 'Currently running in US-WEST (210 gCO2/kWh). EU-NORTH has 25 gCO2/kWh - an 88% reduction in carbon intensity.',
        severity: 'low',
        impact_score: 0.5,
        code_reference: null,
        fix_example: `# Update .carbonlint.toml
[carbon]
region = "EU-NORTH"  # Was US-WEST`,
        tags: ['region', 'infrastructure'],
    },
    {
        id: 'sug_005',
        rule_id: 'EfficientDataStructureRule',
        title: 'Replace list.index() with set lookup',
        description: 'Using list.index() in loop - O(n) per lookup. Convert to set for O(1) lookups.',
        severity: 'medium',
        impact_score: 0.08,
        code_reference: 'processor.py:234',
        fix_example: `# Before
if item in my_list:
    idx = my_list.index(item)

# After
my_set = set(my_list)
if item in my_set:
    # O(1) lookup`,
        tags: ['algorithm', 'performance'],
    },
];

// Carbon trend data (last 30 days)
export const carbonTrendData = {
    labels: Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    values: [
        15.2, 14.8, 12.1, 16.5, 13.2, 11.8, 14.3, 13.1, 12.5, 11.2,
        10.8, 13.4, 12.9, 11.5, 10.2, 9.8, 12.3, 11.1, 10.5, 9.2,
        8.8, 11.2, 10.1, 9.5, 8.2, 7.8, 10.5, 9.2, 8.5, 7.5
    ],
};

// Energy breakdown percentages
export const energyBreakdown = {
    cpu: 62,
    gpu: 28,
    memory: 7,
    io: 3,
};

// CI/CD Pipeline data
export const pipelineBuilds = [
    { id: '#456', branch: 'main', commit: 'a1b2c3d', carbon: 8.2, threshold: 20, status: 'pass', time: '2 mins ago' },
    { id: '#455', branch: 'feature/auth', commit: 'e4f5g6h', carbon: 15.8, threshold: 20, status: 'warning', time: '15 mins ago' },
    { id: '#454', branch: 'fix/memory', commit: 'i7j8k9l', carbon: 45.2, threshold: 20, status: 'fail', time: '1 hour ago' },
    { id: '#453', branch: 'main', commit: 'm0n1o2p', carbon: 7.5, threshold: 20, status: 'pass', time: '2 hours ago' },
];

// Comparison data
export const comparisonData = {
    base: {
        branch: 'main',
        carbon: 12.5,
        energy: 0.059,
        runtime: 128,
        impact: 'MEDIUM',
    },
    head: {
        branch: 'feature/optimize-queries',
        carbon: 3.2,
        energy: 0.015,
        runtime: 34,
        impact: 'LOW',
    },
};

// Dashboard summary stats
export const dashboardStats = {
    totalCarbon: 72.5,
    totalEnergy: 0.034,
    totalRuns: 156,
    avgCarbon: 0.46,
    trend: -18.5, // percentage decrease
};

// History filter options
export const historyFilters = {
    dateRanges: ['7d', '30d', '90d', '1y', 'All'],
    projects: ['All Projects', 'my-ml-pipeline', 'data-processor', 'api-server', 'ml-training'],
    branches: ['All Branches', 'main', 'develop', 'feature/*'],
    impactLevels: ['All', 'LOW', 'MEDIUM', 'HIGH', 'EXTREME'],
};
