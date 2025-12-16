import React, { useState } from 'react';



const ClientForm = ({ client, onSave, onCancel }) => {
  const [name, setName] = useState(client?.name || '');
  const [error, setError] = useState();

  const validate = ()=>{
    if (!name.trim()) {
      setError('Le nom est requis');
      return false;
    }
    setError(undefined);
    return true;
  };

  const handleSubmit = () => {
    e.preventDefault();
    if (validate()) {
      onSave({
        name: name.trim(),
        phone: '',
        email: '',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 text-center mb-2"
        >
          Nom du client <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Entrez le nom du client"
          className={`block w-full px-3 py-2 rounded-md shadow-sm sm:text-sm border ${
            error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }`}
        />
        {error && <p className="mt-1 text-sm text-red-600 text-center">{error}</p>}
      </div>

      <div className="flex justify-center space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {client ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
};

export default ClientForm;
