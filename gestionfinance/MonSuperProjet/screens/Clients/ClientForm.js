import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import api from '../../api/api';

export default function ClientForm({ refresh, client, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Pré-remplir si édition
  useEffect(() => {
    if (client) {
      setName(client.name || '');
      setEmail(client.email || '');
      setPhone(client.phone || '');
    } else {
      setName('');
      setEmail('');
      setPhone('');
    }
  }, [client]);

  const handleSubmit = async () => {
    if (!name || !email || !phone) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      if (client) {
        await api.put(`/clients/${client.id}`, { name, email, phone });
      } else {
        await api.post('/clients', { name, email, phone });
      }
      refresh?.();
      onClose?.();
    } catch (err) {
      console.log(err);
      Alert.alert('Erreur', "Impossible d'enregistrer le client");
    }
  };

  const handleDelete = async () => {
    if (!client) return;
    Alert.alert('Supprimer', 'Voulez-vous vraiment supprimer ce client ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/clients/${client.id}`);
            refresh?.();
            onClose?.();
          } catch (err) {
            console.log(err);
            Alert.alert('Erreur', 'Impossible de supprimer le client');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nom"
        placeholderTextColor="#94a3b8"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        placeholderTextColor="#94a3b8"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Téléphone"
        placeholderTextColor="#94a3b8"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />

      <Button
        mode="contained"
        buttonColor="#10b981"
        textColor="#fff"
        onPress={handleSubmit}
        style={{ marginBottom: client ? 10 : 0 }}
      >
        {client ? 'Modifier' : 'Ajouter'}
      </Button>

      {client && (
        <Button
          mode="outlined"
          buttonColor="#ef4444"
          textColor="#fff"
          onPress={handleDelete}
        >
          Supprimer
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: '#1e293b',
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#475569',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    color: '#f8fafc',
  },
});
