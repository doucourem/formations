import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/inertia-react';

export default function Edit() {
  const { routeData } = usePage().props; // nom "routeData" pour éviter conflit avec route()
  const [form, setForm] = useState({
    departure_city: routeData.departure_city || '',
    arrival_city: routeData.arrival_city || '',
    distance: routeData.distance || ''
  });

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.put(route('routes.update', routeData.id), form);
  };

  return (
    <div>
      <h1>Edit Route #{routeData.id}</h1>
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
        <button type="submit">Update</button>
      </form>
    </div>
  );
}
