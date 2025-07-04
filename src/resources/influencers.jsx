import {
  List, Datagrid, TextField, NumberField, ArrayField, ChipField,
  Edit, Create, SimpleForm, TextInput, NumberInput, ArrayInput,
  SimpleFormIterator, DateField, Show, SimpleShowLayout
} from 'react-admin';

export const InfluencerList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="niche" />
      <NumberField source="followers" />
      <NumberField source="rating" />
    </Datagrid>
  </List>
);

export const InfluencerEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="image" />
      <TextInput source="quote" />
      <ArrayInput source="badges">
        <SimpleFormIterator>
          <TextInput />
        </SimpleFormIterator>
      </ArrayInput>
      <TextInput source="niche" />
      <NumberInput source="followers" />
      <TextInput source="bio" multiline />
      <TextInput source="instagram_url" />
      <TextInput source="youtube_url" />
      <TextInput source="email" />
      <NumberInput source="rating" />
      <ArrayInput source="strengths">
        <SimpleFormIterator>
          <TextInput />
        </SimpleFormIterator>
      </ArrayInput>
      <ArrayInput source="gallery">
        <SimpleFormIterator>
          <TextInput />
        </SimpleFormIterator>
      </ArrayInput>
      <ArrayInput source="timeline">
        <SimpleFormIterator>
          <TextInput label="Année" source="year" />
          <TextInput label="Événement" source="event" />
        </SimpleFormIterator>
      </ArrayInput>
      <ArrayInput source="courses">
        <SimpleFormIterator>
          <TextInput label="Titre" source="title" />
          <TextInput label="Description" source="desc" />
        </SimpleFormIterator>
      </ArrayInput>
      <ArrayInput source="recent_posts">
        <SimpleFormIterator>
          <TextInput label="Titre" source="title" />
          <TextInput label="URL" source="url" />
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Edit>
);

export const InfluencerCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="image" />
      <TextInput source="quote" />
      <ArrayInput source="badges">
        <SimpleFormIterator>
          <TextInput />
        </SimpleFormIterator>
      </ArrayInput>
      <TextInput source="niche" />
      <NumberInput source="followers" />
      <TextInput source="bio" multiline />
      <TextInput source="instagram_url" />
      <TextInput source="youtube_url" />
      <TextInput source="email" />
      <NumberInput source="rating" />
      <ArrayInput source="strengths">
        <SimpleFormIterator>
          <TextInput />
        </SimpleFormIterator>
      </ArrayInput>
      <ArrayInput source="gallery">
        <SimpleFormIterator>
          <TextInput />
        </SimpleFormIterator>
      </ArrayInput>
      <ArrayInput source="timeline">
        <SimpleFormIterator>
          <TextInput label="Année" source="year" />
          <TextInput label="Événement" source="event" />
        </SimpleFormIterator>
      </ArrayInput>
      <ArrayInput source="courses">
        <SimpleFormIterator>
          <TextInput label="Titre" source="title" />
          <TextInput label="Description" source="desc" />
        </SimpleFormIterator>
      </ArrayInput>
      <ArrayInput source="recent_posts">
        <SimpleFormIterator>
          <TextInput label="Titre" source="title" />
          <TextInput label="URL" source="url" />
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Create>
);

export const InfluencerShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="name" />
      <TextField source="quote" />
      <TextField source="niche" />
      <TextField source="bio" />
      <NumberField source="followers" />
      <NumberField source="rating" />
      <DateField source="created_at" />
      <ArrayField source="badges"><ChipField source="" /></ArrayField>
      <ArrayField source="strengths"><ChipField source="" /></ArrayField>
      <ArrayField source="gallery"><ChipField source="" /></ArrayField>
    </SimpleShowLayout>
  </Show>
);
