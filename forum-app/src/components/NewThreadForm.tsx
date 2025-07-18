import React, { useState } from 'react';
import api from '../api';
import axios from 'axios';
import { useAuth } from './AuthContext';
const NewThreadForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setLoading(true);
    try {
      // ou autre selon ton code // récupère-le depuis le state, un contexte, etc.
const userStr = localStorage.getItem('user');
const user = userStr ? JSON.parse(userStr) : null;

const userId = user?.id;
      if (!userId) {
        setMessage('❌ Utilisateur non authentifié');
        return;
      }
      const res = await api.post('/threads', { title, content , user_id: userId,
        
      });

      if (res.status !== 201) {
        throw new Error('Erreur lors de la création du sujet');
      }

      setMessage('✅ Sujet créé avec succès');
      setTitle('');
      setContent('');
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setMessage('❌ Une erreur est survenue. ' + (err.response?.data?.error || err.message));
      } else {
        setMessage('❌ Une erreur est survenue. ' + (err?.message || ''));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>➕ Nouveau sujet</h3>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre"
        required
      />
      <br />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Message"
        required
      />
      <br />
      <button type="submit" disabled={loading}>
        {loading ? 'Création...' : 'Créer'}
      </button>
      <div>{message}</div>
    </form>
  );
};

export default NewThreadForm;
