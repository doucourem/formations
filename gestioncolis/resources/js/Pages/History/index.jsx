import React, { useState, useEffect } from "react";
import { Inertia } from "@inertiajs/inertia";
import { usePage } from "@inertiajs/react";
import ClientSearch from "@/Components/ClientSearch";
import TransactionEditForm from "@/Components/TransactionEditForm";
import PaymentEditForm from "@/Components/PaymentEditForm";
import { Calendar, Info, Edit, Trash2 } from "lucide-react";
import GuestLayout from '@/Layouts/GuestLayout';

export default function History() {
  const { clients, transactions: serverTransactions, payments: serverPayments } = usePage().props;

  // States pour filtres
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(false);

  // States pour données filtrées
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);

  // States pour modals
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [viewingTransaction, setViewingTransaction] = useState(null);

  // Calculs des totaux
  const totalSent = filteredTransactions.reduce((sum, t) => sum + (t.amountSent || 0), 0);
  const totalPaid = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const currentDebt = totalSent - totalPaid;

  // Fonction utilitaire pour formatter FCFA
  const formatFCFA = (amount) =>
    (amount || 0).toLocaleString("fr-FR", { style: "currency", currency: "XOF" });

  // Fonction utilitaire pour formatter les dates
  const formatDateTime = (date) => new Date(date).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });

  // Filtrage local des données
  const loadData = () => {
    setLoading(true);
    let filteredT = [...serverTransactions];
    let filteredP = [...serverPayments];

    if (selectedClient) {
      filteredT = filteredT.filter((t) => t.clientId === selectedClient.id);
      filteredP = filteredP.filter((p) => p.clientId === selectedClient.id);
    }

    if (startDate) {
      filteredT = filteredT.filter((t) => new Date(t.createdAt) >= new Date(startDate));
      filteredP = filteredP.filter((p) => new Date(p.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      filteredT = filteredT.filter((t) => new Date(t.createdAt) <= new Date(endDate));
      filteredP = filteredP.filter((p) => new Date(p.createdAt) <= new Date(endDate));
    }

    setFilteredTransactions(filteredT);
    setFilteredPayments(filteredP);
    setLoading(false);
  };

  // Recharger les données à chaque changement de filtre
  useEffect(() => {
    loadData();
  }, [startDate, endDate, selectedClient]);

  return (
    <GuestLayout>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Historique des Transactions</h1>

      {/* Filtres */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <div className="flex items-center">
            <span className="mr-2">
              <Calendar className="h-5 w-5 text-gray-500" />
            </span>
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <span className="text-gray-500">au</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setSelectedClient(null);
            }}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
          >
            Toutes les dates
          </button>
          <button
            onClick={() => {
              const today = new Date().toISOString().split("T")[0];
              setStartDate(today);
              setEndDate(today);
              setSelectedClient(null);
            }}
            className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md"
          >
            Aujourd'hui
          </button>
        </div>

        {/* Sélection client */}
        <div className="mb-6">
          <ClientSearch
            clients={clients}
            onClientSelect={setSelectedClient}
            onCreateNew={() => {}}
            onRefresh={loadData}
          />
          {selectedClient && (
            <div className="mt-2 p-2 bg-blue-50 rounded-md flex justify-between items-center">
              <span className="text-sm text-blue-700">
                Filtré pour le client: {selectedClient.name}
              </span>
              <button
                onClick={() => setSelectedClient(null)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Effacer
              </button>
            </div>
          )}
        </div>

        {/* Totaux */}
        {loading ? (
          <div className="text-center py-4">Chargement...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-blue-600">Total Envoyé</p>
                <p className="text-2xl font-semibold text-blue-800">{formatFCFA(totalSent)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-sm text-green-600">Total Payé</p>
                <p className="text-2xl font-semibold text-green-800">{formatFCFA(totalPaid)}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-md">
                <p className="text-sm text-red-600">Dette Actuelle</p>
                <p className="text-2xl font-semibold text-red-800">{formatFCFA(currentDebt)}</p>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-lg border border-gray-200 mb-6">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Transactions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th>Date</th>
                      <th>Client</th>
                      <th>Montant Envoyé</th>
                      <th>Montant à Payer</th>
                      <th>Détails</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((t) => {
                        const client = clients.find((c) => c.id === t.clientId);
                        return (
                          <tr key={t.id} className="hover:bg-gray-50">
                            <td>{formatDateTime(t.createdAt)}</td>
                            <td>{client?.name || "Client inconnu"}</td>
                            <td>{formatFCFA(t.amountSent)}</td>
                            <td>{formatFCFA(t.amountToPay)}</td>
                            <td>
                              <button onClick={() => setViewingTransaction(t)} className="text-blue-600 hover:text-blue-900">
                                <Info className="h-4 w-4" />
                              </button>
                            </td>
                            <td>
                              <button onClick={() => setEditingTransaction(t)} className="text-blue-600 hover:text-blue-900">
                                <Edit className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-sm text-gray-500">
                          Aucune transaction trouvée
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paiements Table */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Paiements</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th>Date</th>
                      <th>Client</th>
                      <th>Montant</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map((p) => {
                        const client = clients.find((c) => c.id === p.clientId);
                        return (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td>{formatDateTime(p.createdAt)}</td>
                            <td>{client?.name || "Client inconnu"}</td>
                            <td className="text-green-600 font-medium">{formatFCFA(p.amount)}</td>
                            <td>{p.notes || "-"}</td>
                            <td>
                              <button onClick={() => setEditingPayment(p)} className="text-blue-600 hover:text-blue-900">
                                <Edit className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-sm text-gray-500">
                          Aucun paiement trouvé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals pour édition et visualisation */}
      {editingTransaction && (
        <TransactionEditForm transaction={editingTransaction} onSave={loadData} onCancel={() => setEditingTransaction(null)} />
      )}
      {editingPayment && (
        <PaymentEditForm payment={editingPayment} onSave={loadData} onCancel={() => setEditingPayment(null)} />
      )}
      {viewingTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Détails de la Transaction</h3>
            <p>Client: {clients.find(c => c.id === viewingTransaction.clientId)?.name || "Inconnu"}</p>
            <p>Montant Envoyé: {formatFCFA(viewingTransaction.amountSent)}</p>
            <p>Montant à Payer: {formatFCFA(viewingTransaction.amountToPay)}</p>
            <p>Date: {formatDateTime(viewingTransaction.createdAt)}</p>
            <button onClick={() => setViewingTransaction(null)} className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-md">Fermer</button>
          </div>
        </div>
      )}
    </div>
    </GuestLayout>
  );
}
