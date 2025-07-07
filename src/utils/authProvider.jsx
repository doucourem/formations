// src/utils/authProvider.js
import { supabase } from './supabaseClient';

const authProvider = {
  login: async ({ email, password }) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error("Email ou mot de passe incorrect");
    return true;
  },

  logout: async () => {
    await supabase.auth.signOut();
    return true;
  },

  checkAuth: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw new Error("Non authentifié");
    return true;
  },

  checkError: (error) => {
    if (error.status === 401 || error.status === 403) {
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getPermissions: async () => {
    const { data } = await supabase.auth.getUser();
    const role = data?.user?.user_metadata?.role;
    return role ? Promise.resolve(role) : Promise.reject();
  },

  getIdentity: async () => {
    const { data } = await supabase.auth.getUser();
    return {
      id: data.user.id,
      fullName: data.user.email,
    };
  },
};

export default authProvider;
