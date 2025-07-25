export default function Header() {
  return (
    <header className="bg-white border-b p-4 flex justify-between items-center shadow">
      <h1 className="text-xl font-bold">🎯 Forum</h1>
      <div>
        <span className="mr-4">👤 Nom d'utilisateur</span>
        <button className="bg-red-500 text-white px-3 py-1 rounded">Déconnexion</button>
      </div>
    </header>
  );
}
