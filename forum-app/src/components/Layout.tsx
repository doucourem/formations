// src/components/Layout.tsx
import { ReactNode, useState } from "react";
import { MenuIcon, XIcon, SearchIcon } from "@heroicons/react/outline";

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { name: "Accueil", href: "/" },
  { name: "Catégories", href: "/categories" },
  { name: "Mes discussions", href: "/my-topics" },
  { name: "Profil", href: "/profile" },
];

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:inset-auto
        `}
      >
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <h1 className="text-xl font-bold text-indigo-600">MonForum</h1>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map(({ name, href }) => (
            <a
              key={name}
              href={href}
              className="block px-4 py-2 rounded hover:bg-indigo-100 text-gray-700 font-medium"
            >
              {name}
            </a>
          ))}
        </nav>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black opacity-25 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 focus:outline-none"
            aria-label="Open sidebar"
          >
            <MenuIcon className="w-3 h-3" />
          </button>
          <h1 className="text-lg font-bold text-indigo-600">MonForum</h1>
          <button className="text-gray-700" aria-label="User profile">
            {/* Ici un avatar ou bouton profil */}
           <svg
  xmlns="http://www.w3.org/2000/svg"
  className="w-4 h-4"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M5.121 17.804A9.003 9.003 0 0112 15a9 9 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
  />
</svg>

          </button>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Search bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <label htmlFor="search" className="sr-only">
              Rechercher
            </label>
            <div className="relative text-gray-400 focus-within:text-gray-600">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <SearchIcon className="w-5 h-5" />
              </div>
              <input
                id="search"
                className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Rechercher un sujet, une catégorie..."
                type="search"
                name="search"
              />
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
