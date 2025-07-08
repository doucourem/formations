import {
  List, Datagrid, TextField, DateField, EditButton,
  Edit, Create, SimpleForm, TextInput, Show, SimpleShowLayout,
  ShowButton
} from 'react-admin';
import { useState, useEffect } from 'react';
import {
  useNotify,
  useRedirect,
  Toolbar,
  SaveButton,
} from 'react-admin';
import { supabase } from '../utils/supabaseClient'; // Assure-toi que `supabase` est bien importé

const CustomToolbar = () => (
  <Toolbar>
    <SaveButton />
  </Toolbar>
);
export const ProjectList = () => (
  <List title="Projets IA">
    <Datagrid rowClick="show">
      <TextField source="id" label="ID" />
      <TextField source="title" label="Titre" />
      <TextField source="objectif" label="Objectif" />
      <TextField source="user_id" label="Utilisateur" />
      <DateField source="created_at" label="Créé le" />
      <EditButton />
    </Datagrid>
  </List>
);

export const ProjectEdit = () => (
  <Edit title="Modifier le projet">
    <SimpleForm>
      <TextInput source="title" label="Titre" fullWidth />
      <TextInput source="objectif" label="Objectif" multiline fullWidth />
    </SimpleForm>
  </Edit>
);

export const ProjectCreate = () => {
  const notify = useNotify();
  const redirect = useRedirect();

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        notify('Erreur : utilisateur non connecté', { type: 'error' });
      }
    };
    fetchUser();
  }, [notify]);

  const handleSubmit = async (values) => {
    const { error } = await supabase.from('projects').insert({
      ...values,
      user_id: userId,
    });

    if (error) {
      notify(`Erreur : ${error.message}`, { type: 'error' });
    } else {
      notify('Projet créé avec succès !', { type: 'success' });
      redirect('/admin/projects');
    }
  };

  if (!userId) return null;

  return (
    <Create title="Nouveau projet IA">
      <SimpleForm onSubmit={handleSubmit} toolbar={<CustomToolbar />}>
        <TextInput source="title" label="Titre" fullWidth />
        <TextInput source="objectif" label="Objectif" multiline fullWidth />
      </SimpleForm>
    </Create>
  );
};
export const ProjectShow = () => (
  <Show title="Détails du projet">
    <SimpleShowLayout>
      <TextField source="title" label="Titre" />
      <TextField source="objectif" label="Objectif" />
      <TextField source="user_id" label="Utilisateur" />
      <DateField source="created_at" label="Créé le" />
    </SimpleShowLayout>
  </Show>
);
