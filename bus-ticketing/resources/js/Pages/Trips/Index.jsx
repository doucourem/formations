import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/inertia-react';

export default function Index() {
  const { trips, filters } = usePage().props;
  const [perPage, setPerPage] = useState(filters.per_page || 20);
  const [busId, setBusId] = useState(filters.bus_id || '');
  const [routeId, setRouteId] = useState(filters.route_id || '');

  const handleFilter = () => {
    Inertia.get(route('trips.index'), { per_page: perPage, bus_id: busId, route_id: routeId }, { preserveState: true });
  };

  return (
    <div>
      <h1>Trips</h1>
      <div>
        <label>Bus:</label>
        <input type="text" value={busId} onChange={e => setBusId(e.target.value)} />
        <label>Route:</label>
        <input type="text" value={routeId} onChange={e => setRouteId(e.target.value)} />
        <label>Per page:</label>
        <input type="number" value={perPage} onChange={e => setPerPage(e.target.value)} />
        <button onClick={handleFilter}>Filter</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Route</th>
            <th>Bus</th>
            <th>Departure</th>
            <th>Arrival</th>
            <th>Price</th>
            <th>Seats</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {trips.data.map(trip => (
            <tr key={trip.id}>
              <td>{trip.id}</td>
              <td>{trip.route?.departureCity?.name} → {trip.route?.arrivalCity?.name}</td>
              <td>{trip.bus?.model}</td>
              <td>{trip.departure_at}</td>
              <td>{trip.arrival_at}</td>
              <td>{trip.base_price}</td>
              <td>{trip.seats_available}</td>
              <td>
                <a href={route('trips.edit', trip.id)}>Edit</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        {trips.links.map((link, i) => (
          <button key={i} disabled={!link.url} onClick={() => Inertia.get(link.url)} dangerouslySetInnerHTML={{__html: link.label}} />
        ))}
      </div>
    </div>
  );
}
