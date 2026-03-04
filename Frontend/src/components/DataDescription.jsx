import { Info } from 'lucide-react';

export default function DataDescription({ stats }) {
    if (!stats) return null;

    const items = [
        { value: stats.rows, label: 'TOTAL ENTRIES', color: 'var(--ink-black)' },
        { value: stats.columns, label: 'DIMENSIONS', color: 'var(--cerulean)' },
        { value: stats.missing, label: 'MISSING FRAGMENTS', color: 'var(--cerulean)' },
        { value: `${stats.clean_avg}%`, label: 'LOGIC STABILITY', color: 'var(--ink-black)' },
    ];

    return (
        <div className="card animate-fadeInUp">
            <div className="card-header">
                <div className="card-title">
                    <div style={{ background: 'rgba(34, 116, 165, 0.1)', padding: 10, borderRadius: 12 }}>
                        <Info size={18} color="var(--cerulean)" />
                    </div>
                    <div>
                        <div>Operational Summary</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dataset Structural Metadata</div>
                    </div>
                </div>
            </div>

            <div className="desc-grid">
                {items.map((s, i) => (
                    <div key={s.label} className="desc-stat" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="desc-stat-value" style={{ color: s.color, fontSize: '1.5rem', fontWeight: 850 }}>{s.value}</div>
                        <div className="desc-stat-label" style={{ fontWeight: 800, fontSize: '0.6rem', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>{s.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
