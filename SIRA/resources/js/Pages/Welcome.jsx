import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import {
  Bus,
  Truck,
  Wrench,
  Ticket,
  Package,
  ShieldCheck,
  Search,
  ArrowRight,
  Menu,
  X
} from "lucide-react";

const SERVICES = [
  {
    key: "tickets",
    icon: Ticket,
    color: "text-blue-600",
    title: "Voyageurs & Billetterie",
    desc: "Billets numériques, listes passagers, bagages et contrôle en temps réel."
  },
  {
    key: "parcels",
    icon: Package,
    color: "text-orange-600",
    title: "Fret & Colis",
    desc: "Traçabilité nationale des colis, interurbain et dernier kilomètre."
  },
  {
    key: "fleet",
    icon: Wrench,
    color: "text-red-600",
    title: "Maintenance & Flotte",
    desc: "Suivi des bus, garages, inspections et plans préventifs."
  }
];

export default function Welcome({ auth }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <>
      <Head>
  <title>SIRA MALI NUMÉRIQUE — Portail National</title>
  <meta name="description" content="Billetterie, fret, flotte et contrôle routier numérique au Mali." />
  <meta name="keywords" content="bus, transport, billetterie, Mali, SIRA" />
</Head>


      <div className="min-h-screen bg-white font-sans text-slate-900">
        {/* BARRE NATIONALE */}
        <div className="bg-gradient-to-r from-[#009132] via-[#FCD116] to-[#CE1126] h-1.5 w-full" />

        {/* NAVIGATION */}
        <nav className="border-b sticky top-0 bg-white/95 backdrop-blur-sm z-50">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Brand />

            {/* Desktop */}
            <div className="hidden lg:flex items-center gap-6 font-bold text-sm">
              <NavLinks />
              <AuthCTA auth={auth} />
            </div>

            {/* Mobile */}
            <button aria-label="Menu" className="lg:hidden" onClick={() => setOpen(!open)}>
              {open ? <X /> : <Menu />}
            </button>
          </div>

          {open && (
            <div className="lg:hidden border-t bg-white">
              <div className="px-6 py-4 space-y-3 font-bold">
                <NavLinks mobile />
                <AuthCTA auth={auth} mobile />
              </div>
            </div>
          )}
        </nav>

        {/* HERO */}
        <section className="pt-20 pb-28 bg-[#f8fafc] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge />
              <h1 className="text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-8">
                Le <span className="text-green-600">système national</span> du transport numérique.
              </h1>
              <p className="text-xl text-slate-600 mb-10 max-w-xl">
                Billetterie, fret, flotte et contrôle routier unifiés — transparence, sécurité et performance.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href={route('register')} className="bg-green-600 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-green-700 transition inline-flex items-center gap-2">
                  Enregistrer ma Compagnie <ArrowRight size={20} />
                </Link>
              </div>
            </div>

            {/* Vérification */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
                <Search className="text-green-600" /> Vérification Express
              </h3>
              <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">Numéro Voyage / Colis</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: PK-2026-X4"
                className="w-full bg-slate-50 border-slate-200 rounded-xl py-4 px-5 focus:ring-green-500 focus:border-green-500 font-mono"
              />
              <button
                disabled={!query}
                className="mt-4 w-full bg-slate-900 disabled:opacity-50 text-white py-4 rounded-xl font-bold"
              >
                Vérifier maintenant
              </button>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <SectionTitle title="Architecture du Réseau SIRA" />
          <div className="grid md:grid-cols-3 gap-8">
            {SERVICES.map(({ key, icon: Icon, color, title, desc }) => (
              <ServiceCard key={key} icon={<Icon className={color} />} title={title} desc={desc} />
            ))}
          </div>
        </section>

        {/* STATS */}
        <section className="bg-slate-900 py-20 text-white rounded-[3rem] mx-6 mb-20">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 text-center">
            <StatBox number="+250" label="Compagnies" />
            <StatBox number="99%" label="Traçabilité" />
            <StatBox number="24/7" label="Contrôle" />
            <StatBox number="100%" label="Numérique" />
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-white border-t py-12">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <Brand compact />
            <p className="text-xs text-slate-400 font-bold">© 2026 — AFRICA TECH LABS — RÉPUBLIQUE DU MALI</p>
          </div>
        </footer>
      </div>
    </>
  );
}

function Brand({ compact }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
        <ShieldCheck className="text-white" size={24} />
      </div>
      <div className="leading-none">
        <span className="text-2xl font-black tracking-tighter uppercase">SIRA MALI</span>
        {!compact && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Plateforme Nationale</p>}
      </div>
    </div>
  );
}

function NavLinks({ mobile }) {
  const cls = mobile ? "block" : "";
  return (
    <>
      <Link className={cls} href={route('companies')}>Compagnies</Link>
      <Link className={cls} href={route('maintenance')}>Maintenance</Link>
      <Link className={cls} href={route('heavyVehicles')}>Gros Porteurs</Link>
    </>
  );
}

function AuthCTA({ auth, mobile }) {
  const cls = mobile ? "block" : "";
  return auth.user ? (
    <Link className={cls} href={route('dashboard')}>Dashboard</Link>
  ) : (
    <Link className={cls} href={route('login')}>Connexion</Link>
  );
}

function Badge() {
  return (
    <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold mb-6 border">
      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> Système Opérationnel 2026
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <div className="text-center mb-16">
      <h2 className="text-3xl font-black uppercase tracking-tighter">{title}</h2>
      <div className="h-1.5 w-20 bg-yellow-400 mx-auto mt-4" />
    </div>
  );
}

function ServiceCard({ icon, title, desc }) {
  return (
    <div className="p-10 bg-white border border-slate-100 rounded-[2rem] hover:shadow-2xl transition">
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
        {React.cloneElement(icon, { size: 32 })}
      </div>
      <h3 className="text-xl font-black mb-4 uppercase tracking-tighter">{title}</h3>
      <p className="text-slate-500 text-sm">{desc}</p>
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
