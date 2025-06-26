import React from "react";
import { Link } from "react-router-dom";
import "../css/main.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <h4>À propos</h4>
          <ul>
            <li><Link to="/about">Qui sommes-nous ?</Link></li>
            <li><Link to="/mission">Notre mission</Link></li>
            <li><Link to="/contact">Contact</Link></li>
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
            <li><Link to="/support">Support</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/terms">Conditions d'utilisation</Link></li>
            <li><Link to="/privacy">Politique de confidentialité</Link></li>
          </ul>
        </div>
        <div>
          <h4>Suivez-nous</h4>
          <ul>
            <li><a href="https://facebook.com">Facebook</a></li>
            <li><a href="https://twitter.com">Twitter</a></li>
            <li><a href="https://linkedin.com">LinkedIn</a></li>
            <li><a href="https://instagram.com">Instagram</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} FormationPlus. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
