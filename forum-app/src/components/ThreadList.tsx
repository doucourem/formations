import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

interface Thread {
  id: number;
  title: string;
  last_message?: string;
  last_message_date?: string; // ex: "2025-07-17T10:45:00Z"
  replies_count?: number;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return 'inconnue';
  const date = new Date(dateStr);
  const diff = Math.floor((Date.now() - date.getTime()) / 60000); // minutes

  if (diff < 1) return "à l'instant";
  if (diff < 60) return `il y a ${diff} min`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

export default function ThreadList() {
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    api.get('/threads').then(res => setThreads(res.data));
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">📚 Sujets disponibles</h2>
        <Link
          to="/threads/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
        >
          ➕ Nouveau sujet
        </Link>
      </div>

      <div className="space-y-4">
        {threads.map(t => (
          <Link
            to={`/threads/${t.id}`}
            key={t.id}
            className="block bg-white border border-gray-200 shadow-sm rounded-lg p-4 hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold text-blue-700">{t.title}</h3>
            <div className="text-sm text-gray-500 mt-1 flex justify-between">
              <span>🕒 {formatDate(t.last_message_date)}</span>
              <span>💬 {t.replies_count ?? 0} réponse(s)</span>
            </div>
          </Link>
        ))}

        {threads.length === 0 && (
          <div className="text-gray-500 text-sm text-center">Aucun sujet pour le moment.</div>
        )}
      </div>
    </div>
  );
}
