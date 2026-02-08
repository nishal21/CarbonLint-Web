import { useState, useEffect } from 'react';
import { GitBranch, Package, CheckCircle, AlertTriangle, XCircle, Clock, Activity, Target, MessageSquare, Gauge, Zap, Globe, Leaf } from 'lucide-react';
import * as api from '../api';

export default function CICD() {
    const [runs, setRuns] = useState([]);
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [runsData, settingsData] = await Promise.all([
                    api.getRuns({ limit: 10 }),
                    api.getSettings(),
                ]);
                setRuns(runsData);
                setSettings(settingsData);
                setLoading(false);
            } catch (err) {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="animate-fade-in text-center" style={{ padding: '4rem' }}>
                <h2>Loading...</h2>
            </div>
        );
    }

    const totalCarbon = runs.reduce((sum, r) => sum + (r.carbon?.total_grams || 0), 0);
    const maxCarbon = settings.maxCarbon || 100;
    const budgetPercent = Math.min((totalCarbon / maxCarbon) * 100, 100);

    const recentBuilds = runs.slice(0, 4).map(run => ({
        id: run.id.slice(-8),
        carbon: (run.carbon?.total_grams || 0).toFixed(4),
        threshold: settings.maxCarbon || 100,
        status: (run.carbon?.total_grams || 0) > (settings.maxCarbon || 100) ? 'fail' :
            (run.carbon?.total_grams || 0) > ((settings.maxCarbon || 100) * 0.8) ? 'warning' : 'pass',
        time: new Date(run.timestamp).toLocaleTimeString(),
        branch: run.branch || 'main',
    }));

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pass': return <CheckCircle size={24} color="#22C55E" />;
            case 'warning': return <AlertTriangle size={24} color="#EAB308" />;
            case 'fail': return <XCircle size={24} color="#EF4444" />;
            default: return <Clock size={24} color="#8B949E" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pass': return '#22C55E';
            case 'warning': return '#EAB308';
            case 'fail': return '#EF4444';
            default: return '#8B949E';
        }
    };

    const baseRun = runs[1];
    const headRun = runs[0];

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="flex items-center gap-sm"><GitBranch size={28} /> CI/CD Integration</h1>
                <p>Monitor carbon footprint in your build pipelines</p>
            </div>

            <div className="card mb-lg">
                <div className="card-header"><h3 className="card-title flex items-center gap-sm"><Package size={18} /> Recent Builds</h3></div>
                {recentBuilds.length > 0 ? (
                    <div className="grid grid-4">
                        {recentBuilds.map((build) => (
                            <div key={build.id} className="card" style={{ borderColor: getStatusColor(build.status), borderWidth: '2px' }}>
                                <div className="flex justify-between items-start mb-md">
                                    <div>
                                        <div className="font-medium" style={{ fontFamily: 'monospace' }}>{build.id}</div>
                                        <code style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{build.branch}</code>
                                    </div>
                                    {getStatusIcon(build.status)}
                                </div>
                                <div className="flex justify-between items-center mb-sm">
                                    <span className="text-secondary text-sm flex items-center gap-xs"><Globe size={12} /> Carbon</span>
                                    <span style={{ color: getStatusColor(build.status), fontWeight: '700' }}>{build.carbon}g</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-secondary text-sm flex items-center gap-xs"><Target size={12} /> Threshold</span>
                                    <span>{build.threshold}g</span>
                                </div>
                                <div className="text-secondary text-sm mt-md flex items-center gap-xs"><Clock size={12} /> {build.time}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-secondary" style={{ padding: '2rem' }}>
                        <Package size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                        <p>No builds recorded. Start profiling to see build status!</p>
                    </div>
                )}
            </div>

            <div className="grid grid-2 mb-lg">
                <div className="card">
                    <div className="card-header"><h3 className="card-title flex items-center gap-sm"><Activity size={18} /> Carbon Budget</h3></div>
                    <div className="text-center mb-lg">
                        <div style={{ fontSize: '3rem', fontWeight: '700' }}>
                            <span style={{ color: budgetPercent > 80 ? '#F97316' : '#22C55E' }}>{totalCarbon.toFixed(2)}</span>
                            <span className="text-secondary" style={{ fontSize: '1.5rem' }}>g</span>
                        </div>
                        <div className="text-secondary">of {maxCarbon}g budget used</div>
                    </div>
                    <div className="progress-bar" style={{ height: '20px', borderRadius: '10px' }}>
                        <div className="progress-fill" style={{ width: `${budgetPercent}%`, borderRadius: '10px', background: budgetPercent > 80 ? 'linear-gradient(90deg, #F97316, #EF4444)' : 'linear-gradient(90deg, #22C55E, #4ADE80)' }}></div>
                    </div>
                    <div className="flex justify-between mt-sm text-secondary text-sm">
                        <span>0g</span>
                        <span style={{ fontWeight: '600' }}>{budgetPercent.toFixed(0)}% used</span>
                        <span>{maxCarbon}g</span>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header"><h3 className="card-title flex items-center gap-sm"><MessageSquare size={18} /> PR Comment Preview</h3></div>
                    {baseRun && headRun ? (
                        <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: 'var(--radius-md)', padding: 'var(--space-lg)' }}>
                            <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Leaf size={18} color="#22C55E" /> CarbonLint - PR Carbon Report
                            </div>
                            <div className="table-container" style={{ marginBottom: 'var(--space-md)' }}>
                                <table className="table" style={{ fontSize: '0.8rem' }}>
                                    <thead><tr><th>Metric</th><th>Base</th><th>PR</th><th>Change</th></tr></thead>
                                    <tbody>
                                        <tr>
                                            <td className="flex items-center gap-xs"><Globe size={12} /> Carbon</td>
                                            <td>{(baseRun.carbon?.total_grams || 0).toFixed(4)}g</td>
                                            <td>{(headRun.carbon?.total_grams || 0).toFixed(4)}g</td>
                                            <td style={{ color: (headRun.carbon?.total_grams || 0) <= (baseRun.carbon?.total_grams || 0) ? '#22C55E' : '#EF4444', fontWeight: '600' }}>
                                                {(((headRun.carbon?.total_grams || 0) - (baseRun.carbon?.total_grams || 0)) / (baseRun.carbon?.total_grams || 1) * 100).toFixed(1)}%
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="flex items-center gap-xs"><Clock size={12} /> Duration</td>
                                            <td>{(baseRun.resources?.wall_time || 0).toFixed(1)}s</td>
                                            <td>{(headRun.resources?.wall_time || 0).toFixed(1)}s</td>
                                            <td>-</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="text-secondary text-sm" style={{ fontStyle: 'italic' }}>
                                Powered by <span style={{ color: '#22C55E' }}>CarbonLint</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-secondary" style={{ padding: '2rem' }}>
                            <MessageSquare size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                            <p>Need at least 2 runs to generate PR comparison</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="card">
                <div className="card-header"><h3 className="card-title flex items-center gap-sm"><Target size={18} /> Active Thresholds</h3></div>
                <div className="grid grid-3">
                    <div style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                        <Gauge size={24} style={{ margin: '0 auto 8px', color: '#22C55E' }} />
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#22C55E' }}>{settings.maxCarbon || 100}g</div>
                        <div className="text-secondary text-sm">Max Carbon</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: 'var(--space-lg)', borderLeft: '1px solid var(--border-secondary)', borderRight: '1px solid var(--border-secondary)' }}>
                        <Zap size={24} style={{ margin: '0 auto 8px', color: '#22C55E' }} />
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#22C55E' }}>{settings.maxEnergy || 0.5} kWh</div>
                        <div className="text-secondary text-sm">Max Energy</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                        <XCircle size={24} style={{ margin: '0 auto 8px', color: settings.failOnThreshold ? '#22C55E' : '#8B949E' }} />
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#22C55E' }}>{settings.failOnThreshold ? 'Yes' : 'No'}</div>
                        <div className="text-secondary text-sm">Fail on Exceed</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
