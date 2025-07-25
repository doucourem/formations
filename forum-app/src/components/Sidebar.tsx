import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-100 border-r p-4">
      <h2 className="text-lg font-semibold mb-4">Catégories</h2>
      <ul className="space-y-2">
        <li><Link to="/" className="text-blue-600 hover:underline">🏠 Accueil</Link></li>
        <li><Link to="/category/general">💬 Général</Link></li>
        <li><Link to="/category/annonces">📢 Annonces</Link></li>
        <li><Link to="/category/support">🛠️ Support</Link></li>
      </ul>
    </aside>
  );
}
