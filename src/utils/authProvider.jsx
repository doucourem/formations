import { supabase } from './supabaseClient';

const authProvider = {
  login: async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  },

  logout: async () => {
    await supabase.auth.signOut();
    return Promise.resolve('/admin/login');
  },

  checkAuth: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) return Promise.resolve();
    return Promise.reject();
  },

  checkError: (error) => {
    // Optionnel : gère les erreurs HTTP ici
    return Promise.resolve();
  },

  getPermissions: async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user?.role || 'user';
  },

  getIdentity: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      return {
        id: user.id,
        fullName: user.user_metadata?.full_name || user.email,
        avatar: user.user_metadata?.avatar_url || null,
      };
    }

    return null;
  },
};

export default authProvider;
