import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/inertia-react';

export default function Edit() {
  const { agency } = usePage().props;
  const [form, setForm] = useState({
    name: agency.name || '',
    city: agency.city || ''
  });

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.put(route('agencies.update', agency.id), form);
  };

  return (
    <div>
      <h1>Edit Agency #{agency.id}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input name="name" placeholder="Agency name" value={form.name} onChange={handleChange} />
        </div>
        <div>
          <label>City:</label>
          <input name="city" placeholder="City" value={form.city} onChange={handleChange} />
        </div>
        <button type="submit">Update</button>
      </form>
    </div>
  );
}
