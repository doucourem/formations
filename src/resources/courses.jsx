import {
  List, Datagrid, TextField, NumberField, Edit, Create,
  SimpleForm, TextInput, NumberInput, UrlField, ArrayInput,
  SimpleFormIterator, Show, SimpleShowLayout, DateField, ImageField
} from 'react-admin';

export const CourseList = () => (
  <List title="Cours">
    <Datagrid rowClick="edit">
      <TextField source="id" label="ID" />
      <TextField source="title" label="Titre" />
      <TextField source="niveau" label="Niveau" />
      <NumberField source="rating" label="Note" />
      <TextField source="duree" label="Durée" />
    </Datagrid>
  </List>
);

export const CourseEdit = () => (
  <Edit title="Modifier un cours">
    <SimpleForm>
      <TextInput source="title" label="Titre" fullWidth />
      <TextInput source="description" label="Description" multiline fullWidth />
      <TextInput source="niveau" label="Niveau" />
      <TextInput source="duree" label="Durée" />
      <NumberInput source="rating" label="Note" />
      <TextInput source="image" label="Image (URL)" fullWidth />
      <TextInput source="video_url" label="Vidéo (URL)" fullWidth />
      <ArrayInput source="contenu" label="Contenu">
        <SimpleFormIterator>
          <TextInput label="Module / Leçon" />
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Edit>
);

export const CourseCreate = () => (
  <Create title="Ajouter un cours">
    <SimpleForm>
      <TextInput source="title" label="Titre" fullWidth />
      <TextInput source="description" label="Description" multiline fullWidth />
      <TextInput source="niveau" label="Niveau" />
      <TextInput source="duree" label="Durée" />
      <NumberInput source="rating" label="Note" />
      <TextInput source="image" label="Image (URL)" fullWidth />
      <TextInput source="video_url" label="Vidéo (URL)" fullWidth />
      <ArrayInput source="contenu" label="Contenu">
        <SimpleFormIterator>
          <TextInput label="Module / Leçon" />
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Create>
);

export const CourseShow = () => (
  <Show title="Détails du cours">
    <SimpleShowLayout>
      <TextField source="title" label="Titre" />
      <TextField source="description" label="Description" />
      <TextField source="niveau" label="Niveau" />
      <TextField source="duree" label="Durée" />
      <NumberField source="rating" label="Note" />
      <UrlField source="video_url" label="Lien vidéo" />
      <ImageField source="image" label="Image" />
      <ArrayInput source="contenu" label="Contenu">
        <SimpleFormIterator>
          <TextInput />
        </SimpleFormIterator>
      </ArrayInput>
      <DateField source="created_at" label="Ajouté le" />
    </SimpleShowLayout>
  </Show>
);
