import { Outlet } from 'react-router-dom';


export default function ForumLayout() {
  return (
    <div className="flex h-screen">
    
      <div className="flex flex-col flex-1">
   
        <main className="p-4 overflow-auto">
          <Outlet /> {/* Ici s’affichera la page (ex: liste threads, view thread, etc.) */}
        </main>
      </div>
    </div>
  );
}
