import { supabase } from './supabaseClient';

const authProvider = {
  login: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    // 🔐 Fetch role depuis la table users
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw new Error('Profil non trouvé');
    localStorage.setItem('role', userProfile.role);
    return Promise.resolve();
  },

  logout: () => {
    localStorage.removeItem('role');
    return supabase.auth.signOut();
  },

  getPermissions: () => {
    const role = localStorage.getItem('role');
    return Promise.resolve(role);
  },

  checkAuth: () => {
    return supabase.auth.getUser().then(({ data }) => {
      if (!data.user) throw new Error('Non connecté');
      return;
    });
  },

  checkError: () => Promise.resolve(),
};

export default authProvider;
