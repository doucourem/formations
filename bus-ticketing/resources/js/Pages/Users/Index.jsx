import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/inertia-react';

export default function Index() {
  const { users, filters } = usePage().props;
  const [role, setRole] = useState(filters.role || '');
  const [perPage, setPerPage] = useState(filters.per_page || 20);

  const handleFilter = () => {
    Inertia.get(route('users.index'), { per_page: perPage, role }, { preserveState: true });
  };

  return (
    <div>
      <h1>Users</h1>
      <div>
        <label>Role:</label>
        <input value={role} onChange={e => setRole(e.target.value)} />
        <label>Per page:</label>
        <input type="number" value={perPage} onChange={e => setPerPage(e.target.value)} />
        <button onClick={handleFilter}>Filter</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.data.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td><a href={route('users.edit', u.id)}>Edit</a></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        {users.links.map((link,i) => (
          <button key={i} disabled={!link.url} onClick={() => Inertia.get(link.url)} dangerouslySetInnerHTML={{__html: link.label}} />
        ))}
      </div>
    </div>
  );
}
