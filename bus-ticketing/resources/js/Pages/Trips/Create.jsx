import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';

export default function Create() {
  const [form, setForm] = useState({
    route_id: '',
    bus_id: '',
    departure_at: '',
    arrival_at: '',
    base_price: '',
    seats_available: ''
  });

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.post(route('trips.store'), form);
  };

  return (
    <div>
      <h1>Create Trip</h1>
      <form onSubmit={handleSubmit}>
        <input name="route_id" placeholder="Route ID" value={form.route_id} onChange={handleChange} />
        <input name="bus_id" placeholder="Bus ID" value={form.bus_id} onChange={handleChange} />
        <input name="departure_at" type="datetime-local" value={form.departure_at} onChange={handleChange} />
        <input name="arrival_at" type="datetime-local" value={form.arrival_at} onChange={handleChange} />
        <input name="base_price" type="number" placeholder="Price" value={form.base_price} onChange={handleChange} />
        <input name="seats_available" type="number" placeholder="Seats" value={form.seats_available} onChange={handleChange} />
        <button type="submit">Create</button>
      </form>
    </div>
  );
}
