import {
  List, Datagrid, TextField, DateField, EditButton,
  Edit, Create, SimpleForm, TextInput, Show, SimpleShowLayout,
  ShowButton
} from 'react-admin';

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

export const ProjectCreate = () => (
  <Create title="Nouveau projet IA">
    <SimpleForm>
      <TextInput source="title" label="Titre" fullWidth />
      <TextInput source="objectif" label="Objectif" multiline fullWidth />
    </SimpleForm>
  </Create>
);

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
