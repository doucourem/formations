import { useEffect, useState } from "react";
import axios from "axios";
import GuestLayout from "@/Layouts/GuestLayout";

import SalesChart from "@/Components/SalesChart";
import ParcelRoutesChart from "@/Components/ParcelRoutesChart";
import BusFillRate from "@/Components/BusFillRate";
import TopDrivers from "@/Components/TopDrivers";
import TopRoutes from "@/Components/TopRoutes";
import ExpensesDashboard from "@/Pages/Dashboard/ExpensesDashboard";

import { TrendingUp, Bus, Package, Wallet } from "lucide-react";

// ===== Formatters =====
const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString("fr-FR")} FCFA`;

const formatNumber = (num) =>
  num != null ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : "0";

// ===== KPI CARD =====
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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get("/dashboard/data")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <GuestLayout>
        <div className="flex justify-center items-center h-96">
          <span className="text-gray-500 text-lg">Chargement du tableau de bord...</span>
        </div>
      </GuestLayout>
    );
  }

  // Déstructurer les données avec valeurs par défaut
  const {
    sales = [],
    parcel_routes = [],
    buses = [],
    top_drivers = [],
    top_routes = [],
    kpis = {},
  } = data;

  return (
    <GuestLayout>
      <div className="p-6 space-y-8">
        {/* ===== HEADER ===== */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">📈 Tableau de bord</h1>
          <span className="text-sm text-gray-500">Mise à jour : aujourd’hui</span>
        </div>

        {/* ===== KPI ROW ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Chiffre d'affaires"
            value={formatMoney(kpis.revenue)}
            icon={Wallet}
          />
          <KpiCard
            title="Billets vendus"
            value={formatNumber(kpis.parcels)}
            icon={Package}
          />
          <KpiCard
            title="Bus actifs"
            value={formatNumber(kpis.buses)}
            icon={Bus}
          />
          <KpiCard
            title="Taux remplissage"
            value={`${kpis.fill_rate ?? 0}%`}
            icon={TrendingUp}
          />
        </div>

        {/* ===== ANALYTICS ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-xl shadow border">
            <h2 className="font-semibold mb-3">Évolution des ventes</h2>
            <div className="h-64">
              <SalesChart sales={sales} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow border">
            <h2 className="font-semibold mb-3">Colis par route</h2>
            <div className="h-64">
              <ParcelRoutesChart routes={parcel_routes} />
            </div>
          </div>
        </div>

        {/* ===== OPERATIONS ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-xl shadow border">
            <h2 className="font-semibold mb-3">Remplissage des bus</h2>
            <BusFillRate buses={buses} />
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
            <TopDrivers drivers={top_drivers} />
          </div>

          <div className="bg-white p-4 rounded-xl shadow border">
            <h2 className="font-semibold mb-3">Top Routes</h2>
            <TopRoutes routes={top_routes} />
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
