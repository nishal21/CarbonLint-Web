import { useState, useEffect } from 'react';
import { Lightbulb, AlertCircle, AlertTriangle, Info, Leaf, BarChart3, Globe, Hash } from 'lucide-react';
import * as api from '../api';

export default function Suggestions() {
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

    const generateSuggestions = () => {
        const suggestions = [];
        if (runs.length === 0) return suggestions;

        const avgCpu = runs.reduce((sum, r) => sum + (r.resources?.cpu_utilization || 0), 0) / runs.length;
        const avgMemory = runs.reduce((sum, r) => sum + (r.resources?.memory_avg_percent || 0), 0) / runs.length;
        const totalCarbon = runs.reduce((sum, r) => sum + (r.carbon?.total_grams || 0), 0);
        const avgCarbon = totalCarbon / runs.length;

        if (avgCpu > 70) {
            suggestions.push({
                id: 'high-cpu',
                title: 'High CPU Utilization Detected',
                description: `Average CPU usage across runs is ${avgCpu.toFixed(1)}%. Consider optimizing compute-heavy operations.`,
                severity: avgCpu > 90 ? 'critical' : 'high',
                impact: (avgCpu * 0.01).toFixed(3),
                tags: ['cpu', 'performance'],
            });
        }

        if (avgMemory > 60) {
            suggestions.push({
                id: 'high-memory',
                title: 'High Memory Usage',
                description: `Average memory usage is ${avgMemory.toFixed(1)}%. Consider memory optimization or batch processing.`,
                severity: avgMemory > 80 ? 'high' : 'medium',
                impact: (avgMemory * 0.005).toFixed(3),
                tags: ['memory', 'optimization'],
            });
        }

        if (settings.region === 'GLOBAL-AVG' || settings.region === 'ASIA-SOUTH') {
            suggestions.push({
                id: 'region-optimize',
                title: 'Consider Lower-Carbon Region',
                description: `Your current region (${settings.region}) has higher grid carbon intensity. EU-NORTH (Sweden) has 25 gCO2/kWh.`,
                severity: 'medium',
                impact: (avgCarbon * 0.5).toFixed(3),
                tags: ['region', 'infrastructure'],
            });
        }

        if (runs.length > 0) {
            suggestions.push({
                id: 'batch-processing',
                title: 'Use Batch Processing',
                description: 'Combine multiple small runs into fewer larger batches to reduce overhead energy consumption.',
                severity: 'low',
                impact: (avgCarbon * 0.1).toFixed(3),
                tags: ['efficiency', 'best-practice'],
            });
        }

        suggestions.push({
            id: 'caching',
            title: 'Implement Result Caching',
            description: 'Cache frequently computed results to avoid redundant processing and reduce energy usage.',
            severity: 'low',
            impact: '0.050',
            tags: ['caching', 'optimization'],
        });

        return suggestions;
    };

    const suggestions = generateSuggestions();
    const totalSavings = suggestions.reduce((sum, s) => sum + parseFloat(s.impact || 0), 0);

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'critical': return <AlertCircle size={16} />;
            case 'high': return <AlertTriangle size={16} />;
            case 'medium': return <AlertTriangle size={16} />;
            default: return <Info size={16} />;
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="flex items-center gap-sm"><Lightbulb size={28} /> Optimization Suggestions</h1>
                <p>AI-powered recommendations based on your actual profiling data</p>
            </div>

            <div className="improvement-banner mb-lg">
                <div className="improvement-value flex items-center gap-sm">
                    <Leaf size={24} /> Potential Savings: ~{totalSavings.toFixed(3)} gCO2 per run
                </div>
                <div className="text-secondary mt-sm">Based on analysis of {runs.length} profiling runs</div>
            </div>

            {suggestions.length > 0 ? (
                <div className="flex flex-col gap-md">
                    {suggestions.map((suggestion) => (
                        <div key={suggestion.id} className="suggestion-card">
                            <div className="suggestion-header">
                                <span className={`badge badge-${suggestion.severity} flex items-center gap-xs`}>
                                    {getSeverityIcon(suggestion.severity)} {suggestion.severity.toUpperCase()}
                                </span>
                                <div style={{ flex: 1 }}>
                                    <div className="suggestion-title">{suggestion.title}</div>
                                    <div className="text-secondary text-sm mt-xs">{suggestion.description}</div>
                                </div>
                                <div className="suggestion-impact">-{suggestion.impact}g CO2</div>
                            </div>
                            <div className="flex gap-sm mt-md flex-wrap">
                                {suggestion.tags.map(tag => (
                                    <span key={tag} className="badge flex items-center gap-xs" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                                        <Hash size={10} />{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card text-center" style={{ padding: '3rem' }}>
                    <Lightbulb size={48} style={{ margin: '0 auto 1rem', opacity: 0.5, color: '#22C55E' }} />
                    <h3>No Suggestions</h3>
                    <p className="text-secondary">Your runs look efficient! Record more profiling sessions to get personalized recommendations.</p>
                </div>
            )}

            <div className="card mt-lg">
                <div className="card-header"><h3 className="card-title flex items-center gap-sm"><BarChart3 size={18} /> Your Profile Summary</h3></div>
                <div className="grid grid-4">
                    <div className="text-center">
                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{runs.length}</div>
                        <div className="text-secondary text-sm">Total Runs</div>
                    </div>
                    <div className="text-center">
                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                            {runs.length > 0 ? (runs.reduce((s, r) => s + (r.carbon?.total_grams || 0), 0) / runs.length).toFixed(4) : '0'}g
                        </div>
                        <div className="text-secondary text-sm">Avg Carbon</div>
                    </div>
                    <div className="text-center">
                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}><Globe size={20} style={{ display: 'inline', marginRight: '4px' }} />{settings.region || 'N/A'}</div>
                        <div className="text-secondary text-sm">Region</div>
                    </div>
                    <div className="text-center">
                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{suggestions.length}</div>
                        <div className="text-secondary text-sm">Suggestions</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
