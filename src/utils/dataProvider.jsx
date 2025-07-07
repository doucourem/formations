// src/dataProvider.jsx
import { supabase } from './supabaseClient';

const dataProvider = {
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;

    let query = supabase
      .from(resource)
      .select('*', { count: 'exact' })
      .order(field, { ascending: order === 'ASC' });

    if (params.filter) {
      for (const key in params.filter) {
        const value = params.filter[key];
        query = query.ilike(key, `%${value}%`);
      }
    }

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    return {
      data,
      total: count,
    };
  },

  getOne: async (resource, params) => {
    const { data, error } = await supabase
      .from(resource)
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw new Error(error.message);
    return { data };
  },

  create: async (resource, params) => {
    const { data, error } = await supabase
      .from(resource)
      .insert([params.data])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { data };
  },

  update: async (resource, params) => {
    const { data, error } = await supabase
      .from(resource)
      .update(params.data)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { data };
  },

  delete: async (resource, params) => {
    const { error } = await supabase
      .from(resource)
      .delete()
      .eq('id', params.id);

    if (error) throw new Error(error.message);
    return { data: { id: params.id } };
  },

  getMany: async (resource, params) => {
    const { data, error } = await supabase
      .from(resource)
      .select('*')
      .in('id', params.ids);

    if (error) throw new Error(error.message);
    return { data };
  },

  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;

    let query = supabase
      .from(resource)
      .select('*', { count: 'exact' })
      .eq(params.target, params.id)
      .order(field, { ascending: order === 'ASC' });

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    return {
      data,
      total: count,
    };
  },
  
};

export default dataProvider;
