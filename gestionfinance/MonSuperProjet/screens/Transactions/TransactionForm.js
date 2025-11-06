import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Menu, Button as PaperButton, Text, TextInput } from 'react-native-paper';
import api from '../../api/api';

export default function TransactionForm({ refresh, transaction, onClose }) {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amountFcfa, setAmountFcfa] = useState('');
  const [type, setType] = useState('');

  // Charger la liste des clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data } = await api.get('/clients');
        setClients(data);
      } catch (err) {
        console.log('Erreur chargement clients', err);
      }
    };
    fetchClients();
  }, []);

  // Préremplir si on édite
  useEffect(() => {
    if (transaction) {
      setSelectedClient(
        clients.find((c) => c.id === transaction.client_id) || null
      );
      setPhoneNumber(transaction.phone_number || '');
      setAmountFcfa(transaction.amount_fcfa?.toString() || '');
      setType(transaction.type || '');
    }
  }, [transaction, clients]);

  // Envoi ou mise à jour
  const handleSubmit = async () => {
    if (!selectedClient || !phoneNumber || !amountFcfa || !type) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const payload = {
      client_id: selectedClient.id,
      phone_number: phoneNumber,
      amount: parseFloat(amountFcfa),
      type,
    };

    try {
      if (transaction) {
        await api.put(`/transactions/${transaction.id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }

      setSelectedClient(null);
      setPhoneNumber('');
      setAmountFcfa('');
      setType('');
      onClose?.();
      refresh();
    } catch (err) {
      console.log(err);
      alert("Erreur lors de l'enregistrement de la transaction");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>👤 Client</Text>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <PaperButton
            mode="outlined"
            onPress={() => setMenuVisible(true)}
            textColor="#e2e8f0"
            style={styles.menuButton}
          >
            {selectedClient ? selectedClient.name : 'Sélectionner un client'}
          </PaperButton>
        }
      >
        {clients.map((client) => (
          <Menu.Item
            key={client.id}
            title={client.name}
            onPress={() => {
              setSelectedClient(client);
              setMenuVisible(false);
            }}
          />
        ))}
      </Menu>

      <TextInput
        placeholder="Numéro de téléphone"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        mode="outlined"
        style={styles.input}
        keyboardType="phone-pad"
        placeholderTextColor="#94a3b8"
      />

      <TextInput
        placeholder="Montant (FCFA)"
        value={amountFcfa}
        onChangeText={setAmountFcfa}
        mode="outlined"
        style={styles.input}
        keyboardType="numeric"
        placeholderTextColor="#94a3b8"
      />

      <TextInput
        placeholder="Type (CREDIT / DEBIT)"
        value={type}
        onChangeText={setType}
        mode="outlined"
        style={styles.input}
        placeholderTextColor="#94a3b8"
      />

      <View style={styles.buttonRow}>
        <PaperButton
          mode="contained"
          onPress={handleSubmit}
          buttonColor="#10b981"
          textColor="white"
          style={styles.button}
        >
          {transaction ? 'Modifier' : 'Ajouter'}
        </PaperButton>
        {onClose && (
          <PaperButton
            mode="outlined"
            onPress={onClose}
            textColor="#f87171"
            style={styles.cancelButton}
          >
            Annuler
          </PaperButton>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b', // fond sombre
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  menuButton: {
    borderColor: '#334155',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginRight: 8,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#f87171',
  },
});
