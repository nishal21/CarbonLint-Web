import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { GitCompare, Pin, Target, Globe, Zap, Clock, Cpu, HardDrive, CheckCircle, AlertCircle } from 'lucide-react';
import * as api from '../api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Compare() {
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [baseRun, setBaseRun] = useState(null);
    const [headRun, setHeadRun] = useState(null);

    useEffect(() => {
        async function fetchRuns() {
            try {
                const data = await api.getRuns({ limit: 20 });
                setRuns(data);
                if (data.length >= 2) {
                    setBaseRun(data[1]);
                    setHeadRun(data[0]);
                } else if (data.length === 1) {
                    setBaseRun(data[0]);
                    setHeadRun(data[0]);
                }
                setLoading(false);
            } catch (err) {
                setLoading(false);
            }
        }
        fetchRuns();
    }, []);

    if (loading) {
        return (
            <div className="animate-fade-in text-center" style={{ padding: '4rem' }}>
                <h2>Loading...</h2>
            </div>
        );
    }

    if (runs.length < 2) {
        return (
            <div className="animate-fade-in">
                <div className="page-header">
                    <h1 className="flex items-center gap-sm"><GitCompare size={28} /> Compare Runs</h1>
                    <p>Compare carbon footprint between profiling sessions</p>
                </div>
                <div className="card text-center" style={{ padding: '3rem' }}>
                    <GitCompare size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <h3>Not Enough Data</h3>
                    <p className="text-secondary">You need at least 2 profiling runs to compare. Record more sessions from the Dashboard!</p>
                </div>
            </div>
        );
    }

    const baseCarbonG = baseRun?.carbon?.total_grams || 0;
    const headCarbonG = headRun?.carbon?.total_grams || 0;
    const carbonDiff = headCarbonG - baseCarbonG;
    const carbonPercent = baseCarbonG > 0 ? ((carbonDiff / baseCarbonG) * 100) : 0;

    const baseEnergyWh = (baseRun?.energy?.total_kwh || 0) * 1000;
    const headEnergyWh = (headRun?.energy?.total_kwh || 0) * 1000;
    const energyDiff = headEnergyWh - baseEnergyWh;
    const energyPercent = baseEnergyWh > 0 ? ((energyDiff / baseEnergyWh) * 100) : 0;

    const baseDuration = baseRun?.resources?.wall_time || 0;
    const headDuration = headRun?.resources?.wall_time || 0;
    const durationDiff = headDuration - baseDuration;
    const durationPercent = baseDuration > 0 ? ((durationDiff / baseDuration) * 100) : 0;

    const isImproved = carbonPercent < 0;

    const chartData = {
        labels: ['Carbon (gCO2)', 'Energy (Wh)', 'Duration (s)'],
        datasets: [
            { label: 'Base Run', data: [baseCarbonG, baseEnergyWh, baseDuration], backgroundColor: '#6B7280' },
            { label: 'Head Run', data: [headCarbonG, headEnergyWh, headDuration], backgroundColor: isImproved ? '#22C55E' : '#EF4444' },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { color: '#F0F6FC' } } },
        scales: {
            x: { ticks: { color: '#8B949E' }, grid: { color: 'rgba(48, 54, 61, 0.3)' } },
            y: { ticks: { color: '#8B949E' }, grid: { color: 'rgba(48, 54, 61, 0.3)' } },
        },
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="flex items-center gap-sm"><GitCompare size={28} /> Compare Runs</h1>
                <p>Compare carbon footprint between profiling sessions</p>
            </div>

            <div className="grid grid-2 mb-lg">
                <div className="card">
                    <h3 className="mb-md flex items-center gap-sm"><Pin size={18} /> Base Run</h3>
                    <select className="input" value={baseRun?.id || ''} onChange={(e) => setBaseRun(runs.find(r => r.id === e.target.value))}>
                        {runs.map(run => (<option key={run.id} value={run.id}>{run.id.slice(-8)} - {(run.carbon?.total_grams || 0).toFixed(4)}g</option>))}
                    </select>
                    <div className="mt-md text-secondary text-sm">
                        Carbon: <strong>{baseCarbonG.toFixed(4)}g</strong> | Energy: <strong>{baseEnergyWh.toFixed(4)} Wh</strong>
                    </div>
                </div>
                <div className="card">
                    <h3 className="mb-md flex items-center gap-sm"><Target size={18} /> Head Run</h3>
                    <select className="input" value={headRun?.id || ''} onChange={(e) => setHeadRun(runs.find(r => r.id === e.target.value))}>
                        {runs.map(run => (<option key={run.id} value={run.id}>{run.id.slice(-8)} - {(run.carbon?.total_grams || 0).toFixed(4)}g</option>))}
                    </select>
                    <div className="mt-md text-secondary text-sm">
                        Carbon: <strong>{headCarbonG.toFixed(4)}g</strong> | Energy: <strong>{headEnergyWh.toFixed(4)} Wh</strong>
                    </div>
                </div>
            </div>

            <div className="improvement-banner mb-lg" style={{ background: isImproved ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', borderColor: isImproved ? '#22C55E' : '#EF4444' }}>
                <div className="improvement-value flex items-center gap-sm" style={{ color: isImproved ? '#22C55E' : '#EF4444' }}>
                    {isImproved ? <CheckCircle size={24} /> : <AlertCircle size={24} />} {carbonPercent >= 0 ? '+' : ''}{carbonPercent.toFixed(1)}% Carbon
                </div>
                <div className="text-secondary mt-sm">
                    {isImproved ? `Great! ${Math.abs(carbonDiff).toFixed(4)}g CO2 saved per run` : `${Math.abs(carbonDiff).toFixed(4)}g CO2 more than base run`}
                </div>
            </div>

            <div className="card mb-lg">
                <div className="card-header"><h3 className="card-title flex items-center gap-sm"><GitCompare size={18} /> Comparison Chart</h3></div>
                <div style={{ height: '300px' }}><Bar data={chartData} options={chartOptions} /></div>
            </div>

            <div className="card">
                <div className="card-header"><h3 className="card-title flex items-center gap-sm"><GitCompare size={18} /> Detailed Breakdown</h3></div>
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Metric</th><th>Base</th><th>Head</th><th>Change</th></tr></thead>
                        <tbody>
                            <tr>
                                <td className="flex items-center gap-xs"><Globe size={14} /> Carbon</td>
                                <td>{baseCarbonG.toFixed(4)} gCO2</td>
                                <td>{headCarbonG.toFixed(4)} gCO2</td>
                                <td style={{ color: carbonPercent <= 0 ? '#22C55E' : '#EF4444', fontWeight: '600' }}>{carbonPercent >= 0 ? '+' : ''}{carbonPercent.toFixed(1)}%</td>
                            </tr>
                            <tr>
                                <td className="flex items-center gap-xs"><Zap size={14} /> Energy</td>
                                <td>{baseEnergyWh.toFixed(4)} Wh</td>
                                <td>{headEnergyWh.toFixed(4)} Wh</td>
                                <td style={{ color: energyPercent <= 0 ? '#22C55E' : '#EF4444', fontWeight: '600' }}>{energyPercent >= 0 ? '+' : ''}{energyPercent.toFixed(1)}%</td>
                            </tr>
                            <tr>
                                <td className="flex items-center gap-xs"><Clock size={14} /> Duration</td>
                                <td>{baseDuration.toFixed(1)}s</td>
                                <td>{headDuration.toFixed(1)}s</td>
                                <td style={{ color: durationPercent <= 0 ? '#22C55E' : '#EF4444', fontWeight: '600' }}>{durationPercent >= 0 ? '+' : ''}{durationPercent.toFixed(1)}%</td>
                            </tr>
                            <tr>
                                <td className="flex items-center gap-xs"><Cpu size={14} /> CPU Avg</td>
                                <td>{(baseRun?.resources?.cpu_utilization || 0).toFixed(1)}%</td>
                                <td>{(headRun?.resources?.cpu_utilization || 0).toFixed(1)}%</td>
                                <td>-</td>
                            </tr>
                            <tr>
                                <td className="flex items-center gap-xs"><HardDrive size={14} /> Memory Peak</td>
                                <td>{(baseRun?.resources?.memory_peak_mb || 0).toLocaleString()} MB</td>
                                <td>{(headRun?.resources?.memory_peak_mb || 0).toLocaleString()} MB</td>
                                <td>-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
