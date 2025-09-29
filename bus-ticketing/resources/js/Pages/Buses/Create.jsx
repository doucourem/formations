import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';

export default function Create() {
  const [form, setForm] = useState({
    model: '',
    seats: '',
    agency_id: ''
  });

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.post(route('buses.store'), form);
  };

  return (
    <div>
      <h1>Create Bus</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Model:</label>
          <input name="model" placeholder="Bus model" value={form.model} onChange={handleChange} />
        </div>
        <div>
          <label>Seats:</label>
          <input name="seats" type="number" placeholder="Number of seats" value={form.seats} onChange={handleChange} />
        </div>
        <div>
          <label>Agency ID:</label>
          <input name="agency_id" placeholder="Agency ID" value={form.agency_id} onChange={handleChange} />
        </div>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}
