import React from 'react';
import { Doughnut } from 'react-chartjs-2';

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

// 🔥 Obligatoire pour les Doughnut / Pie Charts
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

export default function BusFillRate({ buses }) {
    const labels = buses.map(b => b.bus);
    const data = buses.map(b => b.fill_rate);

    return (
        <Doughnut
            data={{
                labels,
                datasets: [{
                    data,
                    backgroundColor: buses.map(b =>
                        b.fill_rate > 75
                            ? '#10b981'   // vert
                            : b.fill_rate > 50
                                ? '#f59e0b' // orange
                                : '#ef4444' // rouge
                    ),
                    borderWidth: 1,
                }]
            }}
            options={{
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }}
        />
    );
}
