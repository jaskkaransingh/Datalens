import {
    Server, Download, FileJson, FileText, Activity, ShieldCheck, FileSpreadsheet, Zap
} from 'lucide-react';

export default function RightPanel({ stats, dataset = [] }) {
    const handleExport = (type) => {
        if (!dataset || dataset.length === 0) return;

        if (type === 'excel') {
            window.location.href = `http://localhost:5000/api/export/excel`;
            return;
        }

        let content = '';
        let mime = '';
        let ext = '';

        if (type === 'csv') {
            const headers = Object.keys(dataset[0]).join(',');
            const rows = dataset.map(row => Object.values(row).join(',')).join('\n');
            content = headers + '\n' + rows;
            mime = 'text/csv';
            ext = 'csv';
        } else {
            content = JSON.stringify(dataset, null, 2);
            mime = 'application/json';
            ext = 'json';
        }

        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `datalens_export_${new Date().getTime()}.${ext}`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <aside className="right-panel">
            <div className="rp-section">
                <div className="panel-section-title">Backend Infrastructure</div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: 'var(--alice-blue)',
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: '1px solid var(--sand-dune)'
                }}>
                    <div style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%', boxShadow: '0 0 12px #10b981' }} />
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--ink-black)' }}>System Python API</div>
                    <div style={{ marginLeft: 'auto', fontSize: '0.6rem', fontWeight: 800, color: 'var(--cerulean)' }}>STABLE</div>
                </div>
            </div>

            <div className="sidebar-divider" style={{ margin: '0.5rem 0' }} />

            <div className="rp-section">
                <div className="panel-section-title">Structural Health</div>
                {stats ? (
                    <div className="space-y-4">
                        <div className="health-bar-row">
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: 8 }}>
                                <span style={{ color: 'var(--text-muted)' }}>INTEGRITY INDEX</span>
                                <span style={{ color: 'var(--cerulean)' }}>{stats.clean_avg}%</span>
                            </div>
                            <div className="health-bar-container">
                                <div className="health-bar-fill" style={{ width: `${stats.clean_avg}%` }} />
                            </div>
                        </div>
                    </div>
                ) : <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: 12, background: 'var(--alice-blue)', borderRadius: 10, textAlign: 'center' }}>No analysis initialized</div>}
            </div>

            <div className="sidebar-divider" style={{ margin: '0.5rem 0' }} />

            <div className="rp-section" style={{ flex: 1 }}>
                <div className="panel-section-title">System Status Monitor</div>
                <div style={{
                    background: 'var(--alice-blue)',
                    borderRadius: 12,
                    padding: '1.5rem',
                    border: '1px solid var(--sand-dune)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    textAlign: 'center'
                }}>
                    <ShieldCheck size={32} color="var(--cerulean)" />
                    <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 850, color: 'var(--ink-black)' }}>Guardian Core Active</div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: 4 }}>REAL-TIME ANOMALY MONITORING ENABLED</div>
                    </div>
                </div>
            </div>

            <div className="sidebar-divider" style={{ margin: '0.5rem 0' }} />

            <div className="rp-section">
                <div className="panel-section-title">Export Protocol</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button
                        onClick={() => handleExport('excel')}
                        disabled={dataset.length === 0}
                        className="btn btn-primary"
                        style={{ padding: '14px', fontSize: '0.75rem', textTransform: 'uppercase', opacity: dataset.length === 0 ? 0.5 : 1, width: '100%' }}
                    >
                        <FileSpreadsheet size={16} style={{ marginRight: 8 }} /> Master Excel (.xlsx)
                    </button>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <button
                            onClick={() => handleExport('csv')}
                            disabled={dataset.length === 0}
                            className="btn btn-secondary"
                            style={{ padding: '12px 4px', fontSize: '0.65rem', textTransform: 'uppercase', opacity: dataset.length === 0 ? 0.5 : 1 }}
                        >
                            <FileText size={14} style={{ marginRight: 6 }} /> CSV Raw
                        </button>
                        <button
                            onClick={() => handleExport('json')}
                            disabled={dataset.length === 0}
                            className="btn btn-secondary"
                            style={{ padding: '12px 4px', fontSize: '0.65rem', textTransform: 'uppercase', opacity: dataset.length === 0 ? 0.5 : 1 }}
                        >
                            <FileJson size={14} style={{ marginRight: 6 }} /> JSON Map
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
