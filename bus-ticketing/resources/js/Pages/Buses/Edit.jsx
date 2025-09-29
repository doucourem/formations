import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';

export default function Edit({ bus }) {
  if (!bus) {
    return <p>Chargement du bus...</p>;
  }

  const [form, setForm] = useState({
    model: bus.model || '',
    seats: bus.seats || '',
    agency_id: bus.agency_id || '',
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === 'number' ? Number(value) : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.put(route('buses.update', bus.id), form);
  };

  return (
    <div>
      <h1>Modifier le bus #{bus.id}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="model">Modèle :</label>
          <input
            id="model"
            name="model"
            placeholder="Modèle du bus"
            value={form.model}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="seats">Places :</label>
          <input
            id="seats"
            name="seats"
            type="number"
            min="1"
            placeholder="Nombre de places"
            value={form.seats}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="agency_id">Agence :</label>
          <input
            id="agency_id"
            name="agency_id"
            type="number"
            min="1"
            placeholder="ID de l'agence"
            value={form.agency_id}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Mettre à jour</button>
      </form>
    </div>
  );
}
