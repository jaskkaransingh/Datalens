import { useState } from 'react';
import { Settings2, Zap, Trash2, Plus, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TransformationEngine({ columns = [], onUpdate }) {
    const [selectedCol, setSelectedCol] = useState(columns[0] || '');
    const [action, setAction] = useState('fill_missing');
    const [method, setMethod] = useState('mean');
    const [loading, setLoading] = useState(false);

    const ACTIONS = [
        { id: 'fill_missing', label: 'Heal Fragments', icon: Zap, desc: 'Restore missing data points' },
        { id: 'clip_outliers', label: 'Clip Anomalies', icon: Settings2, desc: 'Suppress mathematical extreme values' },
        { id: 'drop_column', label: 'Prune Dimension', icon: Trash2, desc: 'Remove irrelevant architectural columns' },
    ];

    const applyTransform = async () => {
        setLoading(true);
        try {
            const resp = await fetch('http://localhost:5000/api/transform', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, column: selectedCol, method })
            });
            const result = await resp.json();
            if (result.error) throw new Error(result.error);

            toast.success(result.message);
            if (onUpdate) onUpdate(result);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card animate-fadeInUp">
            <div className="card-header">
                <div className="card-title">
                    <div style={{ background: 'rgba(34, 116, 165, 0.1)', padding: 10, borderRadius: 12 }}>
                        <Settings2 size={18} color="var(--cerulean)" />
                    </div>
                    <div>
                        <div>Strategic Transformation Engine</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Industrial Data Refinery</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', marginTop: '1rem' }}>
                {/* Action Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {ACTIONS.map(a => (
                        <div
                            key={a.id}
                            onClick={() => setAction(a.id)}
                            className={`insight-metric ${action === a.id ? 'active' : ''}`}
                            style={{
                                cursor: 'pointer',
                                border: action === a.id ? '2px solid var(--cerulean)' : '1px solid var(--sand-dune)',
                                background: action === a.id ? 'var(--alice-blue)' : 'white',
                                padding: '1.25rem'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                                <a.icon size={16} color={action === a.id ? 'var(--cerulean)' : 'var(--text-muted)'} />
                                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--ink-black)' }}>{a.label}</span>
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>{a.desc}</div>
                        </div>
                    ))}
                </div>

                {/* Configuration Panel */}
                <div className="insight-metric" style={{ background: 'var(--alice-blue)', padding: '2rem', borderRadius: 24, position: 'relative' }}>
                    <div className="space-y-6">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Dimension</label>
                            <select
                                value={selectedCol}
                                onChange={(e) => setSelectedCol(e.target.value)}
                                style={{ width: '100%', padding: '14px', borderRadius: 12, border: '1px solid var(--sand-dune)', background: 'white', fontWeight: 700, outline: 'none' }}
                            >
                                {columns.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {action === 'fill_missing' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Healing Method</label>
                                <div className="segmented-control" style={{ background: 'white' }}>
                                    {['mean', 'median', 'mode'].map(m => (
                                        <button
                                            key={m}
                                            className={`segment-btn ${method === m ? 'active' : ''}`}
                                            onClick={() => setMethod(m)}
                                            style={{ fontSize: '0.7rem' }}
                                        >
                                            {m.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: 16 }}>
                            <button
                                onClick={applyTransform}
                                disabled={loading}
                                className="btn btn-primary"
                                style={{ flex: 1, padding: '16px' }}
                            >
                                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
                                APPLY TRANSFORMATION
                            </button>
                        </div>
                    </div>

                    {loading && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 24 }}>
                            <div style={{ textAlign: 'center' }}>
                                <RefreshCw className="animate-spin" size={32} color="var(--cerulean)" />
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--cerulean)', marginTop: 12 }}>REFINING CORE LOGIC...</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
