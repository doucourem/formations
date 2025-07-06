import {
  List, Datagrid, TextField, NumberField, ArrayField, ChipField,
  Edit, Create, SimpleForm, TextInput, NumberInput, ArrayInput,
  SimpleFormIterator, DateField, Show, SimpleShowLayout
} from 'react-admin';

// Liste des influenceurs
export const InfluencerList = () => (
  <List title="Liste des influenceurs">
    <Datagrid rowClick="edit">
      <TextField source="id" label="ID" />
      <TextField source="name" label="Nom" />
      <TextField source="niche" label="Thématique" />
      <NumberField source="followers" label="Abonnés" />
      <NumberField source="rating" label="Note moyenne" />
    </Datagrid>
  </List>
);

// Édition d'un influenceur
export const InfluencerEdit = () => (
  <Edit title="Modifier un influenceur">
    <SimpleForm>
      <TextInput source="name" label="Nom" />
      <TextInput source="image" label="Photo (URL)" />
      <TextInput source="quote" label="Citation" />
      <ArrayInput source="badges" label="Badges">
        <SimpleFormIterator>
          <TextInput label="Badge" />
        </SimpleFormIterator>
      </ArrayInput>
      <TextInput source="niche" label="Thématique" />
      <NumberInput source="followers" label="Nombre d'abonnés" />
      <TextInput source="bio" multiline label="Biographie" />
      <TextInput source="instagram_url" label="Lien Instagram" />
      <TextInput source="youtube_url" label="Lien YouTube" />
      <TextInput source="email" label="Adresse email" />
      <NumberInput source="rating" label="Note moyenne" />
      <ArrayInput source="strengths" label="Points forts">
        <SimpleFormIterator>
          <TextInput label="Point fort" />
        </SimpleFormIterator>
      </ArrayInput>
      <ArrayInput source="gallery" label="Galerie (images)">
        <SimpleFormIterator>
          <TextInput label="URL image" />
        </SimpleFormIterator>
      </ArrayInput>
      <ArrayInput source="timeline" label="Parcours (timeline)">
        <SimpleFormIterator>
          <TextInput label="Année" source="year" />
          <TextInput label="Événement" source="event" />
        </SimpleFormIterator>
      </ArrayInput>
      <ArrayInput source="courses" label="Cours dispensés">
        <SimpleFormIterator>
          <TextInput label="Titre du cours" source="title" />
          <TextInput label="Description du cours" source="desc" />
        </SimpleFormIterator>
      </ArrayInput>
      <ArrayInput source="recent_posts" label="Publications récentes">
        <SimpleFormIterator>
          <TextInput label="Titre" source="title" />
          <TextInput label="URL" source="url" />
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Edit>
);

// Création d'un influenceur
export const InfluencerCreate = () => (
  <Create title="Ajouter un influenceur">
    <SimpleForm>
      <TextInput source="name" label="Nom" />
      <TextInput source="image" label="Photo (URL)" />
      <TextInput source="quote" label="Citation" />
      <ArrayInput source="badges" label="Badges">
        <SimpleFormIterator>
          <TextInput label="Badge" />
        </SimpleFormIterator>
      </ArrayInput>
      <TextInput source="niche" label="Thématique" />
      <NumberInput source="followers" label="Nombre d'abonnés" />
      <TextInput source="bio" multiline label="Biographie" />
      <TextInput source="instagram_url" label="Lien Instagram" />
      <TextInput source="youtube_url" label="Lien YouTube" />
      <TextInput source="email" label="Adresse email" />
      <NumberInput source="rating" label="Note moyenne" />
      <ArrayInput source="strengths" label="Points forts">
        <SimpleFormIterator>
          <TextInput label="Point fort" />
        </SimpleFormIterator>
      </ArrayInput>
      <ArrayInput source="gallery" label="Galerie (images)">
        <SimpleFormIterator>
          <TextInput label="URL image" />
        </SimpleFormIterator>
      </ArrayInput>
      <ArrayInput source="timeline" label="Parcours (timeline)">
        <SimpleFormIterator>
          <TextInput label="Année" source="year" />
          <TextInput label="Événement" source="event" />
        </SimpleFormIterator>
      </ArrayInput>
      <ArrayInput source="courses" label="Cours dispensés">
        <SimpleFormIterator>
          <TextInput label="Titre du cours" source="title" />
          <TextInput label="Description du cours" source="desc" />
        </SimpleFormIterator>
      </ArrayInput>
      <ArrayInput source="recent_posts" label="Publications récentes">
        <SimpleFormIterator>
          <TextInput label="Titre" source="title" />
          <TextInput label="URL" source="url" />
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Create>
);

// Affichage d'un influenceur
export const InfluencerShow = () => (
  <Show title="Détails de l'influenceur">
    <SimpleShowLayout>
      <TextField source="name" label="Nom" />
      <TextField source="quote" label="Citation" />
      <TextField source="niche" label="Thématique" />
      <TextField source="bio" label="Biographie" />
      <NumberField source="followers" label="Nombre d'abonnés" />
      <NumberField source="rating" label="Note moyenne" />
      <DateField source="created_at" label="Date de création" />
      <ArrayField source="badges" label="Badges"><ChipField source="" /></ArrayField>
      <ArrayField source="strengths" label="Points forts"><ChipField source="" /></ArrayField>
      <ArrayField source="gallery" label="Galerie"><ChipField source="" /></ArrayField>
    </SimpleShowLayout>
  </Show>
);
