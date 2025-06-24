import { useEffect, useState } from "react";
import axios from "axios";

export default function AgendaSalons() {
  const [salons, setSalons] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/api/salons/")
      .then(res => setSalons(res.data))
      .catch(err => console.error("Erreur chargement salons :", err));
  }, []);

  return (
    <div className="login-form" style={{ maxWidth: 700, margin: 'auto' }}>
      <h2>🗓 Agenda des Salons Professionnels</h2>
      <ul>
        {salons.map((salon) => (
          <li key={salon.id} style={{ marginBottom: 15 }}>
            <h3>{salon.titre}</h3>
            <p><strong>Lieu :</strong> {salon.lieu}</p>
            <p><strong>Date :</strong> {new Date(salon.date).toLocaleDateString()}</p>
            {salon.lien && <a href={salon.lien} target="_blank" rel="noopener noreferrer">Lien vers l'événement</a>}
            {salon.description && <p>{salon.description}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
