import { useState, useEffect } from 'react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement,
    LineElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut, Scatter } from 'react-chartjs-2';
import { BarChart2, RefreshCw, Layers } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const OPT = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1200, easing: 'easeOutQuart' },
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                color: '#131B23',
                font: { family: 'Inter', size: 10, weight: '700' },
                usePointStyle: true,
                padding: 20
            }
        },
        tooltip: {
            backgroundColor: '#131B23',
            padding: 12,
            cornerRadius: 12,
            titleFont: { family: 'Outfit', size: 14, weight: 'bold' },
            bodyFont: { family: 'Inter', size: 13 },
            boxPadding: 6
        }
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: '#64748b', font: { size: 11, weight: '600' } },
            border: { display: false }
        },
        y: {
            grid: { color: 'rgba(231, 223, 198, 0.2)' },
            ticks: { color: '#64748b', font: { size: 11, weight: '600' } },
            border: { display: false }
        },
    },
};

export default function VisualizationStudio({ chartType = 'bar', columns = [] }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [xAxis, setXAxis] = useState('');
    const [yAxis, setYAxis] = useState('');
    const [key, setKey] = useState(0);

    // Initial axis selection
    useEffect(() => {
        if (columns.length > 0) {
            setXAxis(xAxis || columns[0]);
            setYAxis(yAxis || columns[columns.length - 1]);
        }
    }, [columns]);

    const fetchData = async () => {
        if (!xAxis || !yAxis) return;
        setLoading(true);
        try {
            const resp = await fetch(`http://localhost:5000/api/viz?type=${chartType}&xAxis=${xAxis}&yAxis=${yAxis}`);
            const result = await resp.json();
            if (result.error) throw new Error(result.error);

            const backgroundColors = [
                'rgba(34, 116, 165, 0.8)',
                'rgba(231, 223, 198, 0.8)',
                'rgba(19, 27, 35, 0.8)',
                '#4dabf7',
                '#dbd0ae',
            ];

            setData({
                labels: result.labels,
                datasets: [{
                    label: `${result.val_col}`,
                    data: result.values,
                    backgroundColor: chartType === 'pie' || chartType === 'doughnut' ? backgroundColors : 'rgba(34, 116, 165, 0.8)',
                    borderColor: '#2274A5',
                    borderWidth: chartType === 'bar' ? 0 : 2,
                    borderRadius: chartType === 'bar' ? 8 : 0,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#2274A5',
                    pointHoverRadius: 6,
                }]
            });
            setKey(k => k + 1);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [chartType, xAxis, yAxis]);

    const renderChart = () => {
        if (!data) return (
            <div className="empty-state" style={{ height: 350 }}>
                <Layers size={40} className="text-stone-300 opacity-50" />
                <div className="mt-4 text-sm text-stone-400 font-medium">No visualization context available</div>
            </div>
        );

        switch (chartType) {
            case 'bar': return <Bar key={key} data={data} options={OPT} />;
            case 'line': return <Line key={key} data={data} options={OPT} />;
            case 'pie': return <Pie key={key} data={data} options={{ ...OPT, scales: undefined }} />;
            case 'doughnut': return <Doughnut key={key} data={data} options={{ ...OPT, scales: undefined }} />;
            case 'scatter': return <Scatter key={key} data={data} options={OPT} />;
            default: return <Bar key={key} data={data} options={OPT} />;
        }
    };

    return (
        <div className="card animate-fadeInUp">
            <div className="card-header">
                <div className="card-title">
                    <div style={{ background: 'rgba(34, 116, 165, 0.1)', padding: 10, borderRadius: 12 }}>
                        <BarChart2 size={18} color="var(--cerulean)" />
                    </div>
                    <div>
                        <div>Visualization Studio</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dynamic Inference Engine</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {/* Axis Selectors */}
                    <div style={{ display: 'flex', background: 'var(--alice-blue)', padding: '4px 12px', borderRadius: 10, border: '1px solid var(--sand-dune)', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>MAPPING:</span>
                        <select
                            value={xAxis}
                            onChange={(e) => setXAxis(e.target.value)}
                            style={{ background: 'transparent', border: 'none', fontSize: '0.75rem', fontWeight: 700, color: 'var(--cerulean)', outline: 'none', cursor: 'pointer' }}
                        >
                            {columns.map(c => <option key={c} value={c}>X: {c}</option>)}
                        </select>
                        <div style={{ width: 1, height: 16, background: 'var(--sand-dune)' }} />
                        <select
                            value={yAxis}
                            onChange={(e) => setYAxis(e.target.value)}
                            style={{ background: 'transparent', border: 'none', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink-black)', outline: 'none', cursor: 'pointer' }}
                        >
                            {columns.map(c => <option key={c} value={c}>Y: {c}</option>)}
                        </select>
                    </div>

                    <button onClick={fetchData} className="btn-icon" style={{ background: 'white', border: '1px solid var(--sand-dune)', padding: 10, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <RefreshCw size={14} color="var(--cerulean)" className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="chart-container" style={{ height: 380, position: 'relative', padding: '20px 0' }}>
                {loading && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(4px)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12 }}>
                        <RefreshCw className="animate-spin" size={32} color="var(--cerulean)" />
                    </div>
                )}
                {renderChart()}
            </div>
        </div>
    );
}
