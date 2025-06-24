import React from "react";
import "../css/main.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <h4>À propos</h4>
          <ul>
            <li>Qui sommes-nous ?</li>
            <li>Notre mission</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <h4>Catégories</h4>
          <ul>
            <li>Développement Web</li>
            <li>Design & UX</li>
            <li>Marketing Digital</li>
            <li>Data & IA</li>
            <li>Entrepreneuriat</li>
          </ul>
        </div>
        <div>
          <h4>Aide</h4>
          <ul>
            <li>Support</li>
            <li>FAQ</li>
            <li>Conditions d'utilisation</li>
            <li>Politique de confidentialité</li>
          </ul>
        </div>
        <div>
          <h4>Suivez-nous</h4>
          <ul>
            <li>Facebook</li>
            <li>Twitter</li>
            <li>LinkedIn</li>
            <li>Instagram</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} FormationPlus. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
