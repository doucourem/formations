import React, { useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';



const ClientSearch = ({ clients, onClientSelect, onCreateNew, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  const transformClients = (data) => {
    return data.map(client => ({
      id: client.id,
      name: client.name,
      phone: client.phone || '',
      email: client.email || '',
      createdAt: client.created_at,
      totalSent: client.total_sent || 0,
      totalToPay: client.total_to_pay || 0,
      totalPaid: client.total_paid || 0,
      currentDebt: client.current_debt || 0,
      previousDebt: client.previous_debt || 0,
    }));
  };

  const handleSearch = async () => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim().length > 0) {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .or(`name.ilike.%${term}%,phone.ilike.%${term}%`)
          .order('name', { ascending: true });

        if (error) throw error;

        setSearchResults(transformClients(data || []));
        setShowResults(true);
      } catch (err) {
        console.error('Erreur de recherche:', err);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    } else {
      resetSearch();
    }
  };

  const handleClientSelect = (client) => {
    onClientSelect(client);
    resetSearch();
  };

  const handleCreateNew = () => {
    onCreateNew();
    resetSearch();
  };

  const handleRefresh = () => {
    resetSearch();
    onRefresh?.();
  };

  const formatFCFA = (amount) => `${amount.toLocaleString('fr-FR')} FCFA`;

  return (
    <div className="max-w-lg mx-auto relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Rechercher un client par nom ou téléphone..."
            value={searchTerm}
            onChange={handleSearch}
            onFocus={() => searchTerm.trim().length > 0 && setShowResults(true)}
          />
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
          title="Réinitialiser la recherche"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {showResults && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md max-h-60 overflow-auto">
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500">Recherche en cours...</div>
          ) : searchResults.length > 0 ? (
            searchResults.map(client => (
              <div
                key={client.id}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleClientSelect(client)}
              >
                <div className="font-medium text-sm">{client.name}</div>
                <div className="text-xs text-gray-500">{client.phone}</div>
                <div className={`text-xs ${client.currentDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {client.currentDebt > 0
                    ? `Dette: ${formatFCFA(client.currentDebt)}`
                    : client.currentDebt < 0
                    ? `Avance: ${formatFCFA(Math.abs(client.currentDebt))}`
                    : 'Aucune dette'}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3">
              <p className="text-sm text-gray-500">Aucun client trouvé.</p>
              <button
                onClick={handleCreateNew}
                className="mt-1 text-xs text-blue-600 hover:text-blue-800"
              >
                Créer un nouveau client
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientSearch;
