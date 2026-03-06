import React, { useState } from 'react';
import {
    Upload,
    Download,
    MessageSquare,
    FileText,
    Database,
    Send,
    RefreshCw,
    Undo2,
    Save
} from 'lucide-react';
import './index.css';
import SpreadsheetView from './components/SpreadsheetView';
import EditingPanel from './components/EditingPanel';
import DataVisualizer from './components/DataVisualizer';

const API_BASE = "http://localhost:5000/api";

export default function App() {
    const [activeTab, setActiveTab] = useState('Clean');
    const [chatMessage, setChatMessage] = useState('');
    const [showRag, setShowRag] = useState(true);

    // History for Undo
    const [history, setHistory] = useState([]); // Array of dataset versions

    // Data States
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [activeFileName, setActiveFileName] = useState(null);
    const [dataset, setDataset] = useState([]);
    const [columns, setColumns] = useState([]);
    const [visibleCols, setVisibleCols] = useState({});
    const [loading, setLoading] = useState(false);

    // Visualization State
    const [visXCol, setVisXCol] = useState('');
    const [visYCol, setVisYCol] = useState('');
    const [chartType, setChartType] = useState('Bar');

    // Validation State
    const [validationRules, setValidationRules] = useState({}); // { colName: { type: 'Email' | 'Integer' | 'String', min: 18, ... } }

    const handleUpload = async (file) => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const resp = await fetch(`${API_BASE}/upload`, { method: 'POST', body: formData });

            if (!resp.ok) {
                throw new Error("Backend connection failed");
            }

            const result = await resp.json();
            if (result.error) throw new Error(result.error);

            const newDataset = result.preview || [];
            const newCols = result.columns || [];
            const newVisCols = newCols ? Object.fromEntries(newCols.map(c => [c, true])) : {};

            setDataset(newDataset);
            setColumns(newCols);
            setVisibleCols(newVisCols);
            setHistory([]); // Reset history on new file

            const newFile = {
                name: file.name,
                dataset: newDataset,
                columns: newCols,
                visibleCols: newVisCols,
                validationRules: {} // Store rules per file
            };
            setUploadedFiles(prev => [...prev, newFile]);
            setActiveFileName(file.name);
            setValidationRules({});

        } catch (err) {
            console.warn("Upload failed to backend, falling back to basic client-side parsing...", err);
            // Simple robust fallback if backend not responsive
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                const rows = text.split('\n').filter(row => row.trim() !== '');
                if (rows.length > 0) {
                    // Quick and dirty CSV parse for visual demo
                    const newCols = rows[0].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
                    const newDataset = [];
                    for (let i = 1; i < Math.min(rows.length, 100); i++) {
                        const vals = rows[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                        let entry = {};
                        newCols.forEach((col, idx) => {
                            entry[col] = vals[idx] || '';
                        });
                        newDataset.push(entry);
                    }
                    const newVisCols = Object.fromEntries(newCols.map(c => [c, true]));

                    setDataset(newDataset);
                    setColumns(newCols);
                    setVisibleCols(newVisCols);
                    setHistory([]);

                    const newFile = {
                        name: file.name,
                        dataset: newDataset,
                        columns: newCols,
                        visibleCols: newVisCols,
                        validationRules: {}
                    };
                    setUploadedFiles(prev => [...prev.filter(f => f.name !== file.name), newFile]);
                    setActiveFileName(file.name);
                    setValidationRules({});
                }
                setLoading(false);
            };
            reader.readAsText(file);
            return; // Exit early as FileReader is async
        } finally {
            setLoading(false);
        }
    };

    const handleFileSwitch = (fileName) => {
        const fileData = uploadedFiles.find(f => f.name === fileName);
        if (fileData) {
            // First save current rules to the old file
            setUploadedFiles(prev => prev.map(f => f.name === activeFileName ? { ...f, validationRules } : f));

            setDataset(fileData.dataset);
            setColumns(fileData.columns);
            setVisibleCols(fileData.visibleCols);
            setValidationRules(fileData.validationRules || {});
            setActiveFileName(fileName);
            setHistory([]); // Reset history for new context
        }
    };

    // Wrapper for dataset updates to track history
    const updateDataset = (newVal) => {
        setHistory(prev => [...prev, dataset]);
        setDataset(newVal);
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const previous = history[history.length - 1];
        setDataset(previous);
        setHistory(prev => prev.slice(0, -1));
    };

    const handleSave = () => {
        setHistory([]); // Clear history to finalize
        // In a real app, this might also trigger a backend save
        alert("Changes Saved! History cleared.");
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: `260px 1fr ${showRag ? '320px' : '0px'}`,
            height: '100vh',
            backgroundColor: 'transparent',
            fontFamily: 'Inter, sans-serif',
            transition: 'grid-template-columns 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>

            {/* LEFT SIDEBAR - FILES & EXPORT */}
            <div style={{ background: 'rgba(45, 50, 80, 0.88)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', color: 'var(--color-white)', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(103,111,157,0.3)', zIndex: 50, boxShadow: '4px 0 40px rgba(0,0,0,0.35)' }}>
                <div style={{ padding: '24px', fontSize: '1.75rem', fontWeight: '900', borderBottom: '1px solid rgba(103,111,157,0.25)', letterSpacing: '-0.5px', fontFamily: 'Outfit', background: 'rgba(249,177,122,0.04)' }}>
                    <span style={{ color: '#ffffff' }}>Data</span><span style={{ color: '#f9b17a', fontWeight: 600 }}>Lens</span>
                </div>

                {/* Files List */}
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'rgba(103, 111, 157, 0.8)', letterSpacing: '1px', fontWeight: '800', margin: 0 }}>
                            Files
                        </h3>
                        <div style={{ width: '20px', height: '2px', backgroundColor: 'rgba(103,111,157,0.3)', borderRadius: '2px' }}></div>
                    </div>

                    {uploadedFiles.length === 0 && (
                        <div style={{ textAlign: 'center', color: 'rgba(103, 111, 157, 0.7)', fontSize: '0.85rem', padding: '16px 0' }}>
                            No files uploaded yet.
                        </div>
                    )}

                    {uploadedFiles.map(file => (
                        <div
                            key={file.name}
                            onClick={() => handleFileSwitch(file.name)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '14px',
                                background: activeFileName === file.name
                                    ? 'linear-gradient(135deg, #f9b17a 0%, #e8965a 100%)'
                                    : 'rgba(103,111,157,0.12)',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                color: activeFileName === file.name ? '#2d3250' : '#ffffff',
                                fontWeight: '700',
                                transition: 'all 0.3s',
                                boxShadow: activeFileName === file.name ? '0 4px 14px rgba(249, 177, 122, 0.3)' : 'none'
                            }}>
                            <FileText size={18} />
                            <span style={{ fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {file.name}
                            </span>
                        </div>
                    ))}

                    <input
                        id="csv-upload"
                        type="file"
                        accept=".csv"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                handleUpload(e.target.files[0]);
                                e.target.value = null; // reset input
                            }
                        }}
                    />

                    <button
                        onClick={() => document.getElementById('csv-upload').click()}
                        style={{ width: '100%', padding: '13px', border: '1px dashed rgba(103,111,157,0.4)', borderRadius: '10px', background: 'rgba(103,111,157,0.12)', color: '#f9b17a', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px', fontWeight: '800', transition: 'all 0.3s', fontSize: '0.85rem' }}>
                        {loading ? <RefreshCw className="animate-spin" size={18} /> : <Upload size={18} />}
                        {loading ? 'Processing...' : 'Add CSV'}
                    </button>
                </div>

                {/* Undo & Save Actions */}
                {dataset.length > 0 && (
                    <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={handleUndo}
                                disabled={history.length === 0}
                                title="Undo last action"
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(103,111,157,0.15)',
                                    color: history.length === 0 ? 'rgba(103,111,157,0.4)' : 'rgba(255,255,255,0.7)',
                                    border: '1px solid rgba(103,111,157,0.3)',
                                    fontWeight: '600',
                                    fontSize: '0.7rem',
                                    cursor: history.length === 0 ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Undo2 size={14} /> UNDO
                            </button>
                            <button
                                onClick={handleSave}
                                title="Save changes and lock history"
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #f9b17a, #e8965a)',
                                    color: '#2d3250',
                                    border: 'none',
                                    fontWeight: '800',
                                    fontSize: '0.7rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 6px 20px rgba(249,177,122,0.3)'
                                }}
                            >
                                <Save size={14} /> SAVE
                            </button>
                        </div>
                    </div>
                )}

                {/* Export Footer */}
                <div style={{ padding: '24px', borderTop: '1px solid rgba(103,111,157,0.25)' }}>
                    <button style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #f9b17a 0%, #e8965a 100%)', color: '#2d3250', borderRadius: '10px', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontWeight: '800', fontSize: '1rem', transition: 'all 0.3s', boxShadow: '0 6px 20px rgba(249,177,122,0.3)' }}>
                        <Download size={20} /> Export
                    </button>
                </div>
            </div>

            {/* MAIN CENTER AREA - EXCEL & BUTTONS */}
            <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(45,50,80,0.60)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', position: 'relative', overflow: 'hidden' }}>

                {/* Top Bar: Tabs + Horizontal Editing Panel */}
                <div style={{ display: 'flex', padding: '14px 32px', gap: '24px', borderBottom: '1px solid rgba(103,111,157,0.25)', background: 'rgba(66,71,105,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', alignItems: 'center' }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {['Clean', 'Visualize', 'Validate'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: activeTab === tab ? '#2d3250' : '#f9b17a',
                                    color: activeTab === tab ? '#f9b17a' : '#2d3250',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontWeight: '800',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Horizontal Editing Panel */}
                    <div style={{ flex: 1, background: 'rgba(45,50,80,0.90)', borderRadius: '12px', padding: '12px 24px', border: '1px solid rgba(103,111,157,0.25)', overflowX: 'auto', minWidth: 0 }}>
                        <EditingPanel
                            activeTab={activeTab}
                            columns={columns}
                            dataset={dataset}
                            setDataset={updateDataset} // Use history wrapper
                            visXCol={visXCol} setVisXCol={setVisXCol}
                            visYCol={visYCol} setVisYCol={setVisYCol}
                            chartType={chartType} setChartType={setChartType}
                            validationRules={validationRules}
                            setValidationRules={setValidationRules}
                        />
                    </div>
                </div>

                {/* Internal Layout: Content Area Only */}
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                    {/* Content Area (Spreadsheet or Viz) */}
                    <div style={{ flex: 1, padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', backgroundColor: 'transparent' }}>
                        {dataset.length > 0 ? (
                            activeTab === 'Visualize' ? (
                                <DataVisualizer data={dataset} xCol={visXCol} yCol={visYCol} chartType={chartType} />
                            ) : (
                                <SpreadsheetView
                                    data={dataset}
                                    columns={columns}
                                    visibleCols={visibleCols}
                                    validationRules={validationRules}
                                    setDataset={updateDataset}
                                />
                            )
                        ) : (
                            <div style={{ flex: 1, backgroundColor: 'rgba(66,71,105,0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderRadius: '24px', border: '1px solid rgba(103,111,157,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: '#f9b17a' }}></div>
                                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
                                    <Database size={64} strokeWidth={1.5} style={{ margin: '0 auto 24px', color: '#f9b17a', opacity: 0.9 }} />
                                    <h2 style={{ fontSize: '2.5rem', color: '#ffffff', fontFamily: 'Outfit', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.5px' }}>
                                        EXCEL VIEW
                                    </h2>
                                    <p style={{ fontSize: '1.1rem', maxWidth: '350px', margin: '0 auto', color: '#ffffff', opacity: 0.7 }}>
                                        Your data will be visualized here. Please upload a CSV to begin.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {!showRag && (
                    <button
                        onClick={() => setShowRag(true)}
                        style={{
                            position: 'absolute',
                            right: '24px',
                            bottom: '24px',
                            width: '56px',
                            height: '56px',
                            borderRadius: '28px',
                            backgroundColor: '#f9b17a',
                            color: '#2d3250',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 24px rgba(249,177,122,0.4)',
                            zIndex: 100,
                            animation: 'fadeInUp 0.3s ease'
                        }}
                    >
                        <MessageSquare size={24} />
                    </button>
                )}
            </div>

            {/* RIGHT SIDEBAR - RAG CHATBOT */}
            <div style={{ backgroundColor: 'rgba(45,50,80,0.90)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderLeft: '1px solid rgba(103,111,157,0.25)', display: 'flex', flexDirection: 'column', zIndex: 40 }}>
                {/* RAG Header */}
                <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(103,111,157,0.2)', display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
                    <div style={{ padding: '10px', backgroundColor: '#f9b17a', borderRadius: '12px' }}>
                        <MessageSquare size={24} color="#2d3250" strokeWidth={2.5} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '1.4rem', margin: 0, fontFamily: 'Outfit', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>RAG</h2>
                        <p style={{ fontSize: '0.8rem', color: 'rgba(103,111,157,0.9)', margin: '2px 0 0 0', fontWeight: '600' }}>AI Assistant</p>
                    </div>
                    <button
                        onClick={() => setShowRag(false)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'rgba(255,255,255,0.5)',
                            padding: '8px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            hover: { backgroundColor: 'var(--alice-blue)' }
                        }}
                    >
                        <RefreshCw size={18} style={{ transform: 'rotate(45deg)' }} />
                    </button>
                </div>

                {/* Chat Messages */}
                <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', backgroundColor: 'rgba(30,34,64,0.50)' }}>

                    {/* Bot Message */}
                    <div style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(66,71,105,0.80)', border: '1px solid rgba(103,111,157,0.25)', padding: '16px 20px', borderRadius: '4px 20px 20px 20px', maxWidth: '90%', fontSize: '0.95rem', color: '#ffffff', lineHeight: '1.6', fontWeight: '500' }}>
                        Hello! I am connected to your RAG backend. You can ask me to analyze the structural properties of your dataset or find correlations.
                    </div>

                    {/* User Message (Example) */}
                    <div style={{ alignSelf: 'flex-end', backgroundColor: '#f9b17a', color: '#2d3250', padding: '16px 20px', borderRadius: '20px 4px 20px 20px', maxWidth: '90%', fontSize: '0.95rem', lineHeight: '1.6', fontWeight: '700' }}>
                        What are the key insights from the sales column?
                    </div>
                </div>

                {/* Chat Input */}
                <div style={{ padding: '24px', borderTop: '1px solid rgba(103,111,157,0.2)', backgroundColor: 'rgba(45,50,80,0.60)' }}>
                    <div style={{ display: 'flex', gap: '10px', backgroundColor: 'rgba(30,34,64,0.80)', borderRadius: '14px', padding: '8px', border: '1px solid rgba(103,111,157,0.25)' }}>
                        <input
                            type="text"
                            placeholder="Ask the RAG..."
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            style={{ flex: 1, padding: '12px 16px', border: 'none', backgroundColor: 'transparent', outline: 'none', fontSize: '0.95rem', color: '#ffffff', fontWeight: '500' }}
                        />
                        <button style={{ width: '48px', height: '48px', backgroundColor: '#2d3250', color: '#f9b17a', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', opacity: chatMessage ? 1 : 0.8, boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
