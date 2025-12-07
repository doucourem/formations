import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GuestLayout from '@/Layouts/GuestLayout';
import SalesChart from '@/Components/SalesChart';
import BusFillRate from '@/Components/BusFillRate';
import TopDrivers from '@/Components/TopDrivers';
import TopRoutes from '@/Components/TopRoutes';
import ParcelRoutesChart from '@/Components/ParcelRoutesChart';
import { Package, MoveRight, BarChart2, Users, MapPin } from 'lucide-react';

export default function DashboardIndex() {
    const [data, setData] = useState({
        colis: [],
        transferts: [],
        buses: [],
        top_drivers: [],
        top_routes: [],
        parcel_routes: [],
    });

    useEffect(() => {
        axios.get('/dashboard/data').then(res => setData(res.data));
    }, []);

    return (
        <GuestLayout>
            <div className="p-4 space-y-6">
                <h1 className="text-3xl font-bold">Dashboard Transport</h1>

                {/* ===== ROW 1 : COLIS + TRANSFERTS ===== */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* COLIS */}
                    <div className="p-4 bg-white shadow rounded-xl border">
                        <div className="flex items-center mb-3">
                            <Package className="text-orange-600 mr-2" />
                            <h2 className="text-xl font-semibold">Colis (30 derniers jours)</h2>
                        </div>
                        <div className="h-64">
                            <SalesChart sales={data.colis} />
                        </div>
                    </div>

                    {/* TRANSFERTS */}
                    <div className="p-4 bg-white shadow rounded-xl border">
                        <div className="flex items-center mb-3">
                            <MoveRight className="text-blue-600 mr-2" />
                            <h2 className="text-xl font-semibold">Transferts (30 derniers jours)</h2>
                        </div>
                        <div className="h-64">
                            <SalesChart sales={data.transferts} />
                        </div>
                    </div>

                </div>

                {/* ===== ROW 2 : CHAUFFEURS + ROUTES ===== */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* TOP DRIVERS */}


                    {/* TOP ROUTES */}
                    <div className="p-4 bg-white shadow rounded-xl border">
                        <div className="flex items-center mb-3">
                            <MapPin className="text-red-600 mr-2" />
                            <h2 className="text-xl font-semibold">Top Routes</h2>
                        </div>
                        <TopRoutes routes={data.top_routes} />
                    </div>

                </div>

                {/* ===== ROW 3 : MONTANT COLIS PAR ROUTE ===== */}
                <div className="p-4 bg-white shadow rounded-xl border">
                    <div className="flex items-center mb-3">
                        <Package className="text-orange-600 mr-2" />
                        <h2 className="text-xl font-semibold">Montant total des colis par route</h2>
                    </div>

                    <div className="h-72">
                        <ParcelRoutesChart routes={data.parcel_routes} />
                    </div>
                </div>

            </div>
        </GuestLayout>
    );
}
