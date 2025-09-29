import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/inertia-react';

export default function Index() {
  const { buses, filters } = usePage().props;
  const [perPage, setPerPage] = useState(filters.per_page || 20);
  const [agencyId, setAgencyId] = useState(filters.agency_id || '');

  const handleFilter = () => {
    Inertia.get(route('buses.index'), { per_page: perPage, agency_id: agencyId }, { preserveState: true });
  };

  return (
    <div>
      <h1>Buses</h1>
      <div>
        <label>Agency:</label>
        <input type="text" value={agencyId} onChange={e => setAgencyId(e.target.value)} />
        <label>Per page:</label>
        <input type="number" value={perPage} onChange={e => setPerPage(e.target.value)} />
        <button onClick={handleFilter}>Filter</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Model</th>
            <th>Seats</th>
            <th>Agency</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {buses.data.map(bus => (
            <tr key={bus.id}>
              <td>{bus.id}</td>
              <td>{bus.model}</td>
              <td>{bus.seats}</td>
              <td>{bus.agency?.name}</td>
              <td><a href={route('buses.edit', bus.id)}>Edit</a></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {buses.links.map((link,i) => (
          <button key={i} disabled={!link.url} onClick={() => Inertia.get(link.url)} dangerouslySetInnerHTML={{__html: link.label}} />
        ))}
      </div>
    </div>
  );
}
