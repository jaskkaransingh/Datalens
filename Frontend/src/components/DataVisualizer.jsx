import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Line, Scatter } from 'react-chartjs-2';
import { Database, TrendingUp } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function DataVisualizer({ data, xCol, yCol, chartType }) {
    if (!data || data.length === 0 || !xCol || !yCol) {
        return (
            <div style={{ flex: 1, backgroundColor: 'rgba(66, 71, 105, 0.4)', backdropFilter: 'blur(8px)', borderRadius: '24px', border: '1px solid rgba(103, 111, 157, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-premium)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: 'var(--cerulean)' }}></div>
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    <TrendingUp size={64} strokeWidth={1.5} style={{ margin: '0 auto 24px', color: '#f9b17a', opacity: 0.9 }} />
                    <h2 style={{ fontSize: '2.5rem', color: '#ffffff', fontFamily: 'Outfit', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.5px' }}>
                        VISUALIZE DATA
                    </h2>
                    <p style={{ fontSize: '1.1rem', maxWidth: '350px', margin: '0 auto', opacity: 0.8 }}>
                        Please select X and Y columns in the editing panel to generate a chart.
                    </p>
                </div>
            </div>
        );
    }

    // Formatting data for Chart.js
    const labels = data.map(row => row[xCol] || 'N/A');
    // Attempt to parse y values as numbers
    const dataPoints = data.map(row => {
        const val = parseFloat(row[yCol]);
        return isNaN(val) ? 0 : val;
    });

    const chartData = {
        labels,
        datasets: [
            {
                label: yCol,
                data: dataPoints,
                backgroundColor: 'rgba(249, 177, 122, 0.45)',
                borderColor: '#f9b17a',
                borderWidth: 2,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#676f9d',
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: { family: 'Inter', size: 13, weight: '600' },
                    color: '#ffffff'
                }
            },
            title: {
                display: true,
                text: `${yCol} vs ${xCol}`,
                font: { family: 'Outfit', size: 18, weight: '700' },
                color: '#ffffff'
            },
        },
        scales: {
            x: {
                ticks: { font: { family: 'Inter' }, color: '#676f9d' },
                grid: { color: 'rgba(103, 111, 157, 0.15)' }
            },
            y: {
                ticks: { font: { family: 'Inter' }, color: '#676f9d' },
                grid: { color: 'rgba(103, 111, 157, 0.15)' }
            }
        }
    };

    const renderChart = () => {
        if (chartType === 'Bar') return <Bar data={chartData} options={options} />;
        if (chartType === 'Line') return <Line data={chartData} options={options} />;
        if (chartType === 'Scatter') return <Scatter data={chartData} options={options} />;
        return <Bar data={chartData} options={options} />;
    };

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backgroundColor: 'rgba(66, 71, 105, 0.6)',
            backdropFilter: 'blur(12px)',
            borderRadius: '24px',
            border: '1px solid rgba(103, 111, 157, 0.25)',
            boxShadow: 'var(--shadow-premium)',
            minHeight: '400px'
        }}>
            <div style={{ width: '100%', height: '400px', maxWidth: '800px', position: 'relative' }}>
                {renderChart()}
            </div>
        </div>
    );
}
