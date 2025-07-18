import { useState } from 'react';
import api from '../api';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = async () => {
    try {
      await api.post('/auth/register', { username, password });
      alert('Inscription réussie ! Connectez-vous.');
    } catch {
      alert("Nom d'utilisateur déjà pris");
    }
  };

  return (
    <div>
      <h2>Inscription</h2>
      <input placeholder="Nom d'utilisateur" onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Mot de passe" onChange={e => setPassword(e.target.value)} />
      <button onClick={submit}>Créer un compte</button>
    </div>
  );
}
