import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
                <div className="text-xl font-bold text-indigo-600">
                    Gestion Billets
                </div>
            </nav>

            <main className="max-w-4xl mx-auto p-6">
                {children}
            </main>
        </div>
    );
}
