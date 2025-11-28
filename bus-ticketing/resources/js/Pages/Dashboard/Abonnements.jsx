import React, { useState } from "react";
import GuestLayout from '@/Layouts/GuestLayout';
import { CheckCircle, Star, PlusCircle, PackageIcon } from "lucide-react";
import AbonnementsPDF from "./AbonnementsPDF";
import { 
  AppBar, Toolbar, Typography, IconButton, Button, Box,
  ThemeProvider, createTheme, CssBaseline
} from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Logo from "@/Assets/logo.png";

// Données add-ons
const servicesAddons = [
  {
    service: "WhatsApp Bot Automatisé",
    tarif: "5 000 FCFA / mois",
    tag: "Recommandé",
    category: "Automatisation & IA",
    description:
      "Réservations automatiques, confirmation instantanée, génération du billet PDF + QR Code, suivi du statut de paiement et rappel avant le départ.",
  },
  {
    service: "Support prioritaire 24/7",
    tarif: "Inclus avec Enterprise",
    tag: "Inclus",
    category: "Support & Assistance",
    description:
      "Accès direct à l’équipe Mali Billet : résolution rapide WhatsApp, téléphone et email. Assistance technique premium.",
  },
  {
    service: "Frais client par billet",
    tarif: "1 000 FCFA / billet",
    tag: "Automatique",
    category: "Modèle économique",
    description:
      "Chaque passager paie un supplément fixe de 1 000 FCFA sur son billet. Ce montant est collecté et reversé automatiquement à Mali Billet.",
  },
  {
    service: "Statistiques avancées",
    tarif: "5 000 FCFA / mois",
    tag: "Option",
    category: "Analyse & Performance",
    description:
      "Analyse détaillée : taux de remplissage, ventes par ligne, performance chauffeurs, alertes trajets sous-performants.",
  },
  {
    service: "API Intégration",
    tarif: "10 000 FCFA / mois",
    tag: "Enterprise+",
    category: "Intégration système",
    description:
      "Connectez votre site, vos bornes ou votre système interne directement à la plateforme Mali Billet (JSON REST API).",
  },
];

const colisServices = [
  {
    service: "Suivi Colis en Temps Réel",
    tarif: "Inclus",
    tag: "Standard",
    category: "Tracking",
    description:
      "Suivez chaque étape de livraison de vos colis avec notifications automatiques sur votre email ou WhatsApp.",
  },
  {
    service: "Assurance Colis",
    tarif: "1 000 FCFA / colis",
    tag: "Option",
    category: "Sécurité",
    description:
      "Protégez vos envois contre les pertes et dommages avec notre assurance dédiée.",
  },
  {
    service: "Livraison Express",
    tarif: "5 000 FCFA / colis",
    tag: "Premium",
    category: "Livraison",
    description:
      "Livraison rapide sous 24h dans les principales villes du pays.",
  },
];


export default function Abonnements({ abonnements }) {
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: { main: "#00a859" },
      success: { main: "#00a859" },
      background: { default: darkMode ? "#0B0F12" : "#FAFAFA" },
    },
    typography: { fontFamily: "Inter, sans-serif" },
  });

  return (  
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={darkMode ? "bg-gray-900 text-white min-h-screen" : "bg-gray-50 text-gray-900 min-h-screen"}>

        {/* --- HEADER / BARRE HAUT --- */}
        <AppBar position="sticky" color={darkMode ? "default" : "primary"} elevation={3}>
          <Toolbar>
            {/* Logo */}
            <Box display="flex" alignItems="center" mr={2}>
              <img src={Logo} alt="Logo" style={{ height: 40, width: "auto" }} />
            </Box>

            {/* Titre */}
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
              FasoBillet
            </Typography>

            {/* Dark mode toggle */}
            <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>

            {/* Connexion ou menu */}
            <Button color="inherit">Connexion</Button>
          </Toolbar>
        </AppBar>

        {/* --- CONTENU PRINCIPAL --- */}
        <div className="container mx-auto p-6">
          {/* TITRE PRINCIPAL */}
          <h1 className="text-4xl font-bold mb-10 text-center">
            Nos Formules d’Abonnement
          </h1>

          {/* PDF des abonnements */}
          <AbonnementsPDF abonnements={abonnements} />

          {/* LISTE DES ABONNEMENTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {abonnements.map((abonnement, index) => (
              <div
                key={index}
                className={`relative border rounded-2xl p-8 shadow-md hover:shadow-xl hover:-translate-y-1
                           transition-all duration-300 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}
              >
                {abonnement.populaire && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 
                                  rounded-full text-sm font-semibold flex items-center gap-1">
                    <Star size={16} className="text-white" />
                    Populaire
                  </div>
                )}
                <h2 className="text-2xl font-semibold mb-3">{abonnement.plan}</h2>
                <p className="text-3xl font-bold text-blue-600 mb-4">{abonnement.tarif}</p>
                <p className={darkMode ? "text-gray-300 mb-6" : "text-gray-700 mb-6"}>{abonnement.description}</p>
                <ul className="space-y-2 mb-6">
                  {abonnement.objectifs.map((obj, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-800">
                      <CheckCircle size={20} className="text-green-600" />
                      {obj}
                    </li>
                  ))}
                </ul>
                <button
                  className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold 
                             hover:bg-blue-700 transition"
                >
                  Souscrire
                </button>
              </div>
            ))}
          </div>

          {/* --- ADD-ONS SECTION --- */}
          <h2 className="text-3xl font-bold mt-20 mb-8 text-center">Services Additionnels</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {servicesAddons.map((addon, index) => (
              <div
                key={index}
                className={`border rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300
                           ${darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50"}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <PlusCircle size={26} className="text-blue-600" />
                  <div>
                    <h3 className="text-xl font-semibold">{addon.service}</h3>
                    <p className="text-sm text-gray-500">{addon.category}</p>
                  </div>
                </div>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                  addon.tag === "Recommandé" ? "bg-yellow-400 text-white" :
                  addon.tag === "Inclus" ? "bg-green-500 text-white" :
                  addon.tag === "Automatique" ? "bg-blue-500 text-white" :
                  addon.tag === "Option" ? "bg-gray-400 text-white" :
                  addon.tag === "Enterprise+" ? "bg-purple-600 text-white" : "bg-gray-300 text-black"
                }`}>
                  {addon.tag}
                </span>
                <p className="text-2xl font-bold text-green-600 my-2">{addon.tarif}</p>
                <p className={darkMode ? "text-gray-300" : "text-gray-700"}>{addon.description}</p>
                <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-700 transition">
                  Ajouter
                </button>
              </div>
            ))}
          </div>
{/* --- GESTION DE COLIS --- */}
          <h2 className="text-3xl font-bold mt-20 mb-8 text-center">Gestion de Colis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {colisServices.map((colis, index) => (
              <div
                key={index}
                className={`border rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300
                           ${darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50"}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <PackageIcon size={26} className="text-blue-600" />
                  <div>
                    <h3 className="text-xl font-semibold">{colis.service}</h3>
                    <p className="text-sm text-gray-500">{colis.category}</p>
                  </div>
                </div>
                <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-gray-400 text-white">
                  {colis.tag}
                </span>
                <p className="text-2xl font-bold text-green-600 my-2">{colis.tarif}</p>
                <p className={darkMode ? "text-gray-300" : "text-gray-700"}>{colis.description}</p>
                <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-700 transition">
                  Ajouter
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
