import React, { useState } from 'react';
import api from '../api';
import axios from 'axios';

const NewThreadForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id;

      if (!userId) {
        setMessage('❌ Utilisateur non authentifié');
        return;
      }

      const res = await api.post('/threads', { title, content, user_id: userId });

      if (res.status !== 201) throw new Error('Erreur lors de la création du sujet');

      setMessage('✅ Sujet créé avec succès');
      setTitle('');
      setContent('');
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setMessage('❌ Erreur : ' + (err.response?.data?.error || err.message));
      } else {
        setMessage('❌ Erreur : ' + (err?.message || 'Inconnue'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-xl p-6 max-w-2xl mx-auto mt-8"
    >
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">➕ Nouveau sujet</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Titre</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Entrez le titre du sujet"
          required
          className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Message</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Rédigez votre message ici..."
          required
          rows={6}
          className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Création...' : 'Créer le sujet'}
      </button>

      {message && (
        <div className="mt-4 text-sm text-gray-700 bg-gray-100 p-3 rounded-lg">
          {message}
        </div>
      )}
    </form>
  );
};

export default NewThreadForm;
