import { Link } from "@inertiajs/react";
import { GppGood } from "@mui/icons-material";

export default function Navbar({ auth }) {
  return (
    <nav className="border-b sticky top-0 bg-white/95 backdrop-blur-sm z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* LOGO SIRA */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
            <GppGood className="text-white" />
          </div>
          <div className="leading-none">
            <span className="text-2xl font-black tracking-tighter uppercase">
              SIRA MALI <span className="text-green-600 font-extrabold text-sm align-top italic">NUMÉRIQUE</span>
            </span>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Plateforme Nationale</p>
          </div>
        </Link>

        {/* LIENS DE NAVIGATION */}
        <div className="hidden lg:flex items-center gap-8 font-bold text-sm text-slate-600">
          <Link href={route('companies')} className="hover:text-green-600 transition">Compagnies</Link>
          <Link href={route('maintenance')} className="hover:text-green-600 transition">Maintenance</Link>
          <Link href={route('heavyVehicles')} className="hover:text-green-600 transition">Gros Porteurs</Link>
          
          {auth?.user ? (
            <Link href={route('dashboard')} className="bg-slate-900 text-white px-6 py-2.5 rounded-full shadow-lg hover:bg-slate-800 transition">
              Tableau de bord
            </Link>
          ) : (
            <Link href={route('login')} className="border-2 border-slate-900 px-6 py-2.5 rounded-full hover:bg-slate-900 hover:text-white transition">
              Connexion
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}