import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/inertia-react';

export default function Index() {
  const { routes, filters } = usePage().props;
  const [perPage, setPerPage] = useState(filters.per_page || 20);

  return (
    <div>
      <h1>Routes</h1>
      <div>
        <label>Per page:</label>
        <input type="number" value={perPage} onChange={e => setPerPage(e.target.value)} />
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Departure City</th>
            <th>Arrival City</th>
            <th>Distance (km)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {routes.data.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.departure_city}</td>
              <td>{r.arrival_city}</td>
              <td>{r.distance}</td>
              <td><a href={route('routes.edit', r.id)}>Edit</a></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        {routes.links.map((link,i) => (
          <button key={i} disabled={!link.url} onClick={() => Inertia.get(link.url)} dangerouslySetInnerHTML={{__html: link.label}} />
        ))}
      </div>
    </div>
  );
}
