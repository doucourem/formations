import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GuestLayout from '@/Layouts/GuestLayout';
import SalesChart from '@/Components/SalesChart';
import BusFillRate from '@/Components/BusFillRate';
import TopDrivers from '@/Components/TopDrivers';
import TopRoutes from '@/Components/TopRoutes';
import ExpensesDashboard from '@/Pages/Dashboard/ExpensesDashboard';
import ParcelRoutesChart from '@/Components/ParcelRoutesChart';
import { Package } from "lucide-react";


import { TrendingUp, BarChart2, Users, MapPin } from 'lucide-react';

export default function DashboardIndex() {
    const [data, setData] = useState({ sales: [], buses: [], top_drivers: [], top_routes: [] });

    useEffect(() => {
        axios.get('/dashboard/data').then(res => setData(res.data));
    }, []);

    return (
        <GuestLayout>
            <div className="p-4 space-y-6">
                <h1 className="text-3xl font-bold">Dashboard Transport</h1>

                {/* ====== ROW 1 (Sales + Bus Fill Rate) ====== */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* SALES */}
                    <div className="p-4 bg-white shadow rounded-xl border">
                        <div className="flex items-center mb-3">
                            <TrendingUp className="text-blue-600 mr-2" />
                            <h2 className="text-xl font-semibold">Ventes (30 derniers jours)</h2>
                        </div>
                        <div className="h-64">
                            <SalesChart sales={data.sales} />
                        </div>
                    </div>

                    {/* BUS FILL RATE */}
                    <div className="p-4 bg-white shadow rounded-xl border">
                        <div className="flex items-center mb-3">
                            <BarChart2 className="text-green-600 mr-2" />
                            <h2 className="text-xl font-semibold">Taux de remplissage des bus</h2>
                        </div>
                        <div className="h-64 flex justify-center">
                            <BusFillRate buses={data.buses} />
                        </div>
                    </div>

                </div>

                {/* ====== ROW 2 (Drivers + Routes) ====== */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* TOP DRIVERS */}
                    <div className="p-4 bg-white shadow rounded-xl border">
                        <div className="flex items-center mb-3">
                            <Users className="text-purple-600 mr-2" />
                            <h2 className="text-xl font-semibold">Top Chauffeurs</h2>
                        </div>
                        <TopDrivers drivers={data.top_drivers} />
                    </div>

                    {/* TOP ROUTES */}
                    <div className="p-4 bg-white shadow rounded-xl border">
                       <div className="p-4 bg-white shadow rounded-xl border">
    <div className="flex items-center mb-3">
        <MapPin className="text-red-600 mr-2" />
        <h2 className="text-xl font-semibold">Top Routes</h2>
    </div>
    <TopRoutes routes={data.top_routes} />
</div>


                        <ul className="space-y-3">
                            {data.top_routes.map((r, i) => (
                                <li key={i} className="flex justify-between p-2 bg-gray-50 rounded-md">
                                    <span className="font-medium">{r.route}</span>
                                    <span className="text-sm text-gray-600">
                                        {r.tickets_sold} tickets • {r.revenue} FCFA
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ====== ROW — Graphique Colis par Route ====== */}
<div className="p-4 bg-white shadow rounded-xl border">
    <div className="flex items-center mb-3">
        <Package className="text-orange-600 mr-2" />
        <h2 className="text-xl font-semibold">Montant total des colis par route</h2>
    </div>

    <div className="h-72">
        <ParcelRoutesChart routes={data.parcel_routes} />
    </div>
    <ExpensesDashboard tripId={5} rentalId={3} deliveryId={8} />

</div>


                </div>
            </div>
        </GuestLayout>
    );
}
