import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';

export default function Create() {
  const [form, setForm] = useState({
    name: '',
    city: ''
  });

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.post(route('agencies.store'), form);
  };

  return (
    <div>
      <h1>Create Agency</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input name="name" placeholder="Agency name" value={form.name} onChange={handleChange} />
        </div>
        <div>
          <label>City:</label>
          <input name="city" placeholder="City" value={form.city} onChange={handleChange} />
        </div>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}
