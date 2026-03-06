import { useState, useEffect } from 'react';
import { Layers, TrendingUp, Hash, Percent, AlertTriangle, ArrowRight } from 'lucide-react';

export default function DeepAnalysis({ healthData = {}, deepStats = {}, visibleCols = {} }) {
    const [correlations, setCorrelations] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCorr = async () => {
            setLoading(true);
            try {
                const resp = await fetch('http://localhost:5000/api/correlation');
                const data = await resp.json();
                if (!data.error) setCorrelations(data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchCorr();
    }, []);

    const numCols = Object.keys(deepStats).filter(col => visibleCols[col]);

    return (
        <div className="space-y-8">
            {/* Correlation Matrix Card */}
            <div className="card animate-fadeInUp">
                <div className="card-header">
                    <div className="card-title">
                        <div style={{ background: 'rgba(249, 177, 122, 0.12)', padding: 10, borderRadius: 12 }}>
                            <TrendingUp size={18} color="#f9b17a" />
                        </div>
                        <div>
                            <div>Feature Correlation Intelligence</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Matrix Inference Layer</div>
                        </div>
                    </div>
                </div>

                <div className="spreadsheet-wrap mt-6">
                    {loading ? (
                        <div className="p-16 text-center text-stone-400 font-medium">Synchronizing mathematical relationships...</div>
                    ) : correlations ? (
                        <table className="spreadsheet-table" style={{ minWidth: '100%' }}>
                            <thead>
                                <tr>
                                    <th style={{ background: 'var(--alice-blue)', color: 'var(--ink-black)' }}>System Variable</th>
                                    {Object.keys(correlations).map(col => (
                                        <th key={col} style={{ textAlign: 'center', fontSize: '0.7rem' }}>{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(correlations).map(rowCol => (
                                    <tr key={rowCol}>
                                        <td style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--ink-black)', background: 'var(--alice-blue)' }}>{rowCol}</td>
                                        {Object.keys(correlations).map(col => {
                                            const val = correlations[rowCol][col];
                                            const absVal = Math.abs(val);
                                            return (
                                                <td key={col} style={{
                                                    textAlign: 'center',
                                                    background: val > 0 ? `rgba(249, 177, 122, ${absVal * 0.7})` : `rgba(103, 111, 157, ${absVal * 0.7})`,
                                                    color: absVal > 0.4 ? (val > 0 ? '#2d3250' : '#ffffff') : '#ffffff',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 700,
                                                    border: '1px solid rgba(255,255,255,0.05)'
                                                }}>
                                                    {val}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <div className="p-12 text-center text-stone-400">Initialize numerical attributes for relationship mapping</div>}
                </div>
            </div>

            {/* Numerical Insights Grid */}
            <div className="insights-grid">
                {numCols.map(col => {
                    const s = deepStats[col];
                    return (
                        <div key={col} className="card insight-card animate-fadeInUp">
                            <div className="card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(103, 111, 157, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(103, 111, 157, 0.25)' }}>
                                        <Hash size={16} color="#f9b17a" />
                                    </div>
                                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--ink-black)' }}>{col}</span>
                                </div>
                                {s.outliers > 0 && (
                                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'white', background: 'var(--ink-black)', padding: '2px 8px', borderRadius: 4 }}>
                                        {s.outliers} ANOMALIES
                                    </span>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="insight-metric">
                                    <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Weighted Mean</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 850, color: 'var(--ink-black)' }}>{s.mean.toFixed(2)}</div>
                                </div>
                                <div className="insight-metric">
                                    <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>System Median</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 850, color: 'var(--cerulean)' }}>{s.median.toFixed(2)}</div>
                                </div>
                                <div className="insight-metric">
                                    <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dispersion</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink-black)' }}>σ = {s.std.toFixed(2)}</div>
                                </div>
                                <div className="insight-metric">
                                    <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amplitude</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>{s.min} • {s.max}</div>
                                </div>
                            </div>

                            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--sand-dune)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 800 }}>
                                    <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase' }}>Logic Stability</span>
                                    <span style={{ color: s.outliers > 5 ? 'var(--cerulean)' : 'var(--text-muted)' }}>
                                        {s.outliers > 5 ? 'VARIABLE' : 'STABILIZED'}
                                    </span>
                                </div>
                                <div className="health-bar-container" style={{ marginTop: 8 }}>
                                    <div className="health-bar-fill" style={{ width: `${Math.max(10, 100 - (s.outliers / 10 * 100))}%` }} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
