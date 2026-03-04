import { useState } from 'react';
import { FileSpreadsheet, Search, Filter } from 'lucide-react';

function getCellStatus(col, value) {
    if (value === null || value === undefined || value === "") return 'missing';
    if (typeof value === 'number' && value < 0) return 'warning';
    if (typeof value === 'string' && value.toLowerCase().includes('err')) return 'warning';
    return 'clean';
}

function CellValue({ col, value }) {
    const status = getCellStatus(col, value);
    const display = value === null || value === undefined || value === "" ? 'NULL' : String(value);

    return (
        <span className={`cell-status ${status}`}>
            {display}
        </span>
    );
}

export default function SpreadsheetView({ data = [], columns = [], visibleCols = {} }) {
    const [search, setSearch] = useState('');

    const displayCols = columns.filter(col => visibleCols[col]);

    const filteredRows = data.filter(row =>
        displayCols.some(col => String(row[col] ?? '').toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="card animate-fadeInUp">
            <div className="card-header">
                <div className="card-title">
                    <div style={{ background: 'rgba(34, 116, 165, 0.1)', padding: 10, borderRadius: 12 }}>
                        <FileSpreadsheet size={18} color="var(--cerulean)" />
                    </div>
                    <div>
                        <div>Enterprise Dataset</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {data.length} records · {displayCols.length} columns focus
                        </div>
                    </div>
                </div>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={14} style={{ position: 'absolute', left: 14, color: 'var(--cerulean)', opacity: 0.6 }} />
                    <input
                        style={{
                            width: 240,
                            padding: '12px 14px 12px 40px',
                            borderRadius: 12,
                            border: '1px solid var(--sand-dune)',
                            background: 'var(--alice-blue)',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            color: 'var(--ink-black)',
                            outline: 'none'
                        }}
                        placeholder="Search records..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="spreadsheet-wrap">
                <table className="spreadsheet-table">
                    <thead>
                        <tr>
                            <th style={{ width: 60, textAlign: 'center' }}>#</th>
                            {displayCols.map(col => (
                                <th key={col}>{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRows.map((row, i) => (
                            <tr key={i}>
                                <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.75rem' }}>{i + 1}</td>
                                {displayCols.map(col => (
                                    <td key={col}>
                                        <CellValue col={col} value={row[col]} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {filteredRows.length === 0 && (
                            <tr>
                                <td colSpan={displayCols.length + 1} style={{ textAlign: 'center', padding: '80px', background: 'var(--alice-blue)' }}>
                                    <Filter size={32} style={{ margin: '0 auto 12px', color: 'var(--cerulean)', opacity: 0.2 }} />
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>No records localized for current query</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
