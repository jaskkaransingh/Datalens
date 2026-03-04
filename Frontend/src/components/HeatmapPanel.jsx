import { useState, useEffect } from 'react';
import { Activity, Thermometer, ShieldCheck } from 'lucide-react';

const COLOR_MAP = {
    OPTIMAL: '#2274A5',
    STABILIZED: '#E7DFC6',
    CRITICAL: '#131B23',
};

function getColor(clean) {
    if (clean >= 95) return COLOR_MAP.OPTIMAL;
    if (clean >= 80) return COLOR_MAP.STABILIZED;
    return COLOR_MAP.CRITICAL;
}

function getLabel(clean) {
    if (clean >= 95) return 'Optimal Integrity';
    if (clean >= 80) return 'Stabilized Logic';
    return 'Critical Drift';
}

export default function HeatmapPanel({ healthData = {}, visibleCols = {} }) {
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 100);
        return () => clearTimeout(t);
    }, []);

    const displayCols = Object.keys(healthData).filter(col => visibleCols[col]);

    return (
        <div className="card animate-fadeInUp">
            <div className="card-header">
                <div className="card-title">
                    <div style={{ background: 'rgba(34, 116, 165, 0.1)', padding: 10, borderRadius: 12 }}>
                        <Thermometer size={18} color="var(--cerulean)" />
                    </div>
                    <div>
                        <div>Structural Health Map</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enterprise Integrity Audit</div>
                    </div>
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--cerulean)', border: '1px solid var(--cerulean)', padding: '4px 10px', borderRadius: 6 }}>SYSTEM ACTIVE</div>
            </div>

            <div className="heatmap-grid">
                {displayCols.map((col, i) => {
                    const stats = healthData[col];
                    const color = getColor(stats.clean_pct);
                    const isSand = color === COLOR_MAP.STABILIZED;
                    return (
                        <div key={col} className="heatmap-col">
                            <div className="heatmap-col-label" title={col}>
                                {col}
                            </div>
                            <div
                                className="heatmap-cell"
                                style={{
                                    background: animated ? color : 'var(--alice-blue)',
                                    boxShadow: animated ? `0 8px 20px -6px ${color}66` : 'none',
                                    color: isSand ? 'var(--ink-black)' : 'white'
                                }}
                            >
                                {animated ? `${Math.round(stats.clean_pct)}%` : '...'}
                            </div>
                            <div style={{ fontSize: '0.6rem', textAlign: 'center', fontWeight: 700, color: color, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                {getLabel(stats.clean_pct)}
                            </div>
                        </div>
                    );
                })}
                {displayCols.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', border: '2px dashed var(--sand-dune)', borderRadius: 24, background: 'var(--alice-blue)' }}>
                        <ShieldCheck size={32} style={{ margin: '0 auto 12px', color: 'var(--cerulean)', opacity: 0.3 }} />
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Initialize Attributes for Integrity Mapping</div>
                    </div>
                )}
            </div>
        </div>
    );
}

