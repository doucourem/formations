import React from 'react';
import { router } from '@inertiajs/react'; // <-- ici
import { CreditCard, TrendingUp, AlertCircle } from 'lucide-react';

export default function Dashboard({ 
  clients, transactions, payments,
  todaysTransactionsCount, todaysPaymentsCount,
  totalPaidToday, totalToPayToday, totalAdvances, totalDebt,
  currentUser
}) {

  const formatFCFA = (amount) => `${(amount ?? 0).toLocaleString('fr-FR')} FCFA`;

  const navigateToHistory = () => {
    const today = new Date().toISOString().split('T')[0];
    router.visit('/history', { data: { startDate: today, endDate: today } });
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
        {currentUser && <div className="text-sm text-gray-500">Bienvenue, {currentUser.name}</div>}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card color="green" title="Payé Aujourd'hui" value={totalPaidToday} icon={CreditCard} />
        <Card color="blue" title="Total Avances" value={totalAdvances} icon={TrendingUp} />
        <Card color="red" title="Dette Totale" value={totalDebt} icon={AlertCircle} />
      </div>

      {/* Activité du Jour */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Activité du Jour</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center cursor-pointer" onClick={navigateToHistory}>
            <span className="text-gray-600">Transactions</span>
            <span className="font-medium">{todaysTransactionsCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Montant à Payer</span>
            <span className="font-medium">{formatFCFA(totalToPayToday)}</span>
          </div>
          <div className="flex justify-between items-center cursor-pointer" onClick={navigateToHistory}>
            <span className="text-gray-600">Paiements</span>
            <span className="font-medium">{todaysPaymentsCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Montant Payé</span>
            <span className="font-medium text-green-600">{formatFCFA(totalPaidToday)}</span>
          </div>
        </div>
      </div>

      {/* Transactions récentes */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Transactions Récentes</h2>
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th>Client</th>
                  <th>Montant Envoyé</th>
                  <th>Montant à Payer</th>
                  <th>Heure</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 5).map(t => {
                  const client = clients.find(c => c.id === t.client_id);
                  return (
                    <tr key={t.id} className="hover:bg-gray-50 cursor-pointer" onClick={navigateToHistory}>
                      <td>{client?.name || 'Inconnu'}</td>
                      <td>{formatFCFA(t.amount_sent)}</td>
                      <td>{formatFCFA(t.amount_to_pay)}</td>
                      <td>{new Date(t.created_at).toLocaleTimeString('fr-FR')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : <p className="text-gray-500">Aucune transaction aujourd'hui</p>}
      </div>
    </div>
  )
}

function Card({ color, title, value, icon: Icon }) {
  return (
    <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 p-6 rounded-lg shadow-md border-l-4 border-${color}-500`}>
      <div className="flex justify-between items-center">
        <div>
          <p className={`text-sm text-${color}-600`}>{title}</p>
          <p className={`text-2xl font-semibold text-${color}-800`}>{value.toLocaleString()} FCFA</p>
        </div>
        <div className={`bg-${color}-200 p-3 rounded-full`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  )
}
