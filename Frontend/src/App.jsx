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
    const [chatHistory, setChatHistory] = useState([
        { role: 'assistant', content: 'Hello! I am connected to your RAG backend. You can ask me to analyze the structural properties of your dataset or find correlations.' }
    ]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [history, setHistory] = useState([]);

    // Helper to add assistant messages to chat
    const addAssistantMessage = (content) => {
        if (!content) return;
        setChatHistory(prev => [...prev, { role: 'assistant', content }]);
    };

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
            const newCols = Array.isArray(result.columns) ? result.columns : [];
            const newVisCols = newCols.length > 0 ? Object.fromEntries(newCols.map(c => [c, true])) : {};

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

            // NEW: Show proactive insights from upload
            if (result.insights) {
                addAssistantMessage(result.insights);
            }

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
            setChatHistory([{ role: 'assistant', content: `Switched to ${fileName}. How can I assist you with this dataset?` }]);
        }
    };

    const handleSendMessage = async () => {
        if (!chatMessage.trim()) return;

        const userMsg = chatMessage.trim();
        setChatMessage('');
        setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsChatLoading(true);

        try {
            // Ensure this points to the FastAPI backend port. If you run FastAPI on 5000, keep API_BASE.
            // If main.py runs on 8000 in your setup, you'll need to change API_BASE. Assume API_BASE for now.
            const url = `${API_BASE}/ask?question=${encodeURIComponent(userMsg)}${activeFileName ? `&dataset=${encodeURIComponent(activeFileName)}` : ''}`;
            const resp = await fetch(url);

            if (!resp.ok) throw new Error("Failed to get response");

            const data = await resp.json();
            setChatHistory(prev => [...prev, { role: 'assistant', content: data.response }]);

        } catch (error) {
            console.error("Chat error:", error);
            setChatHistory(prev => [...prev, { role: 'assistant', content: "Sorry, I am having trouble connecting to the backend. Please ensure the Python server (main.py) is running." }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleClearChat = () => {
        setChatHistory([{ role: 'assistant', content: 'Chat history cleared. How can I help you today?' }]);
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
            transition: 'grid-template-columns 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            padding: '12px',
            gap: '12px'
        }}>

            {/* LEFT SIDEBAR - FILES & EXPORT */}
            <div style={{ background: 'rgba(28, 37, 65, 0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', color: 'var(--color-white)', display: 'flex', flexDirection: 'column', border: '1px solid rgba(103,111,157,0.15)', borderRadius: '20px', zIndex: 50, boxShadow: 'var(--shadow-glass)' }}>
                <div style={{ padding: '24px', fontSize: '1.75rem', fontWeight: '900', borderBottom: '1px solid rgba(103,111,157,0.15)', letterSpacing: '-0.5px', fontFamily: 'Outfit', background: 'rgba(249,177,122,0.02)' }}>
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
                                borderRadius: '14px',
                                cursor: 'pointer',
                                color: activeFileName === file.name ? '#0B132B' : '#ffffff',
                                fontWeight: '700',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: activeFileName === file.name ? '0 10px 20px -5px rgba(249, 177, 122, 0.4)' : 'none',
                                border: activeFileName === file.name ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent'
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
                        style={{ width: '100%', padding: '13px', border: '1px dashed rgba(249,177,122,0.3)', borderRadius: '12px', background: 'rgba(249,177,122,0.05)', color: '#f9b17a', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px', fontWeight: '800', transition: 'all 0.3s', fontSize: '0.85rem' }}>
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
                                    color: '#0B132B',
                                    border: 'none',
                                    fontWeight: '800',
                                    fontSize: '0.7rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 8px 20px -5px rgba(249,177,122,0.4)'
                                }}
                            >
                                <Save size={14} /> SAVE
                            </button>
                        </div>
                    </div>
                )}

                {/* Export Footer */}
                <div style={{ padding: '24px', borderTop: '1px solid rgba(103,111,157,0.15)' }}>
                    <button style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #f9b17a 0%, #e8965a 100%)', color: '#0B132B', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontWeight: '800', fontSize: '1rem', transition: 'all 0.3s', boxShadow: '0 10px 25px -5px rgba(249,177,122,0.4)' }}>
                        <Download size={20} /> Export
                    </button>
                </div>
            </div>

            {/* MAIN CENTER AREA - EXCEL & BUTTONS */}
            <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(28, 37, 65, 0.4)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(103,111,157,0.15)', borderRadius: '20px', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-glass)' }}>

                {/* Top Bar: Tabs + Horizontal Editing Panel */}
                <div style={{ display: 'flex', padding: '16px 32px', gap: '24px', borderBottom: '1px solid rgba(103,111,157,0.15)', background: 'rgba(28, 37, 65, 0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', alignItems: 'center' }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {['Clean', 'Validate', 'Visualize'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: activeTab === tab ? '#0B132B' : '#f9b17a',
                                    color: activeTab === tab ? '#f9b17a' : '#0B132B',
                                    border: activeTab === tab ? '1px solid rgba(249,177,122,0.3)' : 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontWeight: '800',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                    boxShadow: activeTab === tab ? '0 10px 20px -5px rgba(0,0,0,0.4)' : '0 8px 20px -5px rgba(249,177,122,0.3)'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Horizontal Editing Panel */}
                    <div style={{ flex: 1, background: 'rgba(11, 19, 43, 0.6)', borderRadius: '14px', padding: '12px 24px', border: '1px solid rgba(103,111,157,0.15)', overflowX: 'auto', minWidth: 0, boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)' }}>
                        <EditingPanel
                            activeFileName={activeFileName}
                            activeTab={activeTab}
                            columns={columns}
                            dataset={dataset}
                            setDataset={updateDataset} // Use history wrapper
                            visXCol={visXCol} setVisXCol={setVisXCol}
                            visYCol={visYCol} setVisYCol={setVisYCol}
                            chartType={chartType} setChartType={setChartType}
                            validationRules={validationRules}
                            setValidationRules={setValidationRules}
                            addAssistantMessage={addAssistantMessage}
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
                            <div style={{ flex: 1, backgroundColor: 'rgba(28, 37, 65, 0.5)', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)', borderRadius: '24px', border: '1px solid rgba(103,111,157,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glass)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, transparent, #f9b17a, transparent)' }}></div>
                                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
                                    <Database size={64} strokeWidth={1} style={{ margin: '0 auto 24px', color: '#f9b17a', opacity: 0.8, filter: 'drop-shadow(0 0 10px rgba(249,177,122,0.3))' }} />
                                    <h2 style={{ fontSize: '2.8rem', color: '#ffffff', fontFamily: 'Outfit', fontWeight: '800', marginBottom: '12px', letterSpacing: '-1px' }}>
                                        WORKSPACE
                                    </h2>
                                    <p style={{ fontSize: '1.1rem', maxWidth: '380px', margin: '0 auto', color: '#ffffff', opacity: 0.6, lineHeight: '1.6' }}>
                                        Ready for analysis. Securely upload your CSV data to initialize the visual intelligence engine.
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
                            boxShadow: '0 10px 30px -5px rgba(249,177,122,0.5)',
                            zIndex: 100,
                            border: '1px solid rgba(255,255,255,0.2)',
                            transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                            animation: 'fadeInUp 0.5s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <MessageSquare size={24} />
                    </button>
                )}
            </div>

            {/* RIGHT SIDEBAR - RAG CHATBOT */}
            <div style={{ backgroundColor: 'rgba(28, 37, 65, 0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(103,111,157,0.15)', borderRadius: '20px', display: 'flex', flexDirection: 'column', zIndex: 40, boxShadow: 'var(--shadow-glass)' }}>
                {/* RAG Header */}
                <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(103,111,157,0.2)', display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
                    <div style={{ padding: '10px', backgroundColor: '#f9b17a', borderRadius: '12px', boxShadow: '0 5px 15px rgba(249,177,122,0.3)' }}>
                        <MessageSquare size={22} color="#0B132B" strokeWidth={2.5} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '1.4rem', margin: 0, fontFamily: 'Outfit', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>LensAI</h2>
                    </div>

                    {/* Clear Chat Button */}
                    <button
                        onClick={handleClearChat}
                        title="Clear Chat"
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(103,111,157,0.3)',
                            cursor: 'pointer',
                            color: '#f9b17a',
                            padding: '6px',
                            marginRight: '8px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                        }}
                    >
                        <RefreshCw size={14} />
                    </button>

                    <button
                        onClick={() => setShowRag(false)}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            cursor: 'pointer',
                            color: 'rgba(255,255,255,0.6)',
                            padding: '8px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                    >
                        <RefreshCw size={18} style={{ transform: 'rotate(45deg)' }} />
                    </button>
                </div>

                {/* Chat Messages */}
                <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: 'rgba(11, 19, 43, 0.3)' }}>
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} style={{
                            alignSelf: msg.role === 'assistant' ? 'flex-start' : 'flex-end',
                            backgroundColor: msg.role === 'assistant' ? 'rgba(28, 37, 65, 0.8)' : 'linear-gradient(135deg, #f9b17a 0%, #e8965a 100%)',
                            color: msg.role === 'assistant' ? '#ffffff' : '#0B132B',
                            border: msg.role === 'assistant' ? '1px solid rgba(103,111,157,0.2)' : 'none',
                            padding: '14px 18px',
                            borderRadius: msg.role === 'assistant' ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
                            maxWidth: '85%',
                            fontSize: '0.9rem',
                            lineHeight: '1.5',
                            fontWeight: msg.role === 'assistant' ? '500' : '700',
                            whiteSpace: 'pre-wrap',
                            boxShadow: msg.role === 'assistant' ? '0 4px 15px rgba(0,0,0,0.2)' : '0 8px 20px -5px rgba(249,177,122,0.4)',
                            background: msg.role === 'user' ? 'linear-gradient(135deg, #f9b17a 0%, #e8965a 100%)' : 'rgba(28, 37, 65, 0.8)'
                        }}>
                            {msg.content}
                        </div>
                    ))}
                    {isChatLoading && (
                        <div style={{ alignSelf: 'flex-start', padding: '16px 20px', color: '#f9b17a', fontSize: '0.85rem' }}>
                            Thinking...
                        </div>
                    )}
                </div>

                {/* Chat Input */}
                <div style={{ padding: '24px', borderTop: '1px solid rgba(103,111,157,0.15)', backgroundColor: 'rgba(11, 19, 43, 0.4)' }}>
                    <div style={{ display: 'flex', gap: '10px', backgroundColor: 'rgba(11, 19, 43, 0.6)', borderRadius: '16px', padding: '8px', border: '1px solid rgba(103,111,157,0.2)', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)' }}>
                        <input
                            type="text"
                            placeholder="Ask about your data..."
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSendMessage();
                                }
                            }}
                            style={{ flex: 1, padding: '10px 14px', border: 'none', backgroundColor: 'transparent', outline: 'none', fontSize: '0.9rem', color: '#ffffff', fontWeight: '500' }}
                            disabled={isChatLoading}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={isChatLoading || !chatMessage.trim()}
                            style={{ width: '44px', height: '44px', backgroundColor: '#f9b17a', color: '#0B132B', border: 'none', borderRadius: '12px', cursor: (isChatLoading || !chatMessage.trim()) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)', opacity: (chatMessage && !isChatLoading) ? 1 : 0.4, boxShadow: (chatMessage && !isChatLoading) ? '0 5px 15px rgba(249,177,122,0.4)' : 'none' }}>
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
