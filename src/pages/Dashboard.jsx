import { useState, useEffect, useRef } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Link } from 'react-router-dom';
import { Leaf, Zap, Battery, BarChart3, TrendingDown, TrendingUp, Play, Square, Cpu, HardDrive, History, Settings, CircleDot, Activity, ArrowRight, CheckCircle } from 'lucide-react';
import * as api from '../api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Dashboard() {
    const [summary, setSummary] = useState({ totalRuns: 0, totalCarbon: '0', totalEnergy: '0', trend: '0' });
    const [runs, setRuns] = useState([]);
    const [liveStats, setLiveStats] = useState(null);
    const [profiling, setProfiling] = useState({ active: false });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profilingTime, setProfilingTime] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const [summaryData, runsData, profilingStatus] = await Promise.all([
                    api.getStatsSummary().catch(() => ({ totalRuns: 0, totalCarbon: '0', totalEnergy: '0', trend: '0' })),
                    api.getRuns({ limit: 10 }).catch(() => []),
                    api.getProfilingStatus().catch(() => ({ active: false })),
                ]);
                setSummary(summaryData);
                setRuns(runsData);
                setProfiling(profilingStatus);
                setLoading(false);
            } catch (err) {
                setError('Cannot connect to API. Run: node server/index.js');
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        let mounted = true;
        async function fetchLive() {
            if (!mounted) return;
            try {
                const stats = await api.getCurrentStats();
                if (mounted) setLiveStats(stats);
            } catch (e) { }
        }
        fetchLive();
        const interval = setInterval(fetchLive, 2000);
        return () => { mounted = false; clearInterval(interval); };
    }, []);

    useEffect(() => {
        if (profiling.active) {
            timerRef.current = setInterval(() => setProfilingTime(t => t + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            setProfilingTime(0);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [profiling.active]);

    const handleStartProfiling = async () => {
        try {
            await api.startProfiling({ project: 'CarbonLint Dashboard', command: 'Live monitoring' });
            setProfiling({ active: true });
        } catch (err) {
            alert('Failed to start: ' + err.message);
        }
    };

    const handleStopProfiling = async () => {
        try {
            const result = await api.stopProfiling();
            setProfiling({ active: false });
            const [runsData, summaryData] = await Promise.all([
                api.getRuns({ limit: 10 }),
                api.getStatsSummary(),
            ]);
            setRuns(runsData);
            setSummary(summaryData);
            alert(`Recorded!\n\nCarbon: ${result.carbon.total_grams.toFixed(4)} gCO2\nDuration: ${result.resources.wall_time.toFixed(1)}s`);
        } catch (err) {
            alert('Failed to stop: ' + err.message);
        }
    };

    const trendData = runs.slice().reverse();
    const trendChartData = {
        labels: trendData.map((_, i) => `${i + 1}`),
        datasets: [{
            label: 'Carbon',
            data: trendData.map(r => r.carbon?.total_grams || 0),
            borderColor: '#22C55E',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true,
            tension: 0.4,
        }],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { color: 'rgba(48, 54, 61, 0.3)' }, ticks: { color: '#8B949E' } },
            y: { grid: { color: 'rgba(48, 54, 61, 0.3)' }, ticks: { color: '#8B949E' } },
        },
    };

    const energyChartData = {
        labels: ['CPU', 'Memory'],
        datasets: [{
            data: liveStats ? [liveStats.cpu?.utilization || 0, parseFloat(liveStats.memory?.usage_percent) || 0] : [50, 50],
            backgroundColor: ['#3B82F6', '#22C55E'],
            borderColor: '#0D1117',
            borderWidth: 4,
        }],
    };

    if (loading) {
        return (
            <div className="animate-fade-in text-center" style={{ padding: '4rem' }}>
                <Leaf size={48} className="text-accent" style={{ margin: '0 auto 1rem' }} />
                <h2>Connecting to CarbonLint API...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="animate-fade-in">
                <div className="card text-center" style={{ padding: '3rem' }}>
                    <Activity size={48} style={{ margin: '0 auto 1rem', color: '#F97316' }} />
                    <h2>API Not Connected</h2>
                    <p className="text-secondary mb-lg">{error}</p>
                    <code style={{ display: 'block', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px' }}>
                        node server/index.js
                    </code>
                    <button className="btn btn-primary mt-lg" onClick={() => window.location.reload()}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header flex justify-between items-start">
                <div>
                    <h1 className="flex items-center gap-sm"><Leaf size={28} /> Dashboard</h1>
                    <p>Real-time carbon footprint monitoring</p>
                </div>
                <div className="flex gap-sm items-center">
                    {profiling.active ? (
                        <>
                            <span className="badge badge-high flex items-center gap-xs"><CircleDot size={14} /> Recording: {profilingTime}s</span>
                            <button className="btn btn-primary flex items-center gap-xs" onClick={handleStopProfiling}><Square size={16} /> Stop</button>
                        </>
                    ) : (
                        <button className="btn btn-primary flex items-center gap-xs" onClick={handleStartProfiling}><Play size={16} /> Start Profiling</button>
                    )}
                </div>
            </div>

            {liveStats && (
                <div className="card mb-lg" style={{ borderColor: '#22C55E', borderWidth: '1px' }}>
                    <div className="flex gap-xl items-center flex-wrap">
                        <span className="badge badge-low flex items-center gap-xs"><CircleDot size={12} /> LIVE</span>
                        <div className="flex items-center gap-xs">
                            <Cpu size={16} className="text-secondary" />
                            <span className="text-secondary">CPU:</span>
                            <strong>{liveStats.cpu.utilization.toFixed(1)}%</strong>
                        </div>
                        <div className="flex items-center gap-xs">
                            <HardDrive size={16} className="text-secondary" />
                            <span className="text-secondary">Memory:</span>
                            <strong>{liveStats.memory.usage_percent}%</strong>
                        </div>
                        <div className="flex items-center gap-xs">
                            <BarChart3 size={16} className="text-secondary" />
                            <span className="text-secondary">Used:</span>
                            <strong>{liveStats.memory.used_mb.toLocaleString()} MB</strong>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-4 mb-xl">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.15)' }}><Zap size={24} /></div>
                    <div className="stat-value mt-md">{summary.totalCarbon}g</div>
                    <div className="stat-label">Total Carbon</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}><Battery size={24} /></div>
                    <div className="stat-value mt-md">{summary.totalEnergy}</div>
                    <div className="stat-label">Energy (kWh)</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#A855F7' }}><BarChart3 size={24} /></div>
                    <div className="stat-value mt-md">{summary.totalRuns}</div>
                    <div className="stat-label">Total Runs</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.15)' }}><TrendingDown size={24} /></div>
                    <div className="stat-value mt-md flex items-center justify-center gap-xs" style={{ color: parseFloat(summary.trend) <= 0 ? '#22C55E' : '#EF4444' }}>
                        {parseFloat(summary.trend) <= 0 ? <TrendingDown size={20} /> : <TrendingUp size={20} />} {Math.abs(parseFloat(summary.trend) || 0)}%
                    </div>
                    <div className="stat-label">Trend</div>
                </div>
            </div>

            <div className="grid grid-2 mb-xl">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title flex items-center gap-sm"><Activity size={18} /> Carbon Trend</h3>
                    </div>
                    <div style={{ height: '250px' }}>
                        {runs.length > 0 ? <Line data={trendChartData} options={chartOptions} /> : (
                            <div className="text-center text-secondary" style={{ paddingTop: '80px' }}>
                                <p>No data yet. Start profiling!</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title flex items-center gap-sm"><Zap size={18} /> Live Usage</h3>
                    </div>
                    <div style={{ height: '250px' }}>
                        <Doughnut data={energyChartData} options={{ responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'right', labels: { color: '#F0F6FC' } } } }} />
                    </div>
                </div>
            </div>

            <div className="card mb-xl">
                <div className="card-header"><h3 className="card-title flex items-center gap-sm"><Zap size={18} /> Quick Actions</h3></div>
                <div className="flex gap-md flex-wrap">
                    <button className={`btn ${profiling.active ? 'btn-outline' : 'btn-primary'} flex items-center gap-xs`} onClick={profiling.active ? handleStopProfiling : handleStartProfiling}>
                        {profiling.active ? <><Square size={16} /> Stop Profiling</> : <><Play size={16} /> Start Profiling</>}
                    </button>
                    <Link to="/history" className="btn btn-secondary flex items-center gap-xs"><History size={16} /> View History</Link>
                    <Link to="/settings" className="btn btn-outline flex items-center gap-xs"><Settings size={16} /> Settings</Link>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title flex items-center gap-sm"><BarChart3 size={18} /> Recent Runs</h3>
                    <Link to="/history" className="btn btn-ghost btn-sm flex items-center gap-xs">View All <ArrowRight size={14} /></Link>
                </div>
                {runs.length > 0 ? (
                    <div className="table-container">
                        <table className="table">
                            <thead><tr><th>ID</th><th>Carbon</th><th>Duration</th><th>Impact</th><th>Time</th></tr></thead>
                            <tbody>
                                {runs.slice(0, 5).map((run) => {
                                    const { color } = api.getImpactLevel(run.carbon?.total_grams || 0);
                                    const ago = Math.floor((Date.now() - new Date(run.timestamp)) / 60000);
                                    return (
                                        <tr key={run.id}>
                                            <td><Link to={`/report/${run.id}`} style={{ color: '#22C55E', fontFamily: 'monospace' }}>{run.id.slice(-8)}</Link></td>
                                            <td style={{ fontWeight: '600' }}>{(run.carbon?.total_grams || 0).toFixed(4)}g</td>
                                            <td>{(run.resources?.wall_time || 0).toFixed(1)}s</td>
                                            <td><span className={`badge badge-${color}`}>{run.impact}</span></td>
                                            <td className="text-secondary">{ago < 60 ? `${ago}m ago` : `${Math.floor(ago / 60)}h ago`}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center text-secondary" style={{ padding: '2rem' }}>
                        <p>No runs yet. Click "Start Profiling" to begin!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
