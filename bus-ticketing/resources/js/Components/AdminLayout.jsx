import React from 'react';
import { Link } from '@inertiajs/inertia-react';

export default function AdminLayout({ children }) {
  return (
    <div>
      <nav>
        <Link href={route('dashboard')}>Dashboard</Link> |{' '}
        <Link href={route('cities.index')}>Cities</Link> |{' '}
        <Link href={route('routes.index')}>Trips</Link>
      </nav>
      <main>{children}</main>
    </div>
  );
}
