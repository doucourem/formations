import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert, Modal } from 'react-native';
import api from '../../api/api';
import NotificationsForm from './NotificationsForm';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleAdd = () => {
    setSelectedNotification(null);
    setModalVisible(true);
  };

  const handleEdit = (notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    Alert.alert('Supprimer', 'Voulez-vous vraiment supprimer cette notification ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await api.delete(`/notifications/${id}`);
          fetchNotifications();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Button title="Nouvelle notification" onPress={handleAdd} />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>{item.title}</Text>
            <Text>{item.message}</Text>
            <Text>{new Date(item.created_at).toLocaleString()}</Text>
            <View style={styles.buttons}>
              <Button title="Éditer" onPress={() => handleEdit(item)} />
              <Button title="Supprimer" color="red" onPress={() => handleDelete(item.id)} />
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide">
        <NotificationsForm
          notification={selectedNotification}
          onClose={() => {
            setModalVisible(false);
            fetchNotifications();
          }}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  card: { padding: 15, borderWidth: 1, borderRadius: 5, marginBottom: 10 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
});
