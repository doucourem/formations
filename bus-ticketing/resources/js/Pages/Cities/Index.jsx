import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import { Link } from '@inertiajs/inertia-react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Index({ cities }) { // <-- cities vient des props Inertia
  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this city?')) {
      Inertia.delete(route('cities.destroy', id));
    }
  };

  return (
    <GuestLayout>
      <h1 className="text-2xl font-bold mb-4">Cities</h1>
      <div className="mb-4">
        <Link
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          href={route('cities.create')}
        >
          Add New City
        </Link>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Code</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {cities.data.map((city) => (
            <tr key={city.id}>
              <td className="border px-4 py-2">{city.id}</td>
              <td className="border px-4 py-2">{city.name}</td>
              <td className="border px-4 py-2">{city.code || '-'}</td>
              <td className="border px-4 py-2">
                <Link
                  className="text-blue-500 hover:underline mr-2"
                  href={route('cities.edit', city.id)}
                >
                  Edit
                </Link>
                <button
                  className="text-red-500 hover:underline"
                  onClick={() => handleDelete(city.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-4 space-x-2">
        {cities.links.map((link, index) => (
          <span
            key={index}
            dangerouslySetInnerHTML={{ __html: link.label }}
          />
        ))}
      </div>
    </GuestLayout>
  );
}
