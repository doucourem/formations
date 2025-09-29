import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/inertia-react';

export default function Edit() {
  const { trip } = usePage().props;
  const [form, setForm] = useState({
    route_id: trip.route_id || '',
    bus_id: trip.bus_id || '',
    departure_at: trip.departure_at || '',
    arrival_at: trip.arrival_at || '',
    base_price: trip.base_price || '',
    seats_available: trip.seats_available || ''
  });

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.put(route('trips.update', trip.id), form);
  };

  return (
    <div>
      <h1>Edit Trip #{trip.id}</h1>
      <form onSubmit={handleSubmit}>
        <input name="route_id" placeholder="Route ID" value={form.route_id} onChange={handleChange} />
        <input name="bus_id" placeholder="Bus ID" value={form.bus_id} onChange={handleChange} />
        <input name="departure_at" type="datetime-local" value={form.departure_at} onChange={handleChange} />
        <input name="arrival_at" type="datetime-local" value={form.arrival_at} onChange={handleChange} />
        <input name="base_price" type="number" placeholder="Price" value={form.base_price} onChange={handleChange} />
        <input name="seats_available" type="number" placeholder="Seats" value={form.seats_available} onChange={handleChange} />
        <button type="submit">Update</button>
      </form>
    </div>
  );
}
