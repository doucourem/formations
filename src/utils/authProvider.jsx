import { supabase } from './supabaseClient';

const authProvider = {
  login: ({ username }) => {
    if (username === 'admin') {
      localStorage.setItem('role', 'admin');
      return Promise.resolve(); // ✅ pas d'objet, pas de redirectTo ici
    }
    return Promise.reject('Identifiants invalides');
  },
  logout: () => {
    localStorage.removeItem('role');
    return Promise.resolve('/login'); // ✅ redirect vers cette route
  },
  checkAuth: () => {
    return localStorage.getItem('role') ? Promise.resolve() : Promise.reject();
  },
  checkError: () => Promise.resolve(),
  getPermissions: () => Promise.resolve(localStorage.getItem('role')),
};


export default authProvider;
