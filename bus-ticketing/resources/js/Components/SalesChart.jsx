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

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

export default function SalesChart({ sales }) {
    // 🔹 S'assurer que sales est toujours un tableau
    const safeSales = Array.isArray(sales) ? sales : [];

    // 🔹 Formater les dates en français
    const labels = safeSales.map(s =>
        new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(s.date))
    );

    // 🔹 Formater les revenus, remplacer undefined par 0
    const data = safeSales.map(s => Number(s.revenue ?? 0));

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
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw ?? 0;
                                return value.toLocaleString() + ' FCFA';
                            }
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }}
        />
    );
}
