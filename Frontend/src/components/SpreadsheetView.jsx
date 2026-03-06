import { useState } from 'react';
import { FileSpreadsheet, Search, Filter } from 'lucide-react';

function getCellStatus(col, value, rules = {}) {
    const valStr = String(value ?? '').trim();
    const isMissing = valStr === '' || valStr.toLowerCase() === 'null';
    if (isMissing) return 'missing';

    const rule = rules[col];
    if (rule) {
        if (rule.type === 'Integer') {
            const num = parseFloat(valStr);
            if (isNaN(num)) return 'warning';
            if (rule.min !== undefined && num < rule.min) return 'warning';
            if (rule.max !== undefined && num > rule.max) return 'warning';
        }
        if (rule.type === 'Email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(valStr)) return 'warning';
        }
        if (rule.type === 'Date') {
            const date = new Date(valStr);
            if (date.toString() === 'Invalid Date') return 'warning';
        }
        if (rule.type === 'Boolean') {
            const low = valStr.toLowerCase();
            const validBools = ['true', 'false', '1', '0', 'yes', 'no', 'y', 'n'];
            if (!validBools.includes(low)) return 'warning';
        }
    }

    if (typeof value === 'number' && value < 0) return 'warning';
    return 'clean';
}

function CellValue({ col, value, rules, onEdit }) {
    const [editing, setEditing] = useState(false);
    const [localVal, setLocalVal] = useState(value);
    const status = getCellStatus(col, value, rules);

    if (editing) {
        return (
            <input
                autoFocus
                value={localVal}
                onChange={e => setLocalVal(e.target.value)}
                onBlur={() => { setEditing(false); onEdit(localVal); }}
                onKeyDown={e => { if (e.key === 'Enter') { setEditing(false); onEdit(localVal); } }}
                style={{
                    width: '100%',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '2px solid #f9b17a',
                    fontSize: '0.8rem',
                    outline: 'none',
                    backgroundColor: '#2d3250',
                    color: '#ffffff'
                }}
            />
        );
    }

    const display = status === 'missing' ? 'NULL' : String(value);

    return (
        <span
            className={`cell-status ${status}`}
            onClick={() => setEditing(true)}
            style={{ cursor: 'pointer' }}
            title="Click to edit"
        >
            {display}
        </span>
    );
}

const API_BASE = "http://localhost:5000/api";

export default function SpreadsheetView({ data = [], columns = [], visibleCols = {}, validationRules = {}, setDataset }) {
    const [search, setSearch] = useState('');

    const displayCols = columns.filter(col => visibleCols[col]);

    const filteredRows = data.filter(row =>
        displayCols.some(col => String(row[col] ?? '').toLowerCase().includes(search.toLowerCase()))
    );

    const handleCellEdit = (rowIndex, colName, newValue) => {
        const newData = [...data];
        const actualIndex = data.indexOf(filteredRows[rowIndex]);

        if (actualIndex !== -1) {
            // Update UI immediately for responsiveness
            newData[actualIndex] = { ...newData[actualIndex], [colName]: newValue };
            setDataset(newData);

            // Background sync with backend
            fetch(`${API_BASE}/update-cell`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    row_index: actualIndex,
                    column_name: colName,
                    new_value: newValue
                })
            })
                .then(res => res.json())
                .then(resData => console.log("Backend Sync Success:", resData))
                .catch(err => console.error("Backend Sync Error:", err));
        }
    };


    return (
        <div className="card animate-fadeInUp">
            <div className="card-header">
                <div className="card-title">
                    <div style={{ background: 'rgba(249,177,122,0.12)', padding: 10, borderRadius: 12 }}>
                        <FileSpreadsheet size={18} color="#f9b17a" />
                    </div>
                    <div>
                        <div>Enterprise Dataset</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {data.length} records · {displayCols.length} columns focus
                        </div>
                    </div>
                </div>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={14} style={{ position: 'absolute', left: 14, color: '#f9b17a', opacity: 0.6 }} />
                    <input
                        style={{
                            width: 240,
                            padding: '12px 14px 12px 40px',
                            borderRadius: 12,
                            border: '1px solid rgba(103,111,157,0.3)',
                            background: '#2d3250',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            color: '#ffffff',
                            outline: 'none'
                        }}
                        placeholder="Search records..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="spreadsheet-wrap" style={{ overflow: 'auto', flex: 1, maxHeight: 'calc(100vh - 250px)' }}>
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
                                        <CellValue
                                            col={col}
                                            value={row[col]}
                                            rules={validationRules}
                                            onEdit={(newVal) => handleCellEdit(i, col, newVal)}
                                        />
                                    </td>
                                ))}

                            </tr>
                        ))}
                        {filteredRows.length === 0 && (
                            <tr>
                                <td colSpan={displayCols.length + 1} style={{ textAlign: 'center', padding: '80px', background: 'rgba(66,71,105,0.6)' }}>
                                    <Filter size={32} style={{ margin: '0 auto 12px', color: '#f9b17a', opacity: 0.3 }} />
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>No records found for current query</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
