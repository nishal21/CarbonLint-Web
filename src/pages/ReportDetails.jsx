import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { ArrowLeft, FileText, Folder, Terminal, GitBranch, Clock, Cpu, HardDrive, Wifi, Globe, Zap, Leaf, Smartphone, Search, Car, Tv, GitCompare, Lightbulb, Copy } from 'lucide-react';
import * as api from '../api';

export default function ReportDetails() {
    const { id } = useParams();
    const [run, setRun] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchRun() {
            try {
                const data = await api.getRun(id);
                setRun(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load run details');
                setLoading(false);
            }
        }
        fetchRun();
    }, [id]);

    if (loading) {
        return (
            <div className="animate-fade-in text-center" style={{ padding: '4rem' }}>
                <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <h2>Loading Report...</h2>
            </div>
        );
    }

    if (error || !run) {
        return (
            <div className="animate-fade-in">
                <div className="card text-center" style={{ padding: '3rem' }}>
                    <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5, color: '#F97316' }} />
                    <h2>Report Not Found</h2>
                    <p className="text-secondary mb-lg">{error || 'The requested run could not be found.'}</p>
                    <Link to="/" className="btn btn-primary flex items-center gap-xs" style={{ display: 'inline-flex' }}>
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const { level: impactLevel, color: impactColor } = api.getImpactLevel(run.carbon?.total_grams || 0);
    const equivalents = run.equivalents || api.calculateEquivalents(run.carbon?.total_grams || 0);

    const energyData = {
        labels: ['CPU', 'GPU', 'Memory', 'Disk', 'Network'],
        datasets: [{
            data: [
                (run.energy?.cpu_kwh || 0) * 1000,
                (run.energy?.gpu_kwh || 0) * 1000,
                (run.energy?.memory_kwh || 0) * 1000,
                (run.energy?.disk_kwh || 0) * 1000,
                (run.energy?.network_kwh || 0) * 1000,
            ],
            backgroundColor: ['#3B82F6', '#A855F7', '#22C55E', '#F97316', '#06B6D4'],
            borderColor: '#0D1117',
            borderWidth: 4,
            hoverOffset: 8,
        }],
    };

    const energyOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
            legend: { position: 'right', labels: { color: '#F0F6FC', padding: 12, font: { size: 12 }, usePointStyle: true, pointStyle: 'circle' } },
            tooltip: { backgroundColor: '#161B22', borderColor: '#30363D', borderWidth: 1, callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw.toFixed(4)} Wh` } },
        },
    };

    return (
        <div className="animate-fade-in">
            <div className="flex items-center gap-md mb-lg">
                <Link to="/" className="btn btn-ghost flex items-center gap-xs"><ArrowLeft size={16} /> Back</Link>
                <div>
                    <h1 className="flex items-center gap-sm"><FileText size={28} /> Run Report</h1>
                    <p className="text-secondary" style={{ fontFamily: 'monospace' }}>{run.id}</p>
                </div>
            </div>

            <div className="card mb-lg">
                <div className="flex gap-xl flex-wrap">
                    <div><div className="text-secondary text-sm flex items-center gap-xs"><Folder size={14} /> Project</div><div className="text-primary" style={{ fontWeight: '600' }}>{run.project}</div></div>
                    <div><div className="text-secondary text-sm flex items-center gap-xs"><Terminal size={14} /> Command</div><code style={{ background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: '4px' }}>{run.command}</code></div>
                    <div><div className="text-secondary text-sm flex items-center gap-xs"><GitBranch size={14} /> Branch</div><code style={{ background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: '4px' }}>{run.branch}</code></div>
                    <div><div className="text-secondary text-sm flex items-center gap-xs"><Clock size={14} /> Timestamp</div><div className="text-primary">{new Date(run.timestamp).toLocaleString()}</div></div>
                </div>
            </div>

            <div className="grid grid-3 mb-lg">
                <div className="card">
                    <div className="card-header"><h3 className="card-title flex items-center gap-sm"><Cpu size={18} /> Resource Usage</h3></div>
                    <div className="flex flex-col gap-md">
                        {[
                            { name: 'CPU Utilization', icon: Cpu, value: `${(run.resources?.cpu_utilization || 0).toFixed(1)}%`, percent: run.resources?.cpu_utilization || 0, color: '#3B82F6' },
                            { name: 'Memory Peak', icon: HardDrive, value: `${(run.resources?.memory_peak_mb || 0).toLocaleString()} MB`, percent: run.resources?.memory_avg_percent || 50, color: '#22C55E' },
                        ].map((item) => (
                            <div key={item.name}>
                                <div className="flex justify-between mb-sm">
                                    <span className="flex items-center gap-xs"><item.icon size={14} />{item.name}</span>
                                    <span className="text-secondary text-sm">{item.value}</span>
                                </div>
                                <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min(item.percent, 100)}%`, background: item.color }}></div></div>
                            </div>
                        ))}
                        <div className="flex justify-between mt-md" style={{ borderTop: '1px solid var(--border-secondary)', paddingTop: 'var(--space-md)' }}>
                            <span className="flex items-center gap-xs"><Clock size={14} /> Wall Clock Time</span>
                            <span className="text-accent" style={{ fontWeight: '600' }}>{(run.resources?.wall_time || 0).toFixed(1)}s</span>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header"><h3 className="card-title flex items-center gap-sm"><Zap size={18} /> Energy Consumption</h3></div>
                    <div className="text-center mb-md">
                        <div style={{ fontSize: '2.75rem', fontWeight: '700', color: '#3B82F6' }}>{((run.energy?.total_kwh || 0) * 1000).toFixed(4)}</div>
                        <div className="text-secondary">Wh (Watt-hours)</div>
                    </div>
                    <div style={{ height: '180px' }}><Doughnut data={energyData} options={energyOptions} /></div>
                </div>

                <div className="card">
                    <div className="card-header"><h3 className="card-title flex items-center gap-sm"><Globe size={18} /> Carbon Footprint</h3></div>
                    <div className="text-center mb-lg">
                        <div style={{ fontSize: '3.5rem', fontWeight: '700', color: 'var(--accent-green)' }}>{(run.carbon?.total_grams || 0).toFixed(4)}</div>
                        <div className="text-secondary">gCO2eq</div>
                        <div className="mt-md"><span className={`badge badge-${impactColor}`} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>{impactLevel} Impact</span></div>
                    </div>
                    <div className="flex flex-col gap-sm" style={{ background: 'var(--bg-tertiary)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                        <div className="flex justify-between"><span className="text-secondary">Region</span><span style={{ fontWeight: '500' }}>{run.carbon?.region} ({run.carbon?.intensity} gCO2/kWh)</span></div>
                        <div className="flex justify-between"><span className="text-secondary">PUE</span><span style={{ fontWeight: '500' }}>{run.carbon?.pue}</span></div>
                    </div>
                </div>
            </div>

            <div className="card mb-lg">
                <div className="card-header"><h3 className="card-title flex items-center gap-sm"><Leaf size={18} /> Carbon Equivalents</h3><span className="text-secondary text-sm">What your emissions are equivalent to</span></div>
                <div className="grid grid-4">
                    {[
                        { icon: Smartphone, value: equivalents.smartphoneCharges, label: 'Smartphone charges' },
                        { icon: Search, value: equivalents.googleSearches, label: 'Google searches' },
                        { icon: Car, value: equivalents.kmDrivenCar, label: 'km driven by car' },
                        { icon: Tv, value: equivalents.hoursStreamingVideo, label: 'Hours streaming video' },
                    ].map((item) => (
                        <div key={item.label} className="text-center" style={{ padding: 'var(--space-md)' }}>
                            <item.icon size={32} style={{ margin: '0 auto 8px', color: '#22C55E' }} />
                            <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{item.value}</div>
                            <div className="text-secondary text-sm">{item.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card">
                <div className="card-header"><h3 className="card-title flex items-center gap-sm"><Zap size={18} /> Actions</h3></div>
                <div className="flex gap-md flex-wrap">
                    <Link to="/compare" className="btn btn-primary flex items-center gap-xs"><GitCompare size={16} /> Compare with Another Run</Link>
                    <Link to="/suggestions" className="btn btn-secondary flex items-center gap-xs"><Lightbulb size={16} /> View Suggestions</Link>
                    <button className="btn btn-outline flex items-center gap-xs" onClick={() => navigator.clipboard.writeText(JSON.stringify(run, null, 2))}>
                        <Copy size={16} /> Copy as JSON
                    </button>
                </div>
            </div>
        </div>
    );
}
