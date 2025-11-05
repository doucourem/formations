import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import api from '../../api/api';

export default function TransactionForm({ refresh }) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('');

  const handleSubmit = async () => {
    try {
      await api.post('/transactions', { amount, type });
      setAmount('');
      setType('');
      refresh();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Montant"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Type"
        value={type}
        onChangeText={setType}
        style={styles.input}
      />
      <Button title="Ajouter" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 10 },
  input: { borderWidth: 1, padding: 10, borderRadius: 5, marginBottom: 10 },
});
