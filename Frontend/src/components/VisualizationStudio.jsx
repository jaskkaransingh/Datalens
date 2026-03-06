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
                color: '#ffffff',
                font: { family: 'Inter', size: 10, weight: '700' },
                usePointStyle: true,
                padding: 20
            }
        },
        tooltip: {
            backgroundColor: '#2d3250',
            titleColor: '#ffffff',
            bodyColor: '#f9b17a',
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
            ticks: { color: '#676f9d', font: { size: 11, weight: '600' } },
            border: { display: false }
        },
        y: {
            grid: { color: 'rgba(103, 111, 157, 0.2)' },
            ticks: { color: '#676f9d', font: { size: 11, weight: '600' } },
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
                'rgba(249, 177, 122, 0.85)',
                'rgba(103, 111, 157, 0.85)',
                'rgba(66, 71, 105, 0.85)',
                '#f9b17a',
                '#676f9d',
            ];

            setData({
                labels: result.labels,
                datasets: [{
                    label: `${result.val_col}`,
                    data: result.values,
                    backgroundColor: chartType === 'pie' || chartType === 'doughnut' ? backgroundColors : 'rgba(249, 177, 122, 0.80)',
                    borderColor: '#f9b17a',
                    borderWidth: chartType === 'bar' ? 0 : 2,
                    borderRadius: chartType === 'bar' ? 8 : 0,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#f9b17a',
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
                    <div style={{ background: 'rgba(249,177,122,0.12)', padding: 10, borderRadius: 12 }}>
                        <BarChart2 size={18} color="var(--cerulean)" />
                    </div>
                    <div>
                        <div>Visualization Studio</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dynamic Inference Engine</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {/* Axis Selectors */}
                    <div style={{ display: 'flex', background: 'rgba(66,71,105,0.70)', padding: '4px 12px', borderRadius: 10, border: '1px solid rgba(249,177,122,0.3)', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#676f9d' }}>MAPPING:</span>
                        <select
                            value={xAxis}
                            onChange={(e) => setXAxis(e.target.value)}
                            style={{ background: 'transparent', border: 'none', fontSize: '0.75rem', fontWeight: 700, color: '#f9b17a', outline: 'none', cursor: 'pointer' }}
                        >
                            {columns.map(c => <option key={c} value={c}>X: {c}</option>)}
                        </select>
                        <div style={{ width: 1, height: 16, background: 'rgba(249,177,122,0.4)' }} />
                        <select
                            value={yAxis}
                            onChange={(e) => setYAxis(e.target.value)}
                            style={{ background: 'transparent', border: 'none', fontSize: '0.75rem', fontWeight: 700, color: '#ffffff', outline: 'none', cursor: 'pointer' }}
                        >
                            {columns.map(c => <option key={c} value={c}>Y: {c}</option>)}
                        </select>
                    </div>

                    <button onClick={fetchData} className="btn-icon" style={{ background: 'rgba(103,111,157,0.20)', border: '1px solid rgba(249,177,122,0.3)', padding: 10, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <RefreshCw size={14} color="#f9b17a" className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="chart-container" style={{ height: 380, position: 'relative', padding: '20px 0' }}>
                {loading && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(45,50,80,0.75)', backdropFilter: 'blur(4px)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12 }}>
                        <RefreshCw className="animate-spin" size={32} color="#f9b17a" />
                    </div>
                )}
                {renderChart()}
            </div>
        </div>
    );
}
