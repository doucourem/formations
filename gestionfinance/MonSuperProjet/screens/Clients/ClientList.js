import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert, Modal } from 'react-native';
import api from '../../api/api';
import ClientForm from './ClientForm';

export default function ClientList() {
  const [clients, setClients] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const fetchClients = async () => {
    const res = await api.get('/clients');
    setClients(res.data);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleEdit = (client) => {
    setSelectedClient(client);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setSelectedClient(null);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    Alert.alert('Supprimer', 'Voulez-vous vraiment supprimer ce client ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await api.delete(`/clients/${id}`);
          fetchClients();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Button title="Ajouter un client" onPress={handleAdd} />
      <FlatList
        data={clients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>{item.name}</Text>
            <Text>{item.email}</Text>
            <Text>{item.phone}</Text>
            <View style={styles.buttons}>
              <Button title="Éditer" onPress={() => handleEdit(item)} />
              <Button title="Supprimer" color="red" onPress={() => handleDelete(item.id)} />
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide">
        <ClientForm
          client={selectedClient}
          onClose={() => {
            setModalVisible(false);
            fetchClients();
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
