import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';

export default function Index({ initialRoutes, initialFilters }) {
  const [routes, setRoutes] = useState(initialRoutes);
  const [parPage, setParPage] = useState(initialFilters?.per_page || 20);

  const filtrer = () => {
    Inertia.get(
      route('routes.index'),
      { per_page: parPage },
      {
        preserveState: true,
        onSuccess: page => {
          setRoutes(page.props.routes);
        },
      }
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Routes</h1>

      <div className="mb-4 flex gap-2 items-end">
        <div>
          <label className="block mb-1 font-medium">Par page :</label>
          <input
            type="number"
            value={parPage}
            onChange={e => setParPage(e.target.value)}
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
            <th className="border px-2 py-1">Ville de départ</th>
            <th className="border px-2 py-1">Ville d'arrivée</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {routes.data.map(route => (
            <tr key={route.id}>
              <td className="border px-2 py-1">{route.id}</td>
              <td className="border px-2 py-1">{route.departureCity?.name || '-'}</td>
              <td className="border px-2 py-1">{route.arrivalCity?.name || '-'}</td>
              <td className="border px-2 py-1">
  <a
    href={route.edit_url} // <-- utiliser l'URL générée côté Laravel
    className="text-blue-600 hover:underline"
  >
    Éditer
  </a>
</td>

            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex gap-2">
        {routes.links.map((link, i) => (
          <button
            key={i}
            disabled={!link.url}
            onClick={() =>
              Inertia.get(link.url, {}, {
                onSuccess: page => setRoutes(page.props.routes),
              })
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
