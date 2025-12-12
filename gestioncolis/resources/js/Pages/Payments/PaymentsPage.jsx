import React, { useState } from "react";
import { usePage, router } from "@inertiajs/react";

export default function PaymentsPage() {
  const { clients, payments, today, flash } = usePage().props;

  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSavePayment = (data) => {
    setLoading(true);

    router.post(
      route("payments.store"),
      data,
      {
        preserveScroll: true,
        onSuccess: () => {
          setSelectedClient(null);
          setLoading(false);
        },
      }
    );
  };

  const formatFCFA = (amount) => {
    return `${Number(amount).toLocaleString("fr-FR")} FCFA`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>

      {/* Recherche client */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Sélectionner un Client
        </h2>

      

        <div className="mt-4 text-sm text-gray-500 text-center">
          Recherchez un client pour effectuer un paiement.
        </div>
      </div>

      {/* Formulaire de paiement */}
      {selectedClient && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Nouveau Paiement
          </h2>

         
        </div>
      )}

      {/* Liste des paiements du jour */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Paiements du Jour</h2>
          <p className="text-sm text-gray-500">{today}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Heure</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {payments.length ? (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(p.created_at).toLocaleTimeString("fr-FR")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {p.client?.name ?? "Client inconnu"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-green-600 font-medium">
                        {formatFCFA(p.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {p.notes || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun paiement aujourd'hui
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
