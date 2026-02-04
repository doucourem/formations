import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    LocalShipping, 
    Dashboard, 
    Map, 
    Paid, // Ajouté pour les transferts
    AccountCircle,
    Menu as MenuIcon,
    Close as CloseIcon
} from '@mui/icons-material';

export default function AuthenticatedLayout({ header, children }) {
    // Sécurité : on récupère auth depuis les props
    const { auth } = usePage().props;
    const user = auth?.user; 
    
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-[#F4F7FA]">
            {/* Barre de Navigation Supérieure */}
            <nav className="bg-[#1A237E] border-b border-indigo-900 shadow-lg text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            {/* Logo & Brand */}
                            <div className="shrink-0 flex items-center">
                                <Link href="/" className="flex items-center gap-2">
                                    <div className="bg-yellow-400 p-1 rounded-lg">
                                        <LocalShipping className="text-[#1A237E]" />
                                    </div>
                                    <span className="font-black text-xl tracking-tighter uppercase">
                                        Faso<span className="text-yellow-400">Logistique</span>
                                    </span>
                                </Link>
                            </div>

                            {/* Menu Desktop */}
                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')} className="text-white hover:text-yellow-400">
                                    <Dashboard fontSize="small" className="mr-2" /> Dashboard
                                </NavLink>
                                <NavLink href={route('parcels.index')} active={route().current('parcels.*')} className="text-white hover:text-yellow-400">
                                    <LocalShipping fontSize="small" className="mr-2" /> Colis
                                </NavLink>
                                <NavLink href={route('trips.index')} active={route().current('trips.*')} className="text-white hover:text-yellow-400">
                                    <Map fontSize="small" className="mr-2" /> Voyages
                                </NavLink>
                                {/* Nouveau lien Transferts */}
                                <NavLink href={route('transfers.index')} active={route().current('transfers.*')} className="text-white hover:text-yellow-400">
                                    <Paid fontSize="small" className="mr-2" /> Transferts
                                </NavLink>
                            </div>
                        </div>

                        {/* Profil Utilisateur */}
                        <div className="hidden sm:flex sm:items-center sm:ms-6">
                            <div className="ms-3 relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-800 hover:bg-indigo-700 focus:outline-none transition ease-in-out duration-150"
                                            >
                                                <AccountCircle className="mr-2" />
                                                {/* Utilisation du optional chaining pour éviter l'erreur name is null */}
                                                {user?.name || 'Utilisateur'}
                                                <svg className="ms-2 -me-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>Mon Profil</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">Déconnexion</Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-800 focus:outline-none transition duration-150 ease-in-out"
                            >
                                {showingNavigationDropdown ? <CloseIcon /> : <MenuIcon />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Menu Mobile */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden bg-indigo-900'}>
                    <div className="pt-2 pb-3 space-y-1">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>Dashboard</ResponsiveNavLink>
                        <ResponsiveNavLink href={route('parcels.index')} active={route().current('parcels.index')}>Gestion Colis</ResponsiveNavLink>
                        <ResponsiveNavLink href={route('transfers.index')} active={route().current('transfers.index')}>Transferts d'argent</ResponsiveNavLink>
                    </div>
                    <div className="pt-4 pb-1 border-t border-indigo-800">
                        <div className="px-4">
                            <div className="font-medium text-base text-white">{user?.name}</div>
                            <div className="font-medium text-sm text-indigo-300">{user?.email}</div>
                        </div>
                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Profil</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">Déconnexion</ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Titre de la page (Header) */}
            {header && (
                <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                        {header}
                    </div>
                </header>
            )}

            {/* Contenu Principal */}
            <main className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>

            <footer className="py-6 text-center text-gray-400 text-xs">
                &copy; {new Date().getFullYear()} FasoLogistique v1.0 - Système de Gestion de Fret sécurisé.
            </footer>
        </div>
    );
}