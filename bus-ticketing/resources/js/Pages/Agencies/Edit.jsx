import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import GuestLayout from '@/Layouts/GuestLayout';
export default function Edit({ agency }) {
  const [form, setForm] = useState({
    name: agency?.name || '',
    city: agency?.city || '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.put(route('agencies.update', agency.id), form);
  };

  return (
    <GuestLayout>
    <div>
      <h1>Modifier l’agence #{agency.id}</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Nom :</label>
          <input
            id="name"
            name="name"
            placeholder="Nom de l’agence"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="city">Ville :</label>
          <input
            id="city"
            name="city"
            placeholder="Ville"
            value={form.city}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Mettre à jour</button>
      </form>
    </div>
    </GuestLayout>
  );
}
