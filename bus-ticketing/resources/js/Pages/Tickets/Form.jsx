import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import AdminLayout from '@/Components/AdminLayout';

export default function TicketForm({ ticket }) {
  const [form, setForm] = useState({
    client_name: ticket?.client_name || '',
    client_nina: ticket?.client_nina || '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ticket?.id) {
      Inertia.put(route('tickets.update', ticket.id), form);
    } else {
      Inertia.post(route('tickets.store'), form);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">
        {ticket?.id ? `Éditer le ticket #${ticket.id}` : 'Créer un ticket'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Nom du client</label>
          <input
            type="text"
            name="client_name"
            value={form.client_name}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">NINA</label>
          <input
            type="text"
            name="client_nina"
            value={form.client_nina}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
            required
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {ticket?.id ? 'Mettre à jour' : 'Créer'}
        </button>
      </form>
    </AdminLayout>
  );
}
