import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';

export default function Create() {
  const [form, setForm] = useState({
    departure_city: '',
    arrival_city: '',
    distance: ''
  });

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.post(route('routes.store'), form);
  };

  return (
    <div>
      <h1>Create Route</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Departure City:</label>
          <input name="departure_city" placeholder="Departure city" value={form.departure_city} onChange={handleChange} />
        </div>
        <div>
          <label>Arrival City:</label>
          <input name="arrival_city" placeholder="Arrival city" value={form.arrival_city} onChange={handleChange} />
        </div>
        <div>
          <label>Distance (km):</label>
          <input name="distance" type="number" placeholder="Distance" value={form.distance} onChange={handleChange} />
        </div>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}
