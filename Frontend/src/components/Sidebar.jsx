import { useState } from 'react';
import {
    Upload, Activity, Zap, BarChart2,
    Lightbulb, Download, Eye, EyeOff, Layers, Settings2,
    BarChart, TrendingUp, PieChart, Target
} from 'lucide-react';

const NAV_ITEMS = [
    { id: 'upload', icon: Upload, label: 'Upload Data' },
    { id: 'health', icon: Activity, label: 'Health Overview' },
    { id: 'refine', icon: Settings2, label: 'Strategic Refiner' },
    { id: 'deep', icon: Layers, label: 'Deep Analysis' },
    { id: 'forecast', icon: Target, label: 'Predictive Unity' },
    { id: 'studio', icon: BarChart2, label: 'Visualization Studio' },
    { id: 'export', icon: Download, label: 'Export Hub' },
];

const CHART_TYPES = [
    { id: 'bar', icon: BarChart, label: 'Bar Analysis' },
    { id: 'line', icon: TrendingUp, label: 'Trend Line' },
    { id: 'pie', icon: PieChart, label: 'Distribution' },
    { id: 'scatter', icon: Target, label: 'Scatter Map' },
];

export default function Sidebar({
    activeSection, onSectionChange,
    displayMode, onDisplayModeChange,
    chartType, onChartTypeChange,
    columns = [], visibleCols = {}, onToggleColumn
}) {
    return (
        <aside className="sidebar">
            {/* Logo Section */}
            <div className="sidebar-logo-container">
                <div className="sidebar-logo">Data<span>Lens</span></div>
                <div className="sidebar-badge">Industrial Logic</div>
            </div>

            <div className="sidebar-divider" style={{ background: 'rgba(231, 223, 198, 0.1)', margin: '1rem 0 2rem 0' }} />

            {/* Navigation */}
            <div className="sidebar-section">
                <div className="sidebar-section-title">Workflow Pipeline</div>
                {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
                    <div
                        key={id}
                        className={`nav-item ${activeSection === id ? 'active' : ''}`}
                        onClick={() => onSectionChange(id)}
                        style={{ marginBottom: '6px' }}
                    >
                        <Icon size={18} className="nav-icon" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{label}</span>
                    </div>
                ))}
            </div>

            <div className="sidebar-divider" />

            {/* Display Mode - Segmented Control */}
            <div className="sidebar-section">
                <div className="sidebar-section-title">Analytical Perspective</div>
                <div className="segmented-control mt-2" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(231, 223, 198, 0.1)' }}>
                    {['chart', 'both'].map(m => (
                        <button
                            key={m}
                            className={`segment-btn ${displayMode === m ? 'active' : ''}`}
                            onClick={() => onDisplayModeChange(m)}
                            style={{ color: displayMode === m ? 'var(--cerulean)' : 'rgba(233, 241, 247, 0.4)' }}
                        >
                            {m === 'both' ? 'Unified' : m.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="sidebar-divider" />

            {/* Chart Type - Grid */}
            <div className="sidebar-section">
                <div className="sidebar-section-title">Visual Engine</div>
                <div className="chart-type-grid mt-3">
                    {CHART_TYPES.map(({ id, icon: Icon, label }) => (
                        <button
                            key={id}
                            className={`chart-type-btn ${chartType === id ? 'active' : ''}`}
                            onClick={() => onChartTypeChange(id)}
                        >
                            <Icon size={20} />
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="sidebar-divider" />

            {/* Column Visibility */}
            <div className="sidebar-section" style={{ flex: 1, overflowY: 'auto' }}>
                <div className="sidebar-section-title">Feature Focus</div>
                <div className="space-y-1 mt-2">
                    {columns.length > 0 ? columns.map(col => (
                        <label key={col} className="col-check-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '6px 0', opacity: visibleCols[col] ? 1 : 0.4 }}>
                            <input
                                type="checkbox"
                                style={{ accentColor: 'var(--cerulean)', width: 14, height: 14 }}
                                checked={!!visibleCols[col]}
                                onChange={() => onToggleColumn(col)}
                            />
                            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-on-dark)' }}>{col}</span>
                        </label>
                    )) : (
                        <div style={{ padding: '20px 10px', textAlign: 'center', border: '1px dashed rgba(231,223,198,0.2)', borderRadius: 12 }}>
                            <span style={{ fontSize: '0.65rem', color: 'rgba(233,241,247,0.4)' }}>Awaiting Dataset</span>
                        </div>
                    )}
                </div>
            </div>

        </aside>
    );
}
