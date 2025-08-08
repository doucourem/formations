import { useState } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

 const submit = async () => {
  try {
    const res = await api.post('/auth/login', {
      username,
      password,
    });

    const { token, user } = res.data;

    login(token); // ⬅️ probablement une fonction de AuthContext
    localStorage.setItem('user', JSON.stringify(user));
    alert('Connexion réussie');
  } catch (err: any) {
    console.error("Erreur d'authentification", err?.response?.data);
    alert("Erreur d'authentification");
  }
};


  return (
    <div>
      <h2>Connexion</h2>
      <input placeholder="Nom d'utilisateur" onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Mot de passe" onChange={e => setPassword(e.target.value)} />
      <button onClick={submit}>Se connecter</button>
    </div>
  );
}
