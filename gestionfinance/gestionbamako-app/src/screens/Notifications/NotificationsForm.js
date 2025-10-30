import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import api from '../../api/api';

export default function NotificationsForm({ refresh, notification, onClose }) {
  const [title, setTitle] = useState(notification?.title || '');
  const [message, setMessage] = useState(notification?.message || '');

  const handleSubmit = async () => {
    try {
      if (notification) {
        await api.put(`/notifications/${notification.id}`, { title, message });
      } else {
        await api.post('/notifications', { title, message });
      }
      refresh();
      onClose?.();
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async () => {
    if (!notification) return;
    try {
      await api.delete(`/notifications/${notification.id}`);
      refresh();
      onClose?.();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Titre" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput placeholder="Message" value={message} onChangeText={setMessage} style={styles.input} />
      <Button title={notification ? "Modifier" : "Ajouter"} onPress={handleSubmit} />
      {notification && <Button title="Supprimer" color="red" onPress={handleDelete} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 10 },
  input: { borderWidth: 1, padding: 10, borderRadius: 5, marginBottom: 10 },
});
