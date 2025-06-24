import React from 'react';

const Sidebar = () => {
  return (
    <div style={styles.sidebar}>
      <h2 style={styles.logo}>MaPlateforme</h2>
      <ul style={styles.menu}>
        <li style={styles.item}>🏠 Accueil</li>
        <li style={styles.item}>📚 Cours</li>
        <li style={styles.item}>👨‍🎓 Étudiants</li>
        <li style={styles.item}>⚙️ Paramètres</li>
      </ul>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '220px',
    height: '100vh',
    backgroundColor: '#1e293b',
    color: '#fff',
    padding: '20px',
    boxSizing: 'border-box',
    position: 'fixed',
    top: 0,
    left: 0,
  },
  
  logo: {
    marginBottom: '30px',
    fontSize: '22px',
  },
  menu: {
    listStyle: 'none',
    padding: 0,
  },
  item: {
    margin: '15px 0',
    cursor: 'pointer',
  }
};

export default Sidebar;
