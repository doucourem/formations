import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Modal, ActivityIndicator } from 'react-native';
import { IconButton } from 'react-native-paper';
import api from '../../api/api';
import ClientForm from './ClientForm';

export default function ClientList() {
  const [clients, setClients] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [transactions, setTransactions] = useState({}); // { client_id: [transactions] }

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/clients');
      setClients(res.data);
    } catch (err) {
      console.log(err);
      Alert.alert('Erreur', 'Impossible de charger les clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchEcritures = async (clientId) => {
    try {
      const res = await api.get(`/transactions?client_id=${clientId}`);
      setTransactions((prev) => ({ ...prev, [clientId]: res.data }));
    } catch (err) {
      console.log(err);
      Alert.alert('Erreur', "Impossible de charger les écritures du client");
    }
  };

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
          try {
            await api.delete(`/clients/${id}`);
            fetchClients();
          } catch (err) {
            Alert.alert('Erreur', 'Impossible de supprimer ce client');
          }
        },
      },
    ]);
  };

  const toggleEcritures = async (clientId) => {
    if (expandedClientId === clientId) {
      setExpandedClientId(null);
    } else {
      setExpandedClientId(clientId);
      if (!transactions[clientId]) await fetchEcritures(clientId);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <IconButton
        icon="plus"
        iconColor="#fff"
        size={28}
        style={{ backgroundColor: '#10b981', alignSelf: 'flex-end', marginBottom: 10 }}
        onPress={handleAdd}
      />

      <FlatList
        data={clients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>👤 {item.name}</Text>
            <Text style={styles.text}>📞 {item.phone}</Text>
            <Text style={styles.text}>📧 {item.email}</Text>

            <View style={styles.buttons}>
              <IconButton icon="pencil" iconColor="#3b82f6" size={22} onPress={() => handleEdit(item)} />
              <IconButton icon="delete" iconColor="#ef4444" size={22} onPress={() => handleDelete(item.id)} />
              <IconButton
                icon={expandedClientId === item.id ? 'eye-off' : 'eye'}
                iconColor="#10b981"
                size={22}
                onPress={() => toggleEcritures(item.id)}
              />
            </View>

            {expandedClientId === item.id && (
              <View style={styles.ecrituresSection}>
                {transactions[item.id] ? (
                  transactions[item.id].length > 0 ? (
                    transactions[item.id].map((tx) => (
                      <View key={tx.id} style={styles.ecritureItem}>
                        <Text style={styles.ecritureText}>
                          💰 {tx.amount_fcfa} FCFA ({tx.type === 'CREDIT' ? '✅ Crédit' : '❌ Débit'})
                        </Text>
                        <Text style={styles.ecritureDate}>📅 {new Date(tx.created_at).toLocaleDateString()}</Text>
                        <Text style={styles.ecritureText}>📞 {tx.phone_number}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noEcriture}>Aucune écriture trouvée</Text>
                  )
                ) : (
                  <ActivityIndicator size="small" color="#10b981" />
                )}
              </View>
            )}
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
  container: { flex: 1, padding: 10, backgroundColor: '#0f172a' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#f8fafc', marginTop: 10 },
  card: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    marginBottom: 10,
  },
  name: { fontWeight: 'bold', fontSize: 16, color: '#f1f5f9' },
  text: { color: '#e2e8f0', marginVertical: 2 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  ecrituresSection: {
    marginTop: 10,
    backgroundColor: '#334155',
    borderRadius: 6,
    padding: 8,
  },
  ecritureItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#475569',
    paddingVertical: 5,
  },
  ecritureText: { color: '#f8fafc', fontSize: 14 },
  ecritureDate: { color: '#94a3b8', fontSize: 12 },
  noEcriture: { color: '#94a3b8', textAlign: 'center', paddingVertical: 5 },
});
