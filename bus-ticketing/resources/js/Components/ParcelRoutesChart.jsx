import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

export default function ParcelRoutesChart({ routes }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={routes} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="route" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_amount" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
