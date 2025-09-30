import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import AdminLayout from '@/Components/AdminLayout';
import GuestLayout from '@/Layouts/GuestLayout';
export default function Index({ initialTickets }) {
  const [tickets, setTickets] = useState(initialTickets);

  const handlePage = (url) => {
    Inertia.get(url, {}, {
      preserveState: true,
      onSuccess: page => setTickets(page.props.tickets),
    });
  };

  return (
    <GuestLayout>
      <h1 className="text-2xl font-bold mb-4">Tickets</h1>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Voyage</th>
            <th className="border px-2 py-1">Utilisateur</th>
            <th className="border px-2 py-1">Siège</th>
            <th className="border px-2 py-1">Prix</th>
            <th className="border px-2 py-1">Statut</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.data.map(ticket => (
            <tr key={ticket.id}>
              <td className="border px-2 py-1">{ticket.id}</td>
              <td className="border px-2 py-1">
                {ticket.trip?.route?.departureCity?.name} → {ticket.trip?.route?.arrivalCity?.name}
              </td>
              <td className="border px-2 py-1">{ticket.user?.name}</td>
              <td className="border px-2 py-1">{ticket.seat_number}</td>
              <td className="border px-2 py-1">{ticket.price}</td>
              <td className="border px-2 py-1">{ticket.status}</td>
              <td className="border px-2 py-1">
                <a href={route('tickets.edit', ticket.id)} className="text-blue-600 hover:underline">Éditer</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex gap-2">
        {tickets.links.map((link, i) => (
          <button
            key={i}
            disabled={!link.url}
            onClick={() => handlePage(link.url)}
            className={`px-3 py-1 border rounded ${!link.url ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-200'}`}
            dangerouslySetInnerHTML={{ __html: link.label }}
          />
        ))}
      </div>
    </GuestLayout>
  );
}
