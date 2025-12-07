import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
} from 'chart.js';

// 🔥 Enregistrement obligatoire pour Chart.js v3+
ChartJS.register(
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend
);

export default function SalesChart({ sales }) {
    const labels = sales.map(s => s.date);
    const data = sales.map(s => s.revenue);

    return (
        <Line
            data={{
                labels,
                datasets: [{
                    label: 'Recettes (FCFA)',
                    data,
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 4,
                }]
            }}
            options={{
                responsive: true,
                plugins: {
                    legend: { position: 'top' }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                    }
                }
            }}
        />
    );
}
