import React, { useState, useMemo, useEffect } from 'react';
import { Settings, BarChart2, CheckCircle2, Layers, Type, Filter, RefreshCw, AlertTriangle, ListFilter, PlayCircle, Info, XCircle, Edit3 } from 'lucide-react';

export default function EditingPanel({
    activeTab,
    columns,
    dataset,
    setDataset,
    // Viz State
    visXCol, setVisXCol,
    visYCol, setVisYCol,
    chartType, setChartType,
    // Validation State
    validationRules, setValidationRules
}) {

    // Local State for Clean Tab
    const [cleanCol, setCleanCol] = useState('');
    const [cleanStrategy, setCleanStrategy] = useState('');
    const [cleanCustomValue, setCleanCustomValue] = useState('');

    // Local State for Validate Tab
    const [valCol, setValCol] = useState('');
    const [valType, setValType] = useState('String');
    const [selectedUniques, setSelectedUniques] = useState({});

    // Sub-tab for Validation (Type vs Logical)
    const [valSubTab, setValSubTab] = useState('Type');
    const [showResolution, setShowResolution] = useState(false);
    const [bulkReplaceValue, setBulkReplaceValue] = useState('');

    // --- CLEAN HELPERS ---
    const missingCount = useMemo(() => {
        if (!cleanCol || !dataset) return 0;
        return dataset.filter(row => {
            const v = String(row[cleanCol] ?? '').trim().toLowerCase();
            return v === '' || v === 'null';
        }).length;
    }, [cleanCol, dataset]);

    const handleApplyClean = () => {
        if (!cleanCol || !cleanStrategy || missingCount === 0) return;

        let newDataset = [...dataset];

        if (cleanStrategy === 'Drop') {
            newDataset = newDataset.filter(row => {
                const v = String(row[cleanCol] ?? '').trim().toLowerCase();
                return v !== '' && v !== 'null';
            });
        } else {
            let replacementValue = '';
            if (cleanStrategy === 'Mean' || cleanStrategy === 'Median') {
                const numericValues = dataset
                    .map(row => parseFloat(row[cleanCol]))
                    .filter(val => !isNaN(val));

                if (numericValues.length === 0) {
                    alert("Cannot calculate mean/median for non-numeric column.");
                    return;
                }

                if (cleanStrategy === 'Mean') {
                    const sum = numericValues.reduce((a, b) => a + b, 0);
                    replacementValue = (sum / numericValues.length).toFixed(2);
                } else if (cleanStrategy === 'Median') {
                    numericValues.sort((a, b) => a - b);
                    const mid = Math.floor(numericValues.length / 2);
                    replacementValue = numericValues.length % 2 !== 0 ? numericValues[mid] : ((numericValues[mid - 1] + numericValues[mid]) / 2).toFixed(2);
                }
            } else if (cleanStrategy === 'Mode') {
                const freq = {};
                let maxFreq = 0;
                let modeVal = '';
                dataset.forEach(row => {
                    const val = String(row[cleanCol]).trim();
                    if (val && val.toLowerCase() !== 'null') {
                        freq[val] = (freq[val] || 0) + 1;
                        if (freq[val] > maxFreq) {
                            maxFreq = freq[val];
                            modeVal = val;
                        }
                    }
                });
                replacementValue = modeVal;
            } else if (cleanStrategy === 'Custom') {
                replacementValue = cleanCustomValue;
            }

            newDataset = newDataset.map(row => {
                const val = String(row[cleanCol] ?? '').trim().toLowerCase();
                if (val === '' || val === 'null') {
                    return { ...row, [cleanCol]: replacementValue };
                }
                return row;
            });
        }

        setDataset(newDataset);
        setCleanStrategy('');
        setCleanCustomValue('');
    };

    // --- VALIDATE HELPERS ---
    const uniqueValuesInfo = useMemo(() => {
        if (!valCol || !dataset) return { count: 0, missing: 0, items: [] };
        const missing = dataset.filter(row => {
            const v = String(row[valCol] ?? '').trim().toLowerCase();
            return v === '' || v === 'null';
        }).length;
        const uniqueMap = {};
        dataset.forEach(row => {
            const v = row[valCol];
            if (v !== undefined && v !== null && String(v).trim() !== '' && String(v).toLowerCase() !== 'null') {
                uniqueMap[v] = (uniqueMap[v] || 0) + 1;
            }
        });
        return {
            count: Object.keys(uniqueMap).length,
            missing,
            items: Object.entries(uniqueMap).map(([k, v]) => ({ value: k, occurrences: v })).sort((a, b) => b.occurrences - a.occurrences)
        };
    }, [valCol, dataset]);

    useEffect(() => {
        setSelectedUniques({});
        setShowResolution(false);
        if (valCol) {
            const existingType = validationRules?.[valCol]?.type || 'String';
            setValType(existingType);
        }
    }, [valCol]);

    // NEW: Resolve mismatches for Type Validation
    const handleCorrectTypeMismatches = () => {
        if (!valCol) return;

        const newDataset = dataset.map(row => {
            let val = String(row[valCol] ?? '').trim();
            if (val.toLowerCase() === 'null' || val === '') return row;

            let corrected = val;
            if (valType === 'Integer') {
                corrected = val.replace(/[^0-9.-]/g, '');
                if (corrected === '') corrected = '0';
            } else if (valType === 'Boolean') {
                const low = val.toLowerCase();
                if (['true', '1', 'yes', 'y'].includes(low)) corrected = 'TRUE';
                else if (['false', '0', 'no', 'n'].includes(low)) corrected = 'FALSE';
            } else if (valType === 'Email') {
                corrected = val.toLowerCase();
            }

            return { ...row, [valCol]: corrected };
        });

        setDataset(newDataset);
        alert(`Finished correcting mismatches in ${valCol} based on ${valType} rules.`);
    };

    // Logical Logic Failures calculation
    const failingRowsIndices = useMemo(() => {
        if (!valCol || !dataset || valSubTab !== 'Logical') return [];

        const selectedValues = Object.entries(selectedUniques).filter(([k, v]) => v).map(([k]) => k);
        const min = validationRules?.[valCol]?.min;
        const max = validationRules?.[valCol]?.max;

        const indices = [];
        dataset.forEach((row, idx) => {
            const val = row[valCol];
            const valStr = String(val);

            // Constraint 1: Unique Value Filtering
            if (selectedValues.length > 0 && !selectedValues.includes(valStr)) {
                indices.push(idx);
                return;
            }

            // Constraint 2: Min/Max filtering
            if (valType === 'Integer') {
                const num = parseFloat(valStr);
                if (isNaN(num)) {
                    indices.push(idx);
                    return;
                }
                if (min !== undefined && num < min) indices.push(idx);
                else if (max !== undefined && num > max) indices.push(idx);
            }
        });
        return indices;
    }, [valCol, dataset, valSubTab, selectedUniques, validationRules, valType]);

    const handleApplyLogicalAction = (action) => {
        let newDataset = [...dataset];

        if (action === 'DELETE') {
            newDataset = newDataset.filter((_, i) => !failingRowsIndices.includes(i));
        } else if (action === 'CHANGE') {
            newDataset = newDataset.map((row, i) => {
                if (failingRowsIndices.includes(i)) {
                    return { ...row, [valCol]: bulkReplaceValue };
                }
                return row;
            });
        }

        setDataset(newDataset);
        setShowResolution(false);
        setBulkReplaceValue('');
        setSelectedUniques({});
    };

    const handleConvertValue = (oldVal, newVal) => {
        const newDataset = dataset.map(row => {
            if (String(row[valCol]) === oldVal) {
                return { ...row, [valCol]: newVal };
            }
            return row;
        });
        setDataset(newDataset);
    };

    const matrixInfo = useMemo(() => {
        if (!dataset || dataset.length === 0) return [];
        return columns.slice(0, 15).map(col => {
            const missing = dataset.filter(row => {
                const v = String(row[col] ?? '').trim().toLowerCase();
                return v === '' || v === 'null';
            }).length;
            const uniques = new Set(dataset.map(row => String(row[col] ?? '').trim())).size;
            return { col, missing, uniques };
        });
    }, [dataset, columns]);

    const mismatchCount = useMemo(() => {
        if (!valCol || !dataset) return 0;
        return dataset.filter(row => {
            const val = String(row[valCol] ?? '').trim();
            if (val === '' || val.toLowerCase() === 'null') return false;
            if (valType === 'Integer') return isNaN(parseFloat(val));
            if (valType === 'Email') return !val.includes('@');
            return false;
        }).length;
    }, [valCol, valType, dataset]);

    // --- RENDERERS ---

    const renderCleanPanel = () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f9b17a', fontWeight: '800', paddingRight: '16px', borderRight: '2px solid rgba(249,177,122,0.25)', height: '30px', flexShrink: 0 }}>
                <Settings size={20} color="#f9b17a" strokeWidth={2.5} />
                <span style={{ letterSpacing: '-0.5px' }}>CLEAN</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, overflowX: 'auto', padding: '4px 0', scrollbarWidth: 'none' }}>
                <select
                    value={cleanCol}
                    onChange={e => { setCleanCol(e.target.value); setCleanStrategy(''); setCleanCustomValue(''); }}
                    style={{ width: '130px', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(103,111,157,0.35)', backgroundColor: '#2d3250', color: '#ffffff', fontWeight: '750', fontSize: '0.8rem', outline: 'none' }}
                >
                    <option value="">Col...</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                {cleanCol && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: '#2d3250', borderRadius: '10px', border: '1px solid rgba(103,111,157,0.25)' }}>
                            <span style={{ fontSize: '0.65rem', color: 'rgba(103,111,157,0.9)', fontWeight: '800' }}>NAN:</span>
                            <span style={{ fontSize: '0.9rem', color: missingCount > 0 ? '#f9b17a' : 'rgba(103,111,157,0.5)', fontWeight: '900' }}>{missingCount}</span>
                        </div>

                        {missingCount > 0 ? (
                            <>
                                <select value={cleanStrategy} onChange={e => setCleanStrategy(e.target.value)} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(103,111,157,0.25)', backgroundColor: '#2d3250', color: '#ffffff', fontWeight: '700', fontSize: '0.8rem', outline: 'none' }}>
                                    <option value="">Fix...</option>
                                    <option value="Drop">Drop Rows</option>
                                    <option value="Mean">Mean</option>
                                    <option value="Median">Median</option>
                                    <option value="Mode">Mode</option>
                                    <option value="Custom">Custom...</option>
                                </select>
                                {cleanStrategy === 'Custom' && (
                                    <input type="text" placeholder="..." value={cleanCustomValue} onChange={e => setCleanCustomValue(e.target.value)} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(103,111,157,0.25)', backgroundColor: '#2d3250', color: '#ffffff', width: '80px', fontSize: '0.8rem', outline: 'none' }} />
                                )}
                                <button onClick={handleApplyClean} disabled={!cleanStrategy || (cleanStrategy === 'Custom' && !cleanCustomValue)} style={{ padding: '8px 16px', backgroundColor: '#f9b17a', color: '#2d3250', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.75rem' }}>RESOLVE</button>
                            </>
                        ) : (
                            <div style={{ color: '#f9b17a', fontSize: '0.7rem', fontWeight: '900' }}>DATA PURE ✓</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    const renderValidatePanel = () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', height: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink-black)', fontWeight: '800', paddingRight: '12px', borderRight: '2px solid var(--border-mid)', height: '30px', flexShrink: 0 }}>
                <CheckCircle2 size={20} color="var(--cerulean)" strokeWidth={2.5} />
                <span style={{ fontSize: '0.8rem', letterSpacing: '-0.3px' }}>VAL</span>
            </div>

            {/* Sub-tabs Toggle */}
            <div style={{ display: 'flex', backgroundColor: 'rgba(249,177,122,0.10)', padding: '3px', borderRadius: '10px', flexShrink: 0 }}>
                <button onClick={() => { setValSubTab('Type'); setShowResolution(false); }} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', fontSize: '0.6rem', fontWeight: '900', cursor: 'pointer', backgroundColor: valSubTab === 'Type' ? '#f9b17a' : 'transparent', color: valSubTab === 'Type' ? '#2d3250' : 'rgba(103,111,157,0.8)' }}>TYPE</button>
                <button onClick={() => { setValSubTab('Logical'); setShowResolution(false); }} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', fontSize: '0.6rem', fontWeight: '900', cursor: 'pointer', backgroundColor: valSubTab === 'Logical' ? '#f9b17a' : 'transparent', color: valSubTab === 'Logical' ? '#2d3250' : 'rgba(103,111,157,0.8)' }}>LOGIC</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                <select
                    value={valCol}
                    onChange={e => setValCol(e.target.value)}
                    style={{ width: '110px', padding: '8px', borderRadius: '10px', border: '1px solid rgba(103,111,157,0.25)', backgroundColor: '#2d3250', color: '#ffffff', fontSize: '0.75rem', fontWeight: '750', flexShrink: 0, outline: 'none' }}
                >
                    <option value="">Col...</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                {valCol && valSubTab === 'Type' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: '#2d3250', borderRadius: '10px', border: '1px solid rgba(103,111,157,0.25)' }}>
                            <select
                                value={valType}
                                onChange={e => {
                                    setValType(e.target.value);
                                    setValidationRules(prev => ({ ...prev, [valCol]: { ...prev[valCol], type: e.target.value } }));
                                }}
                                style={{ border: 'none', fontWeight: '850', fontSize: '0.7rem', background: 'transparent', outline: 'none', color: '#f9b17a' }}>
                                <option value="String">String</option>
                                <option value="Integer">Integer</option>
                                <option value="Date">Date</option>
                                <option value="Email">Email</option>
                                <option value="Boolean">Boolean</option>
                            </select>
                        </div>

                        {mismatchCount > 0 && (
                            <button onClick={handleCorrectTypeMismatches} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: 'rgba(249,177,122,0.15)', color: '#f9b17a', border: '1px solid rgba(249,177,122,0.4)', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '800', cursor: 'pointer' }}>
                                <PlayCircle size={14} /> CORRECT {mismatchCount} MISMATHCES
                            </button>
                        )}
                        {mismatchCount === 0 && (
                            <div style={{ color: 'rgba(249,177,122,0.7)', fontSize: '0.6rem', fontWeight: '900' }}>DATA PURE ✓</div>
                        )}
                    </div>
                )}

                {valCol && valSubTab === 'Logical' && !showResolution && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        {valType === 'Integer' && (
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                                <input placeholder="Min" value={validationRules?.[valCol]?.min ?? ''}
                                    onChange={e => setValidationRules(prev => ({ ...prev, [valCol]: { ...prev[valCol], min: e.target.value ? Number(e.target.value) : undefined } }))}
                                    style={{ width: '35px', padding: '6px', fontSize: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-mid)', outline: 'none' }} />
                                <span style={{ opacity: 0.3 }}>-</span>
                                <input placeholder="Max" value={validationRules?.[valCol]?.max ?? ''}
                                    onChange={e => setValidationRules(prev => ({ ...prev, [valCol]: { ...prev[valCol], max: e.target.value ? Number(e.target.value) : undefined } }))}
                                    style={{ width: '35px', padding: '6px', fontSize: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-mid)', outline: 'none' }} />
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', backgroundColor: '#2d3250', padding: '4px 8px', borderRadius: '10px', border: '1px solid rgba(103,111,157,0.2)', flex: 1, minWidth: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
                            {uniqueValuesInfo.items.slice(0, 10).map(item => (
                                <div key={item.value} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.55rem', padding: '2px 6px', backgroundColor: '#424769', borderRadius: '6px', border: '1px solid rgba(103,111,157,0.2)', whiteSpace: 'nowrap', color: '#ffffff' }}>
                                    <input type="checkbox" checked={selectedUniques[item.value] || false} onChange={() => setSelectedUniques(p => ({ ...p, [item.value]: !p[item.value] }))} />
                                    <span style={{ fontWeight: '800' }}>{item.value}</span>
                                    <input placeholder="Fix.." onBlur={e => e.target.value && e.target.value !== item.value && handleConvertValue(item.value, e.target.value)}
                                        style={{ width: '40px', border: 'none', background: 'rgba(249,177,122,0.10)', color: '#f9b17a', padding: '2px', borderRadius: '3px', fontSize: '0.5rem', outline: 'none' }} />
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            {failingRowsIndices.length > 0 && (
                                <span style={{ fontSize: '0.65rem', fontWeight: '900', color: '#ef4444' }}>{failingRowsIndices.length} MISMATCH</span>
                            )}
                            <button onClick={() => failingRowsIndices.length > 0 ? setShowResolution(true) : alert("All rows pass current logic.")} style={{ padding: '8px 12px', backgroundColor: 'var(--ink-black)', color: 'white', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', border: 'none', fontSize: '0.65rem' }}>COMMIT</button>
                        </div>
                    </div>
                )}

                {valCol && valSubTab === 'Logical' && showResolution && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, backgroundColor: 'rgba(249,177,122,0.10)', padding: '5px 12px', borderRadius: '10px', border: '1px solid rgba(249,177,122,0.35)' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: '900', color: '#f9b17a' }}>RESOLVE {failingRowsIndices.length} ROWS</span>

                        <div style={{ display: 'flex', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', borderRadius: '8px', border: '1px solid rgba(103,111,157,0.3)', backgroundColor: '#2d3250', overflow: 'hidden' }}>
                                <input
                                    placeholder="Type replacement..."
                                    value={bulkReplaceValue}
                                    onChange={e => setBulkReplaceValue(e.target.value)}
                                    style={{ border: 'none', padding: '6px 10px', fontSize: '0.65rem', outline: 'none', width: '120px', backgroundColor: 'transparent', color: '#ffffff' }}
                                />
                                <button onClick={() => handleApplyLogicalAction('CHANGE')} style={{ border: 'none', background: '#f9b17a', color: '#2d3250', padding: '6px 10px', cursor: 'pointer', fontSize: '0.65rem', fontWeight: '800' }}>CHANGE</button>
                            </div>
                            <button onClick={() => handleApplyLogicalAction('DELETE')} style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#424769', color: '#ffffff', border: '1px solid rgba(103,111,157,0.4)', borderRadius: '8px', padding: '6px 12px', fontSize: '0.65rem', fontWeight: '800', cursor: 'pointer' }}>
                                <XCircle size={14} /> DELETE ROWS
                            </button>
                            <button onClick={() => setShowResolution(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(103,111,157,0.8)', fontSize: '0.6rem', fontWeight: '900', cursor: 'pointer' }}>CANCEL</button>
                        </div>
                    </div>
                )}

                {/* Health Matrix */}
                <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto', padding: '0 8px', borderLeft: '1px solid var(--border-mid)', height: '30px', alignItems: 'center', overflowX: 'auto', maxWidth: '200px', scrollbarWidth: 'none' }}>
                    {matrixInfo.map(m => (
                        <div key={m.col} style={{ width: '12px', height: '20px', backgroundColor: 'rgba(103,111,157,0.15)', borderRadius: '3px', position: 'relative', flexShrink: 0 }}>
                            <div style={{ position: 'absolute', bottom: 0, width: '100%', height: `${Math.max(10, 100 - (m.missing / dataset.length * 100))}%`, backgroundColor: m.missing > 0 ? 'rgba(249,177,122,0.5)' : '#f9b17a', borderRadius: '2px' }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderVisualizePanel = () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f9b17a', fontWeight: '800', paddingRight: '16px', borderRight: '2px solid rgba(249,177,122,0.25)', height: '30px', flexShrink: 0 }}>
                <BarChart2 size={20} color="#f9b17a" strokeWidth={2.5} />
                <span style={{ letterSpacing: '-0.5px' }}>VIS</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                <select value={visXCol} onChange={e => setVisXCol(e.target.value)} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(103,111,157,0.25)', backgroundColor: '#2d3250', color: '#ffffff', fontSize: '0.8rem', fontWeight: '750', outline: 'none' }}>
                    <option value="">X-Axis...</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={visYCol} onChange={e => setVisYCol(e.target.value)} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(103,111,157,0.25)', backgroundColor: '#2d3250', color: '#ffffff', fontSize: '0.8rem', fontWeight: '750', outline: 'none' }}>
                    <option value="">Y-Axis...</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div style={{ display: 'flex', backgroundColor: '#2d3250', borderRadius: '10px', border: '1px solid rgba(103,111,157,0.25)', overflow: 'hidden' }}>
                    {['Bar', 'Line', 'Scatter'].map(type => (
                        <button key={type} onClick={() => setChartType(type)} style={{ padding: '8px 12px', background: chartType === type ? '#f9b17a' : 'transparent', color: chartType === type ? '#2d3250' : 'rgba(103,111,157,0.8)', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '0.7rem' }}>{type}</button>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ width: '100%', height: '100%' }}>
            {activeTab === 'Clean' && renderCleanPanel()}
            {activeTab === 'Validate' && renderValidatePanel()}
            {activeTab === 'Visualize' && renderVisualizePanel()}
        </div>
    );
}
