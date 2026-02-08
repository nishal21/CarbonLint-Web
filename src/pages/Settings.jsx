import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Globe, Gauge, Target, Lightbulb, Save } from 'lucide-react';
import * as api from '../api';

export default function Settings() {
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState(null);
    const [carbonIntensity, setCarbonIntensity] = useState({});
    const [hardwareProfiles, setHardwareProfiles] = useState({});
    const [loading, setLoading] = useState(true);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                const [settingsData, intensityData, profilesData] = await Promise.all([
                    api.getSettings(),
                    api.getCarbonIntensity(),
                    api.getHardwareProfiles(),
                ]);
                setSettings(settingsData);
                setCarbonIntensity(intensityData);
                setHardwareProfiles(profilesData);
                setLoading(false);
            } catch (err) {
                console.error('Failed to load settings:', err);
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const tabs = [
        { id: 'general', label: 'General', icon: SettingsIcon },
        { id: 'carbon', label: 'Carbon', icon: Globe },
        { id: 'thresholds', label: 'Thresholds', icon: Target },
        { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
    ];

    const Toggle = ({ checked, onChange }) => (
        <div className={`toggle ${checked ? 'active' : ''}`} onClick={() => onChange(!checked)} style={{ cursor: 'pointer' }} />
    );

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setSaveMessage('');
    };

    const handleSave = async () => {
        try {
            await api.saveSettings(settings);
            setSaveMessage('Configuration saved successfully!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (err) {
            setSaveMessage('Failed to save settings');
        }
    };

    if (loading || !settings) {
        return (
            <div className="animate-fade-in text-center" style={{ padding: '4rem' }}>
                <h2>Loading Settings...</h2>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="flex items-center gap-sm"><SettingsIcon size={28} /> Settings & Configuration</h1>
                <p>Configure CarbonLint for your environment</p>
            </div>

            <div className="flex gap-lg">
                <div className="card" style={{ width: '200px', flexShrink: 0, height: 'fit-content' }}>
                    <div className="flex flex-col gap-xs">
                        {tabs.map(({ id, label, icon: Icon }) => (
                            <button key={id} className={`btn ${activeTab === id ? 'btn-secondary' : 'btn-ghost'}`} style={{ justifyContent: 'flex-start', gap: '10px' }} onClick={() => setActiveTab(id)}>
                                <Icon size={16} />
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ flex: 1 }}>
                    {activeTab === 'general' && (
                        <div>
                            <h3 className="mb-lg flex items-center gap-sm"><SettingsIcon size={20} /> General Settings</h3>
                            <div className="flex flex-col gap-lg">
                                <div>
                                    <label className="text-secondary text-sm mb-sm" style={{ display: 'block' }}>Hardware Profile</label>
                                    <select className="input" value={settings.hardwareProfile} onChange={(e) => updateSetting('hardwareProfile', e.target.value)}>
                                        {Object.keys(hardwareProfiles).map((key) => (
                                            <option key={key} value={key}>{key}</option>
                                        ))}
                                    </select>
                                    <p className="text-secondary text-sm mt-sm">Determines power consumption estimates for your hardware type</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'carbon' && (
                        <div>
                            <h3 className="mb-lg flex items-center gap-sm"><Globe size={20} /> Carbon Calculation</h3>
                            <div className="flex flex-col gap-lg">
                                <div>
                                    <label className="text-secondary text-sm mb-sm" style={{ display: 'block' }}>Region (Grid Carbon Intensity)</label>
                                    <select className="input" value={settings.region} onChange={(e) => updateSetting('region', e.target.value)}>
                                        {Object.entries(carbonIntensity).map(([key, data]) => (
                                            <option key={key} value={key}>{key} ({data.region}) - {data.gco2_kwh} gCO2/kWh</option>
                                        ))}
                                    </select>
                                    <p className="text-secondary text-sm mt-sm">Select your electricity grid region for accurate emissions calculation</p>
                                </div>
                                <div>
                                    <label className="text-secondary text-sm mb-sm" style={{ display: 'block' }}>
                                        PUE (Power Usage Effectiveness): <strong style={{ color: 'var(--accent-green)' }}>{settings.pue}</strong>
                                    </label>
                                    <input type="range" min="1.0" max="2.0" step="0.05" value={settings.pue} onChange={(e) => updateSetting('pue', parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#22C55E' }} />
                                    <div className="flex justify-between text-secondary text-sm mt-sm">
                                        <span>1.0 (Efficient)</span>
                                        <span>2.0 (Inefficient DC)</span>
                                    </div>
                                    <p className="text-secondary text-sm mt-sm">Data center overhead multiplier (1.0 for local machines)</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'thresholds' && (
                        <div>
                            <h3 className="mb-lg flex items-center gap-sm"><Target size={20} /> Threshold Settings</h3>
                            <div className="flex flex-col gap-lg">
                                <div>
                                    <label className="text-secondary text-sm mb-sm" style={{ display: 'block' }}>Max Carbon per Run (gCO2)</label>
                                    <input type="number" className="input" style={{ width: '200px' }} value={settings.maxCarbon} onChange={(e) => updateSetting('maxCarbon', parseInt(e.target.value))} />
                                </div>
                                <div>
                                    <label className="text-secondary text-sm mb-sm" style={{ display: 'block' }}>Max Energy per Run (kWh)</label>
                                    <input type="number" className="input" style={{ width: '200px' }} step="0.1" value={settings.maxEnergy} onChange={(e) => updateSetting('maxEnergy', parseFloat(e.target.value))} />
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-medium">Fail CI on Threshold Exceeded</div>
                                        <div className="text-secondary text-sm">Exit with error code if thresholds are exceeded</div>
                                    </div>
                                    <Toggle checked={settings.failOnThreshold} onChange={(v) => updateSetting('failOnThreshold', v)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'suggestions' && (
                        <div>
                            <h3 className="mb-lg flex items-center gap-sm"><Lightbulb size={20} /> Suggestion Settings</h3>
                            <div className="flex flex-col gap-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-medium">Enable Suggestions</div>
                                        <div className="text-secondary text-sm">Show optimization recommendations</div>
                                    </div>
                                    <Toggle checked={settings.suggestionsEnabled} onChange={(v) => updateSetting('suggestionsEnabled', v)} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-md items-center mt-xl" style={{ borderTop: '1px solid var(--border-secondary)', paddingTop: 'var(--space-lg)' }}>
                        <button className="btn btn-primary flex items-center gap-xs" onClick={handleSave}>
                            <Save size={16} /> Save Configuration
                        </button>
                        {saveMessage && (
                            <span style={{ color: saveMessage.includes('success') ? '#22C55E' : '#EF4444', fontWeight: '500' }}>{saveMessage}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
