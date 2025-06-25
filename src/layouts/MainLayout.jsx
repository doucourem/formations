import React from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import MainMenu from './MainMenu';

const MainLayout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Topbar fixe en haut */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        zIndex: 1000,
        backgroundColor: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
      }}>

<MainMenu />
      </header>

      {/* Contenu principal + sidebar */}
      <div style={{
        display: 'flex',
        flex: 1,
        marginTop: 60, // espace sous topbar
        backgroundColor: '#f5f5f5',
        minHeight: 0,
      }}>
        {user && (
          <aside style={{
            width: 220,
            backgroundColor: '#fff',
            borderRight: '1px solid #ddd',
            position: 'fixed',
            top: 60,
            bottom: 0,
            overflowY: 'auto',
          }}>
            <Sidebar />
          </aside>
        )}

        <main style={{
          marginLeft: user ? 220 : 0,
          padding: 40,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 60px)', // hauteur dispo après topbar
          overflowY: 'auto',
        }}>
          {/* contenu qui scroll */}
          <div style={{ flexGrow: 1 }}>
            {children}
          </div>
          {/* footer collé en bas */}
          
        </main>
   
      </div>
           <Footer />
    </div>
  );
};

export default MainLayout;
