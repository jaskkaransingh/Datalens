import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import SpreadsheetView from './components/SpreadsheetView';
import HeatmapPanel from './components/HeatmapPanel';
import DeepAnalysis from './components/DeepAnalysis';
import VisualizationStudio from './components/VisualizationStudio';
import DataDescription from './components/DataDescription';
import TransformationEngine from './components/TransformationEngine';
import PredictiveForecaster from './components/PredictiveForecaster';
import {
    CloudUpload, Activity, RefreshCw, Layers
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE = "http://localhost:5000/api";

export default function App() {
    const [activeSection, setActiveSection] = useState('upload');
    const [displayMode, setDisplayMode] = useState('both');
    const [chartType, setChartType] = useState('bar');
    const [dataset, setDataset] = useState([]);
    const [columns, setColumns] = useState([]);
    const [visibleCols, setVisibleCols] = useState({});
    const [healthData, setHealthData] = useState(null);
    const [deepStats, setDeepStats] = useState({});
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const toggleColumn = (col) => {
        setVisibleCols(prev => ({ ...prev, [col]: !prev[col] }));
    };

    const triggerExport = async (type) => {
        if (!dataset || dataset.length === 0) {
            toast.error("Dataset not initialized");
            return;
        }

        const labels = { excel: 'Master Excel', csv: 'Production CSV', json: 'System JSON Map' };
        toast.loading(`Compiling ${labels[type]}...`);

        window.location.href = `${API_BASE}/export/${type}`;
    };

    const handleUpload = async (file) => {
        setLoading(true);
        setError(null);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const resp = await fetch(`${API_BASE}/upload`, { method: 'POST', body: formData });
            const result = await resp.json();
            if (result.error) throw new Error(result.error);

            setDataset(result.preview || []);
            setColumns(result.columns || []);
            if (result.columns) {
                setVisibleCols(Object.fromEntries(result.columns.map(c => [c, true])));
            }
            setActiveSection('health');
            fetchAnalysis();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalysis = async () => {
        try {
            const resp = await fetch(`${API_BASE}/analyze`);
            const result = await resp.json();
            if (result.error) return;
            setHealthData(result.health);
            setDeepStats(result.deep_stats);
            setStats(result.stats);
        } catch (err) {
            console.error("Analysis failed", err);
        }
    };

    useEffect(() => {
        if (dataset.length > 0) fetchAnalysis();
    }, [dataset]);

    const renderContent = () => {
        if (loading) return (
            <div className="empty-state">
                <RefreshCw className="animate-spin" size={48} color="var(--accent-gold)" />
                <div className="mt-4 font-medium opacity-60">Engine is calculating billions of parameters...</div>
            </div>
        );

        if (error) return (
            <div className="empty-state">
                <Activity size={48} color="var(--accent-rose)" />
                <div className="mt-4 text-rose-600 font-semibold">Error: {error}</div>
                <button onClick={() => setError(null)} className="btn btn-secondary mt-6">Restart Analysis</button>
            </div>
        );

        const showChart = displayMode === 'chart' || displayMode === 'both';
        const showTable = displayMode === 'table' || displayMode === 'both';

        switch (activeSection) {
            case 'upload':
                return (
                    <div className="space-y-6">
                        <div className="upload-zone" onClick={() => document.getElementById('file-input').click()}>
                            <div className="upload-zone-icon">
                                <CloudUpload size={48} color="var(--cerulean)" />
                            </div>
                            <div className="upload-zone-title">Strategic Data Injection</div>
                            <div className="upload-zone-sub">Upload CSV dataset for enterprise structural analysis</div>
                            <input id="file-input" type="file" hidden accept=".csv" onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])} />
                        </div>
                    </div>
                );

            case 'health':
                return (
                    <div className="space-y-6">
                        <DataDescription stats={stats} />
                        {showChart && healthData && <HeatmapPanel healthData={healthData} visibleCols={visibleCols} />}
                        {showTable && dataset.length > 0 && <SpreadsheetView data={dataset} columns={columns} visibleCols={visibleCols} />}
                    </div>
                );

            case 'refine':
                return (
                    <div className="space-y-6">
                        <TransformationEngine columns={columns} onUpdate={(res) => {
                            setDataset(res.preview);
                            setColumns(res.columns);
                            if (res.columns) {
                                setVisibleCols(Object.fromEntries(res.columns.map(c => [c, true])));
                            }
                            fetchAnalysis();
                        }} />
                        {showTable && dataset.length > 0 && <SpreadsheetView data={dataset} columns={columns} visibleCols={visibleCols} />}
                    </div>
                );

            case 'deep':
                return (
                    <div className="space-y-6">
                        <DeepAnalysis healthData={healthData} deepStats={deepStats} visibleCols={visibleCols} />
                        {showTable && dataset.length > 0 && <SpreadsheetView data={dataset} columns={columns} visibleCols={visibleCols} />}
                    </div>
                );

            case 'forecast':
                return (
                    <div className="space-y-6">
                        <PredictiveForecaster columns={columns} />
                        {showTable && dataset.length > 0 && <SpreadsheetView data={dataset} columns={columns} visibleCols={visibleCols} />}
                    </div>
                );

            case 'studio':
                return (
                    <div className="space-y-6">
                        {showChart && <VisualizationStudio chartType={chartType} columns={columns} />}
                        {showTable && dataset.length > 0 && <SpreadsheetView data={dataset} columns={columns} visibleCols={visibleCols} />}
                    </div>
                );

            case 'export':
                return (
                    <div className="card animate-fadeInUp">
                        <div className="card-header">
                            <div className="card-title">Export Hub</div>
                        </div>
                        <div className="p-8 text-center">
                            <p className="text-muted mb-6">Access your processed dataset in multiple industrial formats.</p>
                            <div className="flex justify-center gap-4">
                                <button className="btn btn-primary" onClick={() => triggerExport('excel')}>MASTER EXCEL (.XLSX)</button>
                                <button className="btn btn-secondary" onClick={() => triggerExport('csv')}>PRODUCTION CSV</button>
                                <button className="btn btn-secondary" onClick={() => triggerExport('json')}>SYSTEM JSON</button>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="app-shell">
            <Toaster position="top-right" />

            <Sidebar
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                displayMode={displayMode}
                onDisplayModeChange={setDisplayMode}
                chartType={chartType}
                onChartTypeChange={setChartType}
                columns={columns}
                visibleCols={visibleCols}
                onToggleColumn={toggleColumn}
            />

            <main className="main-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                    <div>
                        <h1 className="main-title">
                            {activeSection.toUpperCase()}
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.02em' }}>
                            Enterprise Analytics • Advanced Structural Pipeline
                        </p>
                    </div>
                    <button onClick={fetchAnalysis} className="btn btn-secondary" style={{ padding: '10px 20px', borderRadius: 12 }}>
                        <RefreshCw size={16} /> Synchronize
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSection + displayMode}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </main>

            <RightPanel stats={stats} dataset={dataset} />
        </div>
    );
}
