// resources/js/Components/Sidebar.jsx
import React from 'react';
import { Link } from '@inertiajs/inertia-react';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-100 min-h-screen p-4">
      <h2 className="text-xl font-bold mb-4">Menu</h2>
      <ul className="space-y-2">
        <li>
          <Link href={route('dashboard')} className="hover:text-blue-600">Dashboard</Link>
        </li>

        <li>
          <span className="font-semibold">Gestion du Profil</span>
          <ul className="ml-4 space-y-1">
            <li>
              <Link href={route('profile.edit')} className="hover:text-blue-600">Éditer Profil</Link>
            </li>
          </ul>
        </li>

        <li>
          <span className="font-semibold">Villes</span>
          <ul className="ml-4 space-y-1">
            <li>
              <Link href={route('cities.index')} className="hover:text-blue-600">Liste des Villes</Link>
            </li>
            <li>
              <Link href={route('cities.create')} className="hover:text-blue-600">Ajouter Ville</Link>
            </li>
          </ul>
        </li>

        <li>
          <span className="font-semibold">Bus</span>
          <ul className="ml-4 space-y-1">
            <li>
              <Link href={route('buses.index')} className="hover:text-blue-600">Liste des Bus</Link>
            </li>
            <li>
              <Link href={route('buses.create')} className="hover:text-blue-600">Ajouter Bus</Link>
            </li>
          </ul>
        </li>

        <li>
          <span className="font-semibold">Agences</span>
          <ul className="ml-4 space-y-1">
            <li>
              <Link href={route('agencies.index')} className="hover:text-blue-600">Liste des Agences</Link>
            </li>
            <li>
              <Link href={route('agencies.create')} className="hover:text-blue-600">Ajouter Agence</Link>
            </li>
          </ul>
        </li>

        <li>
          <span className="font-semibold">Trajets</span>
          <ul className="ml-4 space-y-1">
            <li>
              <Link href={route('routes.index')} className="hover:text-blue-600">Liste des Trajets</Link>
            </li>
            <li>
              <Link href={route('routes.create')} className="hover:text-blue-600">Ajouter Trajet</Link>
            </li>
          </ul>
        </li>

        <li>
          <span className="font-semibold">Voyages</span>
          <ul className="ml-4 space-y-1">
            <li>
              <Link href={route('trips.index')} className="hover:text-blue-600">Liste des Voyages</Link>
            </li>
            <li>
              <Link href={route('trips.create')} className="hover:text-blue-600">Ajouter Voyage</Link>
            </li>
          </ul>
        </li>

        <li>
          <span className="font-semibold">Billets</span>
          <ul className="ml-4 space-y-1">
            <li>
              <Link href={route('ticket.index')} className="hover:text-blue-600">Liste des Billets</Link>
            </li>
            <li>
              <Link href={route('ticket.create')} className="hover:text-blue-600">Ajouter Billet</Link>
            </li>
          </ul>
        </li>

        <li>
          <span className="font-semibold">Utilisateurs</span>
          <ul className="ml-4 space-y-1">
            <li>
              <Link href={route('users.index')} className="hover:text-blue-600">Liste des Utilisateurs</Link>
            </li>
            <li>
              <Link href={route('users.create')} className="hover:text-blue-600">Ajouter Utilisateur</Link>
            </li>
          </ul>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
