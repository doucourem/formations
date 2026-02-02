import React from "react";
import { Head, Link } from "@inertiajs/react";
import { 
  Bus, 
  Truck, 
  Wrench, // Correction ici (Tool -> Wrench)
  Ticket, 
  Package, 
  ShieldCheck, 
  Search,
  ArrowRight
} from "lucide-react";

export default function Welcome({ auth }) {
  return (
    <>
      <Head title="SIRA MALI NUMÉRIQUE - Portail" />

      <div className="min-h-screen bg-white font-sans text-slate-900">
        {/* BARRE NATIONALE TRICOLORE */}
        <div className="bg-gradient-to-r from-[#009132] via-[#FCD116] to-[#CE1126] h-1.5 w-full"></div>

        {/* NAVIGATION */}
        <nav className="border-b sticky top-0 bg-white/95 backdrop-blur-sm z-50">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <div className="leading-none">
                <span className="text-2xl font-black tracking-tighter uppercase">
                  SIRA MALI <span className="text-green-600 font-extrabold text-sm align-top italic">NUMÉRIQUE</span>
                </span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Plateforme Nationale Intégrée</p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-6 font-bold text-sm">
              <Link href={route('companies')} className="hover:text-green-600 transition">Compagnies</Link>
              <Link href={route('maintenance')} className="hover:text-green-600 transition">Maintenance</Link>
              <Link href={route('heavyVehicles')} className="hover:text-green-600 transition">Gros Porteurs</Link>
              {auth.user ? (
                <Link href={route('dashboard')} className="bg-slate-900 text-white px-6 py-2.5 rounded-full shadow-lg hover:bg-slate-800 transition">Dashboard</Link>
              ) : (
                <Link href={route('login')} className="border-2 border-slate-900 px-6 py-2.5 rounded-full hover:bg-slate-900 hover:text-white transition">Connexion</Link>
              )}
            </div>
          </div>
        </nav>

        {/* HERO SECTION */}
        <section className="pt-20 pb-32 bg-[#f8fafc] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <div className="z-10">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold mb-6 border border-green-200">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                Système Opérationnel 2026
              </div>
              <h1 className="text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-8 text-slate-900">
                L'écosystème <span className="text-green-600">numérique</span> au service du transport.
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-lg">
                De la billetterie intelligente à la gestion des gros porteurs, SIRA Mali Numérique unifie le contrôle et la sécurité sur tout le territoire.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href={route('register')} className="bg-green-600 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-xl shadow-green-100 hover:bg-green-700 transition transform hover:-translate-y-1 inline-flex items-center gap-2">
                  Enregistrer ma Compagnie <ArrowRight size={20}/>
                </Link>
              </div>
            </div>

            {/* VÉRIFICATION RAPIDE */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
                <Search className="text-green-600" /> Vérification Express
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-widest">Numéro de Voyage ou Colis</label>
                  <input 
                    type="text" 
                    placeholder="Ex: PK-2026-X4" 
                    className="w-full bg-slate-50 border-slate-200 rounded-xl py-4 px-5 focus:ring-green-500 focus:border-green-500 font-mono outline-none transition" 
                  />
                </div>
                <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition">
                  Vérifier maintenant
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CARTES DE SERVICES */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black uppercase tracking-tighter">Architecture du Réseau SIRA</h2>
            <div className="h-1.5 w-20 bg-yellow-400 mx-auto mt-4"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ServiceCard
              icon={<Ticket className="text-blue-600" />}
              title="Voyageurs & Billetterie"
              desc="Gestion des réservations, bagages et listes de passagers numériques pour une sécurité optimale."
            />
            <ServiceCard
              icon={<Package className="text-orange-600" />}
              title="Fret & Colis (Parcels)"
              desc="Suivi en temps réel des expéditions (ParcelController), livraisons et transferts inter-urbains."
            />
            <ServiceCard
              icon={<Wrench className="text-red-600" />} // Wrench utilisé ici
              title="Maintenance & Flotte"
              desc="Suivi rigoureux des bus, des garages et des plans de maintenance pour réduire les risques."
            />
          </div>
        </section>

        {/* SECTION STATISTIQUES */}
        <section className="bg-slate-900 py-20 text-white rounded-[3rem] mx-6 mb-20 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 text-center relative z-10">
            <StatBox number="+250" label="Compagnies" />
            <StatBox number="99%" label="Traçabilité Colis" />
            <StatBox number="24/7" label="Contrôle Routier" />
            <StatBox number="100%" label="SIRA Numérique" />
          </div>
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
             <div className="bg-white h-full w-full opacity-10 blur-3xl rounded-full translate-y-1/2"></div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-white border-t py-12">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-black text-xl">SIRA MALI</span>
              <span className="bg-green-600 text-white px-2 py-0.5 rounded text-[10px] font-black italic">NUMÉRIQUE</span>
            </div>
            <p className="text-xs text-slate-400 font-bold tracking-tight text-center md:text-left">
               © 2026 — AFRICA TECH LABS  — RÉPUBLIQUE DU MALI
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

// COMPOSANTS INTERNES POUR PLUS DE CLARTÉ
function ServiceCard({ icon, title, desc }) {
  return (
    <div className="p-10 bg-white border border-slate-100 rounded-[2rem] hover:shadow-2xl hover:shadow-slate-100 transition-all group">
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon, { size: 32 })}
      </div>
      <h3 className="text-xl font-black mb-4 uppercase tracking-tighter text-slate-800">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function StatBox({ number, label }) {
  return (
    <div>
      <div className="text-4xl font-black text-green-500 mb-2">{number}</div>
      <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</div>
    </div>
  );
}