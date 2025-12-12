import React, { useState, useMemo } from "react";
import { usePage, router } from "@inertiajs/react";
import axios from "axios";

export default function AccountingPage() {
  const { clients, transactions, prelevementRate, notes, inventoryFields } = usePage().props;

  const [rate, setRate] = useState(prelevementRate);
  const [bureauAmounts, setBureauAmounts] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [saving, setSaving] = useState(false);

  const changeMonth = (value) => {
    setSelectedMonth(value);
    router.get("/accounting", { month: value }, { preserveState: true, replace: true });
  };

  // Validation montant bureau
  const handleBureauChange = (id, value, max) => {
    const newValue = Math.min(Number(value), max);
    setBureauAmounts({ ...bureauAmounts, [id]: newValue });
  };

  const savePrelevementRate = async () => {
    try {
      setSaving(true);
      await axios.post("/accounting/rate", { rate, month: selectedMonth });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du taux :", error);
    } finally {
      setSaving(false);
    }
  };

  const saveBureauAmounts = async () => {
    try {
      setSaving(true);
      await axios.post("/accounting/bureau", { bureauAmounts, month: selectedMonth });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des montants bureau :", error);
    } finally {
      setSaving(false);
    }
  };

  const totals = useMemo(() => {
    let globalCommission = 0;
    let bureauTotal = 0;
    let partnerTotal = 0;

    transactions.forEach((t) => {
      const prelevement = t.amountSent * (1 + rate / 100);
      const commission = t.amountToPay - prelevement;
      const bureau = bureauAmounts[t.id] || 0;

      globalCommission += commission;
      bureauTotal += bureau;
      partnerTotal += commission - bureau;
    });

    return { globalCommission, bureauTotal, partnerTotal };
  }, [transactions, rate, bureauAmounts]);

  const formatFCFA = (n) => `${Number(n).toLocaleString("fr-FR")} FCFA`;

  return (
    <div className="space-y-10 p-6">
      <h1 className="text-3xl font-bold">Comptabilité & Gestion</h1>

      {/* Mois */}
      <div className="bg-white p-6 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-2">Mois</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => changeMonth(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {/* Taux de prélèvement */}
      <div className="bg-white p-6 rounded-lg shadow">
        <label className="block mb-2 font-medium text-gray-700">Taux de prélèvement (%)</label>
        <div className="flex gap-3 items-center">
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="border p-2 rounded w-32"
          />
          <button
            onClick={savePrelevementRate}
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={saving}
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>

      {/* Tableau Transactions */}
      <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Transactions du mois</h2>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Client</th>
              <th className="px-4 py-2 text-left">Envoyé</th>
              <th className="px-4 py-2 text-left">À payer</th>
              <th className="px-4 py-2 text-left">Commission</th>
              <th className="px-4 py-2 text-left">Bureau</th>
              <th className="px-4 py-2 text-left">Partenaire</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length ? (
              transactions.map((t) => {
                const prelevement = t.amountSent * (1 + rate / 100);
                const commission = t.amountToPay - prelevement;
                const bureau = bureauAmounts[t.id] || 0;
                const partenaire = commission - bureau;

                return (
                  <tr key={t.id} className="border-t">
                    <td className="px-4 py-2">{new Date(t.created_at).toLocaleString("fr-FR")}</td>
                    <td className="px-4 py-2">{t.client?.name}</td>
                    <td className="px-4 py-2 text-blue-600">{formatFCFA(t.amountSent)}</td>
                    <td className="px-4 py-2">{formatFCFA(t.amountToPay)}</td>
                    <td className="px-4 py-2 text-green-600">{formatFCFA(commission)}</td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        className="w-24 border p-1 rounded"
                        value={bureau}
                        onChange={(e) => handleBureauChange(t.id, e.target.value, commission)}
                      />
                    </td>
                    <td className="px-4 py-2">{formatFCFA(partenaire)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-4 text-center text-gray-500">
                  Aucune transaction pour ce mois.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totaux */}
        <div className="mt-6 border-t pt-4 grid grid-cols-3 gap-6 text-lg">
          <div>
            <strong>Total Commission Globale :</strong>
            <div className="text-green-700">{formatFCFA(totals.globalCommission)}</div>
          </div>
          <div>
            <strong>Total Bureau :</strong>
            <div className="text-blue-700">{formatFCFA(totals.bureauTotal)}</div>
          </div>
          <div>
            <strong>Total Partenaire :</strong>
            <div className="text-purple-700">{formatFCFA(totals.partnerTotal)}</div>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={saveBureauAmounts}
            className="bg-green-600 text-white px-4 py-2 rounded"
            disabled={saving}
          >
            {saving ? "Enregistrement..." : "Enregistrer Montants Bureau"}
          </button>
        </div>
      </div>

      {/* Modules */}
      {/*inventoryFields?.length > 0 && <InventoryModule fields={inventoryFields} />*/}
      {/*notes && <FinancialNotesModule initialNote={notes} />*/}
    </div>
  );
}
