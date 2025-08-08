import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // ou `useSearchParams` si Next.js
import { useAuth } from './AuthContext';
import api from '../api';

// si c’est via un contexte personnalisé
interface Author {
  id: number;
  username: string;
  avatar_url?: string;
}

interface Message {
  id: number;
  content: string;
  created_at: string;
  author: Author;
}

interface ThreadDetail {
  id: number;
  title: string;
  created_at: string;
  author: Author;
  category?: {
    id: number;
    name: string;
  } | null;
}

export default function ThreadDetailPage() {
  const { id } = useParams();
  const [thread, setThread] = useState<ThreadDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const { token, logout } = useAuth();
  useEffect(() => {
    api.get(`/threads/${id}`)
      .then(res=> {
        setThread(res.data.thread);
        setMessages(res.data.messages);
      });
  }, [id]);
const [message, setMessage] = useState("");

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (message.trim() === "") return;

  try {
    // Appel API ou mutation
    const res = await api.post(`/threads/${id}/messages`,
        { content: message });
    setMessage(""); // Réinitialise après envoi
  } catch (err) {
    console.error("Erreur d'envoi :", err);
  }
};

  if (!thread) return <div>Chargement...</div>;

 return (
  <div className="max-w-3xl mx-auto p-4">
    <h1 className="text-2xl font-bold mb-2">{thread.title}</h1>

    <div className="text-sm text-gray-500 mb-4">
      Posté par <strong>{thread.author.username}</strong> | Catégorie :{" "}
      <span className="text-indigo-600">{thread.category?.name || "—"}</span>
    </div>

    {/* Messages */}
    <div className="space-y-6">
      {messages.map((msg) => (
        <div key={msg.id} className="p-4 bg-white border rounded-xl shadow-sm">
          <div className="text-sm text-gray-700">{msg.content}</div>
          <div className="text-xs text-gray-500 mt-2">
            {msg.author.username} – {new Date(msg.created_at).toLocaleString()}
          </div>
        </div>
      ))}
    </div>

    {/* Formulaire de réponse (si connecté) */}
    {token && (
      <form onSubmit={handleSubmit} className="mt-8">
        <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-700">
          Écris ta réponse :
        </label>
        <textarea
          id="message"
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y min-h-[120px]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tape ta réponse ici..."
          required
        />
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={message.trim() === ""}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Répondre
          </button>
        </div>
      </form>
    )}
  </div>
);
}
