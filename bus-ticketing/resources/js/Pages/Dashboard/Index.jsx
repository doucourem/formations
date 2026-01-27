import { useEffect, useState } from "react";
import axios from "axios";
import GuestLayout from "@/Layouts/GuestLayout";

import SalesChart from "@/Components/SalesChart";
import ParcelRoutesChart from "@/Components/ParcelRoutesChart";
import BusFillRate from "@/Components/BusFillRate";
import TopDrivers from "@/Components/TopDrivers";
import TopRoutes from "@/Components/TopRoutes";
import ExpensesDashboard from "@/Pages/Dashboard/ExpensesDashboard";

import {
  TrendingUp,
  Bus,
  Package,
  Wallet,
} from "lucide-react";

/* ===== KPI CARD ===== */
const KpiCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white border rounded-xl p-5 shadow-sm flex justify-between items-center">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
    <Icon className="w-8 h-8 text-blue-600" />
  </div>
);

export default function DashboardIndex() {
  const [data, setData] = useState({
    sales: [],
    parcel_routes: [],
    buses: [],
    top_drivers: [],
    top_routes: [],
    kpis: {},
  });

  useEffect(() => {
    axios.get("/dashboard/data").then((res) => setData(res.data));
  }, []);

  return (
    <GuestLayout>
      <div className="p-6 space-y-8">

        {/* ===== HEADER ===== */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">📈 Tableau de bord</h1>
          <span className="text-sm text-gray-500">
            Mise à jour : aujourd’hui
          </span>
        </div>

        {/* ===== KPI ROW ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Chiffre d'affaires"
            value={`${data.kpis.revenue ?? 0} FCFA`}
            icon={Wallet}
          />
          <KpiCard
            title="Colis envoyés"
            value={data.kpis.parcels ?? 0}
            icon={Package}
          />
          <KpiCard
            title="Bus actifs"
            value={data.kpis.buses ?? 0}
            icon={Bus}
          />
          <KpiCard
            title="Taux remplissage"
            value={`${data.kpis.fill_rate ?? 0}%`}
            icon={TrendingUp}
          />
        </div>

        {/* ===== ANALYTICS ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-xl shadow border">
            <h2 className="font-semibold mb-3">Évolution des ventes</h2>
            <div className="h-64">
              <SalesChart sales={data.sales} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow border">
            <h2 className="font-semibold mb-3">Colis par route</h2>
            <div className="h-64">
              <ParcelRoutesChart routes={data.parcel_routes} />
            </div>
          </div>
        </div>

        {/* ===== OPERATIONS ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-xl shadow border">
            <h2 className="font-semibold mb-3">Remplissage des bus</h2>
            <BusFillRate buses={data.buses} />
          </div>

          <div className="bg-white p-4 rounded-xl shadow border">
            <h2 className="font-semibold mb-3">Dépenses</h2>
            <ExpensesDashboard />
          </div>
        </div>

        {/* ===== PERFORMANCE ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-xl shadow border">
            <h2 className="font-semibold mb-3">Top Chauffeurs</h2>
            <TopDrivers drivers={data.top_drivers} />
          </div>

          <div className="bg-white p-4 rounded-xl shadow border">
            <h2 className="font-semibold mb-3">Top Routes</h2>
            <TopRoutes routes={data.top_routes} />
          </div>
        </div>

      </div>
    </GuestLayout>
  );
}
