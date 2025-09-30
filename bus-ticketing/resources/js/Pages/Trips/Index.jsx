import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';

export default function Index({ initialTrips, initialFilters }) {
  const [trips, setTrips] = useState(initialTrips);
  const [perPage, setPerPage] = useState(initialFilters?.per_page || 20);
  const [busId, setBusId] = useState(initialFilters?.bus_id || '');
  const [routeId, setRouteId] = useState(initialFilters?.route_id || '');

  const filtrer = () => {
    Inertia.get(
      route('trips.index'),
      { per_page: perPage, bus_id: busId, route_id: routeId },
      {
        preserveState: true,
        onSuccess: page => setTrips(page.props.initialTrips),
      }
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Trajets</h1>

      <div className="mb-4 flex gap-2 items-end">
        <div>
          <label className="block mb-1 font-medium">Bus :</label>
          <input
            type="text"
            value={busId}
            onChange={e => setBusId(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Route :</label>
          <input
            type="text"
            value={routeId}
            onChange={e => setRouteId(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Par page :</label>
          <input
            type="number"
            value={perPage}
            onChange={e => setPerPage(e.target.value)}
            className="border px-2 py-1 rounded w-20"
          />
        </div>
        <button
          onClick={filtrer}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Filtrer
        </button>
      </div>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Route</th>
            <th className="border px-2 py-1">Bus</th>
            <th className="border px-2 py-1">Départ</th>
            <th className="border px-2 py-1">Arrivée</th>
            <th className="border px-2 py-1">Prix</th>
            <th className="border px-2 py-1">Places disponibles</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {trips.data.map(trip => (
            <tr key={trip.id}>
              <td className="border px-2 py-1">{trip.id}</td>
              <td className="border px-2 py-1">
                {trip.route?.departureCity?.name || '-'} → {trip.route?.arrivalCity?.name || '-'}
              </td>
              <td className="border px-2 py-1">{trip.bus?.model || '-'}</td>
              <td className="border px-2 py-1">{trip.departure_at}</td>
              <td className="border px-2 py-1">{trip.arrival_at}</td>
              <td className="border px-2 py-1">{trip.base_price}</td>
              <td className="border px-2 py-1">{trip.seats_available}</td>
              <td className="border px-2 py-1">
                <a href={trip.edit_url} className="text-blue-600 hover:underline">
                  Éditer
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex gap-2">
        {trips.links.map((link, i) => (
          <button
            key={i}
            disabled={!link.url}
            onClick={() =>
              Inertia.get(link.url, {}, { onSuccess: page => setTrips(page.props.initialTrips) })
            }
            className={`px-3 py-1 border rounded ${
              !link.url ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-200'
            }`}
            dangerouslySetInnerHTML={{ __html: link.label }}
          />
        ))}
      </div>
    </div>
  );
}
