import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import AdminLayout from '@/Components/AdminLayout';

export default function Index({ agencies, filters }) {
  const [parPage, setParPage] = useState(filters?.per_page || 20);
  const [ville, setVille] = useState(filters?.city || '');

  const filtrer = () => {
    Inertia.get(
      route('agencies.index'),
      { per_page: parPage, city: ville },
      { preserveState: true }
    );
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Agences</h1>

      <div className="mb-4 flex gap-2 items-end">
        <div>
          <label className="block mb-1 font-medium">Ville :</label>
          <input
            type="text"
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Par page :</label>
          <input
            type="number"
            value={parPage}
            onChange={(e) => setParPage(e.target.value)}
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
            <th className="border px-2 py-1">Nom</th>
            <th className="border px-2 py-1">Ville</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {agencies.data.map((agence) => (
            <tr key={agence.id}>
              <td className="border px-2 py-1">{agence.id}</td>
              <td className="border px-2 py-1">{agence.name}</td>
              <td className="border px-2 py-1">{agence.city}</td>
              <td className="border px-2 py-1">
                <a
                  href={route('agencies.edit', agence.id)}
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
        {agencies.links.map((link, i) => (
          <button
            key={i}
            disabled={!link.url}
            onClick={() => Inertia.get(link.url)}
            className={`px-3 py-1 border rounded ${
              !link.url ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-200'
            }`}
            dangerouslySetInnerHTML={{ __html: link.label }}
          />
        ))}
      </div>
    </AdminLayout>
  );
}
