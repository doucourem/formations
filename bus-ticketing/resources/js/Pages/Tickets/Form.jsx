import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import GuestLayout from '@/Layouts/GuestLayout';

export default function TicketForm({ ticket, trips }) {
  const [form, setForm] = useState({
    trip_id: ticket?.trip_id || '',
    client_name: ticket?.client_name || '',
    client_nina: ticket?.client_nina || '',
    seat_number: ticket?.seat_number || '',
    price: ticket?.price || '',
    status: ticket?.status || 'booked',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ticket?.id) {
      Inertia.put(route('tickets.update', ticket.id), form);
    } else {
      Inertia.post(route('tickets.store'), form);
    }
  };

  return (
    <GuestLayout>
      <h1 className="text-2xl font-bold mb-4">
        {ticket?.id ? `Éditer le ticket #${ticket.id}` : 'Créer un ticket'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Voyage</label>
          <select
            name="trip_id"
            value={form.trip_id}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
            required
          >
            <option value="">Sélectionner un voyage</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.route?.departureCity?.name || '-'} → {t.route?.arrivalCity?.name || '-'} ({t.departure_at})
              </option>
            ))}
          </select>
        </div>

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
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Siège</label>
          <input
            type="text"
            name="seat_number"
            value={form.seat_number}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Prix</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Statut</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
            required
          >
            <option value="booked">Réservé</option>
            <option value="paid">Payé</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {ticket?.id ? 'Mettre à jour' : 'Créer'}
        </button>
      </form>
    </GuestLayout>
  );
}
