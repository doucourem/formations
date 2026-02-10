import React from "react";
import { Truck, Wrench, Users, Star } from "lucide-react";
import Slider from "react-slick";
import { Container } from "@mui/material"; // <-- Ajouté
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const services = [
  { icon: Truck, title: "Suivi des véhicules", desc: "Planification, historique et alertes pour chaque camion ou citerne." },
  { icon: Wrench, title: "Maintenance optimisée", desc: "Coordination avec les garagistes et suivi des interventions." },
  { icon: Users, title: "Garagistes partenaires", desc: "Trouvez les meilleurs garagistes pour vos besoins partout au Mali." },
];

const testimonials = [
  { name: "Amadou Coulibaly", text: "Grâce à GrosPorteur+, je peux suivre toutes mes interventions sans stress.", rating: 5 },
  { name: "Fatoumata Traoré", text: "Les garagistes recommandés sont rapides et fiables. Très satisfaite !", rating: 4 },
  { name: "Moussa Diallo", text: "Une plateforme simple et efficace pour gérer nos camions.", rating: 5 },
];

const HomePageEnhanced = () => {
  const sliderSettings = { dots: true, infinite: true, speed: 600, slidesToShow: 1, slidesToScroll: 1, autoplay: true, autoplaySpeed: 4000 };

  return (
    <div className="font-sans text-gray-800">
      {/* Navbar */}
      <nav className="fixed w-full z-20 bg-white/80 backdrop-blur flex justify-between items-center p-6 shadow-md">
        <div className="text-2xl font-bold text-blue-600">GrosPorteur+</div>
        <ul className="flex gap-6">
          <li className="hover:text-blue-600 cursor-pointer">Accueil</li>
          <li className="hover:text-blue-600 cursor-pointer">Services</li>
          <li className="hover:text-blue-600 cursor-pointer">Tarifs</li>
          <li className="hover:text-blue-600 cursor-pointer">Témoignages</li>
          <li>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Connexion
            </button>
          </li>
        </ul>
      </nav>

      {/* Hero avec parallax */}
  <section
  className="relative h-screen flex flex-col justify-center items-center text-white text-center"
  style={{
    backgroundImage:
      "url('https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1350&q=80')",
    backgroundAttachment: 'fixed',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
>
  <div className="absolute inset-0 bg-black bg-opacity-50"></div>
  <div className="relative z-10 px-4">
    <h1 className="text-5xl md:text-6xl font-bold mb-4">
      Gestion facile de vos gros porteurs
    </h1>
    <p className="text-xl md:text-2xl mb-6">
      Planifiez, suivez et maintenez vos véhicules efficacement
    </p>
    <button className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg text-lg hover:bg-yellow-400">
      Demander un devis
    </button>
  </div>
</section>


      {/* Services */}
      <section className="py-20 bg-gray-50 text-center">
        <h2 className="text-4xl font-bold mb-12">Nos Services</h2>
        <div className="flex flex-col md:flex-row justify-center gap-10 px-6">
          {services.map((service, idx) => (
            <div key={idx} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2">
              <service.icon className="mx-auto mb-4 text-blue-600" size={50} />
              <h3 className="text-2xl font-semibold mb-2">{service.title}</h3>
              <p>{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-20 bg-white text-center">
        <h2 className="text-4xl font-bold mb-12">Témoignages clients</h2>
        <Container maxWidth="md">
          <Slider {...sliderSettings}>
            {testimonials.map((t, idx) => (
              <div key={idx} className="px-4">
                <div className="bg-gray-50 p-8 rounded-lg shadow-md">
                  <p className="mb-4 text-gray-700">{t.text}</p>
                  <div className="flex justify-center mb-2">
                    {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="text-yellow-500" />)}
                  </div>
                  <p className="font-semibold">{t.name}</p>
                </div>
              </div>
            ))}
          </Slider>
        </Container>
      </section>

      {/* CTA final */}
      <section className="py-20 bg-blue-600 text-white text-center">
        <h2 className="text-4xl font-bold mb-4">Prêt à gérer vos véhicules efficacement ?</h2>
        <p className="mb-6">Inscrivez-vous et commencez à suivre vos véhicules dès aujourd’hui !</p>
        <button className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-xl hover:bg-yellow-400">
          Créer un compte maintenant
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 text-center">
        <p>© 2025 GrosPorteur+. Tous droits réservés.</p>
        <p>Bamako, Mali | contact@grosporteurplus.com</p>
      </footer>
    </div>
  );
};

export default HomePageEnhanced;
