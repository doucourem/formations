import React, { useEffect, useState } from "react";
import { usePage, router } from "@inertiajs/react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import GuestLayout from '@/Layouts/GuestLayout';
export default function ReportsPage() {
  const { reports } = usePage().props; // Laravel doit passer les données dans 'reports'
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState({
    clients: [],
    transactions: [],
    payments: [],
  });

  // Mettre à jour les données quand Inertia props changent
  useEffect(() => {
    if (reports) {
      setData(reports);
    }
  }, [reports]);

  const formatFCFA = (n) => `${(n || 0).toLocaleString("fr-FR")} FCFA`;

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Rapport Global", 14, 20);

    const table = data.clients.map((c) => [
      c.name,
      formatFCFA(c.total_sent),
      formatFCFA(c.total_to_pay),
      formatFCFA(c.total_paid),
      formatFCFA(c.current_debt),
    ]);

    doc.autoTable({
      head: [["Client", "Envoyé", "À payer", "Payé", "Dette"]],
      body: table,
      startY: 30,
    });

    doc.save("rapport.pdf");
  };

  const applyFilters = () => {
    router.get(
      "/reports", // route Laravel
      { start: startDate, end: endDate },
      { preserveState: true, replace: true }
    );
  };

  return (
    <GuestLayout>
    <div className="p-6">
      <h1 className="text-xl font-bold">Rapports</h1>

      {/* Filtres */}
      <div className="flex space-x-4 my-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2"
        />
        <button
          onClick={applyFilters}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Appliquer
        </button>
      </div>

      {/* Action */}
      <button
        onClick={generatePDF}
        className="bg-green-600 text-white px-4 py-2 rounded my-2"
      >
        Exporter PDF
      </button>

      {/* Tableau */}
      <table className="w-full mt-6 border">
        <thead className="bg-gray-200">
          <tr>
            <th>Client</th>
            <th>Total Envoyé</th>
            <th>Total à Payer</th>
            <th>Total Payé</th>
            <th>Dette</th>
          </tr>
        </thead>
        <tbody>
          {data.clients.map((c) => (
            <tr key={c.id} className="border-b">
              <td>{c.name}</td>
              <td>{formatFCFA(c.total_sent)}</td>
              <td>{formatFCFA(c.total_to_pay)}</td>
              <td>{formatFCFA(c.total_paid)}</td>
              <td
                className={
                  c.current_debt > 0 ? "text-red-600" : "text-green-600"
                }
              >
                {formatFCFA(c.current_debt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </GuestLayout>
  );
}
