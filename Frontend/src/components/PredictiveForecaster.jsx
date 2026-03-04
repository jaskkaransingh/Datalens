import { useState, useEffect } from 'react';
import { Target, TrendingUp, RefreshCw, Layers, Zap, Info } from 'lucide-react';
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function PredictiveForecaster({ columns = [] }) {
    const [xAxis, setXAxis] = useState('');
    const [yAxis, setYAxis] = useState('');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        if (columns.length > 0) {
            setXAxis(xAxis || columns[0]);
            setYAxis(yAxis || columns[columns.length - 1]);
        }
    }, [columns]);

    const runForecaster = async () => {
        if (!xAxis || !yAxis) return;
        setLoading(true);
        try {
            const resp = await fetch(`http://localhost:5000/api/predict?xAxis=${xAxis}&yAxis=${yAxis}`);
            const result = await resp.json();
            if (result.error) throw new Error(result.error);

            setStats(result);
            setChartData({
                datasets: [
                    {
                        type: 'scatter',
                        label: 'Observed Patterns',
                        data: result.scatter.x.map((x, i) => ({ x, y: result.scatter.y[i] })),
                        backgroundColor: 'rgba(19, 27, 35, 0.4)',
                        pointRadius: 4,
                    },
                    {
                        type: 'line',
                        label: 'Predictive Projection',
                        data: result.trend.x.map((x, i) => ({ x, y: result.trend.y[i] })),
                        borderColor: 'var(--cerulean)',
                        borderWidth: 4,
                        pointRadius: 0,
                        fill: false,
                        tension: 0
                    }
                ]
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        runForecaster();
    }, [xAxis, yAxis]);

    const opts = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { font: { weight: '700', size: 10 } } }
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { weight: '600' } } },
            y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { weight: '600' } } }
        }
    };

    return (
        <div className="card animate-fadeInUp">
            <div className="card-header">
                <div className="card-title">
                    <div style={{ background: 'rgba(34, 116, 165, 0.1)', padding: 10, borderRadius: 12 }}>
                        <Target size={18} color="var(--cerulean)" />
                    </div>
                    <div>
                        <div>Predictive Projection Unit</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scikit-Learn Inference Layer</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ display: 'flex', background: 'var(--alice-blue)', padding: '4px 12px', borderRadius: 10, border: '1px solid var(--sand-dune)', gap: 8, alignItems: 'center' }}>
                        <select
                            value={xAxis}
                            onChange={(e) => setXAxis(e.target.value)}
                            style={{ background: 'transparent', border: 'none', fontSize: '0.75rem', fontWeight: 700, color: 'var(--cerulean)', outline: 'none' }}
                        >
                            {columns.map(c => <option key={c} value={c}>INFLUENCE: {c}</option>)}
                        </select>
                        <div style={{ width: 1, height: 16, background: 'var(--sand-dune)' }} />
                        <select
                            value={yAxis}
                            onChange={(e) => setYAxis(e.target.value)}
                            style={{ background: 'transparent', border: 'none', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink-black)', outline: 'none' }}
                        >
                            {columns.map(c => <option key={c} value={c}>TARGET: {c}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', marginTop: '1rem' }}>
                <div style={{ height: 400, position: 'relative' }}>
                    {loading && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(4px)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12 }}>
                            <RefreshCw className="animate-spin" size={32} color="var(--cerulean)" />
                        </div>
                    )}
                    {chartData && <Scatter data={chartData} options={opts} />}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="insight-metric" style={{ background: 'var(--ink-black)', color: 'white' }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Model Confidence (R²)</div>
                        <div style={{ fontSize: '2rem', fontWeight: 850, color: 'var(--sand-dune)' }}>{stats ? (stats.r2 * 100).toFixed(1) : '0'}%</div>
                    </div>

                    <div className="insight-metric">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <Zap size={14} color="var(--cerulean)" />
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--ink-black)' }}>PATTERN LOGIC</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            Every unit increase in <span style={{ color: 'var(--cerulean)' }}>{xAxis}</span> correlates to a <span style={{ color: 'var(--ink-black)' }}>{stats?.coef}</span> shift in <span style={{ color: 'var(--cerulean)' }}>{yAxis}</span>.
                        </div>
                    </div>

                    <div className="insight-metric" style={{ background: 'var(--alice-blue)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <Info size={14} color="var(--cerulean)" />
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--ink-black)' }}>SYSTEM INFERENCE</span>
                        </div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                            Linear regression detected a {stats?.r2 > 0.5 ? 'STRONG' : 'MODERATE'} correlation. The system has stabilized the trend line with an intercept of {stats?.intercept}.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
