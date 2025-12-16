import React, { useState, useEffect } from 'react';
import ClientSearch from "@/Components/ClientSearch";



const TransactionEditForm = ({ transaction, onSave, onCancel }) => {
  const [amountSent, setAmountSent] = useState(transaction.amountSent.toString());
  const [amountToPay, setAmountToPay] = useState(transaction.amountToPay.toString());
  const [senderName, setSenderName] = useState(transaction.senderName || '');
  const [receiverName, setReceiverName] = useState(transaction.receiverName || '');
  const [destination, setDestination] = useState(transaction.destination || '');
  const [code, setCode] = useState(transaction.code || '');
  const [notes, setNotes] = useState(transaction.notes || '');
  const [errors, setErrors] = useState({});
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      setClients(
        data?.map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email,
          createdAt: c.created_at,
          totalSent: c.total_sent || 0,
          totalToPay: c.total_to_pay || 0,
          totalPaid: c.total_paid || 0,
          currentDebt: c.current_debt || 0,
          previousDebt: c.previous_debt || 0
        })) || []
      );
    } catch (err) {
      console.error('Erreur lors du chargement des clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!amountSent || isNaN(Number(amountSent)) || Number(amountSent) <= 0) {
      newErrors.amountSent = 'Veuillez saisir un montant valide à envoyer';
    }
    if (!amountToPay || isNaN(Number(amountToPay)) || Number(amountToPay) <= 0) {
      newErrors.amountToPay = 'Veuillez saisir un montant valide à payer';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      ...transaction,
      clientId: selectedClient?.id || transaction.clientId,
      amountSent: Number(amountSent),
      amountToPay: Number(amountToPay),
      senderName: senderName.trim() || undefined,
      receiverName: receiverName.trim() || undefined,
      destination: destination.trim() || undefined,
      code: code.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-md">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-blue-800">Client</h3>
            <p className="text-sm text-blue-600">{selectedClient?.name || 'Sélectionnez un client'}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowClientSearch(!showClientSearch)}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-100 rounded-md"
          >
            Changer le client
          </button>
        </div>
        {showClientSearch && (
          <div className="mt-4">
            <ClientSearch
              clients={clients}
              onClientSelect={(c) => { setSelectedClient(c); setShowClientSearch(false); }}
              onCreateNew={() => {}}
              onRefresh={loadClients}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Montant Envoyé', value: amountSent, setter: setAmountSent, key: 'amountSent' },
          { label: 'Montant à Payer', value: amountToPay, setter: setAmountToPay, key: 'amountToPay' }
        ].map(({ label, value, setter, key }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700">{label} <span className="text-red-500">*</span></label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                value={value}
                onChange={(e) => setter(e.target.value)}
                className={`block w-full pr-12 rounded-md shadow-sm sm:text-sm border ${
                  errors[key] ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                step="0.01"
                min="0"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">FCFA</span>
              </div>
            </div>
            {errors[key] && <p className="mt-1 text-sm text-red-600">{errors[key]}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Nom de l'Expéditeur", value: senderName, setter: setSenderName },
          { label: 'Nom du Destinataire', value: receiverName, setter: setReceiverName },
          { label: 'Destination', value: destination, setter: setDestination },
          { label: 'Code/Référence', value: code, setter: setCode }
        ].map(({ label, value, setter }) => (
          <div key={label}>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setter(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Enregistrer
        </button>
      </div>
    </form>
  );
};

export default TransactionEditForm;
