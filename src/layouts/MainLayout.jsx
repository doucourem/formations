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
      

<MainMenu />
      
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
            top: 10,
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
