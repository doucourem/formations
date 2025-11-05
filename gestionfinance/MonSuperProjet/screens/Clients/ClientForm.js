import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import api from '../../api/api';

export default function ClientForm({ refresh, client, onClose }) {
  const [name, setName] = useState(client?.name || '');
  const [email, setEmail] = useState(client?.email || '');
  const [phone, setPhone] = useState(client?.phone || '');

  const handleSubmit = async () => {
    try {
      if (client) {
        // update
        await api.put(`/clients/${client.id}`, { name, email, phone });
      } else {
        // create
        await api.post('/clients', { name, email, phone });
      }
      refresh();
      onClose?.();
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async () => {
    if (!client) return;
    try {
      await api.delete(`/clients/${client.id}`);
      refresh();
      onClose?.();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Nom" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Téléphone" value={phone} onChangeText={setPhone} style={styles.input} />
      <Button title={client ? "Modifier" : "Ajouter"} onPress={handleSubmit} />
      {client && <Button title="Supprimer" color="red" onPress={handleDelete} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 10 },
  input: { borderWidth: 1, padding: 10, borderRadius: 5, marginBottom: 10 },
});
