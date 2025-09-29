import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import GuestLayout from '@/Layouts/GuestLayout';
export default function Index({ buses, filters }) {
  const [parPage, setParPage] = useState(filters?.per_page || 20);
  const [agenceId, setAgenceId] = useState(filters?.agency_id || '');

  const filtrer = () => {
    Inertia.get(
      route('buses.index'),
      { per_page: parPage, agency_id: agenceId },
      { preserveState: true }
    );
  };

  return (
     <GuestLayout>    <div>
      <h1>Liste des bus</h1>

      <div>
        <label htmlFor="agence">Agence :</label>
        <input
          id="agence"
          type="text"
          value={agenceId}
          onChange={(e) => setAgenceId(e.target.value)}
        />

        <label htmlFor="parPage">Par page :</label>
        <input
          id="parPage"
          type="number"
          min="1"
          value={parPage}
          onChange={(e) => setParPage(e.target.value)}
        />

        <button onClick={filtrer}>Filtrer</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Modèle</th>
            <th>Places</th>
            <th>Agence</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {buses.data.map((bus) => (
            <tr key={bus.id}>
              <td>{bus.id}</td>
              <td>{bus.model}</td>
              <td>{bus.seats}</td>
              <td>{bus.agency?.name}</td>
              <td>
                <a href={route('buses.edit', bus.id)}>Modifier</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        {buses.links.map((link, i) => (
          <button
            key={i}
            disabled={!link.url}
            onClick={() => Inertia.get(link.url)}
            dangerouslySetInnerHTML={{ __html: link.label }}
          />
        ))}
      </div>
    </div>
    </GuestLayout>

  );
}
