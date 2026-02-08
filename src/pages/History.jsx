import { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Target, Battery, Activity, FileText, Filter, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import * as api from '../api';

export default function History() {
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeRange, setActiveRange] = useState('all');

    useEffect(() => {
        async function fetchRuns() {
            try {
                const data = await api.getRuns({ limit: 100 });
                setRuns(data);
                setLoading(false);
            } catch (err) {
                setLoading(false);
            }
        }
        fetchRuns();
    }, []);

    const filterRuns = () => {
        const now = new Date();
        return runs.filter(run => {
            const runDate = new Date(run.timestamp);
            switch (activeRange) {
                case '7d': return (now - runDate) / 86400000 <= 7;
                case '30d': return (now - runDate) / 86400000 <= 30;
                case '90d': return (now - runDate) / 86400000 <= 90;
                default: return true;
            }
        });
    };

    const filteredRuns = filterRuns();
    const totalCarbon = filteredRuns.reduce((sum, r) => sum + (r.carbon?.total_grams || 0), 0);
    const avgCarbon = filteredRuns.length > 0 ? totalCarbon / filteredRuns.length : 0;

    const midpoint = Math.floor(filteredRuns.length / 2);
    const recent = filteredRuns.slice(0, midpoint);
    const older = filteredRuns.slice(midpoint);
    const recentAvg = recent.length > 0 ? recent.reduce((s, r) => s + (r.carbon?.total_grams || 0), 0) / recent.length : 0;
    const olderAvg = older.length > 0 ? older.reduce((s, r) => s + (r.carbon?.total_grams || 0), 0) / older.length : 0;
    const trend = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

    const trendData = filteredRuns.slice().reverse();
    const trendChartData = {
        labels: trendData.map((_, i) => `Run ${i + 1}`),
        datasets: [{
            label: 'Carbon (gCO2)',
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

    const impactDist = { low: 0, medium: 0, high: 0 };
    filteredRuns.forEach(r => {
        const c = r.carbon?.total_grams || 0;
        if (c < 1) impactDist.low++;
        else if (c < 10) impactDist.medium++;
        else impactDist.high++;
    });

    const impactChartData = {
        labels: ['Low', 'Medium', 'High'],
        datasets: [{
            data: [impactDist.low, impactDist.medium, impactDist.high],
            backgroundColor: ['#22C55E', '#F97316', '#EF4444'],
            borderColor: '#0D1117',
            borderWidth: 4,
        }],
    };

    if (loading) {
        return (
            <div className="animate-fade-in text-center" style={{ padding: '4rem' }}>
                <h2>Loading History...</h2>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header flex justify-between items-start">
                <div>
                    <h1 className="flex items-center gap-sm"><TrendingUp size={28} /> Carbon History</h1>
                    <p>Historical carbon footprint analytics from real profiling sessions</p>
                </div>
            </div>

            <div className="tabs mb-lg">
                {['7d', '30d', '90d', 'all'].map((range) => (
                    <button key={range} className={`tab ${activeRange === range ? 'active' : ''}`} onClick={() => setActiveRange(range)}>
                        {range === 'all' ? 'All Time' : range}
                    </button>
                ))}
            </div>

            <div className="grid grid-4 mb-lg">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.15)' }}><Activity size={24} /></div>
                    <div className="stat-value mt-md">{avgCarbon.toFixed(2)}g</div>
                    <div className="stat-label">Avg Carbon per Run</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}><Target size={24} /></div>
                    <div className="stat-value mt-md">{totalCarbon.toFixed(2)}g</div>
                    <div className="stat-label">Total Carbon</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#A855F7' }}><TrendingUp size={24} /></div>
                    <div className="stat-value mt-md flex items-center justify-center gap-xs" style={{ color: trend <= 0 ? '#22C55E' : '#EF4444' }}>
                        {trend <= 0 ? <TrendingDown size={20} /> : <TrendingUp size={20} />} {Math.abs(trend).toFixed(1)}%
                    </div>
                    <div className="stat-label">Trend</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.15)' }}><Battery size={24} /></div>
                    <div className="stat-value mt-md">{filteredRuns.length}</div>
                    <div className="stat-label">Total Runs</div>
                </div>
            </div>

            <div className="grid grid-2 mb-lg">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title flex items-center gap-sm"><TrendingUp size={18} /> Carbon Trend</h3>
                    </div>
                    <div style={{ height: '300px' }}>
                        {filteredRuns.length > 0 ? <Line data={trendChartData} options={chartOptions} /> : (
                            <div className="text-center text-secondary" style={{ paddingTop: '100px' }}>
                                <p>No runs recorded yet. Start profiling to see trends!</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title flex items-center gap-sm"><Target size={18} /> Impact Distribution</h3>
                    </div>
                    <div style={{ height: '300px' }}>
                        {filteredRuns.length > 0 ? (
                            <Doughnut data={impactChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#F0F6FC' } } } }} />
                        ) : (
                            <div className="text-center text-secondary" style={{ paddingTop: '100px' }}><p>No data available</p></div>
                        )}
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title flex items-center gap-sm"><FileText size={18} /> All Runs</h3>
                </div>
                {filteredRuns.length > 0 ? (
                    <div className="table-container">
                        <table className="table">
                            <thead><tr><th>Run ID</th><th>Project</th><th>Carbon</th><th>Energy</th><th>Duration</th><th>Impact</th><th>Date</th></tr></thead>
                            <tbody>
                                {filteredRuns.map((run) => {
                                    const { color } = api.getImpactLevel(run.carbon?.total_grams || 0);
                                    return (
                                        <tr key={run.id}>
                                            <td><Link to={`/report/${run.id}`} style={{ color: '#22C55E', fontFamily: 'monospace' }}>{run.id.slice(-8)}</Link></td>
                                            <td>{run.project}</td>
                                            <td style={{ fontWeight: '600' }}>{(run.carbon?.total_grams || 0).toFixed(4)}g</td>
                                            <td>{((run.energy?.total_kwh || 0) * 1000).toFixed(4)} Wh</td>
                                            <td>{(run.resources?.wall_time || 0).toFixed(1)}s</td>
                                            <td><span className={`badge badge-${color}`}>{run.impact || 'N/A'}</span></td>
                                            <td className="text-secondary">{new Date(run.timestamp).toLocaleString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center text-secondary" style={{ padding: '2rem' }}>
                        <FileText size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                        <p>No profiling runs recorded. Start profiling from the Dashboard!</p>
                        <Link to="/" className="btn btn-primary mt-md flex items-center gap-xs">Go to Dashboard <ArrowRight size={16} /></Link>
                    </div>
                )}
            </div>
        </div>
    );
}
